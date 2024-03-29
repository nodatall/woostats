const { recordToWooFiSwap, selectWooFiSwapsQuery } = require('./utils')

function buildQuery({ chain }) {
  return selectWooFiSwapsQuery(chain).orderBy('date', 'desc').toString()
}

function formatRecords({ records, chain }) {
  return { [`recentWooFiSwaps:${chain}`]: records.map(recordToWooFiSwap) }
}

module.exports = { buildQuery, formatRecords }
