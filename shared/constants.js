const TOP_SPOT_EXCHANGES = {
  'binance': 'Binance',
  'gdax': 'Coinbase',
  'okex': 'OKX',
  'mxc': 'MEXC Global',
  'kraken': 'Kraken',
  'bybit_spot': 'Bybit',
  'kucoin': 'Kucoin',
  'binance_us': 'Binance US',
  'huobi': 'Huobi',
  'crypto_com': 'Crypto.com',
}

const TOP_SPOT_EXCHANGE_IDS = Object.keys(TOP_SPOT_EXCHANGES)

const TOP_FUTURES_EXCHANGES = {
  'binance_futures': 'Binance',
  'okex_swap': 'OKX',
  'bybit': 'Bybit',
  'mxc_futures': 'MEXC Global',
  'kumex': 'KuCoin',
  'gate_futures': 'Gate.io',
  'deribit': 'Deribit',
  'dydx_perpetual': 'dYdX',
  'huobi_dm': 'Huobi',
  'bitmex': 'Bitmex',
}

const TOP_FUTURES_EXCHANGE_IDS = Object.keys(TOP_FUTURES_EXCHANGES)

const CHAIN_LOGOS = {
  bsc: 'https://assets.debank.com/static/media/bsc.3d1e2f26.svg',
  avax: 'https://assets.debank.com/static/media/avalanche.850d5617.svg',
  fantom: 'https://assets.debank.com/static/media/fantom.d3c4549f.svg',
  polygon: 'https://assets.debank.com/static/media/polygon.23445189.svg',
  arbitrum: 'https://assets.debank.com/static/media/arbitrum.8e326f58.svg',
}

module.exports = {
  TOP_SPOT_EXCHANGES,
  TOP_SPOT_EXCHANGE_IDS,
  TOP_FUTURES_EXCHANGES,
  TOP_FUTURES_EXCHANGE_IDS,
  CHAIN_LOGOS,
}
