const client = require('../database')
const { web3_eth } = require('../lib/web3')
const dayjs = require('../lib/dayjs')
const fetchWooTokenBurns = require('../queries/fetchWooTokenBurns')
const knex = require('../database/knex')

module.exports = async function updateWooTokenBurns() {
  const response = await fetchWooTokenBurns()
  if (!response) return

  const wooTokenBurns = []
  response.result.forEach(tx => {
    if (tx.blockNumber === '11585811') return // ignore unofficial burn
    const burned = Number(web3_eth.utils.fromWei(tx.value)).toFixed()
    const month = dayjs.unix(tx.timeStamp).subtract(1, 'month').format('YYYY-MM')
    const tx_hash = tx.hash
    wooTokenBurns.push({ burned, month, tx_hash })
  })

  const query = knex.raw(
    `? ON CONFLICT (month) DO NOTHING;`,
    [knex('woo_token_burns').insert(wooTokenBurns)],
  )
  await client.query(`${query}`)
}

