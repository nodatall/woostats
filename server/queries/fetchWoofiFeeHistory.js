const request = require('../lib/request')
const dayjs = require('../lib/dayjs')

module.exports = async function fetchWoofiFeeHistory() {
  const zkevmFeeTxHistory = await fetchFeeTxHistory({
    contractAddress: '0xa8ce8aee21bc2a48a5ef670afcc9274c7bbbc035',
    apiKey: process.env.ZKEVM_API_KEY,
    serverUrl: 'https://api-zkevm.polygonscan.com/api',
  })

  const lineaFeeTxHistory = await fetchFeeTxHistory({
    contractAddress: '0x176211869ca2b568f2a7d4ee941e073a821ee1ff',
    apiKey: process.env.LINEASCAN_API_KEY,
    serverUrl: 'https://api.lineascan.build/api',
  })

  return { zkevmFeeTxHistory, lineaFeeTxHistory }
}

async function fetchFeeTxHistory({contractAddress, apiKey, serverUrl}) {
  const results = []
  let currentPage = 1
  const offset = 1000

  while (true) {
    const params = `
        module=account
        &action=tokentx
        &contractaddress=${contractAddress}
        &address=0x32a1d9b2a85f2ef0516daabaa9c34325bc774cac
        &startblock=0
        &endblock=999999999
        &sort=asc
        &page=${currentPage}
        &offset=${offset}
        &apikey=${apiKey}
    `.replace(/\s+/g, '')

    const response = await request({
      name: 'getFeeTxHistory',
      serverUrl,
      params,
    })

    if (response && response.result && response.result.length > 0) {
      results.push(...response.result)
      currentPage++
      await delay(210)
    } else {
      break
    }
  }

  const header = ['evt_block_time', 'value', 'contract_address', 'to', 'evt_tx_hash']

  const csvRows = results.map(item => [
    dayjs.utc(Number(item.timeStamp) * 1000).toISOString(),
    item.value,
    item.contractAddress,
    item.to,
    item.hash
  ].join(','))

  return [header.join(','), ...csvRows].join('\n')
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
