const { web3_arb } = require('../lib/web3')
const request = require('../lib/request')
const arbiscanRequest = require('../lib/arbiscan')

module.exports = async function updateTotalWoofiMp() {
  const wooStakingManagerContractAddress = '0xa9E245C1FA7E17263Cc7C896488A3da8072924Fb'
  const paramsString = `&module=contract&action=getabi&address=${wooStakingManagerContractAddress}`

  try {
    const response = await arbiscanRequest(paramsString)
    const wooStakingManagerABI = JSON.parse(response.result)
    const wooStakingManager = new web3_arb.eth.Contract(wooStakingManagerABI, wooStakingManagerContractAddress)

    const totalMpValue = await wooStakingManager.methods.mpTotalBalance().call()
    const totalMpValueFormatted = (totalMpValue / 1e18).toFixed(18)

    const csvData = `total_mp\n${totalMpValueFormatted}`

    await request({
      name: 'updateTotalMpDuneTable total_woofi_mp',
      method: 'post',
      serverUrl: 'https://api.dune.com/api/v1/table/upload/csv',
      headers: {
        'X-Dune-Api-Key': process.env.DUNE_API_KEY,
      },
      data: {
        table_name: 'total_woofi_mp',
        data: csvData,
      },
    })

    console.log('Total MP value updated successfully.')
  } catch (error) {
    console.error('Error updating total MP value:', error)
  }
}
