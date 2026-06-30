import React from 'react'
import numeral from 'numeral'

import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'

import { useAppState } from 'lib/appState'
import { useTheme } from '@mui/material/styles'
import ContentCard from 'components/ContentCard'

export default function AggregateNetworkVolumeBox() {
  const {
    woofiVolumeToday = 0,
    woofiPro24hrVolume = 0,
  } = useAppState(
    ['woofiVolumeToday', 'woofiPro24hrVolume']
  )
  const theme = useTheme()
  const stackBaseStyle = { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }

  const createVolumeElements = (swapVolume, proVolume) => {
    const categories = ['Pro', 'Swap']

    return categories.map(category => {
      const volume = category === 'Swap' ? swapVolume : proVolume
      return (
        <Stack sx={{ ...stackBaseStyle, mr: category === 'Pro' ? 2 : 0 }} key={category}>
          <Typography variant="h6" sx={{ textAlign: 'right', opacity: .6 }}>
            {`${category}`}
          </Typography>
          <Typography variant="h6" sx={{ ml: 2 }}>
            ${numeral(volume).format('0,0')}
          </Typography>
        </Stack>
      )
    })
  }

  const woofiVolumesElements = createVolumeElements(woofiVolumeToday, woofiPro24hrVolume)

  return <ContentCard>
    <Stack sx={{ alignItems: 'center', py: 2 }}>
      <Stack sx={{
        ...stackBaseStyle,
        mb: 2,
        [theme.breakpoints.down('sm')]: {
          flexFlow: 'column-reverse',
          '& > *:first-of-type': { mb: 1 },
          mb: 0,
        },
      }}>
        <Typography variant="h4" sx={{ color: 'primary.main', mr: 2 }}>
          ${numeral(+woofiVolumeToday + +woofiPro24hrVolume).format('0,0')}
        </Typography>
        <Typography variant="h5">
          24hr {<WoofiLogo />} volume
        </Typography>
      </Stack>
      <Stack sx={{ ...stackBaseStyle, flexWrap: 'wrap' }}>
        {woofiVolumesElements}
      </Stack>
    </Stack>
  </ContentCard>
}

function WoofiLogo() {
  return <svg id="Layer_6" viewBox="0 0 1659.46 337" height="16px" width="80px">
    <defs>
      <linearGradient id="linear-gradient" x1="1510.36" y1="-14.12" x2="1278.91" y2="316.44" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#47fcaa" />
        <stop offset=".5" stopColor="#00b5ff" />
        <stop offset=".58" stopColor="#01aefa" />
        <stop offset=".69" stopColor="#069dee" />
        <stop offset=".81" stopColor="#0d81da" />
        <stop offset=".95" stopColor="#185abe" />
        <stop offset="1" stopColor="#1d4ab3" />
      </linearGradient>
      <linearGradient id="linear-gradient-2" x1="1651.21" y1="-9.28" x2="1478.96" y2="312.39" xlinkHref="#linear-gradient" />
      <linearGradient id="linear-gradient-3" x1="1730.42" y1="33.14" x2="1558.17" y2="354.81" xlinkHref="#linear-gradient" />
    </defs>
    <path style={{ fill: '#c8c8c8'}} d="m677.57,0c-93.06,0-168.5,75.44-168.5,168.5s75.44,168.5,168.5,168.5,168.5-75.44,168.5-168.5S770.63,0,677.57,0Zm0,258.99c-49.98,0-90.49-40.51-90.49-90.49s40.51-90.49,90.49-90.49,90.49,40.51,90.49,90.49-40.51,90.49-90.49,90.49Z" />
    <path style={{ fill: '#c8c8c8'}} d="m1070.74,0c-93.06,0-168.5,75.44-168.5,168.5s75.44,168.5,168.5,168.5,168.5-75.44,168.5-168.5S1163.8,0,1070.74,0Zm0,258.99c-49.98,0-90.49-40.51-90.49-90.49s40.51-90.49,90.49-90.49,90.49,40.51,90.49,90.49-40.51,90.49-90.49,90.49Z" />
    <path style={{ fill: '#c8c8c8'}} d="m0,6.24h81.57l64.08,209.59,43.7-108.16c5.72-14.15,19.45-23.42,34.72-23.42h31.06c15.26,0,29,9.27,34.72,23.42l43.7,108.16,24.01-78.53h81.57l-51.05,166.97c-4.81,15.74-19.35,26.5-35.81,26.5h-28.61c-15.26,0-29-9.27-34.72-23.42l-49.35-122.14-49.35,122.14c-5.72,14.15-19.45,23.42-34.72,23.42h-28.61c-16.46,0-31-10.75-35.81-26.5L0,6.24Z" />
    <polygon style={{ fill: '#c8c8c8'}} points="397.62 6.24 373.77 84.25 455.35 84.25 479.2 6.24 397.62 6.24" />
    <path style={{ fill: 'url(#linear-gradient)'}} d="m1509.68,84.25V6.24h-138.86c-34.47,0-62.41,27.94-62.41,62.41v265.23h74.89v-121.69h126.38v-74.89h-126.38v-53.05h126.38Z" />
    <rect style={{ fill: 'url(#linear-gradient-2)'}} x="1584.57" y="6.24" width="74.89" height="78.01" />
    <rect style={{ fill: 'url(#linear-gradient-3)'}} x="1584.57" y="137.3" width="74.89" height="196.58" />
  </svg>
}
