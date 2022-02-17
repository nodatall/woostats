import React, { useState, useCallback, useRef, useEffect } from 'react'
import dayjs from 'dayjs'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'

import { useAppState } from 'lib/appState'

import Spinner from 'components/Spinner'
import LineChart from 'components/LineChart'
import TextWithCaption from 'components/TextWithCaption'

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
  const { percentSeries, aggregateVolumeSeries } = aggregateVolume.reduce(
    (acc, { sum }, index) => {
      acc.aggregateVolumeSeries.push(sum)
      acc.percentSeries.push((wooVolumeSeries[index] / sum) * 100)
      return acc
    },
    {
      aggregateVolumeSeries: [],
      percentSeries: [],
    }
  )

  return <Box>
    <VolumeChart {...{
      title: 'WOO % of total market volume',
      labels: wooVolumeLabels,
      datasets: [
        {
          label: 'WOO % of total market volume',
          data: percentSeries,
          borderColor: function(context) {
            const chart = context.chart
            const {ctx, chartArea} = chart
            if (!chartArea) return
            return getGradient(ctx, chartArea, ['#23578e', '#5c238e', '#b3c61d'])
          },
          backgroundColor: 'rgb(25, 29, 35)',
        },
      ],
    }} />
    <VolumeChart {...{
      title: 'Daily WOO Network volume',
      labels: wooVolumeLabels,
      datasets: [
        {
          label: 'Daily WOO Network Volume',
          data: wooVolumeSeries,
          borderColor: function(context) {
            const chart = context.chart
            const {ctx, chartArea} = chart
            if (!chartArea) return
            return getGradient(ctx, chartArea, ['rgb(0, 156, 181)', 'rgb(178, 118, 0)', 'rgb(86, 0, 178)'])
          },
          backgroundColor: 'rgb(25, 29, 35)',
        },
      ],
      sx: { mt: 6 },
    }} />
    <VolumeChart {...{
      title: 'Total crypto market volume',
      labels: wooVolumeLabels,
      datasets: [
        {
          label: 'Total crypto market volume',
          data: aggregateVolumeSeries,
          borderColor: function(context) {
            const chart = context.chart
            const {ctx, chartArea} = chart
            if (!chartArea) return
            return getGradient(ctx, chartArea, ['#23578e', '#5c238e', '#b3c61d'])
          },
          backgroundColor: 'rgb(25, 29, 35)',
        },
      ],
      sx: { mt: 6 }
    }} />
  </Box>
}

function VolumeChart({ title, labels, datasets, sx = {} }) {
  const containerRef = useRef()
  const [tooltip, setTooltip] = useState({})

  return <Card sx={{ p:2, ...sx }} ref={containerRef}>
    <Stack sx={{flexDirection: 'row-reverse', flexWrap: 'wrap', mb: 3, height: '50px'}}>
      <Typography variant="h6" sx={{ textAlign: 'right' }}>
        {title}
      </Typography>
      {tooltip && <Tooltip {...{tooltip}} />}
    </Stack>
    <LineChart {...{
      labels,
      datasets,
      tooltip,
      setTooltip,
      parentRef: containerRef,
    }}
    />
  </Card>
}

function Tooltip({ tooltip }) {
  if (!tooltip.title) return null
  return <TextWithCaption
    {...{
      caption: dayjs(tooltip.title).format('MMM D, YYYY'),
      text: `$${tooltip.body}`,
      sx: { mr: 'auto' },
    }}
  />
}

let width, height, gradient
function getGradient(ctx, chartArea, colors) {
  const chartWidth = chartArea.right - chartArea.left
  const chartHeight = chartArea.bottom - chartArea.top
  if (!gradient || width !== chartWidth || height !== chartHeight) {
    width = chartWidth
    height = chartHeight
    gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top)
    gradient.addColorStop(0, colors[0])
    gradient.addColorStop(0.5, colors[1])
    gradient.addColorStop(1, colors[2])
  }

  return gradient
}
