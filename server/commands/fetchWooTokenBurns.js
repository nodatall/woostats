const etherscanRequest = require('../lib/etherscan')
const client = require('../database')
const web3 = require('../lib/web3')
const dayjs = require('../lib/dayjs')
const statsCache = require('../lib/statsCache')
const knex = require('../database/knex')

module.exports = async function fetchWooTokenBurns(socket) {
  const paramsString = '&module=account'
    + '&action=tokentx'
    + '&contractaddress=0x4691937a7508860f876c9c0a2a617e7d9e945d4b'
    + '&address=0x0000000000000000000000000000000000000000'
    + '&page=1'
    + '&offset=100'
    + '&startblock=0'
    + '&endblock=27025780'
    + '&sort=asc'

  const response = await etherscanRequest(paramsString)
  if (!response) return

  const burnInsert = []
  response.result.forEach(tx => {
    if (tx.blockNumber === '11585811') return // ignore unofficial burn
    const burned = Number(web3.utils.fromWei(tx.value)).toFixed()
    const month = dayjs.unix(tx.timeStamp).subtract(1, 'month').format('YYYY-MM')
    const tx_hash = tx.hash
    burnInsert.push({ burned, month, tx_hash })
  })

  const query = knex.raw(
    `? ON CONFLICT (month) DO NOTHING;`,
    [knex('woo_token_burns').insert(burnInsert)],
  )
  await client.query(`${query}`)

  await statsCache.update()
  const { wooTokenBurns } = await statsCache.get()
  socket.emit('send', { wooTokenBurns })
}

