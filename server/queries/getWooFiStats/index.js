const { client, db } = require('../../database')

const { extractDetailsFromEventType } = require('../../commands/createWooFiEvents')
const getRecentWooFiSwaps = require('./getRecentWooFiSwaps')
const getTopWooFiSwaps = require('./getTopWooFiSwaps')
const getDailySwapVolume = require('./getDailySwapVolume')
const getDailyNumberOfWooFiSwaps = require('./getDailyNumberOfWooFiSwaps')
const getDailyVolumeBySources = require('./getDailyVolumeBySources')
const getDailyVolumeByAssets = require('./getDailyVolumeByAssets')
const getTokensFromContracts = require('./getTokensFromContracts')
const CHAINS = Object.keys(require('../../lib/constants').CHAIN_LOGOS)

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
  'swap': [1, 2, 3, 4, 5, 6, 7],
}

module.exports = async function getWooFiStats({ eventTypes, getAll = false }) {
  const stats = {}
  if (getAll) {
    for (const chain of CHAINS) {
      const getFunctions = Object.values(getFunctionIndexMap)
      await callGetFunctionsForChain({ chain, getFunctions, stats })
    }
  } else {
    const getFunctionIndexesByChain = {}
    for (const eventType of eventTypes) {
      const { chain, type } = extractDetailsFromEventType(eventType)
      const getFunctionIndexes = eventGetFunctionMap[type]
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
  records.forEach((records, index) => {
    Object.assign(stats, getFunctions[index].formatRecords({ records, chain }))
  })
}
