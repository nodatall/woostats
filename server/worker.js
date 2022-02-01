const cron = require('./lib/cron')
const collectAndSaveStats = require('./commands/collectAndSaveStats')

function start(socket){
  const schedule = cron.intervalToSchedule(20)
  cron.schedule(schedule, () => {
    collectAndSaveStats(socket)
  })
}

module.exports = { start }
