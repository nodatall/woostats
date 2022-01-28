const axios = require('axios')

const serverUrl = 'https://api.nomics.com/v1'
const keyString = `key=${process.env.NOMICS_API_KEY}`

module.exports = async function nomicsRequest(path, params) {
  const response = await axios.get(`${serverUrl}${path}?${keyString}&${params}`)
  return response.data
}
