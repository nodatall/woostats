function addRewardsToProtocolBalance({ protocolBalance, token, value }) {
  const rewardIndex = protocolBalance.rewards.map(reward => reward.symbol).indexOf(token.symbol)
  if (rewardIndex === -1) {
    protocolBalance.rewards.push({
      value,
      symbol: token.symbol,
      logoUrl: token.logo_url,
      amount: Number(token.amount),
    })
  } else {
    protocolBalance.rewards[rewardIndex].amount += Number(token.amount)
    protocolBalance.rewards[rewardIndex].value += value
  }
}

const WOO_DAO_ETH_ADDRESS = '0xfA2d1f15557170F6c4A4C5249e77f534184cdb79'

module.exports = {
  addRewardsToProtocolBalance,
  WOO_DAO_ETH_ADDRESS,
}
