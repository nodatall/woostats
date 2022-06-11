const fetchEVMChainTokenBalancesForAddress = require('../queries/fetchEVMChainTokenBalancesForAddress')
const fetchEVMChainProtocolBalanceForAddress = require('../queries/fetchEVMChainProtocolBalanceForAddress')
const fetchWooDaoNearBalances = require('../queries/fetchWooDaoNearBalances')
const fetchTokenTickers = require('../queries/fetchTokenTickers')
const fetchWooDaoCBridgeBalances = require('../queries/fetchWooDaoCBridgeBalances')
const knex = require('../database/knex')
const client = require('../database')
const dayjs = require('../lib/dayjs')
const { addRewardsToProtocolBalance } = require('../lib/treasury')

module.exports = async function updateWooDaoTreasuryBalance() {
  const wooEthAddress = '0xfA2d1f15557170F6c4A4C5249e77f534184cdb79'
  const ethTokenBalances = await fetchEVMChainTokenBalancesForAddress({ address: wooEthAddress, chainId: 'eth' })
  const avalancheTokenBalances = await fetchEVMChainTokenBalancesForAddress({
    address: '0xB54382c680B0AD037C9F441A8727CA6006fe2dD0', chainId: 'avax',
  })
  const uniswapBalance = await fetchEVMChainProtocolBalanceForAddress({
    address: wooEthAddress, chainId: 'eth', protocol: 'uniswap3',
  })
  const bancorBalance = await fetchEVMChainProtocolBalanceForAddress({
    address: wooEthAddress, chainId: 'eth', protocol: 'bancor',
  })

  const tokenTickers = await fetchTokenTickers({ tokens: ['NEAR', 'AVAX', 'REF', 'WOO'] })

  const nearBalances = await fetchWooDaoNearBalances({ tokenTickers })
  const cBridgeBalances = await fetchWooDaoCBridgeBalances({ tokenTickers })
  const tokenBalances = getTokenBalances({ ethTokenBalances, avalancheTokenBalances, nearBalances, tokenTickers })
  const protocolBalances = await getProtocolBalances({
    uniswapBalance, bancorBalance, tokenTickers, nearBalances, cBridgeBalances,
  })
  const totalValue = [...tokenBalances, ...protocolBalances].reduce((sum, item) => item.value + sum, 0)

  const update = [{
    date: dayjs.tz().format('YYYY-MM-DD'),
    identifier: 'WOODAO',
    total_value: totalValue,
    tokens: JSON.stringify(tokenBalances),
    in_protocols: JSON.stringify(protocolBalances),
  }]

  const query = knex.raw(
    `
      ? ON CONFLICT (date, identifier)
      DO UPDATE
      SET
        tokens = EXCLUDED.tokens,
        in_protocols = EXCLUDED.in_protocols,
        total_value = EXCLUDED.total_value;
    `,
    [knex('treasury_balances').insert(update)],
  )
  await client.query(`${query}`)
}

function getTokenBalances({ ethTokenBalances, avalancheTokenBalances, nearBalances, tokenTickers }) {
  const tokenBalances = [
    {
      chain: 'near',
      symbol: 'NEAR',
      logoUrl: tokenTickers.NEAR.logoUrl,
      amount: nearBalances.near,
      value: nearBalances.near * Number(tokenTickers.NEAR.price),
      price: Number(tokenTickers.NEAR.price),
    }
  ]

  ;[...avalancheTokenBalances, ...ethTokenBalances].forEach(balance => {
    const tokenDetails = {
      chain: balance.chain,
      symbol: balance.symbol,
      logoUrl: balance.logo_url,
      amount: balance.amount,
      price: balance.price,
      value: +balance.amount * +balance.price,
    }
    if (balance.chain !== 'eth') tokenDetails.chainLogoUrl = tokenTickers[balance.chain.toUpperCase()].logoUrl

    tokenBalances.push(tokenDetails)
  })

  return tokenBalances.sort((a, b) => b.value - a.value)
}

async function getProtocolBalances({ uniswapBalance, bancorBalance, tokenTickers, nearBalances, cBridgeBalances }) {
  const protocolBalances = [
    {
      type: 'staking',
      name: 'Staked NEAR',
      logoUrl: tokenTickers.NEAR.logoUrl,
      amount: nearBalances.stakedNear,
      value: +tokenTickers.NEAR.price * nearBalances.stakedNear,
      price: +tokenTickers.NEAR.price,
    },
    nearBalances.refFinanceBalances,
    cBridgeBalances,
  ]

  ;[uniswapBalance, bancorBalance].forEach(({ name, chain, site_url, logo_url, portfolio_item_list }) => {
    const protocolBalance = {
      name,
      chain,
      siteUrl: site_url,
      logoUrl: logo_url,
      value: 0,
      details: [],
      rewards: [],
    }

    portfolio_item_list.forEach(item => {
      const protocolDetail = {
        type: item.name,
        netValue: item.stats.net_usd_value,
      }
      protocolBalance.value += item.stats.net_usd_value

      if (item.name === 'Liquidity Pool') {
        protocolDetail.type = 'Liquidity Pool'
        const supplied = []
        item.detail.supply_token_list.forEach(token => {
          supplied.push({
            value: +token.amount * +token.price,
            logoUrl: token.logo_url,
            symbol: token.optimized_symbol,
            amount: token.amount,
          })
        })
        ;(item.detail.reward_token_list || []).forEach(token => {
          const value = +token.amount * +token.price
          protocolBalance.value += value
          addRewardsToProtocolBalance({ protocolBalance, token, value })
        })
        protocolDetail.supplied = supplied
      }

      protocolBalance.details.push(protocolDetail)
    })

    protocolBalances.push(protocolBalance)
  })

  return protocolBalances.sort((a, b) => b.value - a.value)
}
