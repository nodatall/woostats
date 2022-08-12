import React, { useCallback } from 'react'
import ButtonGroup from '@mui/material/ButtonGroup'
import Button from '@mui/material/Button'

export default function ButtonGroupWithSubtitle({ values, valueElements, current, setCurrent }) {
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
      sx: styles,
    }
    if (current === val) props.sx.border = '1px solid secondary.main'
    const valueElement = valueElements ? valueElements[val] : val

    return <Button {...props}>{valueElement}</Button>
  })

  return <ButtonGroup sx={{ display: 'flex', justifyContent: 'right', mt: 2 }}>
    {buttons}
  </ButtonGroup>
}
