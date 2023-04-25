require('../../../environment')

const etherscanRequest = require('../../lib/etherscan')
const { web3_eth } = require('../../lib/web3')
const getTokenTickers = require('../../queries/getTokenTickers')
const updatePositions = require('./updatePositions')

module.exports = async function fetchUniswapV2() {
  const fetchUpdate = async () => {
    const wooUsdcContractAddress = '0xbbc95e1eb6ee476e9cbb8112435e14b372563038'
    const wooEthContractAddress = '0x6ada49aeccf6e556bb7a35ef0119cc8ca795294a'

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
