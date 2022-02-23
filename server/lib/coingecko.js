const request = require('./request')

const serverUrl = 'https://pro-api.coingecko.com/api/v3'
const keyString = `x_cg_pro_api_key=${process.env.COINGECKO_APIKEY}`

module.exports = async function coingeckoRequest(path, params) {
  return await request({
    name: 'coingeckoRequest',
    serverUrl,
    keyString,
    path,
    params,
  })
}
