const knex = require('../database/knex')
const { client } = require('../database')
const fetchWoofiProDailyVolumeHistory = require('../queries/fetchWoofiProDailyVolumeHistory')
const request = require('../lib/request')
const dayjs = require('../lib/dayjs')

module.exports = async function updateWoofiProDailyVolumeHistory() {
  const volumeHistory = await fetchWoofiProDailyVolumeHistory()

  const update = []
  volumeHistory.forEach(({ perp_volume, account_id, date }) => {
    update.push({
      volume: perp_volume,
      account_id,
      date,
    })
  })

  const query = knex.raw(
    `? ON CONFLICT (account_id, date) DO UPDATE SET volume = EXCLUDED.volume;`,
    [knex('woofi_pro_daily_volume_by_account').insert(update)],
  )
  await client.query(`${query}`)

  const header = ['date', 'account_id', 'volume']

  const csvRows = update.map(item => [
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
}
