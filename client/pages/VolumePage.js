import React, { useState, useRef, useCallback, useEffect } from 'react'
import dayjs from 'lib/dayjs'
import isEqual from 'lodash/isEqual'
import { SMA } from 'technicalindicators'
import numeral from 'numeral'

import { useAppState } from 'lib/appState'
import { useLocalStorage } from 'lib/storageHooks'
import { useTheme } from '@mui/material/styles'
import { lineColors } from 'lib/chart'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import ButtonGroup from '@mui/material/ButtonGroup'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Slider from '@mui/material/Slider'

import Loading from 'components/Loading'
import LineChart from 'components/LineChart'
import TextWithCaption from 'components/TextWithCaption'
import ContentCard from 'components/ContentCard'

export default function VolumePage() {
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

  const charts = [
    { title: 'Daily WOO Network volume' },
    { title: 'Daily Network volume [day] day MA', datasets: [wooVolumeSeries] },
    { title: 'WOO Network % of total market volume', datasets: [percentSeries] },
    { title: 'WOO Network % of total [day] day MA', datasets: [percentSeries] },
    { title: 'Total crypto market volume', datasets: [aggregateVolumeSeries] },
    { title: 'Total market volume [day] day MA', datasets: [aggregateVolumeSeries] },
  ].map(({ title, datasets },) => {
    if (datasets) datasets = datasets.map(dataset => ({ data: dataset }))
    const props = {
      title,
      key: title,
      labels: wooVolumeLabels,
      datasets,
    }

    if (title.includes('%')) props.denominator = '%'
    if (title.includes('MA')) return <MAChart {...props} />
    if (title === 'Daily WOO Network volume')
      return <DailyVolumeChart {...{ wooVolumeSeries, wooSpotVolumeSeries, wooFuturesVolumeSeries, ...props }} />
    return <VolumeChart {...props} />
  })

  return <Box>
    <AggregateNetworkVolumeBox />
    {charts}
  </Box>
}

function AggregateNetworkVolumeBox() {
  const {
    wooSpotVolumeToday,
    wooFuturesVolumeToday,
  } = useAppState(
    ['wooSpotVolumeToday', 'wooFuturesVolumeToday']
  )
  const stackBaseStyle = { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }
  const spotAndFuturesElements = ['Spot', 'Futures'].map(category => {
    const topStackStyle = theme => ({
      ...stackBaseStyle,
      mr: category === 'Spot' ? 2 : 0,
      [theme.breakpoints.down('xs')]: {
        mr: 0,
      }
    })
    return <Stack sx={topStackStyle} key={category}>
      <Typography variant="h6" sx={{ textAlign: 'right' }}>
        {category}
      </Typography>
      <Typography variant="h6" sx={{ color: 'primary.main', ml: 2 }}>
        ${numeral(category === 'Spot' ? wooSpotVolumeToday : wooFuturesVolumeToday).format('0,0')}
      </Typography>
    </Stack>
  })

  const spotAndFuturesStackStyle = theme => ({
    ...stackBaseStyle,
    flexWrap: 'wrap',
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column',
    }
  })
  const aggregateVolumeStyle = theme => ({
    color: 'secondary.main',
    mr: 2,
    [theme.breakpoints.down('xs')]: {
      mr: 0,
      mt: 1,
    }
  })
  const aggregateVolumeStackStyle = theme => ({
    ...stackBaseStyle,
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column-reverse',
    }
  })

  return <ContentCard>
    <Stack sx={{ alignItems: 'center' }}>
      <Stack sx={aggregateVolumeStackStyle}>
        <Typography variant="h4" sx={aggregateVolumeStyle}>
          ${numeral(+wooSpotVolumeToday + +wooFuturesVolumeToday).format('0,0')}
        </Typography>
        <Typography variant="h5" sx={{ textAlign: 'right' }}>
          24hr Network Volume
        </Typography>
      </Stack>
      <Divider textAlign="center" sx={{ width: '260px', my: 3 }} />
      <Stack sx={spotAndFuturesStackStyle}>
        {spotAndFuturesElements}
      </Stack>
    </Stack>
  </ContentCard>
}
const reduceArrayToRange = (arr, range) => arr.slice(range[0] - 1, range[1])
let rangeSetTimeout

