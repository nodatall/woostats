import React from 'react'

import ExampleComponent from 'components/ExampleComponent'
import useSocket from 'lib/useSocketHook'

export default function App() {

  useSocket()

  return <ExampleComponent />
}
