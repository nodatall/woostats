import React from 'react'

import isEqual from 'lodash/isEqual'
import numeral from 'numeral'

import dayjs from 'lib/dayjs'
import useDateRangeSlider from 'lib/useDateRangeSliderHook'

import { useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'

import RangeSlider from 'components/RangeSlider'

const VolumeBySourcesChart = React.memo(function ({ dailyWooFiVolumeByAssets, timePeriod, dailyWooFiSwapVolume }) {
  const theme = useTheme()
  const dateLabels = dailyWooFiSwapVolume.map(({ date }) => date)

  const { range, setRange } = useDateRangeSlider({
    length: dateLabels.length, title: 'VolumeByAssets', defaultPeriod: timePeriod,
  })

  const volumeByAssets = {}

  for (const asset of dailyWooFiVolumeByAssets) {
    const date = asset.date
    if (date < dateLabels[range[0]]) continue
    if (date > dateLabels[range[1]]) break
    const key = `${asset.symbol}${asset.chain}`
    if (!volumeByAssets[key]) volumeByAssets[key] = { ...asset, date: undefined }
    else {
      volumeByAssets[key].volume += asset.volume
      volumeByAssets[key].numberOfTrades += asset.numberOfTrades
    }
  }

  const headers = ['Asset', 'Chain', 'Total volume', '# of trades', ]
  const hiddenOnMobile = []

  const headerElements = headers.map((header, index) => {
    const props = { key: `${header}${index}` }
    if (index === headers.length - 1) props.align = 'right'
    if (hiddenOnMobile.includes(header)) props.className = 'hideOnMobile'
    return <TableCell {...props}>{header}</TableCell>
  })

  const assetElements = Object.values(volumeByAssets)
    .sort((a, b) => b.volume - a.volume)
    .map(asset => {
      return <TableRow
        hover={true}
        key={`${asset.chain}${asset.symbol}`}
        // onClick={() => {
        //   window.open(`${chainToExplorerMap[swap.chain]}/tx/${swap.txHash}`, '_blank').focus()
        // }}
      >
        <TableCell component="th" scope="row">
          <Stack direction="row" alignItems="center">
            <img src={asset.logoUrl} style={{ marginRight: '10px', width: '25px', height: '25px' }}/>
            {asset.symbol}
          </Stack>
        </TableCell>
        <TableCell>
          {asset.chain.toUpperCase()}
        </TableCell>
        <TableCell>${numeral(asset.volume).format('0,0')}</TableCell>
        <TableCell align="right">
          {numeral(asset.numberOfTrades).format('0,0')}
        </TableCell>
      </TableRow>
    })

  return <Stack sx={{ height: 'calc(100% - 30px)' }}>
    <Table
      sx={{
        minWidth: 325,
        [theme.breakpoints.down('sm')]: {
          '.hideOnMobile': { display: 'none' }
        },
      }}
      aria-label="simple table"
    >
      <TableHead>
        <TableRow>
          {headerElements}
        </TableRow>
      </TableHead>
      <TableBody>
        {assetElements}
      </TableBody>
    </Table>
    <Stack direction="row" justifyContent="center" sx={{ pt: 2, marginTop: 'auto' }}>
      <Typography variant="body1">
        {dayjs(dateLabels[range[0] - 1]).format('MM/DD/YYYY')} - {dayjs(dateLabels[range[1] - 1]).format('MM/DD/YYYY')}
      </Typography>
    </Stack>
    <Box>
      <RangeSlider {...{ range, labels: dateLabels, setRange }} />
    </Box>
  </Stack>
}, function(prevProps, nextProps) {
  if (prevProps.timePeriod !== nextProps.timePeriod) return false
  for (const prop in prevProps) {
    if (prop === 'dailyWooFiVolumeByAssets' && isEqual(prevProps[prop].data, nextProps[prop].data)) return true
    if (prop === 'dailyWooFiSwapVolume' && isEqual(prevProps[prop].data, nextProps[prop].data)) return true
    if (!isEqual(prevProps[prop], nextProps[prop])) return false
  }
  return true
})

export default VolumeBySourcesChart
