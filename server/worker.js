const cron = require('./lib/cron')
const statsCache = require('./lib/statsCache')
const updateTokenTickers = require('./commands/updateTokenTickers')
const updateTotalMarketVolumeHistory = require('./commands/updateTotalMarketVolumeHistory')
const updateDailyExchangeVolume = require('./commands/updateDailyExchangeVolume')
const updateExchangeVolumeHistory = require('./commands/updateExchangeVolumeHistory')
const updateWooTokenBurns = require('./commands/updateWooTokenBurns')
const updateWooDaoTreasuryBalance = require('./commands/updateWooDaoTreasuryBalance')
const getExchangeVolume = require('./queries/getExchangeVolume')
const getWooTokenBurns = require('./queries/getWooTokenBurns')
const getWooDaoTreasuryBalance = require('./queries/getWooDaoTreasuryBalance')
const getTotalMarketVolumeHistory = require('./queries/getTotalMarketVolumeHistory')

function start(socket){
  if (process.env.INITIALIZE_ALL) intializeAllData(socket)

  cron.schedule('* * * * *', async () => { // once a minute
    const tokenTickers = await updateTokenTickers({ tokens: ['BTC', 'WOO'] })
    statsCache.update({ tokenTickers })

    await updateDailyExchangeVolume({ exchangeId: 'wootrade' })
    await updateTotalMarketVolumeHistory()

    const aggregateVolume = await getTotalMarketVolumeHistory()
    const wooVolume = await getExchangeVolume({ exchangeId: 'wootrade' })

    statsCache.update({ aggregateVolume, wooVolume })
    socket.emit('send', { tokenTickers, aggregateVolume, wooVolume })
  })

  cron.schedule('0 * * * *', async () => { // once an hour
    await updateWooTokenBurns()
    const wooTokenBurns = await getWooTokenBurns()
    statsCache.update({ wooTokenBurns })
    socket.emit('send', { wooTokenBurns })
  })

  cron.schedule('*/5 * * * *', async () => { // every 5 minutes
    await updateWooDaoTreasuryBalance()
    const wooDaoTreasuryBalance = await getWooDaoTreasuryBalance()
    statsCache.update({ wooDaoTreasuryBalance })
    socket.emit('send', { wooDaoTreasuryBalance })
  })


  cron.schedule('0 0 * * *', async () => { // once a day
    await updateExchangeVolumeHistory({ exchangeId: 'wootrade' })
    const wooVolume = await getExchangeVolume({ exchangeId: 'wootrade' })
    statsCache.update({ wooVolume })
    socket.emit('send', { wooVolume })
  })
}

async function intializeAllData(socket) {
  const tokenTickers = await updateTokenTickers({ tokens: ['BTC', 'WOO'] })
  statsCache.update({ tokenTickers })

  await updateExchangeVolumeHistory({ exchangeId: 'wootrade' })
  await updateDailyExchangeVolume({ exchangeId: 'wootrade' })
  await updateTotalMarketVolumeHistory()
  await updateWooTokenBurns()

  const aggregateVolume = await getTotalMarketVolumeHistory()
  const wooVolume = await getExchangeVolume({ exchangeId: 'wootrade' })
  const wooTokenBurns = await getWooTokenBurns()

  statsCache.update({ aggregateVolume, wooVolume })
  socket.emit('send', { tokenTickers, aggregateVolume, wooVolume, wooTokenBurns })

}

module.exports = { start }
