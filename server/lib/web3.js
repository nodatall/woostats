const Web3 = require('web3')

module.exports = {
  web3_eth: new Web3('https://cloudflare-eth.com'),
  web3_bsc: new Web3('https://bsc-dataseed4.ninicoin.io/'),
  web3_avax: new Web3('https://api.avax.network/ext/bc/C/rpc'),
}
