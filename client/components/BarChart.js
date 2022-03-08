import React from 'react'
import { Bar } from 'react-chartjs-2'
import 'lib/chart'

export default function BarChart({
  labels, datasets, options = {},
}) {

  const data = {
    labels,
    datasets,
  }

  options = {
    responsive: true,
    ...options,
  }

  return  <Bar options={options} data={data} />
}
