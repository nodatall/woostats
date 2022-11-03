function buildQuery({ chain }) {
  const query = `
    SELECT "date"::date::text, sum(usd_volume) as volume
    FROM woofi_swaps
    WHERE chain = $1
    GROUP BY "date"::date ORDER BY date ASC
  `

  return { query: query.toString(), values: [chain] }
}

function formatRecords({ records, chain }) {
  return { [`dailyWooFiSwapVolume:${chain}`]: records }
}

module.exports = { buildQuery, formatRecords }
