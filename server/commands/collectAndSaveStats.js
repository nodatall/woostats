const coinGecko =  require('coingecko-api')
const delay = require('delay')

const dayjs = require('../lib/dayjs')
const db = require('../database')
const nomicsRequest = require('../lib/nomicsApi')
const logger = require('../lib/logger')

const CoinGeckoClient = new coinGecko()

module.exports = async function collectAndSaveStats(socket) {
  const newWoo = await getWooNetworkVolume()
  const newTotal = await getTotalMarketVolume()

  if (!newWoo && !newTotal) return
  const allStats = db.get()
  socket.emit('send', { allStats })
}

async function getTotalMarketVolume() {
  const wooMarketVolumes = db.get('wooVolumes') || []

  if (wooMarketVolumes.length === 0) return
  const wooStart = dayjs(wooMarketVolumes[0][0]).format('YYYY-MM-DD')

  const totalVolumes = db.get('totalVolumes') || []
  const noRecords = totalVolumes.length === 0
  const start = noRecords ? wooStart : dayjs.utc().format('YYYY-MM-DD')

  if (
    !noRecords &&
    totalVolumes[totalVolumes.length - 1][0] === dayjs.utc().format('MM-DD-YYYY')
  ) return

  let totalMarketVolumeHistory
  try {
    totalMarketVolumeHistory = await nomicsRequest(
      '/volume/history',
      `start=${start}T00%3A00%3A00Z&end=${dayjs.utc().format('YYYY-MM-DD')}T00%3A00%3A00Z`
    )
  } catch(error) {
    logger.log(
      'debug',
      `Error in getTotalMarketVolume ${error.config.url} ${error.response.data}`
    )
    return
  }

  const append = []
  const appendMemo = {}
  totalMarketVolumeHistory.reverse().forEach(volumeDay => {
    const { timestamp, volume } = volumeDay
    const formatedDate = dayjs.utc(timestamp).format('MM-DD-YYYY')
    if (formatedDate === '11-01-2021') {
      console.log(`volumeDay ==>`, volumeDay)
    }
    if (appendMemo[formatedDate]) return
    appendMemo[formatedDate] = true

    appendMemo[timestamp] = true
    append.unshift([
      dayjs.utc(formatedDate).format('MM-DD-YYYY'),
      volume,
    ])
  })

  db.set(
    'totalVolumes',
    [
      ...totalVolumes,
      ...append,
    ]
  )

  return true
}

async function getWooNetworkVolume() {
  const wooVolumes = db.get('wooVolumes') || []
  const noRecords = wooVolumes.length === 0
  const days = noRecords ? 365 : 1

  const today = dayjs.utc().format('MM-DD-YYYY')
  if (
    !noRecords &&
    (dayjs.utc(wooVolumes[wooVolumes.length - 1][0]).format('MM-DD-YYYY') === today)
  ) return

  let woo
  let btcPrice

  try {
    woo = await CoinGeckoClient.exchanges.fetchVolumeChart('wootrade', { days })
    await delay(1200)
    btcPrice = await CoinGeckoClient.simple.price({ ids: ['bitcoin'] })
  } catch(error) {
    logger.log(
      'debug',
      `Error request to coingecko in getWooNetworkVolume ${error}`
    )
    return
  }

  const append = []
  const appendMemo = {}
  woo.data.reverse().forEach(([date, volume]) => {
    const formatedDate = dayjs.utc(date).format('MM-DD-YYYY')
    if (appendMemo[formatedDate]) return
    appendMemo[formatedDate] = true

    append.unshift([
      formatedDate,
      volume * btcPrice.data.bitcoin.usd,
    ])
  })

  db.set(
    'wooVolumes',
    [
      ...wooVolumes,
      ...append,
    ]
  )

  return true
}
