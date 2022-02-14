import React from 'react'
import { Line } from 'react-chartjs-2'
import numeral from 'numeral'

require('lib/chart')

export default function LineChart({ labels, datasets, options = {}, modifyOptions }) {
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
          parser: 'MM-DD-YYYY',
          unit: labels.length > 45 ? 'month' : 'day',
          displayFormats: {
            day: 'MM/DD'
          }
        }
      },
    },
    plugins: {
      tooltip: {
        titleFontSize: 16,
        bodyFontSize: 14,
        padding: 12,
        displayColors: false,
        bodyAlign: 'center',
        backgroundColor: '#182024',
        borderColor: '#bfbfc9',
        borderWidth: .5,
        callbacks: {
          label: item => `$${item.formattedValue}`,
        },
      },
      legend: {
        display: false,
      },
    },
    ...options,
  }
  if (modifyOptions) modifyOptions(options)

  return <Line data={data} options={options} />
}
