const knex = require('../database/knex')
const { client } = require('../database')
const request = require('../lib/request')
const logger = require('../lib/logger')

module.exports = async function runAndFetchResultsOfWoofiStakingEventsQuery() {
  const latestEvent = await getLatestStakingEvent();

  let queryId
  if (!latestEvent || isEventOlderThanTwoDays(latestEvent.date)) {
    queryId = 3568384
  } else {
    queryId = 3591803
  }

  const executionId = await runDuneWoofiStakingEventsQuery(queryId)
  if (!executionId) return

  let isExecutionFinished = false
  while (!isExecutionFinished) {
    await new Promise((resolve) => setTimeout(resolve, 5000))
    isExecutionFinished = await isDuneWoofiStakingEventsQueryFinished(executionId)
  }

  await getAndInsertWoofiStakingEventsQueryResult(executionId)
}

async function getLatestStakingEvent() {
  const query = knex('woofi_staking_unstaking_events')
    .orderBy('date', 'desc')
    .first()

  return (await client.query(`${query}`))[0]
}

function isEventOlderThanTwoDays(eventDate) {
  const twoDaysAgo = new Date()
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
  return new Date(eventDate) < twoDaysAgo
}

async function insertStakingEventsIntoDb(result) {
  const insert = result.map((row) => {
    return {
      date: row.evt_block_time,
      user_address: row.user,
      amount: +row.amount / 1e18,
      event: row.evt,
    }
  })

  const query = knex.raw(
    `? ON CONFLICT (user_address, date, event) DO NOTHING;`,
    [knex('woofi_staking_unstaking_events').insert(insert)],
  )

  await client.query(`${query}`)
}

async function runDuneWoofiStakingEventsQuery(queryId) {
  const response = await request({
    name: `runDuneWoofiStakingEventsQuery`,
    method: 'post',
    serverUrl: `https://api.dune.com/api/v1/query/${queryId}/execute`,
    headers: {
      'X-Dune-Api-Key': process.env.DUNE_API_KEY,
    },
  })

  if (!response) {
    logger.error('Error running woofi_staking_all_staking_unstaking_events on dune')
    return
  }

  return response.execution_id
}

async function isDuneWoofiStakingEventsQueryFinished(executionId) {
  const response = await request({
    name: `checkDuneWoofiStakingEventsStatus`,
    method: 'get',
    serverUrl: `https://api.dune.com/api/v1/execution/${executionId}/status`,
    headers: {
      'X-Dune-Api-Key': process.env.DUNE_API_KEY,
    },
  })

  if (!response) {
    logger.error('Error querying checkDuneWoofiStakingEventsStatus')
    return
  }

  return response.is_execution_finished
}

async function getAndInsertWoofiStakingEventsQueryResult(executionId) {
  let offset = 0
  while (true) {
    const response = await request({
      name: `getAndInsertWoofiStakingEventsQueryResult`,
      method: 'get',
      serverUrl: `https://api.dune.com/api/v1/execution/${executionId}/results?limit=5000&offset=${offset}`,
      headers: {
        'X-Dune-Api-Key': process.env.DUNE_API_KEY,
      },
    })
    if (!response) {
      logger.error('Error querying getAndInsertWoofiStakingEventsQueryResult')
      return
    }
    await insertStakingEventsIntoDb(response.result.rows)
    if (response.next_offset) {
      offset = response.next_offset
    } else {
      break
    }
  }
}
