const coingeckoRequest = require('../lib/coingecko')

module.exports = async function fetchDailyExchangeStats({ exchangeId }) {
  return await coingeckoRequest(`/exchanges/${exchangeId}`)
}
