import React from 'react'

export default function ChartCard({ title, chart, tooltip, ref }) {
  return <Card sx={{ p:2, ...sx }} ref={ref}>
    <Stack sx={{flexDirection: 'row-reverse', flexWrap: 'wrap', mb: 3, height: '50px'}}>
      <Typography variant="h6" sx={{ textAlign: 'right' }}>
        {title}
      </Typography>
      {tooltip && <Tooltip {...{tooltip, denominator}} />}
    </Stack>
    <LineChart {...{
      labels,
      datasets,
      tooltip,
      setTooltip,
      parentRef: containerRef,
      denominator,
    }}
    />
  </Card>
}
