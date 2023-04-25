const fetchUniswapV2 = require('./fetchUniswapV2')

module.exports = async function updateWooOnChain() {
  await Promise.all([
    fetchUniswapV2(),
  ])
}
