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

module.exports = {
  addRewardsToProtocolBalance,
}
