const statsCache = require('../lib/statsCache')
const fetchVolumeHistory = require('./fetchVolumeHistory')
const getTokenPrice = require('../queries/getTokenPrice')

module.exports = async function fetchAndSendStats(socket) {
  const btcPrice = await getTokenPrice({ token: 'bitcoin' })
  if (!btcPrice) return
  await fetchVolumeHistory({ btcPrice })

  await statsCache.update()
  const { wooVolume, aggregateVolume } = await statsCache.get()
  socket.emit('send', { wooVolume, aggregateVolume })
}
