import React from 'react'
import { Doughnut } from 'react-chartjs-2'
import isEqual from 'lodash/isEqual'
import numeral from 'numeral'

import dayjs from 'lib/dayjs'
import { getAddressLabel } from 'lib/woofi'
import useDateRangeSlider from 'lib/useDateRangeSliderHook'

import { useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import CircleIcon from '@mui/icons-material/Circle'

import RangeSlider from 'components/RangeSlider'

const VolumeBySourcesChart = React.memo(function ({ dailyWooFiVolumeBySources, timePeriod, dailyWooFiSwapVolume }) {
  const theme = useTheme()

  const dateLabels = dailyWooFiSwapVolume.map(({ date }) => date)

  const { range, setRange } = useDateRangeSlider({
    length: dateLabels.length, title: 'VolumeBySources', defaultPeriod: timePeriod,
  })

  const volumeBySources = {}

  for (const { source, date, volume } of dailyWooFiVolumeBySources) {
    if (date < dateLabels[range[0]]) continue
    if (date > dateLabels[range[1]]) break
    const formatted = getAddressLabel(source)
    const key = formatted.includes('..') ? source : formatted
    volumeBySources[key] = volumeBySources[key]
      ? volumeBySources[key] + +volume
      : +volume
  }

  const knownSources = []
  const unknownSources = []

  Object.entries(volumeBySources).sort((a,b) => b[1] - a[1])
    .forEach(source => {
      if (source[0].length !== 42) knownSources.push(source)
      else unknownSources.push(source)
    })

  const dataSeries = []
  const labels = []
  const otherSources = { known: [], unknown: 0 }
  let total = 0

  ;[...knownSources, ...unknownSources].forEach(([address, volume], index) => {
    total += volume
    const isKnown = !(/^(0x)?[0-9a-f]{40}$/.test(address) || /^(0x)?[0-9A-F]{40}$/.test(address))

    if (isKnown && index < 7) {
      labels.push(address)
      dataSeries.push(volume)
    } else if (
      labels[labels.length - 1] !== 'Others' && (
        (!isKnown && index < 7) ||
        index === 7
      )
    ) {
      labels.push('Others')
      dataSeries.push(volume)
      if (isKnown) otherSources.known.push({ address, volume })
      else otherSources.unknown += volume
    } else {
      dataSeries[dataSeries.length - 1] = dataSeries[dataSeries.length - 1] += volume
      if (isKnown) otherSources.known.push({ address, volume })
      else otherSources.unknown += volume
    }
  })

  const backgroundColors = [
    '#003349',
    '#2f4b7c',
    '#665191',
    '#a05195',
    '#d45087',
    '#f95d6a',
    '#ff7c43',
    '#ffa600',
  ]

  const data = {
    labels,
    datasets: [{
      label: 'Volume by sources',
      data: dataSeries,
      backgroundColor: backgroundColors,
      hoverOffset: 4
    }]
  }

  const config = {
    type: 'doughnut',
    data: data,
    options: {
      layout: {
        padding: 5,
      },
      plugins: {
        legend: {
          display: false,
          position: 'right',
        },
        tooltip: {
          callbacks: {
            title: function(tooltipItem) {
              return tooltipItem[0].label
            },
            label: function(tooltipItem) {
              if (tooltipItem.label === 'Others') {
                const labels = []
                function buildString(address, volume) {
                  return `${address} - ` +
                    `$${numeral(volume.toFixed(2)).format('0a')} - ` +
                    `${((volume / total) * 100).toFixed(3)}%`
                }
                otherSources.known.forEach(source => {
                  labels.push(buildString(source.address, source.volume))
                })
                labels.push(buildString('Unknown contracts', otherSources.unknown))
                return labels
              }
              return `$${numeral(tooltipItem.raw.toFixed(2)).format('0a')}`
            },
            afterLabel: function(tooltipItem) {
              if (tooltipItem.label === 'Others') return
              return `${((tooltipItem.raw / total) * 100).toFixed()}%`
            }
          },
          backgroundColor: theme.palette.background.default,
          titleFont: { size: 16 },
          titleColor: theme.palette.primary.main,
          bodyColor: theme.palette.text.primary,
          bodyFont: { size: 15 },
          displayColors: false,
          titleAlign: 'center',
          bodyAlign: 'center',
          padding: 15,
        },
      },
    },
  }

  const labelElements = labels.map((label, index) =>
    <Stack direction="row" key={`${label}${dataSeries[index]}`}>
      <CircleIcon sx={{ color: backgroundColors[index], mr: 1 }}/>
      <Typography sx={{ mr: 1 }}>{label}</Typography>
      <Typography sx={{ ml: 'auto' }}>{((dataSeries[index] / total) * 100).toFixed()}%</Typography>
    </Stack>
  )

  return <Box>
    <Stack direction="row" justifyContent="center">
      <Box sx={{ maxWidth: '700px', position: 'relative', minWidth: '50px', minHeight: '50px', flexGrow: 1 }}>
        <Stack alignItems="center" sx={{ position: 'absolute', top: 'calc(50% - 25px)', right: 'calc(50% - 25px)'}}>
          <Typography variant="h6">${numeral(total.toFixed(2)).format('0a')}</Typography>
          <Typography variant="caption">Total</Typography>
        </Stack>
        <Box sx={{ py: 2 }}>
          <Doughnut {...config} />
        </Box>
      </Box>
      <Stack sx={{ ml: 2, justifyContent: 'center' }}>
        {labelElements}
      </Stack>
    </Stack>
    <Stack direction="row" justifyContent="center">
      <Typography variant="body1">
        {dayjs(dateLabels[range[0] - 1]).format('MM/DD/YYYY')} - {dayjs(dateLabels[range[1] - 1]).format('MM/DD/YYYY')}
      </Typography>
    </Stack>
    <RangeSlider {...{ range, labels: dateLabels, setRange }} />
  </Box>
}, function(prevProps, nextProps) {
  if (prevProps.timePeriod !== nextProps.timePeriod) return false
  for (const prop in prevProps) {
    if (prop === 'dailyWooFiVolumeBySources' && isEqual(prevProps[prop].data, nextProps[prop].data)) return true
    if (prop === 'dailyWooFiSwapVolume' && isEqual(prevProps[prop].data, nextProps[prop].data)) return true
    if (!isEqual(prevProps[prop], nextProps[prop])) return false
  }
  return true
})

export default VolumeBySourcesChart
