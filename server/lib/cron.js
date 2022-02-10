const cron = require('node-cron')

module.exports = {
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
