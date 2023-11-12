const request = require('./request')

const serverUrl = 'https://pro-api.coingecko.com/api/v3'
const keyString = `x_cg_pro_api_key=${process.env.COINGECKO_API_KEY}`

module.exports = async function coingeckoRequest(path, params) {
  const paramsWithKey = params ? `${keyString}&${params}` : keyString
  return await request({
    name: 'coingeckoRequest',
    serverUrl,
    path,
    params: paramsWithKey,
  })
}
