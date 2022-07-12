
const { nearConnectionPromise, nearAPI } = require('../lib/near')
const request = require('../lib/request')
const logger = require('../lib/logger')
const { addRewardsToProtocolBalance } = require('../lib/treasury')

module.exports = async function fetchWooDaoNearBalances({ tokenTickers }) {
  const near = await nearConnectionPromise

  const refFinanceBalances = await getRefFinanceBalances({ near, tokenTickers })

  const nearInLockupResponse = await near.connection.provider.query({
    request_type: 'view_account',
    finality: 'final',
    account_id: 'dfe9b1d2bb90b89a47ce77d9703350b30b7fd051.lockup.near',
  })
  const nearInLockupWallet = nearAPI.utils.format.formatNearAmount(nearInLockupResponse.amount, 2)
  const nearInWalletResponse = await near.connection.provider.query({
    request_type: 'view_account',
    finality: 'final',
    account_id: 'woodao.near',
  })
  const nearInWallet = nearAPI.utils.format.formatNearAmount(nearInWalletResponse.amount, 2)

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
  const stakedNear = nearAPI.utils.format.formatNearAmount(stakedNearBalance, 2)

  return {
    near: toNumber(nearInWallet) + toNumber(nearInLockupWallet),
    stakedNear: toNumber(stakedNear),
    refFinanceBalances,
  }
}

const toReadableNumber = (
  decimals,
  number = '0'
) => {
  if (!decimals) return number

  const wholeStr = number.substring(0, number.length - decimals) || '0'
  const fractionStr = number
    .substring(number.length - decimals)
    .padStart(decimals, '0')
    .substring(0, decimals)

  return +`${wholeStr}.${fractionStr}`.replace(/\.?0+$/, '')
}

async function getRefFinanceBalances({ near, tokenTickers }) {
  const account = await near.account('woodao.near')
  const tokenPriceList = await request({
    name: 'get ref finance token price list',
    serverUrl: 'https://indexer.ref.finance/',
    path: `/list-token-price`,
  })
  const userSeeds = await account.viewFunction(
    'v2.ref-farming.near', 'list_user_seeds', { account_id: 'woodao.near' }
  )
  const poolBalances = await request({
    name: 'get woodao ref finance pool balances',
    serverUrl: 'https://indexer.ref.finance/',
    path: `/liquidity-pools/woodao.near`,
  })
  const farmRewards = await account.viewFunction(
    'v2.ref-farming.near', 'list_rewards', { account_id: 'woodao.near' }
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

  for (const seed_id in userSeeds) {
    const farmsBySeedId = await account.viewFunction(
      'v2.ref-farming.near', 'list_farms_by_seed', { seed_id }
    )
    for (const farm of farmsBySeedId) {
      const unclaimedTokenAmount = await account.viewFunction(
        'v2.ref-farming.near', 'get_unclaimed_reward', { account_id: 'woodao.near', farm_id: farm.farm_id }
      )
      const tokenFromPriceList = tokenPriceList[farm.reward_token]
      const amount = toReadableNumber(tokenFromPriceList.decimal, unclaimedTokenAmount)
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
    const seedAmount = userSeeds[`v2.ref-finance.near@${poolBalance.id}`]
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
