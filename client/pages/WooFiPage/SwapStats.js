import React from 'react'
import { useParams } from 'react-router-dom'

import { useAppState } from 'lib/appState'

import Typography from '@mui/material/Typography'

import ContentCard from 'components/ContentCard'
import TwoColumns from 'components/TwoColumns'
import RangeSliderLineChart from 'components/RangeSliderLineChart'
import SwapsListTable from './SwapsListTable'

export default function SwapStats() {
  const {
    recentWooFiSwaps = [],
    topWooFiSwaps = [],
  } = useAppState(
    [
      'recentWooFiSwaps',
      'topWooFiSwaps'
    ]
  )

  return <TwoColumns>
    <DailyVolumeChart key="DailyVolumeChart" />
    <DailyNumberOfSwapsChart key="DailyNumberOfSwapsChart" />
    <ContentCard>
      <Typography variant="h6" sx={{  }}>
        Recent Trades
      </Typography>
      <SwapsListTable {...{ swaps: recentWooFiSwaps, minDate: true }} />
    </ContentCard>
    <ContentCard>
      <Typography variant="h6" sx={{  }}>
        Top Trades
      </Typography>
      <SwapsListTable {...{ swaps: topWooFiSwaps }} />
    </ContentCard>
  </TwoColumns>
}

function DailyVolumeChart() {
  const {
    dailyWooFiSwapVolume = [],
  } = useAppState(
    [
      'dailyWooFiSwapVolume',
    ]
  )

  const { labels, series } = dailyWooFiSwapVolume
    .reduce(
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
  const datasets = [{ data: series }]
  const title = 'Swap volume'
  const props = {
    title,
    key: title,
    labels,
    datasets,
    gradientIndex: 1,
  }

  return <RangeSliderLineChart {...props} />
}

function DailyNumberOfSwapsChart() {
  const {
    dailyNumberOfWooFiSwaps = [],
  } = useAppState(
    [
      'dailyNumberOfWooFiSwaps',
    ]
  )

  const { labels, series } = dailyNumberOfWooFiSwaps
    .reduce(
      (acc, { date, number }) => {
        acc.labels.push(date)
        acc.series.push(number)
        return acc
      },
      {
        labels: [],
        series: [],
      }
    )
  const datasets = [{ data: series }]
  const title = 'Number of trades'

  const props = {
    title,
    key: title,
    labels,
    datasets,
    gradientIndex: 1,
    denominator: '',
  }

  return <RangeSliderLineChart {...props} />
}
