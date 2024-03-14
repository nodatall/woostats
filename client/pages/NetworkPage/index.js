import React, { useRef, useState, useEffect, useMemo } from 'react'

import { SMA } from 'technicalindicators'

import { useAppState } from 'lib/appState'
import { useLocalStorage } from 'lib/storageHooks'
import { lineColors } from 'lib/chart'
import { TOP_SPOT_EXCHANGES, TOP_FUTURES_EXCHANGES } from 'lib/constants'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'

import Loading from 'components/Loading'
import TwoColumns from 'components/TwoColumns'
import ButtonGroupSelector from 'components/ButtonGroupSelector'
import RangeSliderLineChart from 'components/RangeSliderLineChart'
import AggregateNetworkVolumeBox from './AggregateNetworkVolumeBox'

export default function NetworkPage() {
  const {
    wooSpotVolume = [],
    wooFuturesVolume,
    topFuturesExchangeVolumes,
    topSpotExchangeVolumes,
    woofiVolumeHistory = [],
    woofiProVolumeHistory = [],
  } = useAppState(
    [
      'wooSpotVolume',
      'wooFuturesVolume',
      'topFuturesExchangeVolumes',
      'topSpotExchangeVolumes',
      'woofiVolumeHistory',
      'woofiProVolumeHistory'
    ]
  )

  const completeWoofiVolumeHistory = useMemo(() => {
    return calculateCompletWoofiVolumeHistory({ woofiProVolumeHistory, woofiVolumeHistory });
  }, [woofiProVolumeHistory, woofiVolumeHistory])

  if (
    (!wooSpotVolume || wooSpotVolume.length === 0) ||
    (!wooFuturesVolume || wooFuturesVolume.length === 0) ||
    (!topFuturesExchangeVolumes || topFuturesExchangeVolumes.length == 0) ||
    (!topSpotExchangeVolumes || topSpotExchangeVolumes.length == 0) ||
    (!woofiVolumeHistory || woofiVolumeHistory.length == 0)
  ) return <Loading />

  const {
    labels: wooVolumeLabels, series: wooVolumeSeries, wooSpotVolumeSeries, wooFuturesVolumeSeries,
  } = wooSpotVolume
    .reduce(
      (acc, { date, volume }) => {
        const { volume: futuresVolume } = wooFuturesVolume.find(futuresVol => futuresVol.date === date) || { volume: 0 }
        acc.labels.push(date)
        acc.series.push(+volume + +futuresVolume)
        acc.wooSpotVolumeSeries.push(+volume)
        acc.wooFuturesVolumeSeries.push(futuresVolume ? +futuresVolume : 0)
        return acc
      },
      {
        labels: [],
        series: [],
        wooSpotVolumeSeries: [],
        wooFuturesVolumeSeries: [],
      }
    )


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
        title: 'Daily WOO X volume',
        wooDailyChartData: { wooVolumeSeries, wooSpotVolumeSeries, wooFuturesVolumeSeries },
        labels: wooVolumeLabels,
      }}/>
      <VolumeOrLineChart {...{
        title: 'Daily WOO X volume [day] day MA',
        datasets: [wooVolumeSeries],
        labels: wooVolumeLabels,
      }}/>
    </TwoColumns>
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
    <FuturesComparisonCharts />
    <SpotComparisonCharts />
  </Box>
}

function SpotComparisonCharts() {
  const {
    topSpotExchangeVolumes, wooSpotVolume
  } = useAppState(
    ['topSpotExchangeVolumes', 'wooSpotVolume']
  )

  return <SelectAndMACharts {...{
    wooVolumeSeries: wooSpotVolume,
    localStorageKey: 'spotComparisonDropdown',
    storageDefault: 'aggregateSpot',
    exchangeMap: TOP_SPOT_EXCHANGES,
    volumeHistories: topSpotExchangeVolumes,
  }}/>
}

function FuturesComparisonCharts() {
  const {
    topFuturesExchangeVolumes, wooFuturesVolume
  } = useAppState(
    ['topFuturesExchangeVolumes', 'wooFuturesVolume']
  )

  return <SelectAndMACharts {...{
    wooVolumeSeries: wooFuturesVolume,
    localStorageKey: 'futuresComparisonDropdown',
    storageDefault: 'aggregateFutures',
    exchangeMap: TOP_FUTURES_EXCHANGES,
    volumeHistories: topFuturesExchangeVolumes,
  }}/>
}


