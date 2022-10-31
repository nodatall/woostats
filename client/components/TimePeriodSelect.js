import React from 'react'

import { useLocalStorage } from 'lib/storageHooks'

import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'

export default function TimePeriodSelect({ sx = {} }) {
  const [timePeriod = -1, setTimePeriod] = useLocalStorage('wooFiTimePeriod')

  const periodToDays = {
    'All time': -1,
    '1 week': 7,
    '1 month': 30,
    '3 months': 90,
    '6 months': 180,
    '1 year': 365,
  }
  const selectMenuItems = Object.keys(periodToDays).map(period =>
    <MenuItem value={periodToDays[period]} key={period}>{period}</MenuItem>
  )

  return <FormControl
    fullWidth
    sx={{
      width: 'auto',
      mr: 2,
      mt: 0,
      ...sx,
    }}
  >
    <Select
      value={timePeriod}
      onChange={event => setTimePeriod(event.target.value)}
      sx={{
        '.MuiSelect-select': { py: 1.25 },
        '&:hover fieldset.MuiOutlinedInput-notchedOutline': {
          borderColor: 'rgb(213, 213, 213, 0.5)',
          borderWidth: '1px',
        },
        '&.Mui-focused fieldset.MuiOutlinedInput-notchedOutline': {
          borderColor: 'rgb(213, 213, 213, 0.5)',
          borderWidth: '1px',
        }
      }}
    >
      {selectMenuItems}
    </Select>
  </ FormControl>

}
