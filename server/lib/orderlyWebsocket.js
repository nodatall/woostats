const WebSocket = require('ws')
const uuid = require('uuid')

const memoryCache = require('./memoryCache')
const update24hrExchangeVolume = require('../commands/update24hrExchangeVolume')
const logger = require('../lib/logger')

async function openOrderlyWebsocket(socket) {
  const orderlySocket = new WebSocket(`wss://ws-evm.orderly.org/ws/stream/${process.env.ORDERLY_ACCOUNT_ID}`)

  orderlySocket.on('open', () => {
    orderlySocket.send(JSON.stringify({
      id: uuid.v4(),
      event: 'subscribe',
      topic: 'tickers'
    }))
  })

  let lastUpdate = Date.now()
  let updateTimeout = setInterval(() => {
    if ((Date.now() - lastUpdate) > 20000) {
      orderlySocket.terminate()
      clearInterval(updateTimeout)
      openOrderlyWebsocket(socket)
    }
  }, 5000)

  orderlySocket.on('message', async messageStream => {
    const message = JSON.parse(messageStream.toString())

    if (message.event === 'ping') {
      orderlySocket.send(JSON.stringify({
        event: 'pong',
      }))
    } else if (message.topic === 'tickers') {
      if (!orderlySocket.debounce) {
        orderlySocket.debounce = 1

        let totalVolume = 0

        message.data.forEach(ticker => {
          totalVolume += ticker.amount
        })

        await update24hrExchangeVolume({ exchangeId: 'woofi_pro', volume: totalVolume })
        await memoryCache.update({ woofiPro24hrVolume: totalVolume })
        socket.emit('send', { woofiPro24hrVolume: totalVolume })
        lastUpdate = Date.now()
        setTimeout(() => {
          orderlySocket.debounce = null
        }, 1000)
      }
    }
  })

  orderlySocket.on('error', error => {
    console.error(`OrderlyWebsocket error ${error.message}`)
    logger.log('error', error.message)
  })
}

module.exports = openOrderlyWebsocket
