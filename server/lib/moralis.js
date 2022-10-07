const moralis = require('moralis').default
const { EvmChain } = require('@moralisweb3/evm-utils')

const config = {
  apiKey: process.env.MORALIS_API_KEY,
}

moralis.start(config)

module.exports = {
  moralis,
  evmChain: EvmChain,
}

