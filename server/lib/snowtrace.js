const request = require('./request')

const serverUrl = 'https://api.snowtrace.io/api'
const keyString = `apikey=${process.env.SNOWTRACE_API_KEY}`

module.exports = async function snowtraceRequest(params) {
  const paramsWithKey = params ? `${keyString}&${params}` : keyString

  return await request({
    name: 'snowtraceRequest',
    serverUrl,
    params: paramsWithKey,
  })
}
