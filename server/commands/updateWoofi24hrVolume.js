const request = require('../lib/request')
const updateDailyExchangeVolume = require('./updateDailyExchangeVolume')

module.exports = async function updateWoofi24hrVolume() {
  const response = await request({
    name: 'fetchWoofi24hrVolume',
    serverUrl: 'https://fi-api.woo.org/multi_total_stat',
  })

  if (!response || response.status !== "ok") return

  await updateDailyExchangeVolume({ exchangeId: 'woofi', volume: response.data.past_24h_volume / 1e18 })
}
