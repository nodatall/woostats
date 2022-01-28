const cron = require('./lib/cron')
const collectAndSaveStats = require('./commands/collectAndSaveStats')

function start(){
  collectAndSaveStats()

  const schedule = cron.intervalToSchedule(60)
  cron.schedule(schedule, () => {
    collectAndSaveStats()
  })
}

module.exports = { start }
