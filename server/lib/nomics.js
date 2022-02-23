const request = require('./request')

const serverUrl = 'https://api.nomics.com/v1'
const keyString = `key=${process.env.NOMICS_API_KEY}`

module.exports = async function nomicsRequest(path, params) {
  return await request({
    name: 'nomicsRequest',
    serverUrl,
    keyString,
    path,
    params,
  })
}
