import React from 'react'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'

export default function TwoColunms({ children }) {
  const theme = useTheme()
  let temp = []
  const inTwoColumns = []

  children.forEach(child => {
    temp.push(child)
    if (temp.length === 2) {
      inTwoColumns.push(
        <Stack {...{
          sx: {
            flexDirection: 'row',
            [theme.breakpoints.down('lg')]: {
              flexDirection: 'column',
            },
            '> *': {
              flexBasis: '50%',
              '&:first-of-type': {
                mr: 4,
                [theme.breakpoints.down('lg')]: {
                  mr: 0
                },
              },
            },
          },
          key: child.key,
        }}>
          {temp}
        </Stack>
      )
      temp = []
    }
  })

  return inTwoColumns
}
