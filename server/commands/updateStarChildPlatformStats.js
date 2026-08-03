const { fetchStarChildPlatformStats } = require('../lib/starChildPlatformStats')

module.exports = async function updateStarChildPlatformStats({
  memoryCache,
  socket,
  fetchPlatformStats = fetchStarChildPlatformStats,
  now = () => new Date(),
}) {
  const starchildPlatformStats = await fetchPlatformStats()
  const starchildPlatformStatsUpdatedAt = now().toISOString()
  const payload = {
    starchildPlatformStats,
    starchildPlatformStatsUpdatedAt,
  }

  await memoryCache.updateStrict(payload)
  socket.emit('send', payload)
  return payload
}
