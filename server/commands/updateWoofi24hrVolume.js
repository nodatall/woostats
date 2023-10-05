const request = require('../lib/request')
const update24hrExchangeVolume = require('./update24hrExchangeVolume')

module.exports = async function updateWoofi24hrVolume({ socket, memoryCache }) {
  const response = await request({
    name: 'fetchWoofi24hrVolume',
    serverUrl: 'https://fi-api.woo.org/multi_total_stat',
  })

  if (!response || response.status !== "ok") return

  const woofiVolumeToday = response.data.past_24h_volume / 1e18

  await update24hrExchangeVolume({ exchangeId: 'woofi', volume: woofiVolumeToday })

  await memoryCache.update({ woofiVolumeToday })
  socket.emit('send', { woofiVolumeToday })
}
