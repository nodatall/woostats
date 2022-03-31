const request = require('./request')

const serverUrl = 'https://openapi.debank.com/v1'
const keyString = `id=${DEBANK_API_KEY}`

module.exports = async function debankRequest(path, params) {
  return await request({
    name: 'debankRequest',
    serverUrl,
    keyString,
    path,
    params,
  })
}
