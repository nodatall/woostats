import React from 'react'
import numeral from 'numeral'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import Divider from '@mui/material/Divider'

import { useAppState } from 'lib/appState'

import Loading from 'components/Loading'
import ContentCard from 'components/ContentCard'

export default function DaoPage(){
  const { wooDaoTreasuryBalance } = useAppState(['wooDaoTreasuryBalance'])

  if (!wooDaoTreasuryBalance || wooDaoTreasuryBalance.length === 0) return <Loading />

  const latestTreasuryBalance = wooDaoTreasuryBalance[wooDaoTreasuryBalance.length - 1]
  return <Box>
    <TotalValueBox {...{ totalValue: latestTreasuryBalance.totalValue }} />
    <WalletBalances {...{ tokens: latestTreasuryBalance.tokens }} />
    <ProtocolBalances {...{ inProtocols: latestTreasuryBalance.inProtocols }} />
  </Box>
}

const ROW_CONTAINER_STYLES = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  '> *': { flex: 1 },
}

function ProtocolBalances({ inProtocols }) {
  const priceStyles = theme => ({
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    }
  })

  return inProtocols.map(protocolDetails => {
    if (protocolDetails.type === 'staking') {
      return <ContentCard sx={{ p: 2 }} key={protocolDetails.name}>
        <Stack {...{ sx: ROW_CONTAINER_STYLES }}>
          <Stack sx={{ flexDirection: 'row', alignItems: 'center' }}>
            <img src={protocolDetails.logoUrl} style={{ width: '20px', height: '20px' }} />
            <Typography variant="h6" sx={{ textAlign: 'left', ml: 1 }}>{protocolDetails.name}</Typography>
          </Stack>
          <Typography variant="body2" sx={priceStyles}>${numeral(protocolDetails.price.toFixed(2)).format('0,0.00')}</Typography>
          <Typography variant="body2">{numeral(protocolDetails.amount).format('0,0.00')}</Typography>
          <Typography variant="h6" sx={{ textAlign: 'right', color: 'primary.main' }}>
            ${numeral(protocolDetails.value).format('0,0')}
          </Typography>
        </Stack>
      </ContentCard>
    } else {

      const detailRows = protocolDetails.details.map(detail => {
        const { logoUrls, symbols, amounts } = detail.supplied.reduce((acc, supply) => {
          const amount = supply.amount < .00001 ? 0 : numeral(supply.amount).format('0,0.00')
          acc.logoUrls.push(supply.logoUrl)
          acc.symbols.push(supply.symbol)
          acc.amounts.push(`${amount} ${supply.symbol}`)
          return acc
        }, { logoUrls: [], symbols: [], amounts: []})

        const logoStack = <Stack sx={{ flexDirection: 'row', alignItems: 'center' }}>
          {logoUrls.map((logoUrl, index) => {
            const props = {
              key: logoUrl,
              src: logoUrl,
              style: {
                width: '20px',
                height: '20px',
                borderRadius: '50%',
              }
            }
            if (index !== 0) props.style.marginLeft = '-7px'
            return <img {...props} />
          })}
        </Stack>

        const amountStack = <Stack>
          {amounts.map(amount => <Typography variant="body2" key={amount}>{amount}</Typography>)}
        </Stack>

        return <Stack key={protocolDetails.name}>
          <Stack {...{ sx: ROW_CONTAINER_STYLES, p: 1 }}>
            <Stack sx={{ flexDirection: 'row', alignItems: 'center' }}>
              {logoStack}
              <Typography variant="body2" sx={{ textAlign: 'left', ml: 1 }}>{symbols.join('-')}</Typography>
            </Stack>
            {amountStack}
            <Typography variant="body2" sx={{ textAlign: 'right' }}>
              ${numeral(detail.netValue).format('0,0')}
            </Typography>
          </Stack>
        </Stack>
      })

      const rewards = protocolDetails.rewards
      return <ContentCard sx={{ p: 2 }} key={protocolDetails.name}>
        <TopRow {...{ title: protocolDetails.name, value: protocolDetails.value, logoUrl: protocolDetails.logoUrl }} />
        {detailRows}
        {rewards.length > 0 && <ProtocolRewards {...{ rewards }} />}
      </ContentCard>
    }
  })
}

