const base58 = require('base-x')('123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz')
const nacl = require('tweetnacl')
nacl.util = require('tweetnacl-util')
const request = require('./request')
const logger = require('./logger')

const orderlyAccountId = process.env.ORDERLY_ACCOUNT_ID
const orderlyKey = process.env.ORDERLY_API_KEY
const orderlySecret = process.env.ORDERLY_API_SECRET

function base64url(source) {
  return source.replace(/\+/g, '-').replace(/\//g, '_')
}

async function getHeaders(method = 'get', path, params) {
  const timestamp = new Date().getTime().toString()
  const secretKeyPart = orderlySecret.split(':')[1]
  const decodedSecretKey = base58.decode(secretKeyPart)

  let queryString = new URLSearchParams(params).toString()
  let dataToSign = `${timestamp}${method.toUpperCase()}${path}?${queryString}`

  const keyPair = nacl.sign.keyPair.fromSeed(decodedSecretKey.slice(0, 32))
  const signature = nacl.sign.detached(nacl.util.decodeUTF8(dataToSign), keyPair.secretKey)
  const signatureBase64 = base64url(nacl.util.encodeBase64(signature))

  return {
    'Content-Type': 'application/x-www-form-urlencoded',
    'orderly-timestamp': timestamp,
    'orderly-account-id': orderlyAccountId,
    'orderly-key': orderlyKey,
    'orderly-signature': signatureBase64
  }
}

module.exports = async function orderlyRequest({ method, path, params }) {
  const headers = await getHeaders(method, path, params)

  const response = await request({
    name: 'orderlyRequest',
    method,
    serverUrl: 'https://api-evm.orderly.org',
    path,
    params,
    headers,
  })

  if (response && response.success !== true) {
    logger.log('error', 'orderlyRequest error', `${response}`)
  }

  return response
}
