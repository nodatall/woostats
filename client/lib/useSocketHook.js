import { useEffect } from 'preact/hooks'
import ioClient from 'socket.io-client'

import onReturnToStaleApp from 'lib/onReturnToStaleApp'

const socket = ioClient(process.env.ORIGIN || window.origin)

export default function useSocket() {
  useEffect(() => {
    socket.emit('get', {})
    socket.on('send', function(data) {
      console.log(`data ==>`, data)
    })

    onReturnToStaleApp(
      () => { socket.emit('get', {}) },
      10
    )
  }, [])
}
