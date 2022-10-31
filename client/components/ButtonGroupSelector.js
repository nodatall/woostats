import React, { useCallback } from 'react'

import Typography from '@mui/material/Typography'
import ButtonGroup from '@mui/material/ButtonGroup'
import Button from '@mui/material/Button'

export default function ButtonGroupSelector({
  values, valueElements, current, setCurrent, sx = {}, textVariant = 'body1',
}) {
  const buttons = values.map((val) => {
    const onClick = useCallback(() => {
      setCurrent(val)
    }, [setCurrent])

    const styles = useCallback(theme => {
      const _styles = {}
      if (current === val) _styles.color = `${theme.palette.secondary.main}`
      return _styles
    }, [current, val])

    const props = {
      onClick,
      key: val,
      sx: { textTransform: 'none' },
    }
    if (current === val) props.sx.border = '1px solid secondary.main'
    const valueElement = valueElements ? valueElements[val] : val

    return <Button {...props}>
      <Typography variant={textVariant} sx={styles} component="span">{valueElement}</Typography>
    </Button>
  })

  return <ButtonGroup sx={{ display: 'flex', justifyContent: 'right', ...sx }}>
    {buttons}
  </ButtonGroup>
}
