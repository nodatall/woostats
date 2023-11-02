const knex = require('../database/knex')
const { client } = require('../database')
const dayjs = require('../lib/dayjs')
const request = require('../lib/request')
const { WOO_FUTURES_START_DATE } = require('../lib/constants')

const updateTokenPriceHistory = require('../commands/updateTokenPriceHistory')
const fetchExchangeVolumeHistory = require('../queries/fetchExchangeVolumeHistory')
const getTokenPriceHistory = require('../queries/getTokenPriceHistory')

module.exports = async function updateExchangeVolumeHistory({
  exchangeId, forceUpdate, isFutures, getAll, memoryCache, socket
}) {
  let volumeHistoryUpdate = []
  if (exchangeId === 'woofi') {
    const { dailyTotalWoofiVolume, dailyWoofiVolumeByChain } = await fetchWoofiVolumeData()
    volumeHistoryUpdate = dailyTotalWoofiVolume
    await memoryCache.update({ dailyWoofiVolumeByChain })
    socket.emit('send', { dailyWoofiVolumeByChain })
  } else {
    volumeHistoryUpdate = await fetchExchangeVolumeData(exchangeId, isFutures, forceUpdate, getAll)
  }

  if (volumeHistoryUpdate.length > 0) {
    await updateVolumeDataInDatabase(volumeHistoryUpdate)
  }
}

async function fetchWoofiVolumeData() {
  const response = await request({
    name: 'getWoofiVolumeFromDefiLlama',
    serverUrl: `https://api.llama.fi/summary/dexs/woofi?dataType=dailyVolume&random${generateUrlSafeString(5)}`,
  })
  if (!response.totalDataChart) return {}

  const dailyTotalWoofiVolume = response.totalDataChart.map(([rawDate, volume]) => ({
    date: dayjs.utc(rawDate * 1000).format('YYYY-MM-DD'),
    exchange: 'woofi',
    volume,
  }))
  const dailyWoofiVolumeByChain = response.totalDataChartBreakdown.map(([date, volumes]) => {
    const volumeByChain = {}
    for (let chain in volumes) {
      volumeByChain[chain] = volumes[chain]['WOOFi Swap']
    }
    return {
      date: dayjs.utc(date * 1000).format('YYYY-MM-DD'),
      volumeByChain,
    }
  })

  return {
    dailyTotalWoofiVolume,
    dailyWoofiVolumeByChain,
  }
}

async function fetchExchangeVolumeData(exchangeId, isFutures, forceUpdate, getAll) {
  const beginning = isFutures ? WOO_FUTURES_START_DATE : undefined
  const volumeHistory = await fetchExchangeVolumeHistory({ exchangeId, forceUpdate, beginning, getAll })
  if (!volumeHistory) return []

  await updateTokenPriceHistory({ tokenId: 'bitcoin' })
  const bitcoinHistory = await getTokenPriceHistory({ tokenId: 'bitcoin' })
  if (!bitcoinHistory) return []

  const btcPriceMap = {}
  bitcoinHistory.forEach(({ date, price }) => {
    btcPriceMap[dayjs.utc(date).format('YYYY-MM-DD')] = price
  })

  const seenDateMap = {}
  const last7 = []
  return volumeHistory.reverse().flatMap(([date, volumeInBTC]) => {
    const adjustedDate = dayjs.utc(date).subtract(1, 'day')
    const formattedDate = adjustedDate.format('YYYY-MM-DD')
    if (formattedDate === dayjs.utc().format('YYYY-MM-DD') || seenDateMap[formattedDate]) {
      return []
    }
    seenDateMap[formattedDate] = true
    let volume = Math.round(volumeInBTC * btcPriceMap[formattedDate])
    if (volume === 0) volume = last7[0]
    last7.push(volume)
    if (last7.length > 7) last7.shift()
    return {
      date: formattedDate,
      exchange: exchangeId,
      volume,
    }
  })
}

async function updateVolumeDataInDatabase(volumeHistoryUpdate) {
  const query = knex.raw(
    `? ON CONFLICT (date, exchange) DO UPDATE SET volume = EXCLUDED.volume;`,
    [knex('volume_by_exchange').insert(volumeHistoryUpdate)],
  )
  await client.query(`${query}`)
}

function generateUrlSafeString(length = 10) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}
