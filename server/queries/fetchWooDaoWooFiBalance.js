const { web3_avax } = require('../lib/web3')
const snowtraceRequest = require('../lib/snowtrace')
const chainLogos = require('../lib/chainLogos')

module.exports = async function fetchWooDaoWooFiBalance({ tokenTickers }) {
  const avaxDeployerAddress = '0x3aB48821D50137c31Ac1961c5AD496E4977ec4CF'
  const xWooAvaxContract = '0xcd1B9810872aeC66d450c761E93638FB9FE09DB0'
  const paramsString = '&module=contract'
    + '&action=getabi'
    + `&address=${xWooAvaxContract}`
  const response = await snowtraceRequest(paramsString)
  const xWooAvaxContractABI = JSON.parse(response.result)
  const poolContract = new web3_avax.eth.Contract(xWooAvaxContractABI, xWooAvaxContract)
  const xWooBalanceWei = await poolContract.methods.balanceOf(avaxDeployerAddress).call()
  const fullSharePriceWei = await poolContract.methods.getPricePerFullShare().call()
  const xWooBalance = Number(web3_avax.utils.fromWei(xWooBalanceWei)).toFixed(8)
  const fullSharePrice = Number(web3_avax.utils.fromWei(fullSharePriceWei)).toFixed(8)
  const wooBalance = (xWooBalance * fullSharePrice).toFixed(2)
  const value = wooBalance * tokenTickers.WOO.price

  return {
    name: 'WooFi',
    chain: 'avax',
    chainLogoUrl: chainLogos.avax,
    value: value,
    details: [
      {
        type: 'Liquidity Pool',
        netValue: value,
        supplied: [
          {
            value: value,
            amount: wooBalance,
            symbol: 'WOO.e',
            name: 'Staking',
            logoUrl: tokenTickers.WOO.logoUrl,
          }
        ]
      }
    ],
    'logoUrl': 'https://fi.woo.org/_nuxt/img/3bbab1c.png',
    'rewards': [],
    'siteUrl': 'https://fi.woo.org/stake'
  }
}
