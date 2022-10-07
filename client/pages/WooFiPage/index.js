import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { useLocalStorage } from 'lib/storageHooks'
import chainLogos from 'lib/chainLogos'

import { useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'

import ComingSoon from 'components/ComingSoon'
import ContentCard from 'components/ContentCard'
import ButtonGroupSelector from 'components/ButtonGroupSelector'
import SwapStats from './SwapStats'

export default function WooFiPage(){
  const [section = 'Swap', setSection] = useLocalStorage('wooFiStatsSection')

  return <Box>
    <ContentCard sx={{ mt: 0, pt: 0, pb: 2 }}>
      <Stack direction="row" justifyContent="center" sx={{ flexWrap: 'wrap' }}>
        <ChainChooser/>
        <SectionChooser {...{ section, setSection }} />
      </Stack>
    </ContentCard>
    {section === 'Swap' ? <SwapStats /> : <ComingSoon />}
  </Box>
}

function SectionChooser({ section, setSection }) {
  const sectionValues = ['Swap', 'Stake & earn']
  const sectionElementValues = {}
  sectionValues.forEach(value => {
    sectionElementValues[value] = <SectionButton text={value} key={value}/>
  })

  return <ButtonGroupSelector {...{
    values: sectionValues,
    valueElements: sectionElementValues,
    current: section,
    setCurrent: setSection,
    sx: {
      justifyContent: 'center',
      mt: 0,
      pt: 2,
    },
    textVariant: 'h6',
  }}/>
}

function SectionButton({ text }) {
  const imageSrc = text === 'Swap'
    ? 'https://fi.woo.org/_nuxt/img/ace0b11.png'
    : 'https://fi.woo.org/_nuxt/img/908fd1e.png'

  return <Stack direction="row" sx={{ display: 'flex', alignItems: 'center' }}>
    <img src={imageSrc} style={{ marginRight: '7px', width: '17px', height: '17px' }} />
    {text}
  </Stack>
}

function ChainChooser() {
  const theme = useTheme()
  const navigate = useNavigate()
  const { chain = 'all' } = useParams()

  const setChain = function(chain) {
    const path = chain === 'all' ? '/woofi' : `/woofi/${chain}`
    navigate(path)
  }

  const chainValues = ['all', 'avalanche', 'bsc', 'fantom', 'polygon']
  const buttonGroupValueElements = {}
  chainValues.forEach(value => {
    buttonGroupValueElements[value] = <ChainButton text={value} key={value}/>
  })
  const selectMenuItems = chainValues.map(chain =>
    <MenuItem value={chain} key={chain}>{formatChainText(chain)}</MenuItem>
  )

  return <>
    <FormControl
      fullWidth
      sx={{
        mt: 2,
        [theme.breakpoints.up('sm')]: {
          display: 'none'
        }
      }}
    >
      <InputLabel id="chain-select">Chain</InputLabel>
      <Select
        labelId="chain-select"
        value={chain}
        label="Chain"
        onChange={event => setChain(event.target.value)}
        sx={{ '.MuiSelect-select': { py: 1.25 } }}
      >
        {selectMenuItems}
      </Select>
    </ FormControl>
    <ButtonGroupSelector {...{
      values: chainValues,
      valueElements: buttonGroupValueElements,
      current: chain,
      setCurrent: setChain,
      sx: {
        justifyContent: 'center',
        mt: 0,
        mx: 3,
        pt: 2,
        [theme.breakpoints.down('sm')]: {
          display: 'none'
        }
      },
      textVariant: 'h6',
    }}/>
  </>
}

function ChainButton({ text }) {
  let image = null
  let formattedText = formatChainText(text)
  if (formattedText !== 'All') {
    if (text === 'avalanche') text = 'avax'
    image = <img src={chainLogos[text]} style={{ marginRight: '7px', width: '17px', height: '17px' }} />
  }
  return <Stack
    direction="row"
    sx={{
      display: 'flex',
      alignItems: 'center',
    }}
  >
    {image}
    <span>{formattedText}</span>
  </Stack>
}

function formatChainText(text) {
  let formattedText = text[0].toUpperCase() + text.slice(1)
  if (formattedText === 'Bsc') formattedText = 'BSC'
  return formattedText
}
