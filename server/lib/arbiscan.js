const request = require('./request')

const serverUrl = 'https://api.etherscan.io/v2/api'
const keyString = `apikey=${process.env.ETHERSCAN_API_KEY}`

module.exports = async function arbiscanRequest(params) {
  const paramsWithChain = params ? `chainid=42161&${params}` : 'chainid=42161'
  const paramsWithKey = `${paramsWithChain}&${keyString}`

  console.log('Request URL:', `${serverUrl}?${paramsWithKey}`)

  return await request({
    name: 'arbiscanRequest',
    serverUrl,
    params: paramsWithKey,
    headers: {
      'Accept': 'application/json'
    }
  })
}
