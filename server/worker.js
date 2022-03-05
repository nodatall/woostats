const cron = require('./lib/cron')
const fetchAndSendStats = require('./commands/fetchAndSendStats')
const fetchWooTokenBurns = require('./commands/fetchWooTokenBurns')

function start(socket){
  // fetchAndSendStats(socket)
  fetchWooTokenBurns(socket)

  cron.schedule('* * * * *', () => { // once a minute
    fetchAndSendStats(socket)
  })
  cron.schedule('0 0 * * *', () => { // once a day
    fetchWooTokenBurns(socket)
  })
}

module.exports = { start }
