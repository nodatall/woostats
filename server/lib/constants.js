const TOKENS = {
  'bitcoin': 'BTC',
  'woo-network': 'WOO',
}

const TOKEN_IDS = Object.keys(TOKENS)

const WOO_NETWORK_START_DATE = '2021-06-25'
const WOO_FUTURES_START_DATE = '2022-06-02'

module.exports = {
  ...require('../../shared/constants'),
  TOKENS,
  TOKEN_IDS,
  WOO_NETWORK_START_DATE,
  WOO_FUTURES_START_DATE,
}