const VolumeChart = React.memo(function ({
  title, labels, datasets, denominator = '$', subtitle,
}) {
  const isMA = title.includes('MA')
  const defaultRange = [1, labels.length]
  const [range = defaultRange, _setRange] = useLocalStorage(`${title.replace(/ /g, '')}WooVolumeRangeSlider`)
  const [lastRangeDate = dayjs(), setLastRangeDate] = useLocalStorage(`${title.replace(/ /g, '')}WooVolumeRangeSliderLastDate`)
  const containerRef = useRef()
  const [tooltip, setTooltip] = useState({})

  const setRange = val => {
    _setRange(val)
    clearTimeout(rangeSetTimeout)
    rangeSetTimeout = setTimeout(() => {
      setLastRangeDate(dayjs())
    }, 500)
  }

  useEffect(
    () => {
      const today = dayjs()
      const daysAgo = today.diff(lastRangeDate, 'day')
      if (daysAgo > 0 && labels.length - range[1] === daysAgo) {
        setRange([range[0], range[1] + daysAgo])
        setLastRangeDate(dayjs())
      }
    },
    []
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

function RangeSlider({ range, labels, setRange }) {
  const theme = useTheme()
  function valueLabelFormat(index) {
    return labels[index - 1]
  }

  return <Slider
    name="slider"
    value={range}
    min={1}
    size="small"
    valueLabelFormat={valueLabelFormat}
    valueLabelDisplay="auto"
    max={labels.length}
    onChange={(_, val) => {
      setRange(val)
    }}
    step={range[1] - range[0] < 50 ? 1 : 2}
    sx={{
      maxWidth: 'calc(100% - 45px)',
      display: 'flex',
      margin: 'auto',
      color: '#73bef445',
      '& .MuiSlider-valueLabel': {
        borderRadius: '4px',
        background: theme.palette.primary.main,
        color: theme.palette.background.default,
      },
      '& .MuiSlider-thumb': {
        background: '#456e8c',
      },
    }}
  />
}

function MAChart({ ...props }) {
  const [maLength = 50, setMaLength] = useLocalStorage('maLength')

  props.datasets[0].data = SMA.calculate({ period: maLength, values: props.datasets[0].data })
  props.labels = props.labels.slice(maLength - 1)
  props.title = props.title.replace('[day]', maLength)

  props.subtitle = <ButtonGroupSubtitle {...{
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
  props.subtitle = <ButtonGroupSubtitle {...{
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

function ButtonGroupSubtitle({ values, valueElements, current, setCurrent }) {
  const buttons = values.map((val) => {
    const onClick = useCallback(() => {
      setCurrent(val)
    }, [setCurrent])

    const styles = useCallback(theme => {
      const _styles = {}
      if (current === val) _styles.color = `${theme.palette.secondary.main}`
      return _styles
    }, [current, val])

    const props = {
      onClick,
      key: val,
      sx: styles,
    }
    if (current === val) props.sx.border = '1px solid secondary.main'
    const valueElement = valueElements ? valueElements[val] : val

    return <Button {...props}>{valueElement}</Button>
  })

  return <ButtonGroup sx={{ display: 'flex', justifyContent: 'right', mt: 2 }}>
    {buttons}
  </ButtonGroup>
}

function Tooltip({ tooltip, denominator = '$' }) {
  if (!tooltip.title) return null

  function addDemoninator(value, denominator) {
    return denominator === '%'
      ? `${value}${denominator}`
      : `${denominator}${value}`
  }

  const body = tooltip.body
  let text = !Array.isArray(body)
    ? addDemoninator(body, denominator)
    : body.map((value, index) =>
      <Typography variant="h6" key={value} sx={{ color: lineColors[index] }}>
        {addDemoninator(value, denominator)}
      </Typography>
    )
  if (Array.isArray(text)) text.reverse()

  denominator === '%'
    ? `${tooltip.body}${denominator}`
    : `${denominator}${tooltip.body}`

  const styles = theme => ({
    mr: 'auto',
    [theme.breakpoints.down('sm')]: {
      mr: '0',
      textAlign: 'right',
      width: '100%',
      pt: 2,
    }
  })

  return <TextWithCaption
    {...{
      caption: dayjs(tooltip.title).format('MMM D, YYYY'),
      text,
      sx: styles,
    }}
  />
}
