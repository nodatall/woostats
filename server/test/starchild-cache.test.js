const assert = require('node:assert/strict')
const test = require('node:test')

const { createMemoryCache } = require('../lib/memoryCache')

const quietLogger = {
  error() {},
  warn() {},
}

function deferred() {
  let resolve
  let reject
  const promise = new Promise((_resolve, _reject) => {
    resolve = _resolve
    reject = _reject
  })
  return { promise, resolve, reject }
}

test('strict updates persist the Star Child namespace before advancing memory', async () => {
  const persistence = deferred()
  const persisted = []
  const cache = createMemoryCache({
    loadCache: async () => ({
      starchildPlatformStats: { agentsLaunched: 1 },
      starchildPlatformStatsUpdatedAt: 'old',
    }),
    persistCache: async (write) => {
      persisted.push(write)
      await persistence.promise
    },
    cacheLogger: quietLogger,
  })

  await cache.get('starchild')
  const updatePromise = cache.updateStrict({
    starchildPlatformStats: { agentsLaunched: 2 },
    starchildPlatformStatsUpdatedAt: 'new',
  })
  await new Promise(resolve => setImmediate(resolve))

  assert.deepEqual(await cache.get('starchild'), {
    starchildPlatformStats: { agentsLaunched: 1 },
    starchildPlatformStatsUpdatedAt: 'old',
  })
  assert.deepEqual(persisted[0], {
    cacheName: 'starchild',
    cache: {
      starchildPlatformStats: { agentsLaunched: 2 },
      starchildPlatformStatsUpdatedAt: 'new',
    },
  })

  persistence.resolve()
  await updatePromise
  assert.deepEqual(await cache.get('starchild'), persisted[0].cache)
})

test('strict persistence failure throws and leaves the last-good memory unchanged', async () => {
  let persistCount = 0
  const cache = createMemoryCache({
    loadCache: async () => ({
      starchildPlatformStats: { agentsLaunched: 1 },
      starchildPlatformStatsUpdatedAt: 'old',
    }),
    persistCache: async () => {
      persistCount += 1
      throw new Error('database unavailable')
    },
    cacheLogger: quietLogger,
  })

  await cache.get('starchild')
  await assert.rejects(
    cache.updateStrict({
      starchildPlatformStats: { agentsLaunched: 2 },
      starchildPlatformStatsUpdatedAt: 'new',
    }),
    /database unavailable/,
  )
  assert.deepEqual(await cache.get('starchild'), {
    starchildPlatformStats: { agentsLaunched: 1 },
    starchildPlatformStatsUpdatedAt: 'old',
  })
})

test('a concurrent first read cannot overwrite a newer strict update', async () => {
  const firstLoad = deferred()
  const loadStarted = deferred()
  const persisted = []
  let loadCount = 0
  const oldSnapshot = {
    starchildPlatformStats: { agentsLaunched: 1 },
    starchildPlatformStatsUpdatedAt: 'old',
  }
  const newSnapshot = {
    starchildPlatformStats: { agentsLaunched: 2 },
    starchildPlatformStatsUpdatedAt: 'new',
  }
  const cache = createMemoryCache({
    loadCache: async () => {
      loadCount += 1
      if (loadCount === 1) {
        loadStarted.resolve()
        await firstLoad.promise
      }
      return oldSnapshot
    },
    persistCache: async (write) => { persisted.push(write) },
    cacheLogger: quietLogger,
  })

  const getPromise = cache.get('starchild')
  await loadStarted.promise
  const updatePromise = cache.updateStrict(newSnapshot)
  await new Promise(resolve => setImmediate(resolve))

  assert.equal(loadCount, 1)
  assert.deepEqual(persisted, [])

  firstLoad.resolve()
  await Promise.all([getPromise, updatePromise])

  assert.equal(loadCount, 1)
  assert.deepEqual(persisted, [{ cacheName: 'starchild', cache: newSnapshot }])
  assert.deepEqual(await cache.get('starchild'), newSnapshot)
})

test('legacy non-strict updates retain their advance-on-persistence-failure behavior', async () => {
  const cache = createMemoryCache({
    loadCache: async () => ({}),
    persistCache: async () => { throw new Error('database unavailable') },
    cacheLogger: quietLogger,
  })

  await cache.update({ tokenTickers: { WOO: 1 } })
  assert.deepEqual(await cache.get('general'), { tokenTickers: { WOO: 1 } })
})

test('Star Child is an independent cache namespace', () => {
  const cache = createMemoryCache({ cacheLogger: quietLogger })
  assert.ok(cache.CACHE_NAMES.includes('starchild'))
})
