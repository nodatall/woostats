const { camelCase } = require('change-case')

function buildQuery({ chain }) {
  const query = `
    SELECT a.date, sum(a.volume) as volume, a.token_contract, sum(a.number_of_trades) as number_of_trades, a.chain, t.symbol, t.logo_url FROM (
      SELECT "date"::date::text, sum(usd_volume) as volume, from_token as token_contract, count(*) as number_of_trades, chain FROM woofi_swaps GROUP BY token_contract, chain, date::date
      UNION ALL
      SELECT "date"::date::text, sum(usd_volume) as volume, to_token as token_contract, count(*) as number_of_trades, chain FROM woofi_swaps GROUP BY token_contract, chain, date::date
    ) as a
    JOIN token_contracts as t ON a.token_contract = t.address
    WHERE a.chain = $1
    GROUP BY a.token_contract, a.chain, t.symbol, t.logo_url, a.date ORDER BY a.date ASC
  `

  return { query: query.toString(), values: [chain] }
}

function formatRecords({ records, chain }) {
  return { [`dailyWooFiVolumeByAssets:${chain}`]: records.map(recordToAsset) }
}

function recordToAsset(record) {
  const formattedRecord = {}
  for (const key in record) {
    formattedRecord[camelCase(key)] = ['number_of_trades', 'volume'].includes(key)
      ? +record[key]
      : record[key]
  }
  return formattedRecord
}

module.exports = { buildQuery, formatRecords }
