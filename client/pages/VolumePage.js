import React, { useState, useRef } from 'react'
import dayjs from 'dayjs'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import { SMA } from 'technicalindicators'

import { useAppState } from 'lib/appState'

import Spinner from 'components/Spinner'
import LineChart from 'components/LineChart'
import TextWithCaption from 'components/TextWithCaption'

export default function VolumePage() {
  const { wooVolume, aggregateVolume } = useAppState(['wooVolume', 'aggregateVolume'])

  if (!wooVolume) return <Box sx={{ display: 'flex', justifyContent: 'center', height: '100vh', mt: -30 }}>
    <Spinner />
  </Box>

  const { labels: wooVolumeLabels, series: wooVolumeSeries } = wooVolume.slice(0, -1).reduce(
    (acc, { date, volume }) => {
      acc.labels.push(date)
      acc.series.push(+volume)
      return acc
    },
    {
      labels: [],
      series: [],
    }
  )
  const { percentSeries, aggregateVolumeSeries } = aggregateVolume.slice(0, -1).reduce(
    (acc, { volume }, index) => {
      acc.aggregateVolumeSeries.push(+volume)
      acc.percentSeries.push((wooVolumeSeries[index] / volume) * 100)
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
      denominator: '%',
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
      title: 'WOO % of total 50 day MA',
      labels: wooVolumeLabels.slice(49),
      denominator: '%',
      datasets: [
        {
          label: 'WOO % of total 50 day MA',
          data: SMA.calculate({ period: 50, values: percentSeries }),
          borderColor: function(context) {
            const chart = context.chart
            const {ctx, chartArea} = chart
            if (!chartArea) return
            return getGradient(ctx, chartArea, ['#23578e', '#5c238e', '#b3c61d'])
          },
          backgroundColor: 'rgb(25, 29, 35)',
        },
      ],
      sx: { mt: 6 },
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
            return getGradient(ctx, chartArea, ['rgb(147, 91, 211)', 'rgb(0, 156, 181)', 'rgb(178, 118, 0)'])
          },
          backgroundColor: 'rgb(25, 29, 35)',
        },
      ],
      sx: { mt: 6 },
    }} />
    <VolumeChart {...{
      title: 'Daily WOO volume 50 day MA',
      labels: wooVolumeLabels.slice(49),
      datasets: [
        {
          label: 'Daily WOO volume 50 day MA',
          data: SMA.calculate({ period: 50, values: wooVolumeSeries }),
          borderColor: function(context) {
            const chart = context.chart
            const {ctx, chartArea} = chart
            if (!chartArea) return
            return getGradient(ctx, chartArea, ['rgb(147, 91, 211)', 'rgb(0, 156, 181)', 'rgb(178, 118, 0)'])
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
    <VolumeChart {...{
      title: 'Total market volume 50 day MA',
      labels: wooVolumeLabels.slice(49),
      datasets: [
        {
          label: 'Total market volume 50 day MA',
          data: SMA.calculate({ period: 50, values: aggregateVolumeSeries }),
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

function VolumeChart({ title, labels, datasets, sx = {}, denominator }) {
  const containerRef = useRef()
  const [tooltip, setTooltip] = useState({})

  return <Card sx={{ p:2, ...sx }} ref={containerRef}>
    <Stack sx={{flexDirection: 'row-reverse', flexWrap: 'wrap', mb: 3, height: '50px'}}>
      <Typography variant="h6" sx={{ textAlign: 'right' }}>
        {title}
      </Typography>
      {tooltip && <Tooltip {...{tooltip, denominator}} />}
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

function Tooltip({ tooltip, denominator = '$' }) {
  if (!tooltip.title) return null
  const text = denominator === '%'
    ? `${tooltip.body}${denominator}`
    : `${denominator}${tooltip.body}`
  return <TextWithCaption
    {...{
      caption: dayjs(tooltip.title).format('MMM D, YYYY'),
      text,
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