function SelectAndMACharts({
  localStorageKey, storageDefault, exchangeMap, wooVolumeSeries, volumeHistories,
}) {
  const componentRef = useRef()
  const [savedHeight, setSavedHeight] = useState()
  const [selectedExchange = storageDefault, selectExchange] = useLocalStorage(localStorageKey)

  useEffect(() => {
    if (componentRef.current) {
      setSavedHeight(componentRef.current.offsetHeight);
    }
  }, [])

  useEffect(() => {
    if (componentRef.current && savedHeight) {
      componentRef.current.style.height = `${savedHeight}px`
    }
  }, [savedHeight])

  const handleExchangeChange = newExchange => {
    setSavedHeight(componentRef.current.offsetHeight)
    selectExchange(newExchange)
  }

  const title = exchangeMap[selectedExchange] || 'top exchanges'

  const selectMenuItems = useMemo(() => {
    const items = [<MenuItem value={storageDefault} key={storageDefault}>Top exchanges</MenuItem>]
    return items.concat(
      Object.keys(exchangeMap).map(topExchange => (
        <MenuItem value={topExchange} key={topExchange}>
          {exchangeMap[topExchange]}
        </MenuItem>
      ))
    )
  }, [exchangeMap, storageDefault])

  const select = <FormControl
    sx={{
      width: 'fit-content',
      mr: 2,
      mt: 0,
    }}
  >
    <Select
      value={selectedExchange}
      onChange={event => {
        handleExchangeChange(event.target.value)
      }}
      sx={{
        '.MuiSelect-select': { py: .75 },
        '&:hover fieldset.MuiOutlinedInput-notchedOutline': {
          borderColor: 'rgb(213, 213, 213, 0.5)',
          borderWidth: '1px',
        },
        '&.Mui-focused fieldset.MuiOutlinedInput-notchedOutline': {
          borderColor: 'rgb(213, 213, 213, 0.5)',
          borderWidth: '1px',
        }
      }}
    >
      {selectMenuItems}
    </Select>
  </ FormControl>

  const currentExchangeSeries = useMemo(() => {
    return volumeHistories.find(([topExchange]) => topExchange === selectedExchange)[1];
  }, [selectedExchange, volumeHistories])

  const wooVolumesMap = {}
  wooVolumeSeries.forEach(({ date, volume }) => wooVolumesMap[date] = volume)

  const { percentSeries, labels } = currentExchangeSeries
    .reduce(
      (acc, { volume, date }, index) => {
        if (!wooVolumesMap[date]) return acc
        let percent = (wooVolumesMap[date] / volume) * 100
        if (percent > 1600) {
          percent = acc.percentSeries[index - 1]
        }
        acc.percentSeries.push(percent)
        acc.labels.push(date)
        return acc
      },
      {
        percentSeries: [],
        labels: []
      }
    )

  const spotFut = localStorageKey.includes('spot') ? 'spot' : 'futures'

  return <TwoColumns>
    <div ref={componentRef}>
      <VolumeOrLineChart {...{
        title: `WOO % ${spotFut} marketshare vs [${title}]`,
        selectValue: title,
        datasets: [percentSeries],
        labels,
        select,
      }} />
    </div>
    <VolumeOrLineChart {...{
      title: `WOO % ${spotFut} vs ${title} [day] day MA`,
      datasets: [percentSeries],
      labels,
    }} />

  </TwoColumns>
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
    chart = (title === 'Daily WOO X volume') || (title === 'Daily WOOFi volume')
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
  const localStorageKey = props.title === 'Daily WOOFi volume' ? 'woofiDailyVolumeToggle' : 'wooXDailyVolumeToggle'
  const [isTotal = 1, setIsTotal] = useLocalStorage(localStorageKey)
  const chartKey = props.title.includes('WOO X') ? 'wooXVolumeChart' : 'woofiVolumeChart'

  if (isTotal) {
    props.datasets = [{ data: wooVolumeSeries }]
  } else {
    props.title = props.title === 'Daily WOOFi volume' ? 'WOOFi swap vs pro' : `WOO X spot vs futures`
    props.datasets = [
      { data: wooFuturesVolumeSeries },
      { data: wooSpotVolumeSeries.slice(-(wooFuturesVolumeSeries.length)) },
    ]
    props.labels = props.labels.slice(-(wooFuturesVolumeSeries.length))
  }

  const subtitleElements = props.title.includes('WOOFi') ?
    [
      <Stack direction="row">
        <Typography sx={{ color: lineColors[1] }} component="span">Swap</Typography>
        &nbsp;&nbsp;vs&nbsp;&nbsp;
        <Typography sx={{ color: lineColors[0] }} component="span">Pro</Typography>
      </Stack>,
      'Total',
    ] :
    [
      <Stack direction="row">
        <Typography sx={{ color: lineColors[1] }} component="span">Spot</Typography>
        &nbsp;&nbsp;vs&nbsp;&nbsp;
        <Typography sx={{ color: lineColors[0] }} component="span">Futures</Typography>
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
