const coingeckoRequest = require('../lib/coingecko')
const { WOO_NETWORK_START_DATE } = require('../lib/constants')
const dayjs = require('../lib/dayjs')

module.exports = async function fetchCoingeckoHistoricalData({
  path, beginning = WOO_NETWORK_START_DATE, params = '',
}) {
  beginning = dayjs(beginning).utc().unix()
  const volumeHistory = []
  let to = dayjs().utc().unix()
  let from = to - (86400 * 30)
  let last = from
  while (last > beginning) {
    if (from === to) break
    let thirtyDayVolume = await coingeckoRequest(
      path,
      `${params}&from=${from}&to=${to}`,
    )
    if (thirtyDayVolume.length === 0) break

    if (path.includes('coins/')) thirtyDayVolume = thirtyDayVolume.prices
    volumeHistory.push(...thirtyDayVolume)
    to = from
    from = to - (86400 * 30)
    if (from < beginning) from = beginning
    last = dayjs(thirtyDayVolume[thirtyDayVolume.length - 1][0]).utc().unix()
  }

  return volumeHistory
}
