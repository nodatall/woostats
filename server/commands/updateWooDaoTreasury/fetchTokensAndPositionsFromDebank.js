const fetchEVMChainTokenBalancesForAddress = require('../../queries/fetchEVMChainTokenBalancesForAddress')
const fetchEVMChainProtocolBalanceForAddress = require('../../queries/fetchEVMChainProtocolBalanceForAddress')
const getTokenTickers = require('../../queries/getTokenTickers')
const { WOO_DAO_ETH_ADDRESS } = require('../../lib/treasury')
const { addRewardsToProtocolBalance } = require('../../lib/treasury')
const chainLogos = require('../../lib/chainLogos')
const dayjs = require('../../lib/dayjs')
const updatePositions = require('./updatePositions')

module.exports = async function fetchTokensAndPositionsFromDebank() {
  if (process.env.NODE_ENV !== 'production') return
  const wooBNBAddress = '0xfd899C7c5ED84537e2Acfc998ce26C3797654AE8'

  const fetchTokensUpdate = async () => {
    const wooAvaxDeployer = '0x3aB48821D50137c31Ac1961c5AD496E4977ec4CF'
    const bnbTokenBalances = await fetchEVMChainTokenBalancesForAddress({ address: wooBNBAddress, chainId: 'bsc' })
    const ethTokenBalances = await fetchEVMChainTokenBalancesForAddress({ address: WOO_DAO_ETH_ADDRESS, chainId: 'eth' })
    const avalancheTokenBalances = [
      ...await fetchEVMChainTokenBalancesForAddress({
        address: '0xB54382c680B0AD037C9F441A8727CA6006fe2dD0', chainId: 'avax',
      }),
      ...await fetchEVMChainTokenBalancesForAddress({
        address: wooAvaxDeployer, chainId: 'avax',
      })
    ]
    const tokenTickers = await getTokenTickers()
    const tokenBalances = getTokenBalances({ ethTokenBalances, avalancheTokenBalances, bnbTokenBalances, tokenTickers })

    return { tokens: tokenBalances }
  }

  await updatePositions({
    callerName: 'fetchTokenFromDebank',
    fetchUpdate: fetchTokensUpdate,
  })

  const fetchPositionsUpdate = async () => {
    const uniswapBalance = await fetchEVMChainProtocolBalanceForAddress({
      address: WOO_DAO_ETH_ADDRESS, chainId: 'eth', protocol: 'uniswap3',
    })
    const biswapBalance = await fetchEVMChainProtocolBalanceForAddress({
      address: wooBNBAddress, chainId: 'bsc', protocol: 'bsc_biswap',
    })
    const tokenTickers = await getTokenTickers()
    const protocolBalances = await getProtocolBalances({ uniswapBalance, tokenTickers, biswapBalance })

    return {
      protocolBalances,
    }
  }

  await updatePositions({
    callerName: 'fetchPositionsFromDebank',
    protocolNames: ['Uniswap V3', 'Biswap'],
    fetchUpdate: fetchPositionsUpdate,
    updateExisting: dayjs().minute() > 4,
  })
}

function getTokenBalances({ ethTokenBalances, avalancheTokenBalances, bnbTokenBalances, tokenTickers }) {
  const tokenBalances = []

  ;[...avalancheTokenBalances, ...ethTokenBalances, ...bnbTokenBalances].forEach(balance => {
    if (balance.price === 0 && tokenTickers[balance.symbol.toUpperCase()]) {
      balance.price = tokenTickers[balance.symbol.toUpperCase()].price
    }
    const tokenDetails = {
      chain: balance.chain,
      symbol: balance.symbol,
      logoUrl: balance.logo_url,
      amount: balance.amount,
      price: balance.price,
      value: +balance.amount * +balance.price,
    }
    if (balance.chain !== 'eth') {
      tokenDetails.chainLogoUrl = chainLogos[balance.chain]
    }

    tokenBalances.push(tokenDetails)
  })

  return tokenBalances.sort((a, b) => b.value - a.value)
}

async function getProtocolBalances({ uniswapBalance, biswapBalance, tokenTickers }) {
  const protocolBalances = []

  ;[uniswapBalance, biswapBalance].forEach(({ name, chain, site_url, logo_url, portfolio_item_list }) => {
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
          if (!token.price && tokenTickers[token.symbol.toUpperCase()]) {
            token.price = tokenTickers[token.symbol.toUpperCase()].price
          }
          const value = +token.amount * +token.price
          supplied.push({
            value,
            logoUrl: token.logo_url,
            symbol: token.optimized_symbol,
            amount: token.amount,
          })
          if (value > item.stats.net_usd_value) {
            protocolBalance.value += value
            protocolDetail.netValue += value
          }
        })
        ;(item.detail.reward_token_list || []).forEach(token => {
          if (!token.price && tokenTickers[token.symbol.toUpperCase()]) {
            token.price = tokenTickers[token.symbol.toUpperCase()].price
          }
          const value = +token.amount * +token.price
          if (value === 0) return
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
