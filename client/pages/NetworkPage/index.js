import React from 'react'

import { SMA } from 'technicalindicators'

import { useAppState } from 'lib/appState'
import { useLocalStorage } from 'lib/storageHooks'
import { lineColors } from 'lib/chart'
import { TOP_SPOT_EXCHANGES, TOP_FUTURES_EXCHANGES } from 'lib/constants'
import dayjs from 'lib/dayjs'

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
  const [timePeriod = -1, _] = useLocalStorage('wooFiTimePeriod')

  const {
    wooSpotVolume = [],
    wooFuturesVolume,
    topFuturesExchangeVolumes,
    topSpotExchangeVolumes,
  } = useAppState(
    ['wooSpotVolume', 'wooFuturesVolume', 'topFuturesExchangeVolumes', 'topSpotExchangeVolumes']
  )

  if (
    (!wooSpotVolume || wooSpotVolume.length === 0) ||
    (!wooFuturesVolume || wooFuturesVolume.length === 0) ||
    (!topFuturesExchangeVolumes || topFuturesExchangeVolumes.length == 0) ||
    (!topSpotExchangeVolumes || topSpotExchangeVolumes.length == 0)
  ) return <Loading />

  const {
    labels: wooVolumeLabels, series: wooVolumeSeries, wooSpotVolumeSeries, wooFuturesVolumeSeries, wooTotalVolumesWithDates
  } = wooSpotVolume
    .slice(0, -1)
    .reduce(
      (acc, { date, volume }) => {
        const { volume: futuresVolume } = wooFuturesVolume.find(futuresVol => futuresVol.date === date) || { volume: 0 }
        const aggregateVolume = +volume + +futuresVolume
        acc.labels.push(date)
        acc.series.push(aggregateVolume)
        acc.wooTotalVolumesWithDates.push({ date, volume: aggregateVolume })
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
        wooTotalVolumesWithDates: [],
      }
    )

  return <Box>
    <AggregateNetworkVolumeBox />
    <TwoColumns>
      <VolumeOrLineChart {...{
        title: 'Daily WOO Network volume',
        wooDailyChartData: { wooVolumeSeries, wooSpotVolumeSeries, wooFuturesVolumeSeries },
        labels: wooVolumeLabels,
      }}/>
      <VolumeOrLineChart {...{
        title: 'Daily Network volume [day] day MA',
        datasets: [wooVolumeSeries],
        labels: wooVolumeLabels,
      }}/>
    </TwoColumns>
    <CombinedComparisonCharts {...{ wooTotalVolumesWithDates }} />
    <FuturesComparisonCharts />
    <SpotComparisonCharts />
  </Box>
}

function CombinedComparisonCharts({ wooTotalVolumesWithDates }) {
  const {
    topSpotExchangeVolumes, topFuturesExchangeVolumes,
  } = useAppState(
    ['topSpotExchangeVolumes', 'topFuturesExchangeVolumes']
  )

  const exchangeMap = {
    'aggregate': 'Top Exchanges',
    'binance': 'Binance',
    'okex': 'OKX',
    'gdax': 'Coinbase',
    'kucoin': 'KuCoin',
    'bybit': 'Bybit',
    'mxc': 'MXC',
    'binance_us': 'Binance US',
    'bitmex': 'BitMEX',
    'kraken': 'Kraken',
    'huobi': 'Huobi',
  }
  const indexes = [
    [1,1, 'binance'],
    [2, 3, 'okex'],
    [null, 2, 'gdax'],
    [5, 7, 'kucoin'],
    [3, 6, 'bybit'],
    [4, 4, 'mxc'],
    [null, 8, 'binance_us'],
    [10, null, 'bitmex'],
    [null, 5, 'kraken'],
    [9, 9, 'huobi']
  ]
  const aggregateMap = {}
  const volumeHistories = []
  indexes.forEach(pair => {
    const subAggregateMap = {}
    const [futuresIndex, spotIndex] = pair
    const spotExchange = spotIndex && topSpotExchangeVolumes[spotIndex]
    const futuresExchange = futuresIndex && topFuturesExchangeVolumes[futuresIndex]
    if (!spotExchange || !futuresExchange) {
      const exchangeVolumes = (spotExchange || futuresExchange)[1]
      exchangeVolumes.forEach(({ date, volume }) => {
        aggregateMap[date] = aggregateMap[date] || 0
        aggregateMap[date] += +volume
      })
      volumeHistories.push([pair[2], exchangeVolumes])
    } else {
      const spotExchangeVolumes = spotExchange && spotExchange[1]
      const futuresExchangeVolumes = futuresExchange && futuresExchange[1]
      spotExchangeVolumes.forEach(({ date, volume }) => {
        aggregateMap[date] = aggregateMap[date] || 0
        aggregateMap[date] += +volume
        subAggregateMap[date] = subAggregateMap[date] || 0
        subAggregateMap[date] += +volume
      })
      futuresExchangeVolumes.forEach(({ date, volume }) => {
        aggregateMap[date] = aggregateMap[date] || 0
        aggregateMap[date] += +volume
        subAggregateMap[date] = subAggregateMap[date] || 0
        subAggregateMap[date] += +volume
      })
      volumeHistories.push(
        [
          pair[2],
          Object.entries(subAggregateMap)
            .sort((a,b) => new Date(a[0]) - new Date(b[0]))
            .map(([date, volume]) => ({ date, volume }))
        ]
      )
    }
  })
  const aggregateVolumes = []
  Object.entries(aggregateMap)
    .sort((a,b) => new Date(a[0]) - new Date(b[0]))
    .forEach(([date, volume]) => {
      aggregateVolumes.push({ volume, date })
    })
  volumeHistories.unshift(['aggregate', aggregateVolumes])

  console.log(`volumeHistories ==>`, volumeHistories)

  return <SelectAndMACharts {...{
    wooVolumeSeries: wooTotalVolumesWithDates.slice(0, -1),
    localStorageKey: 'combinedComparisonDropdown',
    storageDefault: 'aggregate',
    exchangeMap,
    volumeHistories,
  }}/>
}

