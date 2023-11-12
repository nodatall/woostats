const request = require('./request')

const serverUrl = 'https://api.bscscan.com/api'
const keyString = `apikey=${process.env.BSCSCAN_API_KEY}`

module.exports = async function bscscanRequest(params) {
  const paramsWithKey = params ? `${keyString}&${params}` : keyString

  return await request({
    name: 'bscscanRequest',
    serverUrl,
    params: paramsWithKey,
  })
}
