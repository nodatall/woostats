const etherscanRequest = require('../lib/etherscan')

module.exports = async function fetchWooTokenBurns() {
  const paramsString = '&module=account'
    + '&action=tokentx'
    + '&contractaddress=0x4691937a7508860f876c9c0a2a617e7d9e945d4b'
    + '&address=0x0000000000000000000000000000000000000000'
    + '&page=1'
    + '&offset=100'
    + '&startblock=0'
    + '&endblock=27025780'
    + '&sort=asc'

  return await etherscanRequest(paramsString)
}

