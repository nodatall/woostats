const cron = require('./lib/cron')
const memoryCache = require('./lib/memoryCache')
const { TOKEN_IDS } = require('./lib/constants.js')

const updateTokenTickers = require('./commands/updateTokenTickers')
const updateTopExchangeVolumeHistories = require('./commands/updateTopExchangeVolumeHistories')
const updateExchangeVolumeHistory = require('./commands/updateExchangeVolumeHistory')
const updateWoofi24hrVolume = require('./commands/updateWoofi24hrVolume')
const updateWoofiFeeHistory = require('./commands/updateWoofiFeeHistory')
const updateWoofiProDailyVolumeHistory = require('./commands/updateWoofiProDailyVolumeHistory')

const getExchangeVolumeHistory = require('./queries/getExchangeVolumeHistory')

async function start(socket){
  cron.schedule('* * * * *', async () => { // minute
    const tokenTickers = await updateTokenTickers({ tokens: TOKEN_IDS })
    await memoryCache.update({ tokenTickers })

    updateTopExchangeVolumeHistories({ memoryCache, socket })

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

  cron.schedule('*/10 * * * *', async () => { // 10 minutes
    updateWoofiProDailyVolumeHistory()
    updateWoofiFeeHistory()
  })
}

module.exports = { start }
