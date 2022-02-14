import React from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'

import { useAppState } from 'lib/appState'

import Spinner from 'components/Spinner'
import LineChart from 'components/LineChart'

export default function VolumePage() {
  const { wooVolume, aggregateVolume } = useAppState(['wooVolume', 'aggregateVolume'])

  if (!wooVolume) return <Box sx={{ display: 'flex', justifyContent: 'center', height: '100vh', mt: -30 }}>
    <Spinner />
  </Box>

  const { labels: wooVolumeLabels, series: wooVolumeSeries } = wooVolume.reduce(
    (acc, { date, volume }) => {
      acc.labels.push(date)
      acc.series.push(volume)
      return acc
    },
    {
      labels: [],
      series: [],
    }
  )

  console.log(`wooVolumeLabels ==>`, wooVolumeLabels)
  console.log(`wooVolumeSeries ==>`, wooVolumeSeries)

  return <Box>
    <Card sx={{p:2}}>
      <Typography variant="h6" sx={{ textAlign: 'right', opacity: .9 }} color="primary.main">
        Daily WOO Network volume
      </Typography>
      <LineChart
        labels={wooVolumeLabels}
        datasets={[
          {
            label: 'Daily WOO Network Volume',
            data: wooVolumeSeries,
            borderColor: '#ffa600',
            backgroundColor: 'rgba(255, 166, 0, .1)',
          },
        ]}
        modifyOptions={options => {
          options.plugins.tooltip.callbacks.title = item => item[0].label.replace(', 12:00:00 am', '')
        }}
      />
    </Card>
  </Box>
}

