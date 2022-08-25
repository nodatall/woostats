const fetchThetanutzPositions = require('./fetchThetanutzPositions')
const fetchWooFiPositions = require('./fetchWooFiPositions')
const fetchCBridgePositions = require('./fetchCBridgePositions')
const fetchNearPositions = require('./fetchNearPositions')
const fetchBancorPositions = require('./fetchBancorPositions')
const fetchTokensAndPositionsFromDebank = require('./fetchTokensAndPositionsFromDebank')

module.exports = async function updateWooDaoTreasury() {
  await fetchTokensAndPositionsFromDebank()
  await fetchBancorPositions()
  await fetchNearPositions()
  await fetchCBridgePositions()
  await fetchWooFiPositions()
  await fetchThetanutzPositions()
}
