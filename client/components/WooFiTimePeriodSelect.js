import React from 'react'

import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'

export default function WooFiTimePeriodSelect({ timePeriod, setTimePeriod, sx = {} }) {
  const periodToDays = {
    'All time': -1,
    '1 week': 7,
    '1 month': 30,
    '3 months': 90,
    '6 months': 180,
  }
  const selectMenuItems = Object.keys(periodToDays).map(period =>
    <MenuItem value={periodToDays[period]} key={period}>{period}</MenuItem>
  )

  return <FormControl
    fullWidth
    sx={{
      width: 'auto',
      mx: 1.5,
      mt: 0,
      ...sx,
    }}
  >
    <Select
      value={timePeriod}
      onChange={event => setTimePeriod(event.target.value)}
      sx={{ '.MuiSelect-select': { py: 1.25 } }}
    >
      {selectMenuItems}
    </Select>
  </ FormControl>
}
