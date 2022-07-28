import React from 'react'

import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

export default function TextWithCaption({ caption, text, sx = {} }) {
  const textElement = Array.isArray(text)
    ? text
    : <Typography variant="h5" sx={{color: 'primary.main'}}>{text}</Typography>
  return <Stack sx={sx}>
    {textElement}
    <Typography variant="caption2" sx={{mr: 1, opacity: .6, fontWeight: 200}}>{caption}</Typography>
  </Stack>
}
