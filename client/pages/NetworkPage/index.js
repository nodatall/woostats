import React from 'react'

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
  const [timePeriod = -1, _] = useLocalStorage('wooFiTimePeriod')

  const {
    wooSpotVolume = [],
    aggregateVolume,
    wooFuturesVolume,
  } = useAppState(
    ['wooSpotVolume', 'wooFuturesVolume', 'aggregateVolume']
  )

  if (
    (!wooSpotVolume || wooSpotVolume.length === 0) ||
    (!wooFuturesVolume || wooFuturesVolume.length === 0) ||
    (!aggregateVolume || aggregateVolume.length == 0)
  ) return <Loading />

  const {
    labels: wooVolumeLabels, series: wooVolumeSeries, wooSpotVolumeSeries, wooFuturesVolumeSeries,
  } = wooSpotVolume
    .slice(0, -1)
    .reduce(
      (acc, { date, volume }) => {
        const { volume: futuresVolume } = wooFuturesVolume.find(futuresVol => futuresVol.date === date) || { volume: 0 }
        acc.labels.push(date)
        acc.series.push(+volume + +futuresVolume)
        if (futuresVolume > 0) {
          acc.wooSpotVolumeSeries.push(+volume)
          acc.wooFuturesVolumeSeries.push(+futuresVolume)
        }
        return acc
      },
      {
        labels: [],
        series: [],
        wooSpotVolumeSeries: [],
        wooFuturesVolumeSeries: [],
      }
    )

  const { percentSeries, aggregateVolumeSeries } = aggregateVolume
    .slice(0, -1)
    .reduce(
      (acc, { volume }, index) => {
        const wooSpotVolume = wooVolumeSeries[index]
        const aggregatePlusWoo = +volume + wooSpotVolume
        acc.aggregateVolumeSeries.push(aggregatePlusWoo)
        acc.percentSeries.push((wooVolumeSeries[index] / aggregatePlusWoo) * 100)
        return acc
      },
      {
        aggregateVolumeSeries: [],
        percentSeries: [],
      }
    )

  const charts = []
  ;[
    { title: 'Daily WOO Network volume' },
    { title: 'Daily Network volume [day] day MA', datasets: [wooVolumeSeries] },
    { title: 'WOO Network % of total market volume', datasets: [percentSeries] },
    { title: 'WOO Network % of total [day] day MA', datasets: [percentSeries] },
    { title: 'Total crypto market volume', datasets: [aggregateVolumeSeries] },
    { title: 'Total market volume [day] day MA', datasets: [aggregateVolumeSeries] },
  ].forEach(({ title, datasets },) => {
    if (datasets) datasets = datasets.map(dataset => ({ data: dataset }))
    const props = {
      title,
      key: title,
      labels: wooVolumeLabels,
      datasets,
      timePeriod,
    }

    let chart
    if (title.includes('%')) props.denominator = '%'
    if (title.includes('MA')) chart = <MAChart {...props} />
    else {
      chart = title === 'Daily WOO Network volume'
        ? <DailyVolumeChart {...{ wooVolumeSeries, wooSpotVolumeSeries, wooFuturesVolumeSeries, ...props }} />
        : <RangeSliderLineChart {...props} />
    }
    charts.push(chart)
  })

  return <Box>
    <AggregateNetworkVolumeBox />
    <TwoColumns>
      {charts}
    </TwoColumns>
  </Box>
}

function MAChart({ ...props }) {
  const [maLength = 50, setMaLength] = useLocalStorage('maLength')

  props.datasets[0].data = SMA.calculate({ period: maLength, values: props.datasets[0].data })
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
  const [isTotal = 1, setIsTotal] = useLocalStorage('dailyVolumeToggle')

  if (isTotal) {
    props.datasets = [{ data: wooVolumeSeries }]
  } else {
    props.title = `Daily spot vs futures volumes`
    props.datasets = [
      { data: wooFuturesVolumeSeries },
      { data: wooSpotVolumeSeries.slice(-(wooFuturesVolumeSeries.length)) },
    ]
    props.labels = props.labels.slice(-(wooFuturesVolumeSeries.length))
  }
  props.subtitle = <ButtonGroupSelector {...{
    sx: { mt: 1 },
    values: [
      1,
      0,
    ],
    valueElements: [
      <Stack direction="row">
        <Typography sx={{ color: lineColors[1] }} component="span">Spot</Typography>
        &nbsp;&nbsp;vs&nbsp;&nbsp;
        <Typography sx={{ color: lineColors[0] }} component="span">Futures</Typography>
      </Stack>,
      'Total',
    ],
    current: isTotal,
    setCurrent: setIsTotal,
  }}/>

  return <RangeSliderLineChart {...props} />
}
