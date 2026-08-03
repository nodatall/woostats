const updateCache = require('../commands/updateCache')
const getCache = require('../queries/getCache')
const logger = require('./logger')

const cacheKeysByCacheName = {
  general: ['tokenTickers', 'tokenTickersUpdatedAt'],
  network: [
    'wooSpotVolume',
    'wooFuturesVolume',
    'wooSpotVolumeToday',
    'wooFuturesVolumeToday',
    'woofiVolumeToday',
    'topSpotExchangeVolumes',
    'topFuturesExchangeVolumes',
    'woofiVolumeHistory',
    'exchangeVolumes24hr',
    'dailyWoofiVolumeByChain',
    'woofiPro24hrVolume',
    'woofiProVolumeHistory',
  ],
  dao: [
    // 'wooDaoTreasuryBalance'
  ],
  woofi: [
    // 'recentWooFiSwaps:bsc',
    // 'topWooFiSwaps:bsc',
    // 'dailyWooFiSwapVolume:bsc',
    // 'dailyNumberOfWooFiSwaps:bsc',
    // 'dailyWooFiVolumeBySources:bsc',
    // 'dailyWooFiVolumeByAssets:bsc',
    // 'wooFiAssetTokens',
  ],
  token: [
    // 'wooTokenBurns'
  ],
  starchild: [
    'starchildPlatformStats',
    'starchildPlatformStatsUpdatedAt',
  ],
}
const CACHE_NAMES = Object.keys(cacheKeysByCacheName)

function createMemoryCache({
  persistCache = updateCache,
  loadCache = getCache,
  cacheLogger = logger,
} = {}) {
  const memoryCache = {}
  const initializationPromises = new Map()

  async function get(cacheName = 'general') {
    await ensureInitialized(cacheName)
    return { ...memoryCache[cacheName] }
  }

  async function ensureInitialized(cacheName) {
    if (memoryCache[cacheName]) return

    if (!initializationPromises.has(cacheName)) {
      const initializationPromise = initializeCache(cacheName)
        .finally(() => initializationPromises.delete(cacheName))
      initializationPromises.set(cacheName, initializationPromise)
    }

    await initializationPromises.get(cacheName)
  }

  async function initializeCache(cacheName) {
    let cache
    try {
      cache = await loadCache(cacheName)
    } catch (error) {
      cacheLogger.error(`initializeCache failed for "${cacheName}"`, {
        message: error.message,
        stack: error.stack,
      })
      memoryCache[cacheName] = memoryCache[cacheName] || {}
      return
    }

    if (!cache) {
      cacheLogger.warn(`initializeCache received empty cache for "${cacheName}"; defaulting to {}`)
      memoryCache[cacheName] = {}
      try {
        await persistCache({ cacheName, cache: {} })
      } catch (error) {
        cacheLogger.error(`initializeCache failed to persist empty cache for "${cacheName}"`, {
          message: error.message,
          stack: error.stack,
        })
      }
      return
    }
    const initialCacheLength = Object.keys(cache).length
    for (let key in cache) {
      if (!cacheKeysByCacheName[cacheName].includes(key)) {
        console.error(`key "${key}" not in cacheKeysByCacheName for cacheName "${cacheName}"`)
        delete cache[key]
      }
    }
    if (Object.keys(cache).length !== initialCacheLength) {
      try {
        await persistCache({ cacheName, cache })
      } catch (error) {
        cacheLogger.error(`initializeCache failed to persist sanitized cache for "${cacheName}"`, {
          message: error.message,
          stack: error.stack,
        })
      }
      memoryCache[cacheName] = cache
    } else {
      memoryCache[cacheName] = cache
    }
  }

  async function buildUpdatedCache(changes, { strict = false } = {}) {
    const changesByCacheName = {}

    for (const key in changes) {
      if (changes[key] === undefined) continue
      let cacheName
      for (const _cacheName in cacheKeysByCacheName) {
        if (cacheKeysByCacheName[_cacheName].includes(key)) cacheName = _cacheName
      }
      if (!cacheName) {
        const message = `no cache name in cacheKeysByCacheName matching "${key}"`
        if (strict) throw new Error(message)
        console.error(message)
        continue
      }

      changesByCacheName[cacheName] = {
        ...changesByCacheName[cacheName],
        [key]: changes[key],
      }
    }

    const updatedCacheNames = new Set(Object.keys(changesByCacheName))
    for (const cacheName of updatedCacheNames) {
      await ensureInitialized(cacheName)
    }

    const updatedCache = { ...memoryCache }
    for (const cacheName of updatedCacheNames) {
      updatedCache[cacheName] = {
        ...memoryCache[cacheName],
        ...changesByCacheName[cacheName],
      }
    }

    return { updatedCache, updatedCacheNames }
  }

  async function update(changes) {
    const { updatedCache, updatedCacheNames } = await buildUpdatedCache(changes)

    for (const cacheName of [...updatedCacheNames]) {
      try {
        await persistCache({ cacheName, cache: updatedCache[cacheName] })
      } catch (error) {
        cacheLogger.error(`memoryCache.update failed to persist "${cacheName}"`, {
          message: error.message,
          stack: error.stack,
        })
      }
    }
    Object.assign(memoryCache, updatedCache)
  }

  async function updateStrict(changes) {
    const { updatedCache, updatedCacheNames } = await buildUpdatedCache(changes, { strict: true })

    for (const cacheName of [...updatedCacheNames]) {
      await persistCache({ cacheName, cache: updatedCache[cacheName] })
    }
    Object.assign(memoryCache, updatedCache)
  }

  return { get, update, updateStrict, CACHE_NAMES }
}

module.exports = {
  ...createMemoryCache(),
  createMemoryCache,
}
