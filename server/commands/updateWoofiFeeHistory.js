const request = require('../lib/request')
const fetchWoofiFeeHistory = require('../queries/fetchWoofiFeeHistory')

module.exports = async function updateWoofiFeeHistory() {
  const { zkevmFeeTxHistory, lineaFeeTxHistory } = await fetchWoofiFeeHistory()

  await updateWoofiFeeHistoryDuneTable({ tableName: 'woofi_zkevm_fee_txs', data: zkevmFeeTxHistory })
  await updateWoofiFeeHistoryDuneTable({ tableName: 'woofi_linea_fee_txs', data: lineaFeeTxHistory })
}

async function updateWoofiFeeHistoryDuneTable({ tableName, data }) {
  await request({
    name: `updateWoofiFeeHistoryDuneTable ${tableName}`,
    method: 'post',
    serverUrl: 'https://api.dune.com/api/v1/table/upload/csv',
    headers: {
      'X-Dune-Api-Key': process.env.DUNE_API_KEY,
    },
    data: {
      'table_name': tableName,
      data,
    }
  })
}
