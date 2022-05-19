const request = require('./request')

const authenticatedServerUrl = 'https://pro-openapi.debank.com'
const openServerUrl = 'https://openapi.debank.com'

module.exports = async function debankRequest(path, params, requiresAuthentication) {
  const headers = {}
  let serverUrl = openServerUrl
  if (requiresAuthentication) {
    headers.AccessKey = process.env.DEBANK_API_KEY
    serverUrl = authenticatedServerUrl
  }

  return await request({
    name: 'debankRequest',
    serverUrl,
    path,
    params,
    headers,
  })
}
