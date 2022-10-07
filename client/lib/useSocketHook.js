import { useEffect } from 'react'
import ioClient from 'socket.io-client'

import onReturnToStaleApp from 'lib/onReturnToStaleApp'
import { useAppState } from 'lib/appState'

const socket = ioClient(process.env.ORIGIN || window.origin)

export default function useSocket() {
  const { setState } = useAppState()
  useEffect(() => {
    const pageName = document.location.href.split('/')[3]
    socket.emit('get', { pageName })
    socket.on('send', function(incomingState) {
      const newState = { ...incomingState }
      Object.keys(newState).forEach(key => {
        if (newState[key] === undefined) delete newState[key]
      })
      setState(newState)
    })
    onReturnToStaleApp(
      () => { socket.emit('get', { pageName }) },
      10
    )
  }, [])
}
