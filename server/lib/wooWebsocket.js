const WebSocket = require('ws')

const statsCache = require('./statsCache')
const updateDailyExchangeVolume = require('../commands/updateDailyExchangeVolume')

async function openWooWebsocket(socket) {
  const wooSocket = new WebSocket('wss://wss.woo.org/ws/stream/OqdphuyCtYWxwzhxyLLjOWNdFP7sQt8RPWzmb5xY')

  wooSocket.on('open', () => {
    wooSocket.send(JSON.stringify({
      event: 'subscribe',
      id: 'tickers',
      topic: 'tickers'
    }))
  })

  let lastUpdate = Date.now()
  let updateTimeout = setInterval(() => {
    if ((Date.now() - lastUpdate) > 30000) {
      wooSocket.terminate()
      clearInterval(updateTimeout)
      openWooWebsocket(socket)
    }
  }, 5000)

  wooSocket.on('message', async messageStream => {
    const message = JSON.parse(messageStream.toString())

    if (message.event === 'ping') {
      wooSocket.send(JSON.stringify({
        event: 'pong',
      }))
    } else if (message.topic === 'tickers') {
      if (!wooSocket.debounce) {
        wooSocket.debounce = 1

        const {
          wooSpotVolumeToday,
          wooFuturesVolumeToday,
        } = message.data.reduce((acc, cur) => {
          if (cur.symbol.indexOf('SPOT') !== -1) {
            acc.wooSpotVolumeToday += cur.amount
          } else {
            acc.wooFuturesVolumeToday += cur.amount
          }
          return acc
        }, {
          wooSpotVolumeToday: 0,
          wooFuturesVolumeToday: 0,
        })

        await updateDailyExchangeVolume({ exchangeId: 'wootrade', volume: wooSpotVolumeToday })
        await updateDailyExchangeVolume({ exchangeId: 'woo_network_futures', volume: wooFuturesVolumeToday })

        statsCache.update({ wooSpotVolumeToday, wooFuturesVolumeToday })
        socket.emit('send', { wooSpotVolumeToday, wooFuturesVolumeToday })
        lastUpdate = Date.now()
        setTimeout(() => {
          wooSocket.debounce = null
        }, 1000)
      }
    }
  })
}

module.exports = openWooWebsocket
