const debankRequest = require('../lib/debank')

module.exports = async function fetchTokenBalancesForAddress({ address }) {
  return await debankRequest(
    `/v1/user/all_token_list`,
    `id=${address}&is_all=true`
  )
}
