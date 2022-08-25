const getTokenTickers = require('../../queries/getTokenTickers')
const { nearConnectionPromise, nearAPI } = require('../../lib/near')
const request = require('../../lib/request')
const logger = require('../../lib/logger')
const { addRewardsToProtocolBalance } = require('../../lib/treasury')
const { toReadableNumber } = require('../../lib/utils')
const updatePositions = require('./updatePositions')

module.exports = async function fetchNearPositions() {
  const fetchUpdate = async () => {
    const tokenTickers = await getTokenTickers()
    const near = await nearConnectionPromise

    const refFinanceBalances = await getRefFinanceBalances({ near, tokenTickers })
    const stakedNear = await getStakedNear({ near })
    const tokenBalances = await getTokenBalances({ near, tokenTickers })

    return {
      protocolBalances: [
        {
          type: 'staking',
          name: 'Staked NEAR',
          logoUrl: tokenTickers.NEAR.logoUrl,
          amount: stakedNear,
          value: tokenTickers.NEAR.price * stakedNear,
          price: tokenTickers.NEAR.price,
          symbol: 'NEAR',
        },
        refFinanceBalances,
      ],
      tokens: tokenBalances,
    }
  }

  await updatePositions({
    callerName: 'fetchNearPositions',
    protocolNames: ['Staked NEAR', 'Ref Finance'],
    tokens: [['NEAR', 'near'], ['REF', 'near'], ['WOO', 'near']],
    fetchUpdate,
  })
}

async function getTokenBalances({ near, tokenTickers }) {
  const nearInLockupResponse = await near.connection.provider.query({
    request_type: 'view_account',
    finality: 'final',
    account_id: 'dfe9b1d2bb90b89a47ce77d9703350b30b7fd051.lockup.near',
  })
  const nearInLockupWallet = toNumber(nearAPI.utils.format.formatNearAmount(nearInLockupResponse.amount, 2))
  const nearInWalletResponse = await near.connection.provider.query({
    request_type: 'view_account',
    finality: 'final',
    account_id: 'woodao.near',
  })
  const nearInWallet = toNumber(nearAPI.utils.format.formatNearAmount(nearInWalletResponse.amount, 2))
  const refAmount = await getTokenAmount(near, 'token.v2.ref-finance.near')
  const wooAmount = await getTokenAmount(near, '4691937a7508860f876c9c0a2a617e7d9e945d4b.factory.bridge.near')
  const wrappedNearAmount = await getTokenAmount(near, 'wrap.near')
  const nearAmount = nearInWallet + nearInLockupWallet + wrappedNearAmount

  const chainLogoUrl = tokenTickers.NEAR.logoUrl
  return [
    {
      chain: 'near',
      symbol: 'NEAR',
      logoUrl: tokenTickers.NEAR.logoUrl,
      amount: nearAmount,
      value: nearAmount * tokenTickers.NEAR.price,
      price: tokenTickers.NEAR.price,
      chainLogoUrl,
    },
    {
      chain: 'near',
      symbol: 'REF',
      logoUrl: tokenTickers.REF.logoUrl,
      amount: refAmount,
      value: refAmount * tokenTickers.REF.price,
      price: tokenTickers.REF.price,
      chainLogoUrl,
    },
    {
      chain: 'near',
      symbol: 'WOO',
      logoUrl: tokenTickers.WOO.logoUrl,
      amount: wooAmount,
      value: wooAmount * tokenTickers.WOO.price,
      price: tokenTickers.WOO.price,
      chainLogoUrl,
    },
  ]
}

