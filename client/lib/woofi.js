// last update Sep 8, 2022 afa8480 https://github.com/woonetwork/woofi_subgraph/commits/main/src/constants.ts

const { WOOFI_SOURCES } = require('../../shared/woofi')
const SOURCES_BY_ADDRESS = {}
for (const key in WOOFI_SOURCES) {
  for (const address of WOOFI_SOURCES[key]) {
    SOURCES_BY_ADDRESS[address] = key
  }
}

export function getAddressLabel(address) {
  return SOURCES_BY_ADDRESS[address]
    ? SOURCES_BY_ADDRESS[address]
    : `${address.slice(2,6)}..${address.slice(-4)}`
}
