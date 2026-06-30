const updateCache = require('../commands/updateCache')
const getCache = require('../queries/getCache')
const logger = require('./logger')

const memoryCache = {}

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
}
const CACHE_NAMES = Object.keys(cacheKeysByCacheName)

async function get(cacheName = 'general') {
  if (!memoryCache[cacheName]) await initializeCache(cacheName)
  return { ...memoryCache[cacheName] }
}

async function initializeCache(cacheName) {
  let cache
  try {
    cache = await getCache(cacheName)
  } catch (error) {
    logger.error(`initializeCache failed for "${cacheName}"`, {
      message: error.message,
      stack: error.stack,
    })
    memoryCache[cacheName] = memoryCache[cacheName] || {}
    return
  }

  if (!cache) {
    logger.warn(`initializeCache received empty cache for "${cacheName}"; defaulting to {}`)
    memoryCache[cacheName] = {}
    try {
      await updateCache({ cacheName, cache: {} })
    } catch (error) {
      logger.error(`initializeCache failed to persist empty cache for "${cacheName}"`, {
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
      await updateCache({ cacheName, cache })
    } catch (error) {
      logger.error(`initializeCache failed to persist sanitized cache for "${cacheName}"`, {
        message: error.message,
        stack: error.stack,
      })
    }
    memoryCache[cacheName] = cache
  } else {
    await update({ ...cache })
  }
}

async function update(changes) {
  const updatedCache = { ...memoryCache }
  const updatedCacheNames = new Set()

  for (const key in changes) {
    if (changes[key] === undefined) delete changes[key]
    let cacheName
    for (const _cacheName in cacheKeysByCacheName) {
      if (cacheKeysByCacheName[_cacheName].includes(key)) cacheName = _cacheName
    }
    if (!cacheName) {
      console.error(`no cache name in cacheKeysByCacheName matching "${key}"`)
      continue
    }

    if (!memoryCache[cacheName]) {
      let existingCache
      try {
        existingCache = await getCache(cacheName)
      } catch (error) {
        logger.error(`memoryCache.update failed to load existing cache for "${cacheName}"`, {
          message: error.message,
          stack: error.stack,
        })
      }
      updatedCache[cacheName] = existingCache || {}
    }

    updatedCache[cacheName] = updatedCache[cacheName]
      ? { ...updatedCache[cacheName], [key]: changes[key] }
      : { [key]: changes[key] }
    updatedCacheNames.add(cacheName)
  }

  for (const cacheName of [...updatedCacheNames]) {
    try {
      await updateCache({ cacheName, cache: updatedCache[cacheName] })
    } catch (error) {
      logger.error(`memoryCache.update failed to persist "${cacheName}"`, {
        message: error.message,
        stack: error.stack,
      })
    }
  }
  Object.assign(memoryCache, updatedCache)
}

module.exports = { get, update, CACHE_NAMES }
