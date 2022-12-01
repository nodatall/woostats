import React from 'react'

import { useTheme } from '@mui/material/styles'
import Spinner from 'components/Spinner'
import ContentCard from 'components/ContentCard'
import Box from '@mui/material/Box'

export default function ContentCardLoading() {
  const theme = useTheme()

  return <ContentCard>
    <Box sx={{ display: 'flex', justifyContent: 'center', minHeight: '400px', height: '100%' }}>
      <Spinner styles={{ height: 'auto' }} coreStyles={{ backgroundColor: theme.palette.background.paper }} />
    </Box>
  </ ContentCard>
}
