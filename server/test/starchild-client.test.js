const assert = require('node:assert/strict')
const test = require('node:test')

const {
  STAR_CHILD_PLATFORM_STATS_URL,
  fetchStarChildPlatformStats,
  normalizePlatformStats,
} = require('../lib/starChildPlatformStats')

const validResponse = {
  agents_launched: 4170,
  human_queries: 170125,
  skills_available: 1112534,
  tokens_used_30d: 9763177574,
}

test('normalizes the complete Star Child response to client fields', async () => {
  const calls = []
  const result = await fetchStarChildPlatformStats({
    fetchImpl: async (...args) => {
      calls.push(args)
      return { ok: true, json: async () => validResponse }
    },
  })

  assert.deepEqual(result, {
    agentsLaunched: 4170,
    humanQueries: 170125,
    skillsAvailable: 1112534,
    tokensUsed30d: 9763177574,
  })
  assert.equal(calls.length, 1)
  assert.equal(calls[0][0], STAR_CHILD_PLATFORM_STATS_URL)
  assert.equal(calls[0][1].headers.Accept, 'application/json')
  assert.ok(calls[0][1].signal instanceof AbortSignal)
})

test('rejects missing and additional counters', () => {
  const { agents_launched, ...missingCounter } = validResponse

  assert.throws(
    () => normalizePlatformStats(missingCounter),
    /must contain exactly/,
  )
  assert.throws(
    () => normalizePlatformStats({ ...validResponse, extra: 1 }),
    /must contain exactly/,
  )
})

test('rejects malformed counters', () => {
  for (const invalidValue of [-1, 1.5, Infinity, NaN, '10', null]) {
    assert.throws(
      () => normalizePlatformStats({ ...validResponse, human_queries: invalidValue }),
      /human_queries.*finite non-negative integer/,
    )
  }
})

test('propagates network failures', async () => {
  const networkError = new Error('connection reset')

  await assert.rejects(
    fetchStarChildPlatformStats({
      fetchImpl: async () => { throw networkError },
    }),
    networkError,
  )
})

test('aborts requests at the configured timeout', async () => {
  let receivedSignal

  await assert.rejects(
    fetchStarChildPlatformStats({
      timeoutMs: 5,
      fetchImpl: async (url, { signal }) => {
        receivedSignal = signal
        await new Promise((resolve, reject) => {
          signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true })
        })
      },
    }),
    /timed out after 5ms/,
  )
  assert.equal(receivedSignal.aborted, true)
})
