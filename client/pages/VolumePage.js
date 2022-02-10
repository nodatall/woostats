import React from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import Spinner from 'components/Spinner'
import { useAppState } from 'lib/appState'

export default function VolumePage() {
  const { wooVolume, aggregateVolume } = useAppState(['wooVolume', 'aggregateVolume'])

  if (!wooVolume) return <Box sx={{ display: 'flex', justifyContent: 'center', height: '100vh', mt: -30 }}>
    <Spinner />
  </Box>

  return <Box>
    <Typography variant="h3" sx={{ textAlign: 'center', pb: 2 }} >
      WOO Network Volume
    </Typography>
  </Box>
}

