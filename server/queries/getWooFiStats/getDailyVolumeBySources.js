function buildQuery({ chain }) {
  let query = 'SELECT "date"::date::text, sum(usd_volume) as volume, source FROM woofi_swaps'
  if (chain) query += ` WHERE chain = $1`
  query += ' GROUP BY source, date::date ORDER BY date::date ASC'
  const values = chain ? [chain] : undefined

  return { query: query.toString(), values }
}

function formatRecords(records) {
  return { dailyWooFiVolumeBySources: records }
}

module.exports = { buildQuery, formatRecords }
