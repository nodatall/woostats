const { bancorTokenContractABI, bancorNetworkInfoABI } = require('../../lib/ABI')
const { web3_eth } = require('../../lib/web3')
const { WOO_DAO_ETH_ADDRESS } = require('../../lib/treasury')
const updatePositions = require('./updatePositions')
const getTokenTickers = require('../../queries/getTokenTickers')

module.exports = async function fetchBancorPositions() {
  const fetchUpdate = async () => {
    const tokenTickers = await getTokenTickers()
    const wooBancorContractAddress = '0x2FC8bC3eE171eD5610ba3093909421E90b47Fc07'
    const poolContract = new web3_eth.eth.Contract(bancorTokenContractABI, wooBancorContractAddress)
    const weiBntWooBalance = await poolContract.methods.balanceOf(WOO_DAO_ETH_ADDRESS).call()
    const networkInfoContract = new web3_eth.eth.Contract(bancorNetworkInfoABI, '0x8E303D296851B320e6a697bAcB979d13c9D6E760')
    const weiWooBalance = await networkInfoContract.methods.poolTokenToUnderlying(
      '0x4691937a7508860F876c9c0a2a617E7d9E945D4B', weiBntWooBalance
    ).call()
    const wooBalance = Number(web3_eth.utils.fromWei(weiWooBalance)).toFixed()
    const value = wooBalance * tokenTickers.WOO.price

    return {
      protocolBalances: [
        {
          "name": "Bancor V3",
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
                  "logoUrl": "https://static.debank.com/image/eth_token/logo_url/0x4691937a7508860f876c9c0a2a617e7d9e945d4b/c68741e50aeee41d87b4f0cf50df859d.png"
                }
              ]
            }
          ],
          "logoUrl": "https://static.debank.com/image/project/logo_url/bancor/18b73b302f4d3122ac47534da9ead2ba.png",
          "rewards": [],
          "siteUrl": "https://app.bancor.network"
        },
      ]
    }
  }

  await updatePositions({
    callerName: 'fetchBancorPositions',
    protocolNames: ['Bancor V3'],
    fetchUpdate,
  })
}
