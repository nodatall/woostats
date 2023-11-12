const request = require('./request')

const serverUrl = 'https://api.etherscan.io/api'
const keyString = `apikey=${process.env.ETHERSCAN_API_KEY}`

module.exports = async function etherscanRequest(params) {
  const paramsWithKey = params ? `${keyString}&${params}` : keyString

  return await request({
    name: 'etherscanRequest',
    serverUrl,
    params: paramsWithKey,
  })
}
