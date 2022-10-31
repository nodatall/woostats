import React, { useState, useRef } from 'react'
import isEqual from 'lodash/isEqual'

import useDateRangeSlider from 'lib/useDateRangeSliderHook'

import Box from '@mui/material/Box'

import LineChart from 'components/LineChart'
import ContentCard from 'components/ContentCard'
import RangeSlider from 'components/RangeSlider'
import ChartTopBar from 'components/ChartTopBar'

const reduceArrayToRange = (arr, range) => arr.slice(range[0] - 1, range[1])

const RangeSliderLineChart = React.memo(function ({
  title, labels, datasets, denominator = '$', subtitle, gradientIndex, timePeriod,
}) {
  const isMA = title.includes('MA')
  const { range, setRange } = useDateRangeSlider({
    length: labels.length, title, defaultPeriod: timePeriod,
  })
  const containerRef = useRef()
  const [tooltip, setTooltip] = useState({})

  datasets = datasets.map(dataset => {
    return {
      ...dataset,
      data: isMA ? dataset.data : reduceArrayToRange(dataset.data, range),
    }
  })

  return <ContentCard sx={{ key: title }} >
    <ChartTopBar {...{ title, subtitle, tooltip, denominator }} />
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
  if (prevProps.timePeriod !== nextProps.timePeriod) return false
  for (const prop in prevProps) {
    if (prop === 'datasets' && isEqual(prevProps[prop].data, nextProps[prop].data)) return true
    if (!isEqual(prevProps[prop], nextProps[prop])) return false
  }
  return true
})

export default RangeSliderLineChart
