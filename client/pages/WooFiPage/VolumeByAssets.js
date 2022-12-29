import React, { useCallback } from 'react'
import isEqual from 'lodash/isEqual'
import numeral from 'numeral'

import { useAppState } from 'lib/appState'
import dayjs from 'lib/dayjs'
import useDateRangeSlider from 'lib/useDateRangeSliderHook'
import { useLocalStorage } from 'lib/storageHooks'
import useWooFiState from 'lib/useWooFiStateHook'

import { useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import RangeSlider from 'components/RangeSlider'
import ContentCard from 'components/ContentCard'
import ChartTopBar from 'components/ChartTopBar'
import BarChart from 'components/BarChart'
import ContentCardLoading from 'components/ContentCardLoading'

const reduceArrayToRange = (arr, range) => arr.slice(range[0] - 1, range[1])

const VolumeBySourcesChart = React.memo(function () {
  const {
    dailyWooFiVolumeByAssets,
    dailyWooFiSwapVolume,
    loading,
  } = useWooFiState(['dailyWooFiVolumeByAssets', 'dailyWooFiSwapVolume'])

  const [showingChart = true, setShowingChart] = useLocalStorage('showVolumeByAssetsChart')
  const [timePeriod = -1, _] = useLocalStorage('wooFiTimePeriod')

  const dateLabels = (dailyWooFiSwapVolume || []).map(({ date }) => date)

  const { range, setRange } = useDateRangeSlider({
    length: dateLabels.length, title: 'VolumeByAssets', defaultPeriod: timePeriod,
  })

  const onSubtitleClick = useCallback(() => {
    setShowingChart(!showingChart)
  }, [showingChart])

  if (loading) return <ContentCardLoading />

  const subtitle = <Button
    size="small"
    sx={{ textAlign: 'right', textTransform: 'none', width: 'fit-content', marginLeft: 'auto', py: 0 }}
    onClick={onSubtitleClick}
  >
    {showingChart ? 'Show sums' : 'Show daily'}
  </Button>

  return <ContentCard key="VolumeByAssets">
    <ChartTopBar {...{ title: 'Volume by assets', subtitle }} />
    <Stack sx={{ height: 'calc(100% - 55px)', justifyContent: 'center' }}>
      { showingChart
        ? <VolumeByAssetsBarChart {...{ dateLabels: reduceArrayToRange(dateLabels, range), dailyWooFiVolumeByAssets, range }} />
        : <VolumeByAssetsTable {...{ dateLabels, dailyWooFiVolumeByAssets, range }} />
      }
      <Box>
        <RangeSlider {...{ range, labels: dateLabels, setRange }} />
      </Box>
    </Stack>
  </ ContentCard>
}, function(prevProps, nextProps) {
  if (prevProps.timePeriod !== nextProps.timePeriod) return false
  for (const prop in prevProps) {
    if (prop === 'dailyWooFiVolumeByAssets' && isEqual(prevProps[prop].data, nextProps[prop].data)) return true
    if (prop === 'dailyWooFiSwapVolume' && isEqual(prevProps[prop].data, nextProps[prop].data)) return true
    if (!isEqual(prevProps[prop], nextProps[prop])) return false
  }
  return true
})

function VolumeByAssetsBarChart({ dateLabels, dailyWooFiVolumeByAssets }) {
  const { wooFiAssetTokens = {} } = useAppState(['wooFiAssetTokens'])

  const colors = ['#b30000', '#7c1158', '#4421af', '#1a53ff', '#0d88e6', '#00b7c7', '#5ad45a', '#8be04e', '#ebdc78']

  const datasets = []
  const tokenToDatasetIndexMap = {}
  wooFiAssetTokens.forEach((token, index) => {
    datasets.push({
      label: token.symbol,
      data: [],
      backgroundColor: colors[index],
    })
    tokenToDatasetIndexMap[token.symbol] = index
  })
  const allSymbols = Object.keys(tokenToDatasetIndexMap)

  let lastDate
  let tempSymbols
  for (const asset of dailyWooFiVolumeByAssets) {
    const { date, symbol, volume } = asset
    const _date = dayjs(date)
    if (_date.isBefore(dateLabels[0])) continue
    if (_date.isAfter(dateLabels[dateLabels.length - 1])) break
    datasets[tokenToDatasetIndexMap[symbol]].data.push(volume)
    if (lastDate !== date) {
      if (lastDate) {
        const missingSymbols = allSymbols.filter(_symbol => !tempSymbols.includes(_symbol))
        missingSymbols.forEach(_symbol => {
          datasets[tokenToDatasetIndexMap[_symbol]].data.push(0)
        })
      }
      lastDate = date
      tempSymbols = [symbol]
    } else {
      tempSymbols.push(symbol)
    }
  }

  return <BarChart {...{ labels: dateLabels, datasets }} />
}

function VolumeByAssetsTable({ dateLabels, dailyWooFiVolumeByAssets, range }) {
  const theme = useTheme()
  const volumeByAssets = {}

  for (const asset of dailyWooFiVolumeByAssets) {
    const date = dayjs(asset.date)
    if (date.isBefore(dateLabels[range[0]])) continue
    if (date.isAfter(dateLabels[range[1]])) break
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

  return <>
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
    <Stack direction="row" justifyContent="center" sx={{ pt: 2 }}>
      <Typography variant="body1">
        {dayjs(dateLabels[range[0] - 1]).format('MM/DD/YYYY')} - {dayjs(dateLabels[range[1] - 1]).format('MM/DD/YYYY')}
      </Typography>
    </Stack>
  </>
}

export default VolumeBySourcesChart
