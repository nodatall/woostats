const fetchThetanutzPositions = require('./fetchThetanutzPositions')
const fetchWooFiPositions = require('./fetchWooFiPositions')
const fetchCBridgePositions = require('./fetchCBridgePositions')
const fetchNearPositions = require('./fetchNearPositions')
const fetchBancorPositions = require('./fetchBancorPositions')
const fetchTokensAndPositionsFromDebank = require('./fetchTokensAndPositionsFromDebank')
const fetchDammPositions = require('./fetchDammPositions')

module.exports = async function updateWooDaoTreasury() {
  await Promise.all([
    fetchTokensAndPositionsFromDebank(),
    fetchBancorPositions(),
    fetchNearPositions(),
    fetchCBridgePositions(),
    fetchWooFiPositions(),
    fetchThetanutzPositions(),
    fetchDammPositions(),
  ])
}
