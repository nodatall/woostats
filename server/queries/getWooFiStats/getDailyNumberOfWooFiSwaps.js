function buildQuery({ chain }) {
  let query = 'SELECT "date"::date::text, count(*) as number FROM woofi_swaps'
  if (chain) query += ` WHERE chain = $1`
  query += ' GROUP BY "date"::date ORDER BY date ASC'
  const values = chain ? [chain] : undefined

  return { query: query.toString(), values }
}

function formatRecords(records) {
  return { dailyNumberOfWooFiSwaps: records }
}

module.exports = { buildQuery, formatRecords }
