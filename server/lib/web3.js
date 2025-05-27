const Web3 = require('web3')

module.exports = {
  web3_eth: new Web3(process.env.ALCHEMY_ETH_URL),
  web3_bsc: new Web3('https://bsc-dataseed4.ninicoin.io/'),
  web3_avax: new Web3('https://api.avax.network/ext/bc/C/rpc'),
  web3_arb: new Web3('https://arb1.arbitrum.io/rpc'),
}
