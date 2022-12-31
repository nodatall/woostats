import React, { useCallback } from 'react'
import { SMA } from 'technicalindicators'

import { useLocalStorage } from 'lib/storageHooks'
import useWooFiState from 'lib/useWooFiStateHook'

import Button from '@mui/material/Button'
import ContentCardLoading from 'components/ContentCardLoading'
import TwoColumns from 'components/TwoColumns'
import RangeSliderLineChart from 'components/RangeSliderLineChart'
import SwapsListTable from './SwapsListTable'
import VolumeBySourcesChart from './VolumeBySourcesChart'
import VolumeByAssets from './VolumeByAssets'

export default function SwapStats() {
  return <TwoColumns>
    <DailyVolumeChart key="DailyVolumeChart" />
    <DailyNumberOfSwapsChart key="DailyNumberOfSwapsChart" />
    <VolumeBySourcesChart />
    <VolumeByAssets />
    <RecentTradesTable key="RecentTradesTable"/>
    <TopTradesTable key="TopTradesTable" />
  </TwoColumns>
}

function LineOrMAChart({ coreTitle, ...props }) {
  const [timePeriod = -1, _] = useLocalStorage('wooFiTimePeriod')
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

  return <RangeSliderLineChart {...{ ...props, timePeriod }} />
}

function DailyVolumeChart() {
  const { dailyWooFiSwapVolume, loading } = useWooFiState(['dailyWooFiSwapVolume'])
  if (loading) return <ContentCardLoading />

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
    coreTitle,
  }

  return <LineOrMAChart {...props} />
}

function DailyNumberOfSwapsChart() {
  const { dailyNumberOfWooFiSwaps, loading } = useWooFiState(['dailyNumberOfWooFiSwaps'])
  if (loading) return <ContentCardLoading />

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
  }

  return <LineOrMAChart {...props} />
}

function RecentTradesTable() {
  const { recentWooFiSwaps, loading } = useWooFiState(['recentWooFiSwaps'])
  if (loading) return <ContentCardLoading />

  return <SwapsListTable {...{ swaps: recentWooFiSwaps, minDate: true, title: 'Recent Trades', key: 'Recent Trades' }} />
}

function TopTradesTable() {
  const { topWooFiSwaps, loading } = useWooFiState(['topWooFiSwaps'])
  if (loading) return <ContentCardLoading />

  return <SwapsListTable {...{ swaps: topWooFiSwaps, title: 'Top Trades (All time)', key: 'Top Trades' }} />
}