function SpotComparisonCharts() {
  const {
    topSpotExchangeVolumes, wooSpotVolume
  } = useAppState(
    ['topSpotExchangeVolumes', 'wooSpotVolume']
  )

  return <SelectAndMACharts {...{
    wooVolumeSeries: wooSpotVolume.slice(0, -1),
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
    wooVolumeSeries: wooFuturesVolume.slice(0, -1),
    localStorageKey: 'futuresComparisonDropdown',
    storageDefault: 'aggregateFutures',
    exchangeMap: TOP_FUTURES_EXCHANGES,
    volumeHistories: topFuturesExchangeVolumes,
  }}/>
}

function SelectAndMACharts({
  localStorageKey, storageDefault, exchangeMap, wooVolumeSeries, volumeHistories,
}) {
  const [selectedExchange = storageDefault, selectExchange] = useLocalStorage(localStorageKey)
  const title = exchangeMap[selectedExchange] || 'top exchanges'
  const selectMenuItems = [
    <MenuItem value={storageDefault} key={storageDefault}>Top exchanges</MenuItem>
  ]
  Object.keys(exchangeMap).map(topExchange => {
    selectMenuItems.push(
      <MenuItem value={topExchange} key={topExchange}>{exchangeMap[topExchange]}</MenuItem>
    )
  })
  const select = <FormControl
    sx={{
      width: 'fit-content',
      mr: 2,
      mt: 0,
    }}
  >
    <Select
      value={selectedExchange}
      onChange={event => selectExchange(event.target.value)}
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

  let currentExchangeSeries = volumeHistories.find(([topExchange]) => topExchange === selectedExchange)[1]
  const wooVolumesMap = {}
  wooVolumeSeries.forEach(({ date, volume }) => wooVolumesMap[date] = volume)

  const { percentSeries, topExchangeSeries, labels } = currentExchangeSeries
    .reduce(
      (acc, { volume, date }, index) => {
        if (!wooVolumesMap[date]) return acc
        let percent = (wooVolumesMap[date] / volume) * 100
        if (percent > 1000) {
          percent = acc.percentSeries[index - 1]
        }
        acc.topExchangeSeries.push((+volume))
        acc.percentSeries.push(percent)
        acc.labels.push(date)
        return acc
      },
      {
        topExchangeSeries: [],
        percentSeries: [],
        labels: []
      }
    )

  const spotFut = localStorageKey.includes('spot') ? 'spot' : 'futures'

  return <TwoColumns>
    <VolumeOrLineChart {...{
      title: `WOO % ${spotFut} marketshare vs [${title}]`,
      selectValue: title,
      datasets: [percentSeries],
      labels,
      select,
    }} />
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
    chart = title === 'Daily WOO Network volume'
      ? <DailyVolumeChart {...{ ...wooDailyChartData, ...props }} />
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
