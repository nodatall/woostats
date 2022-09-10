const debankRequest = require('../lib/debank')

module.exports = async function fetchEVMChainTokenBalancesForAddress({ address, chainId }) {
  return await debankRequest(
    `/v1/user/token_list`,
    `id=${address}&chain_id=${chainId}&has_balance=true&is_all=false`,
    true
  )
}
