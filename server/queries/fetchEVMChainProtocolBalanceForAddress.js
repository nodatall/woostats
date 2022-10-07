const debankRequest = require('../lib/debank')

module.exports = async function fetchEVMChainProtocolBalanceForAddress({ address, chainId, protocol }) {
  return await debankRequest(
    `/v1/user/protocol`,
    `id=${address}&chain_id=${chainId}&protocol_id=${protocol}`,
    process.env.NODE_ENV === 'production'
  )
}
