const request = require('./request')

module.exports = async function wooXRequest(path, params) {
  return await request({
    name: 'wooXRequest',
    serverUrl: 'https://api.woo.org',
    path,
    params,
  })
}
