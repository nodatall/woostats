const TOKEN_NAME_MAP = {
  'WOO.e': 'WOO',
  'USDC.e': 'USDC',
}

module.exports = function(symbol, tokenTickers) {
  return TOKEN_NAME_MAP[symbol]
    ? tokenTickers[TOKEN_NAME_MAP[symbol]].price
    : tokenTickers[symbol].price
}
