import React, { useCallback } from 'react'
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

function DailyVolumeChart({ timePeriod }) {
  const coreTitle = 'Swap volume'
  const [title = coreTitle, setTitle] = useLocalStorage('WooFiSwapVolumeTitle')

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
  const onSubtitleClick = useCallback(() => {
    if (title.includes('MA')) setTitle(coreTitle)
    else setTitle(`${coreTitle} 50 day MA`)
  }, [title])
  const subtitle = <Button
    size="small"
    sx={{ textAlign: 'right', textTransform: 'none', width: 'fit-content', marginLeft: 'auto', py: 0 }}
    onClick={onSubtitleClick}
  >
    {title === coreTitle ? 'Show MA' : 'Show all'}
  </Button>
  const props = {
    title,
    key: title,
    labels,
    datasets,
    gradientIndex: 1,
    timePeriod,
    subtitle,
  }

  if (title.includes('MA')) {
    props.datasets[0].data = SMA.calculate({ period: 50, values: props.datasets[0].data })
    props.labels = props.labels.slice(49)
  }

  return <RangeSliderLineChart {...props} />
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
    timePeriod,
  }

  return <RangeSliderLineChart {...props} />
}
