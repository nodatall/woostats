import React from 'react'

import Spinner from 'components/Spinner'
import Box from '@mui/material/Box'

export default function Loading() {
  return <Box sx={{ display: 'flex', justifyContent: 'center', height: '100vh', mt: -30 }}>
    <Spinner />
  </Box>
}
