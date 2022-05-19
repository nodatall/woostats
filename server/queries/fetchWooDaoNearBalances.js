
const { nearConnectionPromise, nearAPI } = require('../lib/near')

module.exports = async function fetchNearAccountBalance() {
  const near = await nearConnectionPromise
  const nearInLockupResponse = await near.connection.provider.query({
    request_type: 'view_account',
    finality: 'final',
    account_id: 'dfe9b1d2bb90b89a47ce77d9703350b30b7fd051.lockup.near',
  })
  const nearInLockupWallet = nearAPI.utils.format.formatNearAmount(nearInLockupResponse.amount, 2)
  const nearInWalletResponse = await near.connection.provider.query({
    request_type: 'view_account',
    finality: 'final',
    account_id: 'woodao.near',
  })
  const nearInWallet = nearAPI.utils.format.formatNearAmount(nearInWalletResponse.amount, 2)

  const contractCallResponse = await near.connection.provider.query({
    request_type: 'call_function',
    finality: 'final',
    account_id: 'astro-stakers.poolv1.near',
    method_name: 'get_accounts',
    args_base64: Buffer.from(
      JSON.stringify({
        from_index: 2500,
        limit: 100,
      })
    ).toString("base64"),
  })

  const _tokens = decode(contractCallResponse.result)
  const stakedNearBalance = _tokens
    .find(({ account_id }) => account_id === 'dfe9b1d2bb90b89a47ce77d9703350b30b7fd051.lockup.near').staked_balance
  const stakedNear = nearAPI.utils.format.formatNearAmount(stakedNearBalance, 2)
  return {
    near: toNumber(nearInWallet) + toNumber(nearInLockupWallet),
    stakedNear: toNumber(stakedNear),
  }
}

function toNumber(numberString) {
  return parseInt(numberString.replace(/,/g, ''), 10)
}

function decode(data) {
  let res = ""
  for (let i = 0; i < data.length; i++) {
    res += String.fromCharCode(data[i])
  }
  return JSON.parse(res)
}
