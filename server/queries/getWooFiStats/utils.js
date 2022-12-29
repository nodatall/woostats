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
  const swapsDb = `woofi_swaps_${chain}`
  const query = knex
    .select(
      `${swapsDb}.*`,
      'a.logo_url AS from_logo_url',
      'a.symbol AS from_symbol',
      'b.logo_url AS to_logo_url',
      'b.symbol AS to_symbol'
    )
    .from(swapsDb)
    .join({ a: 'token_contracts' }, function() {
      this.on(`${swapsDb}.from_token`, 'a.address')
    })
    .join({ b: 'token_contracts' }, function() {
      this.on(`${swapsDb}.to_token`, 'b.address')
    })
    .where('a.chain', chain)
    .limit(50)

  return query
}

module.exports = { recordToWooFiSwap, selectWooFiSwapsQuery }
