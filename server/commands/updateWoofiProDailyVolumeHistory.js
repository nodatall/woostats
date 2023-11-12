const knex = require('../database/knex')
const { client } = require('../database')
const fetchWoofiProDailyVolumeHistory = require('../queries/fetchWoofiProDailyVolumeHistory')

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
}
