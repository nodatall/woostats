const axios = require('axios')
const logger = require('./logger')

async function request({
  name,
  method = 'get',
  serverUrl,
  path = '',
  params,
  headers = {},
  data,
}) {
  if (!name) throw new Error('name is required')
  let result

  try {
    let requestUrl = `${serverUrl}${path}`
    if (params) {
      const searchParams = new URLSearchParams(params).toString()
      requestUrl += `?${searchParams}`
    }

    const config = {
      method: method,
      url: requestUrl,
      headers: {
        'Cache-Control': 'no-store',
        'Pragma': 'no-cache',
        'Expires': '0',
        ...headers,
      },
      maxBodyLength: Infinity,
    }

    if (['post', 'put', 'patch'].includes(method)) {
      config.data = data
    }

    logger.debug(`${name} ${config.url} ${JSON.stringify(data) || ''.slice(0,500)}`)

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
