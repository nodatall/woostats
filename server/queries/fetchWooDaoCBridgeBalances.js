const request = require('../lib/request')
const { toReadableNumber } = require('../lib/utils')
const getTokenTickers = require('../queries/getTokenTickers')

module.exports = async function fetchWooDaoCBridgeBalances() {
  const tokenTickers = await getTokenTickers()

  const response = await request({
    name: 'cBridgeRequest',
    serverUrl: 'https://cbridge-prod2.celer.network',
    path: '/v1/getLPInfoList',
    params: 'addr=0x891c61289ccE86a8f8d62BD51a070857E0Db7abe'
  })
  if (!response) return
  let totalValue = 0
  const liquidityPositions = response.lp_info
    .filter(lp => lp['liquidity_amt'] !== '0')
    .map(lp => {
      const liquidity = toReadableNumber(lp.token.token.decimal, lp.liquidity_amt)
      const value = liquidity * tokenTickers[lp.token.token.symbol.toUpperCase()].price
      totalValue += value
      return {
        chain: lp.chain.name,
        chainLogoUrl: lp.chain.icon,
        token: lp.token.token.symbol,
        tokenLogoUrl: lp.token.icon,
        liquidity,
        value,
      }
    })
    .sort((a, b) => b.liquidity - a.liquidity)

  return {
    name: 'cBridge',
    logoUrl: 'https://cbridge.celer.network/static/media/favicon.e3350473.png',
    type: 'bridge',
    value: totalValue,
    liquidityPositions,
  }
}
