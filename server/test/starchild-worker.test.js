const assert = require('node:assert/strict')
const test = require('node:test')

const { createWorker } = require('../worker')

const quietLogger = {
  error() {},
}

function deferred() {
  let resolve
  const promise = new Promise(_resolve => { resolve = _resolve })
  return { promise, resolve }
}

function createTestWorker(updateStarChildPlatformStatsCommand) {
  const schedules = []
  const worker = createWorker({
    cronService: {
      schedule(expression, task) {
        schedules.push({ expression, task })
      },
    },
    workerLogger: quietLogger,
    cache: { update: async () => {} },
    updateStarChildPlatformStatsCommand,
  })
  return { schedules, worker }
}

test('refreshes immediately and registers a 60-second cron schedule', async () => {
  let refreshCount = 0
  const { schedules, worker } = createTestWorker(async () => { refreshCount += 1 })

  await worker.start({ emit() {} })

  assert.equal(refreshCount, 1)
  assert.deepEqual(
    schedules.map(({ expression }) => expression),
    ['*/5 * * * *', '*/10 * * * *', '* * * * *'],
  )
})

test('suppresses overlapping Star Child refreshes', async () => {
  const firstRefresh = deferred()
  let refreshCount = 0
  const { schedules, worker } = createTestWorker(async () => {
    refreshCount += 1
    if (refreshCount === 1) await firstRefresh.promise
  })

  const startPromise = worker.start({ emit() {} })
  await new Promise(resolve => setImmediate(resolve))
  const minuteTask = schedules.find(({ expression }) => expression === '* * * * *').task
  const overlappingResult = await minuteTask()

  assert.equal(refreshCount, 1)
  assert.equal(overlappingResult, undefined)

  firstRefresh.resolve()
  await startPromise
  await minuteTask()
  assert.equal(refreshCount, 2)
})
