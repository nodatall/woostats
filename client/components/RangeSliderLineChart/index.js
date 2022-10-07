import React, { useState, useRef, useEffect } from 'react'
import isEqual from 'lodash/isEqual'

import dayjs from 'lib/dayjs'
import { useLocalStorage } from 'lib/storageHooks'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'


import LineChart from 'components/LineChart'
import ContentCard from 'components/ContentCard'
import RangeSlider from './RangeSlider'
import Tooltip from './Tooltip'

let rangeSetTimeout
let rangeSliderDebounce = null

const reduceArrayToRange = (arr, range) => arr.slice(range[0] - 1, range[1])

const RangeSliderLineChart = React.memo(function ({
  title, labels, datasets, denominator = '$', subtitle, gradientIndex,
}) {
  const isMA = title.includes('MA')
  const defaultRange = [1, labels.length]
  const [range = defaultRange, _setRange] = useLocalStorage(`${title.replace(/ /g, '')}WooVolumeRangeSlider`)
  const [
    lastRangeDate = dayjs.tz().format('YYYY-MM-DD'), setLastRangeDate
  ] = useLocalStorage(`${title.replace(/ /g, '')}WooVolumeRangeSliderLastDate`)
  const containerRef = useRef()
  const [tooltip, setTooltip] = useState({})

  const setRange = val => {
    if (rangeSliderDebounce) return
    rangeSliderDebounce = true
    _setRange(val)
    clearTimeout(rangeSetTimeout)
    rangeSetTimeout = setTimeout(() => {
      setLastRangeDate(dayjs.tz().format('YYYY-MM-DD'))
    }, 500)
    setTimeout(() => {
      rangeSliderDebounce = null
    }, 20)

  }

  useEffect(
    () => {
      const today = dayjs.tz(dayjs.tz().format('YYYY-MM-DD'))
      const daysAgo = today.diff(lastRangeDate, 'day')
      if (daysAgo > 0 && labels.length - range[1] === daysAgo) {
        setRange([range[0], range[1] + daysAgo])
        setLastRangeDate(dayjs.tz().format('YYYY-MM-DD'))
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

  return <ContentCard sx={{ p: 2, key: title }} >
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
        gradientIndex,
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

export default RangeSliderLineChart
