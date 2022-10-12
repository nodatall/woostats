import React from 'react'
import numeral from 'numeral'

import { getAddressLabel } from 'lib/woofi'
import dayjs from 'lib/dayjs'

import { useTheme } from '@mui/material/styles'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'

const chainToExplorerMap = {
  'bsc': 'https://bscscan.com/',
}

export default function SwapsListTable({ swaps, minDate }) {
  const theme = useTheme()
  const headers = ['Time', 'Volume', 'Source', 'Chain', 'Pair' ]
  const hiddenOnMobile = ['Source', 'Chain']

  const swapElements = swaps.map(swap => {
    const date = minDate
      ? dayjs.tz(swap.date).format('HH:mm:ss')
      : dayjs.tz(swap.date).format('DD/MM/YY HH:mm')
    return <TableRow
      hover={true}
      key={`${swap.txHash}${swap.fromSymbol}${swap.toSymbol}${swap.usdVolume}`}
      sx={{
        cursor: 'pointer',
        textDecoration: 'none',
      }}
      onClick={() => {
        window.open(`${chainToExplorerMap[swap.chain]}/tx/${swap.txHash}`, '_blank').focus()
      }}
    >
      <TableCell component="th" scope="row">{date}</TableCell>
      <TableCell>${numeral(swap.usdVolume).format('0,0.00')}</TableCell>
      <TableCell className="hideOnMobile">{getAddressLabel(swap.source)}</TableCell>
      <TableCell className="hideOnMobile">{swap.chain.toUpperCase()}</TableCell>
      <TableCell
        align="right"
        sx={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '-1px',
          [theme.breakpoints.down('sm')]: {
            marginBottom: '0',
          },
        }}
      >
        <span>{swap.fromSymbol}</span>
        <ChevronRightIcon fontSize="medium" color="disabled" />
        <span>{swap.toSymbol}</span>
      </TableCell>
    </TableRow>
  })

  const headerElements = headers.map((header, index) => {
    const props = { key: `${header}${index}` }
    if (index === headers.length - 1) props.align = 'right'
    if (hiddenOnMobile.includes(header)) props.className = 'hideOnMobile'
    return <TableCell {...props}>{header}</TableCell>
  })

  return <Table
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
      {swapElements}
    </TableBody>
  </Table>
}
