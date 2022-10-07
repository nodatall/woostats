require('../../../environment')

const etherscanRequest = require('../../lib/etherscan')
const { web3_eth } = require('../../lib/web3')
const { WOO_DAO_ETH_ADDRESS } = require('../../lib/treasury')
const getTokenTickers = require('../../queries/getTokenTickers')
const updatePositions = require('./updatePositions')

async function fetchDammPositions() {
  const fetchUpdate = async () => {
    const wooDammContractAddress = '0x33E67BB96d51d0B6cF759f4cF0c75916B04a0229'

    const paramsString = '&module=contract'
      + '&action=getabi'
      + `&address=${wooDammContractAddress}`
    const wooDammContractABI = JSON.parse((await etherscanRequest(paramsString)).result)
    const poolContract = new web3_eth.eth.Contract(wooDammContractABI, wooDammContractAddress)
    const wooBalanceWei = await poolContract.methods.balanceOfUnderlying(WOO_DAO_ETH_ADDRESS).call()
    if (wooBalanceWei === '0') return {}
    const wooBalance = Number(web3_eth.utils.fromWei(wooBalanceWei)).toFixed(8)
    const tokenTickers = await getTokenTickers()
    const value = wooBalance * tokenTickers.WOO.price

    return {
      protocolBalances: [
        {
          "name": "dAMM Finance",
          "chain": "eth",
          "value": value,
          "details": [
            {
              "type": "Liquidity Pool",
              "netValue": value,
              "supplied": [
                {
                  "value": value,
                  "amount": wooBalance,
                  "symbol": "WOO",
                  "logoUrl": tokenTickers.WOO.logoUrl
                }
              ]
            }
          ],
          "logoUrl": "https://static.debank.com/image/project/logo_url/dammfinance/fa9d8a087b3fd15cb307375b189b2fbc.png",
          "rewards": [],
          "siteUrl": "https://app.damm.finance"
        },
      ]
    }
  }

  await updatePositions({
    callerName: 'fetchDammPositions',
    protocolNames: ['dAMM Finance'],
    fetchUpdate,
  })
}

fetchDammPositions()
