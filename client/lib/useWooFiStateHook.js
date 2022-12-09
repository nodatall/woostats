import { useParams } from 'react-router-dom'

import { useAppState } from 'lib/appState'

export default function useWooFiState(keys) {
  const { chain } = useParams()

  const chainedKeys = chain ? keys.map(key => `${key}:${chain}`) : keys

  const state = useAppState(chainedKeys)

  const result = {}
  keys.forEach(key => {
    const value = state[`${key}:${chain}`]
    result[key] = value
    if (value === undefined || Array.isArray(value && value.length === 0)) result.loading = true
  })

  return result
}
