import React from 'react'
import Card from '@mui/material/Card'

const ContentCard = ({ sx = {}, children }, ref) => {
  const styles = theme => ({
    p: 2,
    mb: 4,
    ...sx,
    [theme.breakpoints.down('sm')]: {
      mb: 3,
    }
  })

  return <Card sx={styles} ref={ref}>{children}</Card>
}

export default React.forwardRef(ContentCard)
