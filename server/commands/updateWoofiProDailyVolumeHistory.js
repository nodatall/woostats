const knex = require('../database/knex')
const { client } = require('../database')
const fetchWoofiProDailyVolumeHistory = require('../queries/fetchWoofiProDailyVolumeHistory')
const request = require('../lib/request')
const dayjs = require('../lib/dayjs')
const fs = require('fs')
const tempFile = './temp.csv'
const axios = require('axios')

let running = false

module.exports = async function updateWoofiProDailyVolumeHistory() {
  if (running) {
    console.log('updateWoofiProDailyVolumeHistory is already running.')
    return
  }
  running = true

  try {
    const { volumeHistory, accountAddressMap, isFullHistory } = await fetchWoofiProDailyVolumeHistory()
    if (!volumeHistory || !accountAddressMap) return

    const { update, aggregatedVolumes } = prepareUpdateData(volumeHistory, accountAddressMap)
    checkForDuplicateKeys(update)
    const volumeHistoryUpdate = await prepareVolumeHistoryUpdate(isFullHistory, aggregatedVolumes)

    await updateDatabase(update, volumeHistoryUpdate)
    const csv = await generateCSV()

    const fileSizeInMB = await uploadCSV(csv)
    cleanUpTempFile(fileSizeInMB)
  } catch (error) {
    console.error('Error in updateWoofiProDailyVolumeHistory:', error)
  } finally {
    running = false
  }
}

function prepareUpdateData(volumeHistory, accountAddressMap) {
  const updateMap = {}
  const aggregatedVolumes = {}

  for (const { perp_volume, account_id, date } of volumeHistory) {
    const mappedAccountId = accountAddressMap[account_id]
    if (!mappedAccountId) continue // skip unknown mappings

    const key = `${mappedAccountId}-${date}`

    if (!updateMap[key]) {
      updateMap[key] = {
        account_id: mappedAccountId,
        date,
        volume: perp_volume,
      }
    } else {
      updateMap[key].volume += perp_volume
    }

    aggregatedVolumes[date] = (aggregatedVolumes[date] || 0) + perp_volume
  }

  const update = Object.values(updateMap)

  const dedupedUpdateMap = {}
  for (const row of update) {
    const key = `${row.account_id}-${row.date}`
    if (!dedupedUpdateMap[key]) {
      dedupedUpdateMap[key] = row
    } else {
      dedupedUpdateMap[key].volume += row.volume
    }
  }
  const dedupedUpdate = Object.values(dedupedUpdateMap)
  return { update: dedupedUpdate, aggregatedVolumes }
}

async function prepareVolumeHistoryUpdate(isFullHistory, aggregatedVolumes) {
  const volumeHistoryUpdate = []

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

  return volumeHistoryUpdate
}

async function updateDatabase(update, volumeHistoryUpdate) {
  const query = knex('woofi_pro_daily_volume_by_account')
    .insert(update)
    .onConflict(['account_id', 'date'])
    .merge(['volume']);

  await client.query(`${query}`)
    .catch(error => {
      console.error('Error in updateWoofiProDailyVolumeHistory:', error)
    })

  const aggregateQuery = knex('volume_by_exchange')
    .insert(volumeHistoryUpdate)
    .onConflict(['date', 'exchange'])
    .merge(['volume']);

  await client.query(`${aggregateQuery}`)
    .catch(error => {
      console.error('Error in updateWoofiProDailyVolumeHistory:', error)
    })
}

async function generateCSV() {
  const header = ['date', 'account_id', 'volume']
  const queryResult = await client.query(`SELECT * FROM woofi_pro_daily_volume_by_account ORDER BY date ASC;`)
  const csvRows = queryResult.map(item => [
    dayjs.utc(item.date).toISOString(),
    item.account_id,
    item.volume,
  ].join(','))

  return [header.join(','), ...csvRows].join('\n')
}

async function uploadCSV(csv) {
  fs.writeFileSync(tempFile, csv)
  const fileSizeInBytes = fs.statSync(tempFile).size
  const fileSizeInMB = fileSizeInBytes / (1024 * 1024)

  if (fileSizeInMB > 200) {
    console.log('CSV file size exceeds the 200 MB limit. Please reduce the data size.')
    return fileSizeInMB
  }

  try {
    const response = await axios.post(
      'https://api.dune.com/api/v1/table/upload/csv',
      {
        data: csv,
        description: 'Woofi Pro Daily Volume by Account',
        table_name: 'woofi_pro_daily_volume_by_account',
        is_private: false
      },
      {
        headers: {
          'X-Dune-Api-Key': process.env.DUNE_API_KEY,
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 second timeout
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
    )
    console.log('Upload response:', response.status, response.statusText)
  } catch (err) {
    console.error('Upload failed:', err.code || err.message, err?.response?.data || '')
  }

  return fileSizeInMB
}

function cleanUpTempFile(fileSizeInMB) {
  fs.unlinkSync(tempFile)
  console.log(`CSV file size: ${fileSizeInMB} MB`)
}

function combineDuplicateData(data) {
  const combined = {}

  for (const entry of data) {
    const key = `${entry.account_id}-${entry.date}`

    if (!combined[key]) {
      combined[key] = {
        account_id: entry.account_id,
        date: entry.date,
        perp_volume: entry.perp_volume,
      }
    } else {
      combined[key].perp_volume += entry.perp_volume
    }
  }

  return Object.values(combined)
}

function checkForDuplicateKeys(update) {
  const seen = new Set()
  for (const row of update) {
    const key = `${row.account_id}-${row.date}`
    if (seen.has(key)) {
      console.error('❌ Duplicate detected in final update array:', key)
    }
    seen.add(key)
  }
}
