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

const getExchangeVolumeHistory = require('./queries/getExchangeVolumeHistory')

async function runSafely(name, task) {
  try {
    await task()
  } catch (error) {
    logger.error(`${name} failed`, {
      message: error.message,
      stack: error.stack,
    })
  }
}

async function start(socket){
  cron.schedule('*/5 * * * *', async () => { // 5 minutes
    await runSafely('5 minute worker', async () => {
      const tokenTickers = await updateTokenTickers({ tokens: TOKEN_IDS })
      await memoryCache.update({ tokenTickers })

      await updateTopExchangeVolumeHistories({ memoryCache, socket })

      await updateWoofi24hrVolume({ memoryCache, socket })
      await updateExchangeVolumeHistory({ exchangeId: 'wootrade' })
      await updateExchangeVolumeHistory({ exchangeId: 'woo_network_futures', isFutures: true })
      await updateExchangeVolumeHistory({ exchangeId: 'woofi', memoryCache, socket })

      const woofiVolumeHistory = await getExchangeVolumeHistory({ exchangeId: 'woofi'})
      const wooSpotVolume = await getExchangeVolumeHistory({ exchangeId: 'wootrade' })
      const wooFuturesVolume = await getExchangeVolumeHistory({ exchangeId: 'woo_network_futures' })

      await memoryCache.update({ wooSpotVolume, wooFuturesVolume, woofiVolumeHistory })
      socket.emit('send', { tokenTickers, wooSpotVolume, wooFuturesVolume, woofiVolumeHistory })
    })
  })

  cron.schedule('*/10 * * * *', async () => { // 10 minutes
    await runSafely('10 minute worker', async () => {
      // updateWoofiFeeHistory()
      await updateTotalWoofiMp()
      await updateWoofiProDailyVolumeHistory()
      const woofiProVolumeHistory = await getExchangeVolumeHistory({ exchangeId: 'woofi_pro' })
      await memoryCache.update({ woofiProVolumeHistory })
      socket.emit('send', { woofiProVolumeHistory })
    })
  })
}

module.exports = { start }
