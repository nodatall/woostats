import React from 'react'

import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Tooltip from 'components/Tooltip'

export default function ChartTopBar({ title, subtitle, tooltip, denominator, sx = {} }) {
  return <Stack sx={{flexDirection: 'row-reverse', flexWrap: 'wrap', mb: 2, minHeight: '50px', ...sx }}>
    <Stack>
      <Typography variant="h6" sx={{ textAlign: 'right' }}>
        {title}
      </Typography>
      {subtitle}
    </Stack>
    {tooltip && <Tooltip {...{tooltip, denominator}} />}
  </Stack>
}
