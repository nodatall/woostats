const { client } = require('../database')

module.exports = async function getWooDaoTreasuryBalance() {
  const records = await client.query(
    `
      SELECT * FROM treasury_balances WHERE identifier = 'WOODAO' ORDER BY date;
    `
  )

  return records.map(record => ({
    date: record.date,
    identifier: record.identifier,
    price: record.price,
    tokens: record.tokens,
    inProtocols: record.in_protocols,
    totalValue: record.total_value,
  }))
}
