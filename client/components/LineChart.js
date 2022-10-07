import React, { useCallback, useEffect } from 'react'
import { Line } from 'react-chartjs-2'
import numeral from 'numeral'

import { lineColors } from 'lib/chart'
let tooltipDebounce

export default function LineChart({
  labels, datasets, options = {}, modifyOptions, setTooltip, tooltip, parentRef, denominator = '', gradientIndex = 0
}) {
  useEffect(
    () => {
      if (parentRef.current) parentRef.current.addEventListener('mouseleave', () => {
        setTimeout(() => {
          if (tooltip) setTooltip({})
        }, 50)
      })
    },
    [parentRef.current]
  )

  const gradients = [
    ['rgb(147, 91, 211)', 'rgb(0, 156, 181)', 'rgb(178, 118, 0)'],
    ['rgb(57, 91, 211)', 'rgb(0, 156, 71)', 'rgb(178, 58, 0)'],
  ]
  const calculateBorderColor = gradient => {
    return function(context) {
      const chart = context.chart
      const {ctx, chartArea} = chart
      if (!chartArea) return
      return getGradient(ctx, chartArea, gradient)
    }
  }
  datasets = datasets.map((dataset, index) => {
    let borderColor
    if (datasets.length > 1) {
      borderColor = lineColors[index]
    } else {
      borderColor = calculateBorderColor(gradients[gradientIndex])
    }
    const backgroundColor = datasets.length === 1
      ? 'rgb(25, 29, 35)'
      : undefined
    return {
      ...dataset,
      borderColor,
      backgroundColor,
    }
  })

  const tooltipSetter = useCallback(
    context => {
      if (tooltipDebounce) return
      tooltipDebounce = true
      const { dataPoints } = context.tooltip
      if (!dataPoints) return
      const body = dataPoints.length === 1
        ? dataPoints[0].formattedValue
        : dataPoints.map(dataPoint => {
          return dataPoint.formattedValue
        })
      setTooltip({
        title: context.tooltip.title[0].replace('a.m.', ''),
        body,
      })
      setTimeout(() => {
        tooltipDebounce = false
      }, 10)
    },
    [tooltip]
  )

  const defaultDataset = {
    fill: true,
    backgroundColor: '#363c4f',
    borderColor: '#bfbfc9',
    borderWidth: 1.5,
    pointRadius: 0,
    pointHoverRadius: 3,
    pointHoverBorderWidth: 2,
    lineTension: .2,
  }

  const data = {
    labels,
    datasets: datasets.map(dataset => ({
      ...defaultDataset,
      ...dataset,
    }))
  }

  options = {
    animations: false,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    scales: {
      y: {
        gridLines: {
          color: 'grey',
          lineWidth: .5,
        },
        ticks: {
          fontColor: '#bfbfc9',
          callback: num => {
            const value = num < 1000 ? num : numeral(num).format('0a')
            return denominator === '%' ? `${value}${denominator}` : `${denominator}${value}`
          },
          lineHeight: 2,
        },
      },
      x: {
        gridLines: {
          color: 'grey',
          lineWidth: .5,
        },
        ticks: {
          fontColor: '#bfbfc9',
        },
        type: 'time',
        time: {
          unit: labels.length > 60 ? 'month' : 'day',
          displayFormats: {
            day: 'mm/dd'
          }
        },
      },
    },
    plugins: {
      tooltip: {
        enabled: false,
        external: tooltipSetter,
      },
      legend: {
        display: false,
      },
    },
    ...options,
  }
  if (modifyOptions) modifyOptions(options)

  const plugins = [
    {
      afterDraw: (chart) => {
        if (chart.tooltip._active && chart.tooltip._active.length) {
          const activePoint = chart.tooltip._active[0]
          const { ctx } = chart
          const { x } = activePoint.element
          const topY = chart.scales.y.top
          const bottomY = chart.scales.y.bottom
          ctx.save()
          ctx.beginPath()
          ctx.moveTo(x, topY)
          ctx.lineTo(x, bottomY)
          ctx.lineWidth = 1
          ctx.strokeStyle = '#57585A'
          ctx.stroke()
          ctx.restore()
        }
      },
    },
  ]

  return <Line data={data} options={options} plugins={plugins} />
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
