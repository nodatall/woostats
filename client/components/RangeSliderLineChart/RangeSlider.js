import React from 'react'
import { useTheme } from '@mui/material/styles'
import Slider from '@mui/material/Slider'

export default function RangeSlider({ range, labels, setRange }) {
  const theme = useTheme()
  function valueLabelFormat(index) {
    return labels[index - 1]
  }

  return <Slider
    name="slider"
    value={range}
    min={1}
    size="small"
    valueLabelFormat={valueLabelFormat}
    valueLabelDisplay="auto"
    max={labels.length}
    onChange={(_, val) => {
      setRange(val)
    }}
    step={range[1] - range[0] < 50 ? 1 : 2}
    sx={{
      maxWidth: 'calc(100% - 45px)',
      display: 'flex',
      margin: 'auto',
      color: '#73bef445',
      '& .MuiSlider-valueLabel': {
        borderRadius: '4px',
        background: theme.palette.primary.main,
        color: theme.palette.background.default,
      },
      '& .MuiSlider-thumb': {
        background: '#456e8c',
      },
    }}
  />
}
