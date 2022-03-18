import { useEffect, useCallback } from 'react'
import { useAppState } from 'lib/appState'

function useStorage(storage, key){
  const { [key]: appStateValue, setState } = useAppState([key])

  const value = key in storage ? safeJSONParse(storage, key) : undefined

  useEffect(() => {
    if (value !== appStateValue) setState({ [key]: value })
  })

  const setValue = useCallback(
    value => {
      if (typeof value === 'undefined') {
        if (typeof storage[key] === 'undefined') return
        delete storage[key]
      }else{
        value = JSON.stringify(value)
        if (storage[key] === value) return
        storage[key] = value
      }

      setState({ [key]: value })
    },
    [storage, key]
  )

  return [value, setValue]
}

export function useLocalStorage(...args){
  return useStorage(global.localStorage, ...args)
}

export function useSessionStorage(...args){
  return useStorage(global.sessionStorage, ...args)
}

function safeJSONParse(storage, key){
  try{
    return JSON.parse(storage[key])
  }catch(error){
    console.warn('useStorage hook failed to parse storage key as json', {key, value: storage[key]})
    return undefined
  }
}
