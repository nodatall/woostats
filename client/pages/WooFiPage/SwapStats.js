import React, { useCallback, useState } from 'react'
import { SMA } from 'technicalindicators'

import { useAppState } from 'lib/appState'
import { useLocalStorage } from 'lib/storageHooks'

import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import ContentCard from 'components/ContentCard'
import Loading from 'components/Loading'
import TwoColumns from 'components/TwoColumns'
import RangeSliderLineChart from 'components/RangeSliderLineChart'
import SwapsListTable from './SwapsListTable'
import VolumeBySourcesChart from './VolumeBySourcesChart'
import VolumeByAssetsTable from './VolumeByAssetsTable'

export default function SwapStats({ timePeriod }) {
  const statStateKeys = [
    'recentWooFiSwaps',
    'topWooFiSwaps',
    'dailyWooFiVolumeBySources',
    'dailyWooFiSwapVolume',
    'dailyWooFiVolumeByAssets',
  ]
  const state = useAppState(statStateKeys)
  if (statStateKeys.some(key => state[key] === undefined)) return <Loading />
  const {
    recentWooFiSwaps,
    topWooFiSwaps,
    dailyWooFiVolumeBySources,
    dailyWooFiSwapVolume,
    dailyWooFiVolumeByAssets,
  } = state

  return <TwoColumns>
    <DailyVolumeChart key="DailyVolumeChart" timePeriod={timePeriod} />
    <DailyNumberOfSwapsChart key="DailyNumberOfSwapsChart" timePeriod={timePeriod} />
    <ContentCard key="VolumeBySources">
      <Typography variant="h6">
        Volume by sources
      </Typography>
      <VolumeBySourcesChart {...{ dailyWooFiVolumeBySources, timePeriod, dailyWooFiSwapVolume }} />
    </ContentCard>
    <ContentCard key="VolumeByAssets">
      <Typography variant="h6">
        Volume by assets
      </Typography>
      <VolumeByAssetsTable {...{ dailyWooFiVolumeByAssets, timePeriod, dailyWooFiSwapVolume }} />
    </ContentCard>
    <ContentCard>
      <Typography variant="h6">
        Recent Trades
      </Typography>
      <SwapsListTable {...{ swaps: recentWooFiSwaps, minDate: true }} />
    </ContentCard>
    <ContentCard>
      <Typography variant="h6">
        Top Trades (All time)
      </Typography>
      <SwapsListTable {...{ swaps: topWooFiSwaps }} />
    </ContentCard>
  </TwoColumns>
}

function LineOrMAChart({ coreTitle, ...props }) {
  const [isMA = false, setIsMA] = useLocalStorage('isLineOrMAChartMA')

  const onSubtitleClick = useCallback(() => {
    setIsMA(!isMA)
  }, [isMA])

  props.subtitle = <Button
    size="small"
    sx={{ textAlign: 'right', textTransform: 'none', width: 'fit-content', marginLeft: 'auto', py: 0 }}
    onClick={onSubtitleClick}
  >
    {isMA ? 'Show daily' : 'Show MA'}
  </Button>

  if (isMA) {
    props.datasets[0].data = SMA.calculate({ period: 50, values: props.datasets[0].data })
    props.labels = props.labels.slice(49)
  }
  props.title = isMA ? `${coreTitle} 50 day MA` : coreTitle

  return <RangeSliderLineChart {...props} />
}

function DailyVolumeChart({ timePeriod }) {
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
        acc.series.push(+volume)
        return acc
      },
      {
        labels: [],
        series: [],
      }
    )
  const datasets = [{ data: series }]
  const coreTitle = 'Swap volume'

  const props = {
    key: coreTitle,
    labels,
    datasets,
    gradientIndex: 1,
    timePeriod,
    coreTitle,
  }

  return <LineOrMAChart {...props} />
}

function DailyNumberOfSwapsChart({ timePeriod }) {
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
        acc.series.push(+number)
        return acc
      },
      {
        labels: [],
        series: [],
      }
    )
  const datasets = [{ data: series }]
  const coreTitle = 'Number of trades'
  const props = {
    coreTitle,
    key: coreTitle,
    labels,
    datasets,
    gradientIndex: 1,
    denominator: '',
    timePeriod,
  }

  return <LineOrMAChart {...props} />
}
