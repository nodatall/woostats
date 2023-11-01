import React from 'react'
import Typography from '@mui/material/Typography'

import dayjs from 'lib/dayjs'
import { lineColors } from 'lib/chart'

import TextWithCaption from 'components/TextWithCaption'

export default function Tooltip({ tooltip, denominator = '$' }) {
  if (!tooltip.title) return null

  function addDemoninator(value, denominator) {
    return denominator === '%'
      ? `${value}${denominator}`
      : `${denominator}${value}`
  }

  const body = tooltip.body
  let text = !Array.isArray(body)
    ? addDemoninator(body, denominator)
    : body.map((value, index) =>
      <Typography variant="h6" key={value} sx={{ color: lineColors[index], marginBottom: -.5 }}>
        {addDemoninator(value, denominator)}
      </Typography>
    )
  if (Array.isArray(text)) text.reverse()

  denominator === '%'
    ? `${tooltip.body}${denominator}`
    : `${denominator}${tooltip.body}`

  const styles = theme => ({
    mr: 'auto',
    [theme.breakpoints.down('sm')]: {
      mr: '0',
      textAlign: 'right',
      width: '100%',
      pt: 2,
    }
  })

  return <TextWithCaption
    {...{
      caption: dayjs.utc(tooltip.title).format('MMM D, YYYY'),
      text,
      sx: styles,
    }}
  />
}
