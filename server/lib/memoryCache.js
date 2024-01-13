const updateCache = require('../commands/updateCache')
const getCache = require('../queries/getCache')

const memoryCache = {}

const cacheKeysByCacheName = {
  general: ['tokenTickers'],
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

async function get(cacheName) {
  if (!memoryCache[cacheName]) await initializeCache(cacheName)
  return { ...memoryCache[cacheName] }
}

async function initializeCache(cacheName) {
  const cache = await getCache(cacheName)
  const initialCacheLength = Object.keys(cache).length
  if (!cache) return
  for (let key in cache) {
    if (!cacheKeysByCacheName[cacheName].includes(key)) {
      console.error(`key "${key}" not in cacheKeysByCacheName for cacheName "${cacheName}"`)
      delete cache[key]
    }
  }
  if (Object.keys(cache).length !== initialCacheLength) {
    await updateCache({ cacheName, cache })
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
      const existingCache = await getCache(cacheName)
      updatedCache[cacheName] = existingCache
    }

    updatedCache[cacheName] = updatedCache[cacheName]
      ? { ...updatedCache[cacheName], [key]: changes[key] }
      : { [key]: changes[key] }
    updatedCacheNames.add(cacheName)
  }

  for (const cacheName of [...updatedCacheNames]) {
    await updateCache({ cacheName, cache: updatedCache[cacheName] })
  }
  Object.assign(memoryCache, updatedCache)
}

module.exports = { get, update, CACHE_NAMES }
