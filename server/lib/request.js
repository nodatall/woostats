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
}) {
  if (!name) throw new Error('name is required')
  let result

  try {
    let requestUrl = `${serverUrl}${path}`
    if (keyString || params) requestUrl += `?${keyString}`
    logger.debug(`${name} ${requestUrl} ${params}`)
    if (params) requestUrl += params
    const options = {
      headers: {
        'Cache-Control': 'no-store',
        'Pragma': 'no-cache',
        'Expires': '0',
        ...headers,
      }
    }
    const response = await axios[method](requestUrl, options)
    result = response.data
  } catch(error) {
    logger.log('error', `${name} ${error.config.url} ${JSON.stringify(error.response ? error.response.data : error)}`)
  }

  if (result) logger.debug(`${name} result ${JSON.stringify(result).slice(0,500)}`)
  return result
}

module.exports = request
