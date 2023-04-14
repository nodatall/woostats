const WebSocket = require('ws')

const { web3_eth } = require('./web3')
const request = require('./request')
const dayjs = require('./dayjs')
const logger = require('./logger')
const { createWooFiEvents } = require('../commands/createWooFiEvents')
const { queueWooFiEventType } = require('../commands/processWooFiEvents')
const { NAJKJI_BSC_WOOFI_WOOSWAPS } = require('./constants')

const STABLE_ADDRESSES = [
  '0xe9e7cea3dedca5984780bafc599bd69add087d56',  // BUSD
  '0x55d398326f99059ff775485246999027b3197955',  // USDT
  '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',  // USDC
  '0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3',  // DAI
]

async function start() {
  const streams = NAJKJI_BSC_WOOFI_WOOSWAPS.join('&streams=')
  subscribeToStream({
    endpoint: `wss://stream.nakji.network/ws/${process.env.NAKJI_API_KEY}?streams=${streams}`,
  })
}

async function subscribeToStream({ endpoint }) {
  const socketConnection = new WebSocket(endpoint)

  let lastUpdate = Date.now()
  let updateTimeout = setInterval(() => {
    if ((Date.now() - lastUpdate) > 30000) {
      socketConnection.terminate()
      clearInterval(updateTimeout)
      subscribeToStream({ endpoint })
    }
  }, 5000)

  socketConnection.on('message', async messageStream => {
    for (const message of messageStream.toString().split('\n')) {
      if (typeof message === 'string') {
        console.error(message)
        continue
      }
      const event = processNakjiMessage(JSON.parse(message))
      await createWooFiEvents({ events: [event] })
      queueWooFiEventType(event.Event)
    }
    lastUpdate = Date.now()
  })

  socketConnection.on('error', error => {
    console.error(`nakji.subscribeToStream error ${error.message}`)
    logger.log('error', error.message)
  })
}

function processNakjiMessage(message) {
  const processed = { ...message }
  for (let key in message.Data) {
    if (!['ts', 'blockNumber', 'index'].includes(key)) {
      if (typeof message.Data[key] !== 'object')
        processed.Data[key] = Buffer.from(message.Data[key], 'base64').toString('hex')
      if (key.includes('Amount') || key.includes('swap')) processed.Data[key] = processNakjiNumber(processed.Data[key])
      if (['fromToken', 'toToken', 'from', 'to', 'rebateTo'].includes(key))
        processed.Data[key] = web3_eth.utils.toHex(processed.Data[key])
      if (key === 'txHash') processed.Data[key] = `0x${processed.Data[key]}`
    }
    if (key === 'ts' && typeof message.Data[key] === 'object') {
      processed.Data[key] = dayjs.unix(message.Data[key].seconds).tz().format('YYYY-MM-DD HH:mm:ss')
    }
  }

  if (processed.Event.includes('WooSwap')) { // any swap
    processed.Data.usdVolume = STABLE_ADDRESSES.includes(processed.Data.fromToken)
      ? processed.Data.fromAmount.toFixed(8)
      : processed.Data.toAmount.toFixed(8)
  }
  return processed
}

function processNakjiNumber(nakjiNumber) {
  if (typeof nakjiNumber === 'object') {
    return nakjiNumber.Int * Math.pow(10, nakjiNumber.Exp - 18)
  } else {
    const number = parseInt(nakjiNumber, 16).toLocaleString('fullwide', { useGrouping:false })
    return Number(
      web3_eth.utils.fromWei(number).toString()
    )
  }
}

async function nakjiRequest({ path, params, headers }) {
  return await request({
    name: 'nakjiRequest',
    serverUrl: 'https://api.nakji.network/v1',
    path,
    params,
    headers,
  })
}

module.exports = {
  start,
  nakjiRequest,
  processNakjiMessage,
}
