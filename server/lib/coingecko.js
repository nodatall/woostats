const axios = require('axios')

const logger = require('./logger')

const serverUrl = 'https://pro-api.coingecko.com/api/v3'
const keyString = `x_cg_pro_api_key=${process.env.COINGECKO_APIKEY}`

async function request(path, params) {
  let result

  try {
    let requestUrl = `${serverUrl}${path}?${keyString}`
    logger.debug(`coingecko.request ${requestUrl}`)
    if (params) requestUrl += params
    const response = await axios.get(requestUrl)
    result = response.data
  } catch(error) {
    logger.log('error', `coingeckoRequest ${error.config.url} ${JSON.stringify(error.response.data)}`)
  }

  if (result) logger.debug(`coingecko.request result ${JSON.stringify(result).slice(0,500)}`)
  return result
}

module.exports = { request }
