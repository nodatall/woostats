const dayjs = require('../../lib/dayjs')
const { recordToWooFiSwap, selectWooFiSwapsQuery } = require('./utils')

function buildQuery({ chain, fromHours }) {
  const query = selectWooFiSwapsQuery(chain).orderBy('usd_volume', 'desc')

  if (fromHours) {
    query.where('date', '>', dayjs.utc().subtract(fromHours, 'hour').format('YYYY-MM-DD HH:mm:ss'))
  }

  return query.toString()
}

function formatRecords({ records, chain }) {
  return { [`topWooFiSwaps:${chain}`]: records.map(recordToWooFiSwap) }
}

module.exports = { buildQuery, formatRecords }
