const TOKENS = {
  'bitcoin': 'BTC',
  'woo-network': 'WOO',
}

const TOKEN_IDS = Object.keys(TOKENS)

const WOO_NETWORK_START_DATE = '2021-06-25'
const WOO_FUTURES_START_DATE = '2022-06-02'

const NAJKJI_BSC_WOOFI_WOOSWAPS = [
  'nakji.woofi_bsc.0_0_0.WooPPV1_WooSwap',
  // 'nakji.woofi_bsc.0_0_0.WooPPV2_WooSwap',
  // 'nakji.woofi_bsc.0_0_0.WooPPV3_WooSwap',
  // 'nakji.woofi_bsc.0_0_0.WooPPV4_WooSwap',
]

module.exports = {
  ...require('../../shared/constants'),
  TOKENS,
  TOKEN_IDS,
  WOO_NETWORK_START_DATE,
  WOO_FUTURES_START_DATE,
  NAJKJI_BSC_WOOFI_WOOSWAPS,
}
