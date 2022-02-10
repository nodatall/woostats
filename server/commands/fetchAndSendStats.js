const statsCache = require('../lib/statsCache')
const fetchExchangeVolumes = require('./fetchExchangeVolumes')

module.exports = async function fetchAndSendStats(socket) {
  await fetchExchangeVolumes()
  await statsCache.update()
  const { wooVolume, aggregateVolume } = await statsCache.get()
  socket.emit('send', { wooVolume, aggregateVolume })
}
