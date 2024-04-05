const request = require('./request')

const serverUrl = 'https://api.arbiscan.io/api'
const keyString = `apikey=${process.env.ARBISCAN_API_KEY}`

module.exports = async function arbicanRequest(params) {
  const paramsWithKey = params ? `${keyString}&${params}` : keyString

  return await request({
    name: 'arbiscanRequest',
    serverUrl,
    params: paramsWithKey,
  })
}
