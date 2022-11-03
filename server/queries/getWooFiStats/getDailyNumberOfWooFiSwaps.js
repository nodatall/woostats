function buildQuery({ chain }) {
  const query = `
    SELECT "date"::date::text, count(*) as number
    FROM woofi_swaps
    WHERE chain = $1
    GROUP BY "date"::date ORDER BY date ASC;
  `

  return { query: query.toString(), values: [chain] }
}

function formatRecords({ records, chain }) {
  return { [`dailyNumberOfWooFiSwaps:${chain}`]: records }
}

module.exports = { buildQuery, formatRecords }
