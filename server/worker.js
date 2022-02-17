const cron = require('./lib/cron')
const fetchAndSendStats = require('./commands/fetchAndSendStats')

function start(socket){
  fetchAndSendStats(socket)
  cron.schedule('0 * * * *', () => {
    // fetchAndSendStats(socket)
  })
}

module.exports = { start }
