import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Line } from 'react-chartjs-2'
import numeral from 'numeral'

require('lib/chart')

export default function LineChart({
  labels, datasets, options = {}, modifyOptions, parentRef, setTooltip, tooltip,
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

  const tooltipSetter = useCallback(
    context => {
      if (context.tooltip.title[0] === tooltip.title) return
      setTooltip({
        title: context.tooltip.title[0],
        body: context.tooltip.dataPoints[0].formattedValue,
      })
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
          callback: num =>  numeral(num).format('0a'),
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
          parser: 'YYYY-MM-DD',
          unit: labels.length > 45 ? 'month' : 'day',
          displayFormats: {
            day: 'MM/DD'
          }
        }
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
