import { useEffect } from 'react'
import ioClient from 'socket.io-client'

import onReturnToStaleApp from 'lib/onReturnToStaleApp'
import { useAppState } from 'lib/appState'

const socket = ioClient(process.env.ORIGIN || window.origin)

export default function useSocket() {
  const { setState } = useAppState()
  useEffect(() => {
    socket.emit('get', {})
    socket.on('send', function({ wooVolume, aggregateVolume, wooPrice }) {
      const newState = { wooVolume, aggregateVolume }
      if (wooPrice) newState.wooPrice = wooPrice
      setState(newState)
    })
    onReturnToStaleApp(
      () => { socket.emit('get', {}) },
      10
    )
  }, [])
}
