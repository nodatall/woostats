const statsCache = require('../lib/statsCache')
const fetchVolumeHistory = require('./fetchVolumeHistory')
const getTokenPrices = require('../queries/getTokenPrices')

module.exports = async function fetchAndSendStats(socket) {
  const { bitcoin, ['woo-network']: wooPrice } = await getTokenPrices(['bitcoin', 'woo-network'])
  if (!bitcoin) return
  await fetchVolumeHistory({ btcPrice: bitcoin })

  await statsCache.update({ wooPrice })
  const { wooVolume, aggregateVolume } = await statsCache.get()
  socket.emit('send', { wooVolume, aggregateVolume, wooPrice })
}
