const assert = require('node:assert/strict')
const test = require('node:test')

const updateStarChildPlatformStats = require('../commands/updateStarChildPlatformStats')

const platformStats = {
  agentsLaunched: 1,
  humanQueries: 2,
  skillsAvailable: 3,
  tokensUsed30d: 4,
}
const updatedAt = '2026-08-03T12:34:56.000Z'

test('strictly persists a complete snapshot before broadcasting it', async () => {
  const events = []
  const payload = await updateStarChildPlatformStats({
    memoryCache: {
      async updateStrict(changes) {
        events.push(['persist', changes])
      },
    },
    socket: {
      emit(name, changes) {
        events.push(['emit', name, changes])
      },
    },
    fetchPlatformStats: async () => platformStats,
    now: () => new Date(updatedAt),
  })

  assert.deepEqual(payload, {
    starchildPlatformStats: platformStats,
    starchildPlatformStatsUpdatedAt: updatedAt,
  })
  assert.deepEqual(events, [
    ['persist', payload],
    ['emit', 'send', payload],
  ])
})

test('does not persist or broadcast when the upstream request fails', async () => {
  let persistCount = 0
  let emitCount = 0

  await assert.rejects(
    updateStarChildPlatformStats({
      memoryCache: { updateStrict: async () => { persistCount += 1 } },
      socket: { emit: () => { emitCount += 1 } },
      fetchPlatformStats: async () => { throw new Error('upstream failed') },
    }),
    /upstream failed/,
  )
  assert.equal(persistCount, 0)
  assert.equal(emitCount, 0)
})

test('does not broadcast when strict persistence fails', async () => {
  let emitCount = 0

  await assert.rejects(
    updateStarChildPlatformStats({
      memoryCache: { updateStrict: async () => { throw new Error('database failed') } },
      socket: { emit: () => { emitCount += 1 } },
      fetchPlatformStats: async () => platformStats,
    }),
    /database failed/,
  )
  assert.equal(emitCount, 0)
})