async function getRefFinanceBalances({ near, tokenTickers }) {
  const account = await near.account('woodao.near')
  const tokenPriceList = await request({
    name: 'get ref finance token price list',
    serverUrl: 'https://indexer.ref.finance/',
    path: `/list-token-price`,
  })
  const poolBalances = await request({
    name: 'get woodao ref finance pool balances',
    serverUrl: 'https://indexer.ref.finance/',
    path: `/liquidity-pools/woodao.near`,
  })

  const farmRewards = await account.viewFunction(
    'boostfarm.ref-labs.near', 'list_farmer_rewards', { farmer_id: 'woodao.near' }
  )
  const farmerSeeds = await account.viewFunction(
    'boostfarm.ref-labs.near', 'list_farmer_seeds', { farmer_id: 'woodao.near' }
  )

  const protocolBalance = {
    name: 'Ref Finance',
    chain: 'near',
    siteUrl: 'https://app.ref.finance/',
    logoUrl: tokenTickers.REF.logoUrl,
    value: 0,
    details: [],
    rewards: [],
  }

  for (tokenKey in farmRewards) {
    const symbol = tokenPriceList[tokenKey].symbol
    const tokenTicker = tokenTickers[symbol]
    if (!tokenTicker) {
      logger.log('debug', `no tokenTicker for symbol "${symbol}"`)
      return
    }
    const amount = toReadableNumber(tokenPriceList[tokenKey].decimal, farmRewards[tokenKey])
    const price = +tokenPriceList[tokenKey].price
    const value = amount * price
    protocolBalance.value += value
    addRewardsToProtocolBalance({
      protocolBalance,
      token: {
        amount,
        logo_url: tokenTicker.logoUrl,
        symbol,
      },
      value,
    })
  }

  for (const seed_id in farmerSeeds) {
    const unclaimedTokenAmount = await account.viewFunction(
      'boostfarm.ref-labs.near', 'get_unclaimed_rewards', { farmer_id: 'woodao.near', seed_id }
    )
    for (rewardToken in unclaimedTokenAmount) {
      const unclaimedAmount = unclaimedTokenAmount[rewardToken]
      const tokenFromPriceList = tokenPriceList[rewardToken]
      const amount = toReadableNumber(tokenFromPriceList.decimal, unclaimedAmount)
      const symbol = tokenFromPriceList.symbol
      const tokenTicker = tokenTickers[symbol]
      if (!tokenTicker) {
        logger.log('debug', `no tokenTicker for symbol "${symbol}"`)
        return
      }
      const price = +tokenFromPriceList.price
      const value = amount * price
      protocolBalance.value += value
      addRewardsToProtocolBalance({
        protocolBalance,
        token: {
          amount,
          logo_url: tokenTicker.logoUrl,
          symbol,
        },
        value,
      })
    }
  }

  for (const poolBalance of poolBalances) {
    const protocolDetail = {
      type: 'Liquidity Pool',
      netValue: 0,
      supplied: [],
    }
    const seedAmount = farmerSeeds[`v2.ref-finance.near@${poolBalance.id}`].free_amount
    const ratio = +seedAmount / +poolBalance.shares_total_supply
    poolBalance.token_account_ids.forEach((tokenId, index) => {
      const tokenFromPriceList = tokenPriceList[tokenId]
      let symbol = tokenFromPriceList.symbol
      if (symbol === 'near') symbol = 'NEAR'
      const tokenTicker = tokenTickers[symbol]
      if (!tokenTicker) {
        logger.log('debug', `no tokenTicker for symbol "${symbol}"`)
        return
      }
      const price = +tokenFromPriceList.price
      const amount = toReadableNumber(tokenFromPriceList.decimal, poolBalance.amounts[index]) * ratio
      const value = amount * price
      protocolBalance.value += value
      protocolDetail.netValue += value
      protocolDetail.supplied.push({ value, logoUrl: tokenTicker.logoUrl, symbol, amount })
    })
    protocolBalance.details.push(protocolDetail)
  }

  return protocolBalance
}

async function getStakedNear({ near }) {
  const contractCallResponse = await near.connection.provider.query({
    request_type: 'call_function',
    finality: 'final',
    account_id: 'astro-stakers.poolv1.near',
    method_name: 'get_accounts',
    args_base64: Buffer.from(
      JSON.stringify({
        from_index: 2500,
        limit: 100,
      })
    ).toString("base64"),
  })

  const _tokens = decode(contractCallResponse.result)
  const stakedNearBalance = _tokens
    .find(({ account_id }) => account_id === 'dfe9b1d2bb90b89a47ce77d9703350b30b7fd051.lockup.near').staked_balance
  return toNumber(nearAPI.utils.format.formatNearAmount(stakedNearBalance, 2))
}

async function getTokenAmount(near, accountId) {
  const refTokenMetaData = await near.connection.provider.query({
    request_type: 'call_function',
    finality: 'final',
    account_id: accountId,
    method_name: 'ft_metadata',
    args_base64: '',
  })
  const decimals = decode(refTokenMetaData.result).decimals
  const refTokenResponse = await near.connection.provider.query({
    request_type: 'call_function',
    finality: 'final',
    account_id: accountId,
    method_name: 'ft_balance_of',
    args_base64: Buffer.from(JSON.stringify({ account_id: 'woodao.near' })).toString('base64'),
  })
  return toReadableNumber(decimals, decode(refTokenResponse.result))
}

function toNumber(numberString) {
  return parseInt(numberString.replace(/,/g, ''), 10)
}

function decode(data) {
  let res = ""
  for (let i = 0; i < data.length; i++) {
    res += String.fromCharCode(data[i])
  }
  return JSON.parse(res)
}
