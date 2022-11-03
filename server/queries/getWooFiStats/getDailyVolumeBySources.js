function buildQuery({ chain }) {
  const query = `
    SELECT "date"::date::text, sum(usd_volume) as volume, source
    FROM woofi_swaps
    WHERE chain = $1
    GROUP BY source, date::date ORDER BY date::date ASC;
  `

  return { query: query.toString(), values: [chain] }
}

function formatRecords({ records, chain }) {
  return { [`dailyWooFiVolumeBySources:${chain}`]: records }
}

module.exports = { buildQuery, formatRecords }
