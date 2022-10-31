const { client, db } = require('../../database')

const getRecentWooFiSwaps = require('./getRecentWooFiSwaps')
const getTopWooFiSwaps = require('./getTopWooFiSwaps')
const getDailySwapVolume = require('./getDailySwapVolume')
const getDailyNumberOfWooFiSwaps = require('./getDailyNumberOfWooFiSwaps')
const getDailyVolumeBySources = require('./getDailyVolumeBySources')
const getDailyVolumeByAssets = require('./getDailyVolumeByAssets')
const getTokensFromContracts = require('./getTokensFromContracts')

const getFunctionIndexMap = {
  1: getRecentWooFiSwaps,
  2: getTopWooFiSwaps,
  3: getDailySwapVolume,
  4: getDailyNumberOfWooFiSwaps,
  5: getDailyVolumeBySources,
  6: getDailyVolumeByAssets,
  7: getTokensFromContracts,
}
const eventGetFunctionMap = {
  'nakji.woofi.0_0_0.WOOPP_WooSwap': [1, 2, 3, 4, 5, 6, 7],
}

const eventsByChain = {
  bsc: ['nakji.woofi.0_0_0.WOOPP_WooSwap']
}

const eventTypesToChainMap = {}
for (const chain in eventsByChain) {
  for (const event of eventsByChain[chain]) {
    eventTypesToChainMap[event] = chain
  }
}

module.exports = async function getWooFiStats({ eventTypes, getAll = false }) {
  const stats = {}
  if (getAll) {
    for (const chain of Object.keys(eventsByChain)) {
      const getFunctions = Object.values(getFunctionIndexMap)
      await callGetFunctionsForChain({ chain, getFunctions, stats })
    }
  } else {
    const getFunctionIndexesByChain = {}
    for (const eventType of eventTypes) {
      const chain = eventTypesToChainMap[eventType]
      const getFunctionIndexes = eventGetFunctionMap[eventType]
      getFunctionIndexesByChain[chain] = getFunctionIndexesByChain[chain]
        ? getFunctionIndexesByChain[chain].add([...getFunctionIndexes])
        : new Set([...getFunctionIndexes])
    }
    for (const chain in getFunctionIndexesByChain) {
      const getFunctions = []
      for (const getFunctionIndex of getFunctionIndexesByChain[chain]) {
        getFunctions.push(getFunctionIndexMap[getFunctionIndex])
      }
      await callGetFunctionsForChain({ chain, getFunctions, stats })
    }
  }

  return stats
}

async function callGetFunctionsForChain({ chain, getFunctions, stats }) {
  const queries = getFunctions.map(({ buildQuery }) => buildQuery({ chain }))
  const sql = db.helpers.concat(queries)
  const records = await client.multi(sql)
  records.forEach((record, index) => {
    Object.assign(stats, getFunctions[index].formatRecords(record))
  })
}
