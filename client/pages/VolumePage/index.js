import React, { useState, useRef, useEffect } from 'react'
import dayjs from 'lib/dayjs'
import isEqual from 'lodash/isEqual'
import { SMA } from 'technicalindicators'

import { useAppState } from 'lib/appState'
import { useLocalStorage } from 'lib/storageHooks'
import { lineColors } from 'lib/chart'

import { useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'

import Loading from 'components/Loading'
import LineChart from 'components/LineChart'
import ContentCard from 'components/ContentCard'
import RangeSlider from './RangeSlider'
import ButtonGroupWithSubtitle from './ButtonGroupWithSubtitle'
import Tooltip from './Tooltip'
import AggregateNetworkVolumeBox from './AggregateNetworkVolumeBox'

export default function VolumePage() {
  const {
    wooSpotVolume = [],
    aggregateVolume,
    wooFuturesVolume,
  } = useAppState(
    ['wooSpotVolume', 'wooFuturesVolume', 'aggregateVolume']
  )
  const theme = useTheme()

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

  let charts = []
  let tempCharts = []
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
    }

    let chart
    if (title.includes('%')) props.denominator = '%'
    if (title.includes('MA')) chart = <MAChart {...props} />
    else {
      chart = title === 'Daily WOO Network volume'
        ? <DailyVolumeChart {...{ wooVolumeSeries, wooSpotVolumeSeries, wooFuturesVolumeSeries, ...props }} />
        : <VolumeChart {...props} />
    }
    tempCharts.push(chart)

    if (tempCharts.length === 2) {
      charts.push(
        <Stack {...{
          sx: {
            flexDirection: 'row',
            [theme.breakpoints.down('lg')]: {
              flexDirection: 'column',
            },
            '> *': {
              flexBasis: '50%',
              '&:first-of-type': {
                mr: 4,
                [theme.breakpoints.down('lg')]: {
                  mr: 0
                },
              },
            },
          },
          key: title,
        }}>
          {tempCharts}
        </Stack>
      )
      tempCharts = []
    }
  })

  return <Box>
    <AggregateNetworkVolumeBox />
    {charts}
  </Box>
}

const reduceArrayToRange = (arr, range) => arr.slice(range[0] - 1, range[1])
let rangeSetTimeout

const VolumeChart = React.memo(function ({
  title, labels, datasets, denominator = '$', subtitle,
}) {
  const isMA = title.includes('MA')
  const defaultRange = [1, labels.length]
  const [range = defaultRange, _setRange] = useLocalStorage(`${title.replace(/ /g, '')}WooVolumeRangeSlider`)
  const [
    lastRangeDate = dayjs().format('YYYY-MM-DD'), setLastRangeDate
  ] = useLocalStorage(`${title.replace(/ /g, '')}WooVolumeRangeSliderLastDate`)
  const containerRef = useRef()
  const [tooltip, setTooltip] = useState({})

  const setRange = val => {
    _setRange(val)
    clearTimeout(rangeSetTimeout)
    rangeSetTimeout = setTimeout(() => {
      setLastRangeDate(dayjs().format('YYYY-MM-DD'))
    }, 500)
  }

  useEffect(
    () => {
      const today = dayjs(dayjs().format('YYYY-MM-DD'))
      const daysAgo = today.diff(lastRangeDate, 'day')
      if (daysAgo > 0 && labels.length - range[1] === daysAgo) {
        setRange([range[0], range[1] + daysAgo])
        setLastRangeDate(dayjs().format('YYYY-MM-DD'))
      }
    },
    [title]
  )

  datasets = datasets.map(dataset => {
    return {
      ...dataset,
      data: isMA ? dataset.data : reduceArrayToRange(dataset.data, range),
    }
  })

  return <ContentCard sx={{ p: 2 }} >
    <Stack sx={{flexDirection: 'row-reverse', flexWrap: 'wrap', mb: 3, minHeight: '50px'}}>
      <Stack>
        <Typography variant="h6" sx={{ textAlign: 'right' }}>
          {title}
        </Typography>
        {subtitle}
      </Stack>
      {tooltip && <Tooltip {...{tooltip, denominator}} />}
    </Stack>
    <Box ref={containerRef}>
      <LineChart {...{
        labels: isMA ? labels : reduceArrayToRange(labels, range),
        datasets,
        tooltip,
        setTooltip,
        parentRef: containerRef,
        denominator,
      }}
      />
    </Box>
    {!isMA && <RangeSlider {...{ range, labels, setRange }} />}
  </ContentCard>
}, function(prevProps, nextProps) {
  for (const prop in prevProps) {
    if (prop === 'datasets' && isEqual(prevProps[prop].data, nextProps[prop].data)) return true
    if (!isEqual(prevProps[prop], nextProps[prop])) return false
  }
  return true
})

function MAChart({ ...props }) {
  const [maLength = 50, setMaLength] = useLocalStorage('maLength')

  props.datasets[0].data = SMA.calculate({ period: maLength, values: props.datasets[0].data })
  props.labels = props.labels.slice(maLength - 1)
  props.title = props.title.replace('[day]', maLength)

  props.subtitle = <ButtonGroupWithSubtitle {...{
    values: [25, 50, 100],
    current: maLength,
    setCurrent: setMaLength,
  }}/>

  return <VolumeChart {...props} />
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
  props.subtitle = <ButtonGroupWithSubtitle {...{
    values: [
      1,
      0,
    ],
    valueElements: [
      <Stack direction="row">
        <Typography sx={{ color: lineColors[1] }}>Spot</Typography>
        &nbsp;&nbsp;vs&nbsp;&nbsp;
        <Typography sx={{ color: lineColors[0] }}>Futures</Typography>
      </Stack>,
      'Total',
    ],
    current: isTotal,
    setCurrent: setIsTotal,
  }}/>

  return <VolumeChart {...props} />
}
