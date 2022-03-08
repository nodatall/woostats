import React from 'react'

import BarChart from 'components/BarChart'
import Loading from 'components/Loading'

import { useAppState } from 'lib/appState'

export default function TokenPage(){

  const { wooTokenBurns } = useAppState(['wooTokenBurns'])
  if (!wooTokenBurns) return <Loading />

  const { wooBurnLabels, wooBurnSeries } = wooTokenBurns.reduce(
    (acc, { month, burned, tx_hash }) => {
      acc.wooBurnLabels.push(month)
      acc.wooBurnSeries.push(+burned)
      return acc
    },
    {
      wooBurnLabels: [],
      wooBurnSeries: [],
    }
  )

  return <BarChart {...{
    labels: wooBurnLabels,
    datasets: [
      {
        label: 'Monthly WOO Token Burn',
        data: wooBurnSeries,
      }
    ]
  }} />
}
