import React from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import ConstructionIcon from '@mui/icons-material/Construction'

export default function ComingSoon(){
  return <Box>
    <Card sx={{px:2, py: 10}}>
      <Stack sx={{ alignItems: 'center' }}>
        <Typography variant="h5">Coming soon</Typography>
        <ConstructionIcon fontSize="large" color="secondary" sx={{ mt: 2 }}/>
      </Stack>
    </Card>
  </Box>
}
