const { web3_bsc } = require('../../lib/web3')
const chainLogos = require('../../lib/chainLogos')
const request = require('../../lib/request')
const getTokenTickers = require('../../queries/getTokenTickers')
const updatePositions = require('./updatePositions')

module.exports = async function fetchThetanutzPositions() {
  const fetchUpdate = async () => {
    const tokenTickers = await getTokenTickers()
    const ABI = await request({
      serverUrl: 'https://thetanuts.finance/v1/synVault_ABI.json',
    })
    const wooVaultContract = new web3_bsc.eth.Contract(ABI, '0x91FDBdB3E031F0Ac57aCe6F393b247192A7265b4')
    const balance = web3_bsc.utils.fromWei(await wooVaultContract.methods.balanceOf('0xfd899C7c5ED84537e2Acfc998ce26C3797654AE8').call())
    const epoch = await wooVaultContract.methods.epoch().call()
    const valuePerLPX = web3_bsc.utils.fromWei(await wooVaultContract.methods.valuePerLPX1e18(epoch).call())
    const totalWooBalance = valuePerLPX * balance
    const value = totalWooBalance * tokenTickers.WOO.price

    return {
      protocolBalances: [
        {
          name: 'Thetanuts',
          chain: 'bsc',
          chainLogoUrl: chainLogos.bsc,
          value: value,
          details: [
            {
              type: 'Liquidity Pool',
              netValue: value,
              supplied: [
                {
                  value: value,
                  amount: totalWooBalance,
                  name: 'Covered Call',
                  symbol: 'WOO',
                  logoUrl: 'https://thetanuts.finance/images/crypto-icons/icon-coin-woo.svg',
                }
              ]
            }
          ],
          'logoUrl': 'https://stronghold.thetanuts.finance/favicon.49a0f338.png',
          'rewards': [],
          'siteUrl': 'https://thetanuts.finance/basic/vaults/0x38/0x91FDBdB3E031F0Ac57aCe6F393b247192A7265b4'
        },
      ],
    }
  }

  await updatePositions({
    callerName: 'fetchThetanutzPositions',
    protocolNames: ['Thetanuts'],
    fetchUpdate,
  })
}
