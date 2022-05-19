const nearAPI = require('near-api-js')

const config = {
  networkId: 'mainnet',
  nodeUrl: 'https://rpc.mainnet.near.org',
  walletUrl: 'https://wallet.mainnet.near.org',
  helperUrl: 'https://helper.mainnet.near.org',
  explorerUrl: 'https://explorer.mainnet.near.org',
  keyStore: {},
}

module.exports = {
  nearConnectionPromise: nearAPI.connect(config),
  nearAPI,
}

