import create from 'zustand'
import shallow from 'zustand/shallow'

global.DEBUG = global.DEBUG || {}
const initialState = {}
global.DEBUG.state = initialState

const useStore = create(set => ({
  ...initialState,
  setState: newValues => {
    set(prevState => {
      const newState = { ...prevState, ...newValues }
      global.DEBUG.state = newState
      return newState
    })
  }
}))

const { getState: getAppState, setState: setAppState, subscribe: subscribeToAppState } = useStore
export { getAppState, setAppState, subscribeToAppState }

const useAppState = keys => {
  const setState = useStore(state => state.setState)

  if (!keys) {
    const state = useStore()
    return { state, setState }
  }

  if (typeof keys === 'string') keys = [keys]

  function keysToState(state) {
    const map = {}
    for (const key of keys) {
      map[key] = state[key]
    }
    return map
  }

  const { ...values } = useStore(keysToState, shallow)

  return { setState, ...values }
}

export { useAppState }
