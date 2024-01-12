import React from 'react'
import numeral from 'numeral'

import { useTheme } from '@mui/material/styles'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'

import { useAppState } from 'lib/appState'
import ContentCard from 'components/ContentCard'
import woofiProLogo from '../../assets/woofipro-branding.png'

export default function AggregateNetworkVolumeBox() {
  const {
    wooSpotVolumeToday,
    wooFuturesVolumeToday,
    woofiVolumeToday,
    woofiPro24hrVolume = 0,
  } = useAppState(
    ['wooSpotVolumeToday', 'wooFuturesVolumeToday', 'woofiVolumeToday', 'woofiPro24hrVolume']
  )
  const theme = useTheme()
  const stackBaseStyle = { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }
  const spotAndFuturesElements = ['Futures', 'Spot'].map(category => {
    const topStackStyle = theme => ({
      ...stackBaseStyle,
      mr: category === 'Futures' ? 2 : 0,
      [theme.breakpoints.down('xs')]: {
        mr: 0,
      }
    })
    return <Stack sx={topStackStyle} key={category}>
      <Typography variant="h6" sx={{ textAlign: 'right', opacity: .6 }}>
        {category}
      </Typography>
      <Typography variant="h6" sx={{ ml: 2 }}>
        ${numeral(category === 'Spot' ? wooSpotVolumeToday : wooFuturesVolumeToday).format('0,0')}
      </Typography>
    </Stack>
  })

  return <ContentCard>
    <Stack sx={{ alignItems: 'center', py: 2 }}>
      <Stack sx={{
        ...stackBaseStyle,
        [theme.breakpoints.down('xs')]: {
          flexDirection: 'column-reverse',
        },
        mb: 2,
      }}>
        <Typography variant="h4" sx={{
          color: 'secondary.main',
          mr: 2,
          [theme.breakpoints.down('xs')]: {
            mr: 0,
            mt: 1,
          }
        }}>
          ${numeral(+wooSpotVolumeToday + +wooFuturesVolumeToday).format('0,0')}
        </Typography>
        <Typography variant="h5" sx={{ textAlign: 'right' }}>
          24hr {<WooxLogo />} volume
        </Typography>
      </Stack>
      <Stack sx={{
        ...stackBaseStyle,
        flexWrap: 'wrap',
        [theme.breakpoints.down('xs')]: {
          flexDirection: 'column',
        }
      }}>
        {spotAndFuturesElements}
      </Stack>
      <Divider textAlign="center" sx={{ width: '260px', my: 2 }} />
      <Stack sx={{
        ...stackBaseStyle,
        [theme.breakpoints.down('xs')]: {
          flexDirection: 'column-reverse',
        }
      }}>
        <Typography variant="h4" sx={{
          color:  'primary.main',
          mr: 1,
          [theme.breakpoints.down('xs')]: {
            mr: 0,
            mt: 1,
          }
        }}>
          ${numeral(+woofiVolumeToday).format('0,0')}
        </Typography>
        <Typography variant="h5" sx={{ textAlign: 'right' }}>
          {<WoofiLogo/>}
        </Typography>
      </Stack>
      <Divider textAlign="center" sx={{ width: '260px', my: 2 }} />
      <Stack sx={{
        ...stackBaseStyle,
        [theme.breakpoints.down('xs')]: {
          flexDirection: 'column-reverse',
        }
      }}>
        <Typography variant="h4" sx={{
          color: 'purple.main',
          mr: 2,
          [theme.breakpoints.down('xs')]: {
            mr: 0,
            mt: 1,
          }
        }}>
          ${numeral(+woofiPro24hrVolume).format('0,0')}
        </Typography>
        <Typography variant="h5" sx={{ textAlign: 'right' }}>
          {<WoofiLogo/>}{<img src={woofiProLogo} style={{ marginLeft: '5px', width: '25px' }} />}
        </Typography>
      </Stack>
    </Stack>
  </ContentCard>
}

