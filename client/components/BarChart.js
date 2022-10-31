import React from 'react'
import { Bar } from 'react-chartjs-2'
import numeral from 'numeral'

import { useTheme } from '@mui/material/styles'

import 'lib/chart'

export default function BarChart({
  labels, datasets, options = {},
}) {
  const theme = useTheme()
  const data = {
    labels,
    datasets,
  }

  options = {
    responsive: true,
    scales: {
      x: {
        stacked: true,
        type: 'time',
        time: {
          unit: 'day',
          unit: labels.length > 60 ? 'month' : 'day',
          displayFormats: {
            day: 'MM/dd'
          }
        },
        offset: false,
      },
      y: {
        stacked: true,
        ticks: {
          fontColor: '#bfbfc9',
          callback: num => {
            return num < 1000 ? num : numeral(num).format('0a')
          },
          lineHeight: 2,
        },
      }
    },
    tooltips: {
      mode: 'index'
    },
    interaction: {
      mode: 'index'
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          color: theme.palette.text.primary,
          padding: 15,
          font: {
            family: theme.typography.fontFamily,
            size: 14,
          },
        },
      },
      tooltip: {
        callbacks: {
          title: function(tooltipItem) {
            return tooltipItem[0].label.replace(', 12:00:00 a.m.', '')
          },
          label: function(tooltipItem) {
            const value = numeral(tooltipItem.raw.toFixed(2)).format('0,0')
            return ` ${tooltipItem.dataset.label}: $${value}`
          },
          labelColor: function(tooltipItem) {
            const color = tooltipItem.dataset.backgroundColor
            return { borderColor: color, backgroundColor: color }
          },
        },
        backgroundColor: theme.palette.background.default,
        titleFont: { size: 16 },
        titleColor: theme.palette.primary.main,
        bodyColor: theme.palette.text.primary,
        bodyFont: { size: 15 },
        displayColors: true,
        usePointStyle: true,
        titleAlign: 'center',
        bodyAlign: 'left',
        padding: 15,
      },
    },
    ...options,
  }

  return  <Bar options={options} data={data} />
}
