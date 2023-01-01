const request = require('../../lib/request')
const { toReadableNumber } = require('../../lib/utils')
const getTokenTickers = require('../../queries/getTokenTickers')
const updatePositions = require('./updatePositions')

module.exports = async function fetchCBridgePositions() {
  const fetchUpdate = async () => {
    const tokenTickers = await getTokenTickers()
    const response = await request({
      name: 'cBridgeRequest',
      serverUrl: 'https://cbridge-prod2.celer.network',
      path: '/v1/getLPInfoList',
      params: 'addr=0x0a9eEddaa65546Ad35D3F0Ac9E6F09575E4C9297'
    })
    if (!response) return
    let totalValue = 0
    const liquidityPositions = response.lp_info
      .filter(lp => lp['liquidity_amt'] !== '0')
      .map(lp => {
        const liquidity = toReadableNumber(lp.token.token.decimal, lp.liquidity_amt)
        const symbol = lp.token.token.symbol.toUpperCase()
        const value = liquidity * tokenTickers[symbol].price
        totalValue += value
        return {
          chain: lp.chain.name,
          chainLogoUrl: lp.chain.icon,
          token: symbol,
          tokenLogoUrl: lp.token.icon,
          liquidity,
          value,
        }
      })
      .sort((a, b) => b.liquidity - a.liquidity)

    return {
      protocolBalances: [
        {
          name: 'cBridge',
          logoUrl: '/assets/c-bridge.png',
          type: 'bridge',
          value: totalValue,
          liquidityPositions,
        },
      ],
    }
  }

  await updatePositions({
    callerName: 'fetchCBridgePositions',
    protocolNames: ['cBridge'],
    fetchUpdate,
  })
}
