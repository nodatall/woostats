const knex = require('../../database/knex')
const { client } = require('../../database')
const dayjs = require('../../lib/dayjs')

module.exports = async function insertIntoTreasuryTable({ tokens = [], protocolBalances = [] }) {
  const today = dayjs().utc().format('YYYY-MM-DD')
  const latest = await client.one(`SELECT date, in_protocols, tokens FROM treasury_balances ORDER BY date DESC LIMIT 1;`)
  if (latest.date === today) {
    tokens = [
      ...tokens,
      ...latest.tokens.filter(token => !tokens.find(t => t.chain === token.chain && t.symbol === token.symbol)),
    ]
    protocolBalances = [
      ...protocolBalances,
      ...latest.in_protocols.filter(protocol => !protocolBalances.find(p => p.name === protocol.name)),
    ]
  }
  const totalValue = [...tokens, ...protocolBalances].reduce((sum, item) => item.value + sum, 0)

  const update = [{
    date: today,
    identifier: 'WOODAO',
    total_value: totalValue,
    tokens: JSON.stringify(tokens.sort((a, b) => b.value - a.value)),
    in_protocols: JSON.stringify(protocolBalances.sort((a, b) => b.value - a.value)),
  }]

  const query = knex.raw(
    `
      ? ON CONFLICT (date, identifier)
      DO UPDATE
      SET
        tokens = EXCLUDED.tokens,
        in_protocols = EXCLUDED.in_protocols,
        total_value = EXCLUDED.total_value;
    `,
    [knex('treasury_balances').insert(update)],
  )
  await client.query(`${query}`)
}
