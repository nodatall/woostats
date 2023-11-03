const axios = require('axios')
const logger = require('./logger')

async function request({
  name,
  method = 'get',
  serverUrl,
  keyString = '',
  path = '',
  params,
  headers = {},
  data,
}) {
  if (!name) throw new Error('name is required')
  let result

  try {
    let requestUrl = `${serverUrl}${path}`
    if (keyString || params) requestUrl += `?${keyString}${params}` // Combined keyString and params here

    const config = {
      method: method,
      url: requestUrl,
      headers: {
        'Cache-Control': 'no-store',
        'Pragma': 'no-cache',
        'Expires': '0',
        ...headers,
      },
    }

    if (['post', 'put', 'patch'].includes(method)) {
      config.data = data
    }

    logger.debug(`${name} ${config.url} ${JSON.stringify(data)}`)

    const response = await axios(config)
    result = response.data
  } catch (error) {
    if (error.config) {
      logger.log('error', `${name} ${error.config.url} ${JSON.stringify(error.response ? error.response.data : error)}`)
    } else {
      logger.log('error', `${name} ${error.message}`)
    }
  }

  if (result) logger.debug(`${name} result ${JSON.stringify(result).slice(0,500)}`)
  return result
}

module.exports = request
