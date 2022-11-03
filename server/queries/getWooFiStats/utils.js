const { camelCase } = require('change-case')
const knex = require('../../database/knex')

const numberColumns = ['from_amount', 'to_amount', 'usd_volume']

function recordToWooFiSwap(record) {
  const formattedRecord = {}
  for (const key in record) {
    formattedRecord[camelCase(key)] = numberColumns.includes(key)
      ? +record[key]
      : record[key]
  }
  return formattedRecord
}

const selectWooFiSwapsQuery = function(chain) {
  const query = knex
    .select(
      `woofi_swaps_${chain}.*`,
      'a.logo_url AS from_logo_url',
      'a.symbol AS from_symbol',
      'b.logo_url AS to_logo_url',
      'b.symbol AS to_symbol'
    )
    .from('woofi_swaps')
    .join({ a: 'token_contracts' }, function() {
      this
        .on('woofi_swaps.chain', 'a.chain')
        .on('woofi_swaps.from_token', 'a.address')
    })
    .join({ b: 'token_contracts' }, function() {
      this
        .on('woofi_swaps.chain', 'b.chain')
        .on('woofi_swaps.to_token', 'b.address')
    })
    .where('woofi_swaps.chain', chain)
    .limit(50)

  return query
}

module.exports = { recordToWooFiSwap, selectWooFiSwapsQuery }
