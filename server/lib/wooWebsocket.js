const WebSocket = require('ws')

const statsCache = require('./statsCache')
const updateDailyExchangeVolume = require('../commands/updateDailyExchangeVolume')
const getExchangeVolume = require('../queries/getExchangeVolume')

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
        spotVolume,
        futuresVolume,
      } = message.data.reduce((acc, cur) => {
        if (cur.symbol.indexOf('SPOT') !== -1) {
          acc.spotVolume += cur.amount
        } else {
          acc.futuresVolume += cur.amount
        }
        return acc
      }, {
        spotVolume: 0,
        futuresVolume: 0,
      })

      await updateDailyExchangeVolume({ exchangeId: 'wootrade', volume: spotVolume })
      await updateDailyExchangeVolume({ exchangeId: 'woo_network_futures', volume: futuresVolume })

      const wooSpotVolume = await getExchangeVolume({ exchangeId: 'wootrade' })
      const wooFuturesVolume = await getExchangeVolume({ exchangeId: 'woo_network_futures' })

      statsCache.update({ wooSpotVolume, wooFuturesVolume })
      socket.emit('send', { wooSpotVolume, wooFuturesVolume })
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
