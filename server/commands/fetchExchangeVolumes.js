const delay = require('delay')
const fs = require('fs')

const knex = require('../database/knex')
const coingecko = require('../lib/coingecko')
const dayjs = require('../lib/dayjs')
const client = require('../database')
const coingeckoExchangeList = require('../../shared/coingeckoExchangeList')
const inactiveExchangeList = require('../../shared/inactiveExchanges')

module.exports = async function fetchExchangeVolumes() {
  const btcPriceResponse = await coingecko.request(
    '/simple/price',
    '&ids=bitcoin&vs_currencies=usd'
  )
  if (!btcPriceResponse) return
  const btcPrice = btcPriceResponse.bitcoin.usd
  const inactiveExchanges = []

  for (const exchange of coingeckoExchangeList) {
    if (inactiveExchanges.includes(exchange.id)) continue
    const volumeRecords = await client.query('SELECT * FROM volume_by_exchange WHERE exchange = $1', [exchange.id])
    const days = volumeRecords.length === 0
      ? dayjs().utc().diff('2021-06-24', 'day')
      : 3

    const exchangeVolumes = await coingecko.request(
      `/exchanges/${exchange.id}/volume_chart`,
      `&days=${days}`
    )
    if (!exchangeVolumes) continue
    if (exchangeVolumes.length === 0) inactiveExchanges.push(exchange.id)

    let previousDate
    const insertExchangeVolumes = exchangeVolumes.map(([date, volumeInBTC]) => {
      const dateFormat = 'YYYY-MM-DD'
      let formattedDate = dayjs.utc(date).format(dateFormat)
      if (previousDate === formattedDate) formattedDate = dayjs.utc(formattedDate).add(1, 'day').format(dateFormat)
      previousDate = formattedDate
      return {
        date: formattedDate,
        exchange: exchange.id,
        volume: Math.round(volumeInBTC * btcPrice),
      }
    })

    const query = knex.raw(
      `? ON CONFLICT (date, exchange) DO UPDATE SET volume = EXCLUDED.volume;`,
      [knex('volume_by_exchange').insert(insertExchangeVolumes)],
    )

    fs.writeFileSync(
      '../../shared/inactiveExchanges.js',
      `module.exports = ${JSON.stringify([...inactiveExchangeList, ...inactiveExchanges])}`
    )

    await client.query(`${query}`)
    await delay(120) // delay to rate limit 500 calls per minute
  }
}
