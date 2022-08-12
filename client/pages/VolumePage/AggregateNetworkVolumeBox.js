import React from 'react'
import numeral from 'numeral'

import { useTheme } from '@mui/material/styles'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'

import { useAppState } from 'lib/appState'
import ContentCard from 'components/ContentCard'

export default function AggregateNetworkVolumeBox() {
  const {
    wooSpotVolumeToday,
    wooFuturesVolumeToday,
  } = useAppState(
    ['wooSpotVolumeToday', 'wooFuturesVolumeToday']
  )
  const theme = useTheme()
  const stackBaseStyle = { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }
  const spotAndFuturesElements = ['Spot', 'Futures'].map(category => {
    const topStackStyle = theme => ({
      ...stackBaseStyle,
      mr: category === 'Spot' ? 2 : 0,
      [theme.breakpoints.down('xs')]: {
        mr: 0,
      }
    })
    return <Stack sx={topStackStyle} key={category}>
      <Typography variant="h6" sx={{ textAlign: 'right' }}>
        {category}
      </Typography>
      <Typography variant="h6" sx={{ color: 'primary.main', ml: 2 }}>
        ${numeral(category === 'Spot' ? wooSpotVolumeToday : wooFuturesVolumeToday).format('0,0')}
      </Typography>
    </Stack>
  })

  return <ContentCard>
    <Stack sx={{ alignItems: 'center' }}>
      <Stack sx={{
        ...stackBaseStyle,
        [theme.breakpoints.down('xs')]: {
          flexDirection: 'column-reverse',
        }
      }}>
        <Typography variant="h4" sx={{
          color: 'secondary.main',
          mr: 2,
          [theme.breakpoints.down('xs')]: {
            mr: 0,
            mt: 1,
          }
        }}>
          ${numeral(+wooSpotVolumeToday + +wooFuturesVolumeToday).format('0,0')}
        </Typography>
        <Typography variant="h5" sx={{ textAlign: 'right' }}>
          24hr Network Volume
        </Typography>
      </Stack>
      <Divider textAlign="center" sx={{ width: '260px', my: 3 }} />
      <Stack sx={{
        ...stackBaseStyle,
        flexWrap: 'wrap',
        [theme.breakpoints.down('xs')]: {
          flexDirection: 'column',
        }
      }}>
        {spotAndFuturesElements}
      </Stack>
    </Stack>
  </ContentCard>
}
