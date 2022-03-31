import React, { useState, useRef, useCallback } from 'react'
import dayjs from 'dayjs'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import ButtonGroup from '@mui/material/ButtonGroup'
import Button from '@mui/material/Button'
import { SMA } from 'technicalindicators'
import numeral from 'numeral'

import { useAppState } from 'lib/appState'
import { useLocalStorage } from 'lib/storageHooks'

import Loading from 'components/Loading'
import LineChart from 'components/LineChart'
import TextWithCaption from 'components/TextWithCaption'

export default function VolumePage() {
  const { wooVolume, aggregateVolume } = useAppState(['wooVolume', 'aggregateVolume'])

  if (!wooVolume) return <Loading />

  const { labels: wooVolumeLabels, series: wooVolumeSeries } = wooVolume
    .slice(0, -1)
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


  const { percentSeries, aggregateVolumeSeries } = aggregateVolume
    .slice(0, -1)
    .reduce(
      (acc, { volume }, index) => {
        const wooVolume = wooVolumeSeries[index]
        const aggregatePlusWoo = +volume + wooVolume
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
    { title: 'Daily WOO Network volume', data: wooVolumeSeries },
    { title: 'Daily WOO volume [day] day MA', data: wooVolumeSeries },
    { title: 'WOO Network % of total market volume', data: percentSeries },
    { title: 'WOO Network % of total [day] day MA', data: percentSeries },
    { title: 'Total crypto market volume', data: aggregateVolumeSeries },
    { title: 'Total market volume [day] day MA', data: aggregateVolumeSeries },
  ].map(({ title, data },) => {
    const props = {
      title,
      key: title,
      labels: wooVolumeLabels,
      datasets: [
        {
          label: 'WOO % of total market volume',
          data,
          borderColor: function(context) {
            const chart = context.chart
            const {ctx, chartArea} = chart
            if (!chartArea) return
            return getGradient(ctx, chartArea, ['rgb(147, 91, 211)', 'rgb(0, 156, 181)', 'rgb(178, 118, 0)'])
          },
          backgroundColor: 'rgb(25, 29, 35)',
        },
      ],
      sx: { mb: 6 },
    }
    if (title.includes('%')) props.denominator = '%'
    if (title.includes('MA')) return <MAChart {...props} />
    return <VolumeChart {...props} />
  })

  return <Box>
    <Card sx={{ p: 4, mb: 6 }}>
      <Stack sx={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ color: 'secondary.main', mr: 2 }}>
          ${numeral(wooVolume[wooVolume.length - 1].volume).format('0,0')}
        </Typography>
        <Typography variant="h5" sx={{ textAlign: 'right' }}>
          24hr Network Volume
        </Typography>
      </Stack>
    </Card>
    {charts}
  </Box>
}

function VolumeChart({ title, labels, datasets, sx = {}, denominator = '$', subtitle }) {
  const containerRef = useRef()
  const [tooltip, setTooltip] = useState({})

  return <Card sx={{ p:2, ...sx }} ref={containerRef}>
    <Stack sx={{flexDirection: 'row-reverse', flexWrap: 'wrap', mb: 3, minHeight: '50px'}}>
      <Stack>
        <Typography variant="h6" sx={{ textAlign: 'right' }}>
          {title}
        </Typography>
        {subtitle}
      </Stack>
      {tooltip && <Tooltip {...{tooltip, denominator}} />}
    </Stack>
    <LineChart {...{
      labels,
      datasets,
      tooltip,
      setTooltip,
      parentRef: containerRef,
      denominator,
    }}
    />
  </Card>
}

function MAChart({ ...props }) {
  const [maLength = 50, setMaLength] = useLocalStorage('maLength')

  props.datasets[0].data = SMA.calculate({ period: maLength, values: props.datasets[0].data })
  props.labels = props.labels.slice(maLength - 1)
  props.title = props.title.replace('[day]', maLength)

  const buttons = [25, 50, 100].map(num => {
    const onClick = useCallback(() => {
      setMaLength(num)
    }, [setMaLength])

    const styles = useCallback(theme => {
      const _styles = {}
      if (maLength === num) _styles.color = `${theme.palette.secondary.main}`
      return _styles
    }, [maLength, num])

    const props = {
      onClick,
      key: num,
      sx: styles,
    }
    if (maLength === num) props.sx.border = '1px solid secondary.main'



    return <Button {...props}>{num}</Button>
  })

  props.subtitle = <ButtonGroup sx={{ display: 'flex', justifyContent: 'right', mt: 2 }}>
    {buttons}
  </ButtonGroup>


  return <VolumeChart {...props} />
}

function Tooltip({ tooltip, denominator = '$' }) {
  if (!tooltip.title) return null
  const text = denominator === '%'
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

let width, height, gradient
function getGradient(ctx, chartArea, colors) {
  const chartWidth = chartArea.right - chartArea.left
  const chartHeight = chartArea.bottom - chartArea.top
  if (!gradient || width !== chartWidth || height !== chartHeight) {
    width = chartWidth
    height = chartHeight
    gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top)
    gradient.addColorStop(0, colors[0])
    gradient.addColorStop(0.5, colors[1])
    gradient.addColorStop(1, colors[2])
  }

  return gradient
}
