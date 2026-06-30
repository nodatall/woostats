import React, { useMemo } from 'react'

import { SMA } from 'technicalindicators'

import { useAppState } from 'lib/appState'
import { useLocalStorage } from 'lib/storageHooks'
import { lineColors } from 'lib/chart'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'

import Loading from 'components/Loading'
import TwoColumns from 'components/TwoColumns'
import ButtonGroupSelector from 'components/ButtonGroupSelector'
import RangeSliderLineChart from 'components/RangeSliderLineChart'
import AggregateNetworkVolumeBox from './AggregateNetworkVolumeBox'

export default function NetworkPage() {
  const {
    woofiVolumeHistory = [],
    woofiProVolumeHistory = [],
  } = useAppState(
    [
      'woofiVolumeHistory',
      'woofiProVolumeHistory'
    ]
  )

  const completeWoofiVolumeHistory = useMemo(() => {
    return calculateCompletWoofiVolumeHistory({ woofiProVolumeHistory, woofiVolumeHistory });
  }, [woofiProVolumeHistory, woofiVolumeHistory])

  if (
    (!woofiVolumeHistory || woofiVolumeHistory.length == 0)
  ) return <Loading />

  const {
    woofiVolumeSeries,
    woofiProVolumeSeries,
    woofiTotalVolumeSeries,
    woofiVolumeLabels,
  } = completeWoofiVolumeHistory.reduce((acc, spotEntry, index, array) => {
    const { date: spotDate, volume: spotVolume } = spotEntry
    const proEntry = woofiProVolumeHistory.find(entry => entry.date === spotDate)
    const proVolume = proEntry ? +proEntry.volume : 0

    if (index === array.length - 1 && proVolume === 0 && +spotVolume > 0) return acc

    acc.woofiVolumeSeries.push(+spotVolume)
    acc.woofiProVolumeSeries.push(proVolume)
    acc.woofiTotalVolumeSeries.push(+spotVolume + proVolume)
    acc.woofiVolumeLabels.push(spotDate)

    return acc
  }, {
    woofiVolumeSeries: [],
    woofiProVolumeSeries: [],
    woofiTotalVolumeSeries: [],
    woofiVolumeLabels: [],
  })

  return <Box>
    <AggregateNetworkVolumeBox />
    <TwoColumns>
      <VolumeOrLineChart {...{
        title: 'Daily WOOFi volume',
        wooDailyChartData: {
          wooVolumeSeries: woofiTotalVolumeSeries,
          wooSpotVolumeSeries: woofiVolumeSeries,
          wooFuturesVolumeSeries: woofiProVolumeSeries,
        },
        labels: woofiVolumeLabels,
      }}/>
      <VolumeOrLineChart {...{
        title: 'Daily WOOFi volume [day] day MA',
        datasets: [woofiTotalVolumeSeries],
        labels: woofiVolumeLabels,
      }}/>
    </TwoColumns>
  </Box>
}

function VolumeOrLineChart({ title, datasets, wooDailyChartData, labels, select, selectValue }) {
  const [timePeriod = -1, _] = useLocalStorage('wooFiTimePeriod')

  if (datasets) datasets = datasets.map(dataset => ({ data: dataset }))
  const props = {
    title,
    key: title,
    labels,
    datasets,
    timePeriod,
    select,
    selectValue,
  }

  let chart
  if (title.includes('%')) props.denominator = '%'
  if (title.includes('MA')) chart = <MAChart {...props} />
  else {
    chart = title === 'Daily WOOFi volume'
      ? <DailyVolumeChart {...{ title, ...wooDailyChartData, ...props }} />
      : <RangeSliderLineChart {...props} />
  }
  return chart
}

function MAChart({ ...props }) {
  const [maLength = 50, setMaLength] = useLocalStorage('maLength')

  props.datasets[0].data = SMA.calculate({ values: props.datasets[0].data, period: maLength }).filter(percent => percent > 0)
  props.labels = props.labels.slice(maLength - 1)
  props.title = props.title.replace('[day]', maLength)

  props.subtitle = <ButtonGroupSelector {...{
    sx: { mt: 1 },
    values: [25, 50, 100],
    current: maLength,
    setCurrent: setMaLength,
  }}/>

  return <RangeSliderLineChart {...props} />
}

function DailyVolumeChart({ wooVolumeSeries, wooSpotVolumeSeries, wooFuturesVolumeSeries, ...props }) {
  const [isTotal = 1, setIsTotal] = useLocalStorage('woofiDailyVolumeToggle')
  const chartKey = 'woofiVolumeChart'

  if (wooSpotVolumeSeries.length && wooFuturesVolumeSeries.length) {
    const lastSpotVolume = wooSpotVolumeSeries[wooSpotVolumeSeries.length - 1]
    const lastFuturesVolume = wooFuturesVolumeSeries[wooFuturesVolumeSeries.length - 1]

    if (lastSpotVolume === 0 || lastFuturesVolume === 0) {
      wooSpotVolumeSeries = wooSpotVolumeSeries.slice(0, -1)
      wooFuturesVolumeSeries = wooFuturesVolumeSeries.slice(0, -1)
      props.labels = props.labels.slice(0, -1)
    }
  }

  if (isTotal) {
    props.datasets = [{ data: wooVolumeSeries }]
  } else {
    props.title = 'WOOFi swap vs pro'
    props.datasets = [
      { data: wooFuturesVolumeSeries },
      { data: wooSpotVolumeSeries.slice(-(wooFuturesVolumeSeries.length)) },
    ]
    props.labels = props.labels.slice(-(wooFuturesVolumeSeries.length))
  }

  const subtitleElements = [
    <Stack direction="row">
      <Typography sx={{ color: lineColors[1] }} component="span">Swap</Typography>
      &nbsp;&nbsp;vs&nbsp;&nbsp;
      <Typography sx={{ color: lineColors[0] }} component="span">Pro</Typography>
    </Stack>,
    'Total',
  ]

  props.subtitle = <ButtonGroupSelector {...{
    sx: { mt: 1 },
    values: [
      1,
      0,
    ],
    valueElements: subtitleElements,
    current: isTotal,
    setCurrent: setIsTotal,
  }}/>

  return <RangeSliderLineChart {...props} chartKey={chartKey} />
}

function calculateCompletWoofiVolumeHistory({ woofiProVolumeHistory, woofiVolumeHistory }) {
  const latestProVolumeDate = woofiProVolumeHistory.reduce((latest, entry) => {
    return latest > entry.date ? latest : entry.date
  }, '2024-03-08')

  const woofiVolumeHistoryMap = woofiVolumeHistory.reduce((map, entry) => {
    map[entry.date] = entry
    return map
  }, {})

  let currentDate = new Date('2024-03-09')
  const endDate = new Date(latestProVolumeDate)
  const updatedHistory = [...woofiVolumeHistory]

  while (currentDate <= endDate) {
    const dateString = currentDate.toISOString().split('T')[0]
    if (!woofiVolumeHistoryMap[dateString]) {
      updatedHistory.push({ date: dateString, volume: 0 })
    }
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return updatedHistory.sort((a, b) => a.date.localeCompare(b.date))
}