function ProtocolRewards({ rewards }) {
  const rewardElements = rewards
    .filter(reward => reward.amount > 0)
    .map(reward => (
      <Stack {...{
        sx: { ...ROW_CONTAINER_STYLES, p: 1, pb: 2, '&:last-child': { pb: 1 }},
        key: reward.amount,
      }}>
        <Stack sx={{ flexDirection: 'row', alignItems: 'center' }}>
          <img src={reward.logoUrl} style={{ width: '20px', height: '20px', borderRadius: '50%' }} />
          <Typography variant="body1" sx={{ ml: 1 }}>{reward.symbol}</Typography>
        </Stack>
        <Typography variant="body2">{numeral(reward.amount).format('0,0.00')}</Typography>
        <Typography variant="body2" sx={{ textAlign: 'right' }}>${numeral(reward.value).format('0,0')}</Typography>
      </Stack>
    ))

  return <Stack>
    <Divider textAlign="left">
      <Typography variant="body1" sx={{ my: 2 }}>Rewards</Typography>
    </Divider>
    {rewardElements}
  </Stack>
}

function WalletBalances({ tokens }) {
  let walletBalance = 0

  const tokenList = tokens.map(token => {
    walletBalance += token.value
    return <TokenRow {...{ token, key: token.symbol }} />
  })

  return <ContentCard sx={{ p: 2 }}>
    <TopRow {...{ title: 'Wallet', value: walletBalance, iconElement: <AccountBalanceWalletIcon /> }} />
    {tokenList}
  </ContentCard>
}

function TotalValueBox({ totalValue }) {
  return <ContentCard>
    <Stack sx={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
      <Typography variant="h5" sx={{ textAlign: 'right' }}>
        Treasury Value
      </Typography>
      <Typography variant="h4" sx={{ color: 'secondary.main', ml: 2 }}>
        ${numeral(totalValue).format('0,0')}
      </Typography>
    </Stack>
  </ContentCard>
}

function TokenRow({ token }) {
  const priceStyles = theme => ({
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    }
  })
  return <Stack {...{
    sx: { ...ROW_CONTAINER_STYLES, p: 1, pb: 2, '&:last-child': { pb: 1 }},
  }}>
    <Stack sx={{ flexDirection: 'row', alignItems: 'center' }}>
      <Stack>
        <img src={token.logoUrl} style={{ width: '20px', height: '20px', borderRadius: '50%' }} />
        {token.chainLogoUrl &&
          <img
            src={token.chainLogoUrl}
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              marginTop: '-5px',
              marginLeft: '10px',
              position: 'absolute',
            }}
          />
        }
      </Stack>
      <Typography variant="body1" sx={{ ml: 1 }}>{token.symbol}</Typography>
    </Stack>
    <Typography variant="body2" sx={priceStyles}>${numeral(token.price.toFixed(2)).format('0,0.00')}</Typography>
    <Typography variant="body2">{numeral(token.amount).format('0,0.00')}</Typography>
    <Typography variant="body2" sx={{ textAlign: 'right' }}>${numeral(token.value).format('0,0')}</Typography>
  </Stack>
}

function TopRow({ title, value, logoUrl, iconElement }) {
  const icon = logoUrl
    ? <img src={logoUrl} style={{ width: '20px', height: '20px' }} />
    : iconElement
  return <Stack sx={{ flexDirection: 'row', alignItems: 'center', mb: 2 }}>
    {icon}
    <Typography variant="h6" sx={{ textAlign: 'left', ml: 1 }}>{title}</Typography>
    <Typography variant="h6" sx={{ marginLeft: 'auto', color: 'primary.main' }}>
      ${numeral(value).format('0,0')}
    </Typography>
  </Stack>
}
