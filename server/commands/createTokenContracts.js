const { client } = require('../database')
const logger = require('../lib/logger')
const knex = require('../database/knex')

const tokenLogoUrls = {
  'WBNB': 'https://oss.woo.org/static/icons/BNB.png',
  'BNB': 'https://oss.woo.org/static/icons/BNB.png',
  'USDT': 'https://oss.woo.org/static/icons/USDT.png',
  'ETH': 'https://oss.woo.org/static/icons/ETH.png',
  'BTCB': 'https://oss.woo.org/static/icons/BTC.png',
  'BTC': 'https://oss.woo.org/static/icons/BTC.png',
  'WOO': 'https://oss.woo.org/static/icons/WOO.png',
  'BUSD': 'https://oss.woo.org/static/icons/BUSD.png',
}

module.exports = async function createTokenContracts({ contracts }) {
  const insert = contracts.map(contract => {
    if (!contract.thumbnail && !tokenLogoUrls[contract.symbol]) {
      logger.log('error', `createTokenContracts: no tokenLogoUrl matching ${contract.symbol}`)
    }
    return {
      ...contract,
      logo_url: contract.logo_url || tokenLogoUrls[contract.symbol],
    }
  })

  const query = knex.raw(
    `? ON CONFLICT (address, chain) DO NOTHING;`,
    [knex('token_contracts').insert(insert)],
  )
  await client.query(`${query}`)
}
