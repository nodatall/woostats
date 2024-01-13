const knex = require('../database/knex')
const { client } = require('../database')
const fetchWoofiProDailyVolumeHistory = require('../queries/fetchWoofiProDailyVolumeHistory')
const request = require('../lib/request')
const dayjs = require('../lib/dayjs')
let running = false

module.exports = async function updateWoofiProDailyVolumeHistory() {
  if (running) return
  running = true

  const { volumeHistory, accountAddressMap, isFullHistory } = await fetchWoofiProDailyVolumeHistory()
  if (!volumeHistory || !accountAddressMap) {
    running = false
    return
  }

  const update = []
  const volumeHistoryUpdate = []
  const aggregatedVolumes = {}

  deduplicateData(volumeHistory).forEach(({ perp_volume, account_id, date }) => {
    update.push({
      volume: perp_volume,
      account_id: accountAddressMap[account_id],
      date,
    })

    if (!aggregatedVolumes[date]) {
      aggregatedVolumes[date] = 0
    }
    aggregatedVolumes[date] += perp_volume
  })

  if (!isFullHistory) {
    const allData = await client.query(`SELECT date, sum(volume) as volume FROM woofi_pro_daily_volume_by_account GROUP BY date;`)
    allData.forEach(({ date, volume }) => {
      volumeHistoryUpdate.push({
        date,
        exchange: 'woofi_pro',
        volume
      })
    })
  } else {
    Object.entries(aggregatedVolumes).forEach(([date, volume]) => {
      volumeHistoryUpdate.push({
        date,
        exchange: 'woofi_pro',
        volume
      })
    })
  }

  const query = knex.raw(
    `? ON CONFLICT (account_id, date) DO UPDATE SET volume = EXCLUDED.volume;`,
    [knex('woofi_pro_daily_volume_by_account').insert(update)],
  )
  await client.query(`${query}`)

  const queryAggregated = knex.raw(
    `? ON CONFLICT (date, exchange) DO UPDATE SET volume = EXCLUDED.volume;`,
    [knex('volume_by_exchange').insert(volumeHistoryUpdate)],
  )
  await client.query(`${queryAggregated}`)

  const header = ['date', 'account_id', 'volume']

  const queryResult = await client.query(`SELECT * FROM woofi_pro_daily_volume_by_account ORDER BY date ASC;`)
  const csvRows = queryResult.map(item => [
    dayjs.utc(item.date).toISOString(),
    item.account_id,
    item.volume,
  ].join(','))

  const csv = [header.join(','), ...csvRows].join('\n')
  await request({
    name: `updateWoofiProDailyVolumeHistoryDuneTable`,
    method: 'post',
    serverUrl: 'https://api.dune.com/api/v1/table/upload/csv',
    headers: {
      'X-Dune-Api-Key': process.env.DUNE_API_KEY,
    },
    data: {
      'table_name': 'woofi_pro_daily_volume_by_account',
      data: csv,
    }
  })

  running = false
}

function deduplicateData(data) {
  const uniqueEntries = new Map()

  data.forEach(entry => {
    const uniqueKey = `${entry.account_id}-${entry.date}-${entry.volume}`
    if (!uniqueEntries.has(uniqueKey)) {
      uniqueEntries.set(uniqueKey, entry)
    }
  })

  return Array.from(uniqueEntries.values())
}