function WooxLogo() {
  return <svg height="15px" width="71px" focusable="false" viewBox="0 0 114 24">
    <path fill="#c8c8c8" d="M47.9849 0C45.6482 0 43.3639 0.692837 41.4209 1.99108C39.4779 3.28933 37.9636 5.13463 37.0693 7.29353C36.1751 9.45243 35.9411 11.828 36.397 14.1199C36.8529 16.4118 37.9781 18.5172 39.6305 20.1695C41.2829 21.8219 43.3881 22.9471 45.68 23.403C47.9718 23.8589 50.3474 23.6249 52.5063 22.7306C54.6652 21.8364 56.5105 20.322 57.8087 18.379C59.107 16.436 59.7999 14.1518 59.7999 11.815C59.7999 8.68149 58.5551 5.67624 56.3394 3.4605C54.1236 1.24477 51.1185 0 47.9849 0ZM47.9849 18.176C46.7269 18.176 45.497 17.803 44.451 17.1041C43.4049 16.4051 42.5896 15.4115 42.1082 14.2492C41.6268 13.0869 41.5008 11.8081 41.7462 10.5742C41.9917 9.34026 42.5975 8.20686 43.4871 7.31727C44.3767 6.42768 45.5101 5.82181 46.744 5.57637C47.9779 5.33093 49.2569 5.4568 50.4192 5.93824C51.5815 6.41969 52.5749 7.23511 53.2739 8.28116C53.9728 9.32721 54.3459 10.5569 54.3459 11.815C54.3459 13.502 53.6757 15.1198 52.4828 16.3127C51.2899 17.5057 49.672 18.176 47.9849 18.176Z"></path>
    <path fill="#c8c8c8" d="M74.6149 0C72.2782 0 69.9939 0.692837 68.0509 1.99108C66.1079 3.28933 64.5936 5.13463 63.6994 7.29353C62.8051 9.45243 62.5711 11.828 63.027 14.1199C63.4829 16.4118 64.6082 18.5172 66.2605 20.1695C67.9129 21.8219 70.0181 22.9471 72.31 23.403C74.6018 23.8589 76.9774 23.6249 79.1363 22.7306C81.2952 21.8364 83.1405 20.322 84.4387 18.379C85.737 16.436 86.4299 14.1518 86.4299 11.815C86.4299 8.68149 85.1851 5.67624 82.9694 3.4605C80.7537 1.24477 77.7485 0 74.6149 0ZM74.6149 18.176C73.3569 18.176 72.1271 17.803 71.081 17.1041C70.0349 16.4051 69.2196 15.4115 68.7382 14.2492C68.2568 13.0869 68.1308 11.8081 68.3762 10.5742C68.6217 9.34026 69.2275 8.20686 70.1171 7.31727C71.0067 6.42768 72.1401 5.82181 73.374 5.57637C74.6079 5.33093 75.8869 5.4568 77.0492 5.93824C78.2115 6.41969 79.2049 7.23511 79.9039 8.28116C80.6028 9.32721 80.9759 10.5569 80.9759 11.815C80.9759 13.502 80.3057 15.1198 79.1128 16.3127C77.9199 17.5057 76.302 18.176 74.6149 18.176Z"></path>
    <path fill="#c8c8c8" d="M35.1899 0.195374H29.435L26.781 8.85571H32.4521L35.1899 0.195374Z"></path>
    <path fill="#c8c8c8" d="M22.0318 8.43666L24.8813 15.1135L25.915 11.7052H31.5582L28.3734 22.0697C28.122 22.8799 27.3677 23.4386 26.5016 23.4386H23.2889C22.5067 23.4386 21.7804 22.9637 21.4731 22.2094L17.9531 13.6049L14.461 22.1815C14.1816 22.9078 13.4553 23.4107 12.6451 23.4107H9.40445C8.53842 23.4107 7.78413 22.8519 7.5327 22.0418L0.799988 0.195374H6.47111L10.941 15.1135L13.9023 8.38079C14.5448 6.70459 16.1651 5.61507 17.9531 5.61507C19.7689 5.61507 21.3893 6.73253 22.0318 8.43666Z"></path>
    <path d="M98.9184 5.50455L94.8625 0.200012H87.8L95.3871 10.128L98.9184 5.50455Z" fill="#62CF7F"></path>
    <path d="M113.126 0.200012H106.061L88.3031 23.44H95.3656L113.126 0.200012Z" fill="#62CF7F"></path>
    <path d="M106.564 23.44L102.511 18.1355L106.042 13.512L113.629 23.44H106.564Z" fill="#62CF7F"></path>
  </svg>
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

