const WebSocket = require('ws')

const statsCache = require('./statsCache')
const updateDailyExchangeVolume = require('../commands/updateDailyExchangeVolume')

module.exports = async function openWooWebsocket(socket) {
  const wooSocket = new WebSocket('wss://wss.woo.org/ws/stream/OqdphuyCtYWxwzhxyLLjOWNdFP7sQt8RPWzmb5xY')

  wooSocket.on('open', () => {
    wooSocket.send(JSON.stringify({
      event: 'subscribe',
      id: 'tickers',
      topic: 'tickers'
    }))
  })

  wooSocket.on('message', async messageStream => {
    const message = JSON.parse(messageStream.toString())

    if (message.event === 'ping') {
      heartbeat(wooSocket)
      wooSocket.send(JSON.stringify({
        event: 'pong',
      }))
    } else if (message.topic === 'tickers') {
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
    }
  })

  wooSocket.on('close', function clear() {
    clearTimeout(this.pingTimeout)
  })
}

function heartbeat(wooSocket) {
  clearTimeout(wooSocket.pingTimeout)
  wooSocket.pingTimeout = setTimeout(() => {
    wooSocket.terminate()
  }, 30000)
}
