const knex = require('../database/knex')
const { client } = require('../database')
const dayjs = require('../lib/dayjs')
const { WOO_FUTURES_START_DATE } = require('../lib/constants')

const updateTokenPriceHistory = require('../commands/updateTokenPriceHistory')
const fetchExchangeVolumeHistory = require('../queries/fetchExchangeVolumeHistory')
const getTokenPriceHistory = require('../queries/getTokenPriceHistory')

module.exports = async function updateExchangeVolumeHistory({ exchangeId, forceUpdate, isFutures }) {
  await updateTokenPriceHistory({ tokenId: 'bitcoin' })
  const bitcoinHistory = await getTokenPriceHistory({ tokenId: 'bitcoin' })

  const beginning = isFutures ? WOO_FUTURES_START_DATE : undefined
  const volumeHistory = await fetchExchangeVolumeHistory({ exchangeId, forceUpdate, beginning })
  if (!volumeHistory || !bitcoinHistory) return

  const btcPriceMap = {}
  bitcoinHistory.forEach(({ date, price }) => {
    btcPriceMap[dayjs.tz(date).format('YYYY-MM-DD')] = price
  })

  const seenDateMap = {}
  let volumeHistoryUpdate = []
  const last7 = []
  volumeHistory.reverse().forEach(([date, volumeInBTC]) => {
    const formattedDate = dayjs.tz(date).format('YYYY-MM-DD')
    if (formattedDate === dayjs.tz().format('YYYY-MM-DD')) return
    if (seenDateMap[formattedDate]) return
    seenDateMap[formattedDate] = true
    let volume = Math.round(volumeInBTC * btcPriceMap[formattedDate])
    if (volume === 0) volume = last7[0]
    last7.push(volume)
    if (last7.length > 7) last7.shift()
    volumeHistoryUpdate.push({
      date: formattedDate,
      exchange: exchangeId,
      volume,
    })
  })

  const query = knex.raw(
    `? ON CONFLICT (date, exchange) DO UPDATE SET volume = EXCLUDED.volume;`,
    [knex('volume_by_exchange').insert(volumeHistoryUpdate)],
  )
  await client.query(`${query}`)
}
