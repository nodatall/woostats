const cron = require('node-cron')

function intervalToSchedule(seconds){
  const c = n => n === 0 ? '*' : `*/${n}`
  const minutes = Math.floor(seconds / 60, 0)
  if (minutes >= 1){
    seconds = seconds % 60
    return seconds === 0
      ? `${c(minutes)} * * * *`
      : `*/${seconds} ${c(minutes)} * * * *`
  }else{
    return `${c(seconds)} * * * * *`
  }
}

module.exports = {
  intervalToSchedule,

  schedule(schedule, task){
    cron.schedule(schedule, task, {
      scheduled: true,
      timezone: "Atlantic/St_Helena",
    })
  },

  clearSchedule(){
    const tasks = cron.getTasks() // this returns a global variable
    for (const task of tasks) task.destroy()
    tasks.length = 0
  },
}
