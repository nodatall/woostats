const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const twillioClient = require('twilio')(accountSid, authToken)

const logger = require('../../lib/logger')
const calculateTokenPrice = require('../../lib/calculateTokenPrice')
const getTokenTickers = require('../../queries/getTokenTickers')
const client = require('../../database')
const insertIntoTreasuryTable = require('./insertToTreasuryTable')

module.exports = async function updatePositions({ callerName, protocolNames = [], fetchUpdate, tokens = [] }) {
  const tokenTickers = await getTokenTickers()
  try {
    const update = await fetchUpdate()
    await insertIntoTreasuryTable(update)
  } catch(error) {
    if (process.env.NODE_ENV === 'production') {
      twillioClient.messages
        .create({
          body: `${callerName}: ${error.message.slice(0, 130)}`,
          from: process.env.FROM_PHONE,
          to: process.env.TO_PHONE
        })
    }
    logger.log('error', error)

    const treasuryBalances = await client.query(
      `SELECT date, in_protocols, tokens FROM treasury_balances ORDER BY date DESC;`
    )
    const protocolBalances = getUpdatedProtocolBalances({ tokenTickers, protocolNames, treasuryBalances })
    const updatedTokens = getUpdatedTokenBalances({ tokenTickers, tokens, treasuryBalances })

    await insertIntoTreasuryTable({ protocolBalances, tokens: updatedTokens })
  }
}

function getUpdatedTokenBalances({ tokenTickers, tokens, treasuryBalances }) {
  if (tokens.length === 0) return []

  let mostRecentTokenBalances
  treasuryBalances.find(treasuryBalance => {
    const recentTokens = treasuryBalance.tokens.filter(token => {
      return tokens.find(t => t[0] === token.symbol && t[1] === token.chain)
    })
    if (
      recentTokens.length > 0 &&
      recentTokens.length === tokens.length
    ) {
      mostRecentTokenBalances = recentTokens
      return true
    }
  })
  if (!mostRecentTokenBalances) return []

  return mostRecentTokenBalances.map(tokenBalance => ({
    ...tokenBalance,
    value: tokenBalance.amount * calculateTokenPrice(tokenBalance.symbol, tokenTickers),
    price: calculateTokenPrice(tokenBalance.symbol, tokenTickers),
  }))
}

function getUpdatedProtocolBalances({ tokenTickers, protocolNames, treasuryBalances }) {
  let mostRecentPositions
  treasuryBalances.find(treasuryBalance => {
    const recentPositions = treasuryBalance.in_protocols.filter(protocol => {
      return protocolNames.includes(protocol.name)
    })
    if (
      recentPositions.length > 0 &&
      protocolNames.every(name => recentPositions.find(position => position.name === name))
    ) {
      mostRecentPositions = recentPositions
      return true
    }
  })
  if (!mostRecentPositions) return []

  return mostRecentPositions.map(position => {
    if (position.type === 'staking') {
      const price = calculateTokenPrice(position.symbol, tokenTickers)
      return {
        ...position,
        value: position.amount * price,
        price,
      }
    } else if (position.type === 'bridge') {
      let value = 0
      const liquidityPositions = position.liquidityPositions.map(p => {
        const newValue = p.liquidity * calculateTokenPrice(p.token, tokenTickers)
        value += newValue
        return {
          ...p,
          value: newValue,
        }
      })

      return {
        ...position,
        value,
        liquidityPositions,
      }
    } else {
      let value = 0
      const updatedDetails = position.details.map(detail => {
        let netValue = 0
        const supplied = detail.supplied.map(supplied => {
          const value = calculateTokenPrice(supplied.symbol, tokenTickers) * supplied.amount
          netValue += value

          return {
            ...supplied,
            value,
          }
        })
        value += netValue

        return {
          ...detail,
          supplied,
          netValue,
        }
      })
      const updatedRewards = position.rewards.map(reward => {
        const value = calculateTokenPrice(reward.symbol, tokenTickers) * reward.amount
        return {
          ...reward,
          value,
        }
      })

      return {
        ...position,
        value,
        details: updatedDetails,
        rewards: updatedRewards,
      }
    }
  })
}
