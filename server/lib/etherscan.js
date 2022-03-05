const request = require('./request')

const serverUrl = 'https://api.etherscan.io/api'
const keyString = `apikey=${process.env.ETHERSCAN_API_KEY}`

module.exports = async function etherscanRequest(params) {
  return await request({
    name: 'etherscanRequest',
    serverUrl,
    keyString,
    params,
  })
}
