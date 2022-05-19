const debankRequest = require('../lib/debank')

module.exports = async function fetchEVMProtocolBalancesForAddress({ address }) {
  return await debankRequest(
    `/v1/user/all_complex_protocol_list`,
    `id=${address}&has_balance=true`
  )
}
