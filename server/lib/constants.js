const TOKENS = {
  'bitcoin': 'BTC',
  'woo-network': 'WOO',
}

const TOKEN_IDS = Object.keys(TOKENS)

module.exports = {
  ...require('../../shared/constants'),
  TOKENS,
  TOKEN_IDS,
}
