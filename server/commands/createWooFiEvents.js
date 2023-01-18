const { WOOFI_SOURCES } = require('../../shared/woofi')
const { client } = require('../database')
const knex = require('../database/knex')
const { snakeCase } = require('change-case')
const { evmChain, moralis } = require('../lib/moralis')
const createTokenContracts = require('../commands/createTokenContracts')

const chainToMoralisChainMap = {
  'bsc': 'BSC',
  'avax': 'AVALANCHE',
}

async function createWooFiEvents({ events }) {
  const insertsByTable = {}

  const allEvents = []
  events.forEach(event => {
    const { chain, dbName } = extractDetailsFromEventType(event.Event)
    const formatted = { chain }
    for (const key in event.Data) {
      let snakeKey = snakeCase(key)
      if (['from', 'to'].includes(snakeKey)) snakeKey = snakeKey + '_address'
      if (snakeKey === 'ts') snakeKey = 'date'
      formatted[snakeKey] = event.Data[key]
    }
    formatted.source = WOOFI_SOURCES.WOOFi.includes(formatted.from_address)
      ? formatted.to_address
      : formatted.from_address

    if (insertsByTable[dbName]) {
      insertsByTable[dbName].push(formatted)
    } else {
      insertsByTable[dbName] = [formatted]
    }
    allEvents.push(formatted)
  })

  await fetchAndSaveTokenContractsFromEvents({ events: allEvents })

  for (const table in insertsByTable) {
    const query = knex.raw(
      `? ON CONFLICT (tx_hash, to_token, from_token, usd_volume) DO NOTHING;`,
      [knex(table).insert(insertsByTable[table])],
    )
    await client.query(`${query}`)
  }
}

async function fetchAndSaveTokenContractsFromEvents({ events }) {
  const tokenAddressesByChain = {}

  for (const event of events) {
    const tokenContractKeys = ['from_token', 'to_token']
    for (const key of tokenContractKeys) {
      const contractAddress = event[key]
      if (!contractAddress) continue
      const records = await client.query(
        `SELECT * FROM token_contracts WHERE address = $1 AND chain = $2;`,
        [contractAddress, event.chain]
      )
      if (records.length === 0) {
        tokenAddressesByChain[event.chain]
          ? tokenAddressesByChain[event.chain].add(contractAddress)
          : tokenAddressesByChain[event.chain] = new Set([contractAddress])
      }
    }
  }

  for (const chain in tokenAddressesByChain) {
    let response
    try {
      response = await moralis.EvmApi.token.getTokenMetadata({
        addresses: [...tokenAddressesByChain[chain]],
        chain: evmChain[chainToMoralisChainMap[chain]],
      })
    } catch(error) {
      throw new Error(error.message)
    }
    const contracts = response.data.map(contract => ({
      chain,
      address: contract.address,
      symbol: contract.symbol,
      logo_url: contract.thumbnail,
      decimals: contract.decimals,
    }))
    await createTokenContracts({ contracts })
  }
}

function extractDetailsFromEventType(eventType) {
  const chain = eventType.match(/nakji.woofi_([a-z]+)\./)[1]
  const type = eventType.includes('WooSwap') ? 'swap' : 'invalid'
  // const dbName = `woofi_swaps_${chain}`
  const dbName = `woofi_swaps_bsc`
  return { chain, type, dbName }
}

module.exports = {
  createWooFiEvents,
  extractDetailsFromEventType,
}
