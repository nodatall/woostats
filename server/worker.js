const cron = require('./lib/cron')
const fetchAndSendStats = require('./commands/fetchAndSendStats')

function start(socket){
  cron.schedule('* * * * *', () => {
    fetchAndSendStats(socket)
  })
}

module.exports = { start }
