const coinGecko =  require('coingecko-api')
const dayjs = require('../lib/dayjs')

const db = require('../database')
const nomicsRequest = require('../lib/nomicsApi')
const logger = require('../lib/logger')

const CoinGeckoClient = new coinGecko()

module.exports = async function collectAndSaveStats() {
  await getWooNetworkVolume()
  await getTotalMarketVolume()
}

async function getTotalMarketVolume() {
  if (!db.get('wooVolumes')) return

  const totalVolumes = db.get('totalVolumes') || []
  const noRecords = totalVolumes.length === 0
  const today = dayjs.utc().format('YYYY-MM-DD')
  const start = noRecords ? '2021-06-26' : today
  const aFewDaysAgo = '2022-01-20'

  if (
    !noRecords &&
    (dayjs.utc(totalVolumes[totalVolumes.length - 1][0]).format('MM-DD-YYYY') === today)
  ) return

  let totalMarketVolumeHistory
  try {
    totalMarketVolumeHistory = await nomicsRequest(
      '/volume/history',
      `start=${aFewDaysAgo}T00%3A00%3A00Z&end=${dayjs.utc().format('YYYY-MM-DD')}T00%3A00%3A00Z`
    )
  } catch(error) {
    logger.log(
      'debug',
      `Error in getTotalMarketVolume ${error.config.url} ${error.response.data}`
    )
    return
  }

  console.log(`totalMarketVolumeHistory ==>`, totalMarketVolumeHistory)
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
    btcPrice = await CoinGeckoClient.simple.price({ ids: ['bitcoin'] })
  } catch(error) {
    logger.log(
      'debug',
      `Error request to coingecko in getWooNetworkVolume ${error}`
    )
    return
  }

  const append = woo.data.map(([date, volume]) => {
    return [
      dayjs.utc(date).format('MM-DD-YYYY'),
      volume * btcPrice.data.bitcoin.usd,
    ]
  })

  db.set(
    'wooVolumes',
    [
      ...wooVolumes,
      ...append,
    ]
  )
}
