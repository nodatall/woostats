const cron = require('./lib/cron')
const logger = require('./lib/logger')
const memoryCache = require('./lib/memoryCache')
const { TOKEN_IDS } = require('./lib/constants.js')

const updateTokenTickers = require('./commands/updateTokenTickers')
const updateTopExchangeVolumeHistories = require('./commands/updateTopExchangeVolumeHistories')
const updateExchangeVolumeHistory = require('./commands/updateExchangeVolumeHistory')
const updateWoofi24hrVolume = require('./commands/updateWoofi24hrVolume')
// const updateWoofiFeeHistory = require('./commands/updateWoofiFeeHistory')
const updateWoofiProDailyVolumeHistory = require('./commands/updateWoofiProDailyVolumeHistory')
const updateTotalWoofiMp = require('./commands/updateTotalWoofiMp')
const updateStarChildPlatformStats = require('./commands/updateStarChildPlatformStats')

const getExchangeVolumeHistory = require('./queries/getExchangeVolumeHistory')

function createWorker({
  cronService = cron,
  workerLogger = logger,
  cache = memoryCache,
  tokenIds = TOKEN_IDS,
  updateTokenTickersCommand = updateTokenTickers,
  updateTopExchangeVolumeHistoriesCommand = updateTopExchangeVolumeHistories,
  updateExchangeVolumeHistoryCommand = updateExchangeVolumeHistory,
  updateWoofi24hrVolumeCommand = updateWoofi24hrVolume,
  updateWoofiProDailyVolumeHistoryCommand = updateWoofiProDailyVolumeHistory,
  updateTotalWoofiMpCommand = updateTotalWoofiMp,
  updateStarChildPlatformStatsCommand = updateStarChildPlatformStats,
  getExchangeVolumeHistoryQuery = getExchangeVolumeHistory,
} = {}) {
  let starChildRefreshInFlight = false

  async function runSafely(name, task) {
    try {
      await task()
    } catch (error) {
      workerLogger.error(`${name} failed`, {
        message: error.message,
        stack: error.stack,
      })
    }
  }

  async function refreshStarChild(socket) {
    if (starChildRefreshInFlight) return false
    starChildRefreshInFlight = true

    try {
      await runSafely('Star Child worker', async () => {
        await updateStarChildPlatformStatsCommand({ memoryCache: cache, socket })
      })
    } finally {
      starChildRefreshInFlight = false
    }
    return true
  }

  async function start(socket){
    cronService.schedule('*/5 * * * *', async () => { // 5 minutes
      await runSafely('5 minute worker', async () => {
        const tokenTickers = await updateTokenTickersCommand({ tokens: tokenIds })
        await cache.update({ tokenTickers })

        await updateTopExchangeVolumeHistoriesCommand({ memoryCache: cache, socket })

        await updateWoofi24hrVolumeCommand({ memoryCache: cache, socket })
        await updateExchangeVolumeHistoryCommand({ exchangeId: 'wootrade' })
        await updateExchangeVolumeHistoryCommand({ exchangeId: 'woo_network_futures', isFutures: true })
        await updateExchangeVolumeHistoryCommand({ exchangeId: 'woofi', memoryCache: cache, socket })

        const woofiVolumeHistory = await getExchangeVolumeHistoryQuery({ exchangeId: 'woofi'})
        const wooSpotVolume = await getExchangeVolumeHistoryQuery({ exchangeId: 'wootrade' })
        const wooFuturesVolume = await getExchangeVolumeHistoryQuery({ exchangeId: 'woo_network_futures' })

        await cache.update({ wooSpotVolume, wooFuturesVolume, woofiVolumeHistory })
        socket.emit('send', { tokenTickers, wooSpotVolume, wooFuturesVolume, woofiVolumeHistory })
      })
    })

    cronService.schedule('*/10 * * * *', async () => { // 10 minutes
      await runSafely('10 minute worker', async () => {
        // updateWoofiFeeHistory()
        await updateTotalWoofiMpCommand()
        await updateWoofiProDailyVolumeHistoryCommand()
        const woofiProVolumeHistory = await getExchangeVolumeHistoryQuery({ exchangeId: 'woofi_pro' })
        await cache.update({ woofiProVolumeHistory })
        socket.emit('send', { woofiProVolumeHistory })
      })
    })

    cronService.schedule('* * * * *', async () => {
      await refreshStarChild(socket)
    })

    await refreshStarChild(socket)
  }

  return { start }
}

module.exports = {
  ...createWorker(),
  createWorker,
}
