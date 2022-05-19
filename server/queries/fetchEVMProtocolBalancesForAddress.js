const debankRequest = require('../lib/debank')

module.exports = async function fetchEVMTokenBalancesForAddress({ address }) {
  return await debankRequest(
    `/v1/user/all_token_list`,
    `id=${address}&is_all=true`
  )
}
