function buildQuery() {
  let query = 'SELECT symbol, chain FROM token_contracts'

  return { query: query.toString() }
}

function formatRecords(records) {
  return { wooFiAssetTokens: records }
}

module.exports = { buildQuery, formatRecords }
