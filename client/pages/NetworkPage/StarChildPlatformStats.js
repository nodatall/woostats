import React from 'react'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'

import starChildLogo from 'assets/starchild-logo.jpg'
import ContentCard from 'components/ContentCard'
import { useAppState } from 'lib/appState'

const metrics = [
  ['agentsLaunched', 'Agents launched'],
  ['humanQueries', 'Human queries'],
  ['skillsAvailable', 'Skills available'],
  ['tokensUsed30d', 'Tokens used (30d)'],
]

export default function StarChildPlatformStats() {
  const { starchildPlatformStats } = useAppState(['starchildPlatformStats'])
  const theme = useTheme()

  if (!isCompletePlatformStats(starchildPlatformStats)) return null

  return <ContentCard sx={{ p: 0, overflow: 'hidden' }}>
    <Box
      component="section"
      aria-label="Star Child platform statistics"
      sx={{
        minHeight: '170px',
        px: 3,
        pt: 2.5,
        pb: 3.5,
        [theme.breakpoints.down('sm')]: {
          minHeight: 0,
          px: 2.5,
          pt: 2.25,
          pb: 1.25,
        },
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={1.25}
        sx={{ mb: '25px', [theme.breakpoints.down('sm')]: { mb: 1.25 } }}
      >
        <Box
          component="img"
          src={starChildLogo}
          alt="Star Child logo"
          sx={{ width: 32, height: 32, borderRadius: '7px', objectFit: 'cover' }}
        />
        <Typography sx={{
          color: '#f1f1f1',
          fontSize: 15,
          fontWeight: 700,
          letterSpacing: '.14em',
        }}>
          STARCHILD
        </Typography>
      </Stack>

      <Box sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
        [theme.breakpoints.down('lg')]: {
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        },
        [theme.breakpoints.down('sm')]: {
          gridTemplateColumns: '1fr',
        },
      }}>
        {metrics.map(([key, label]) => (
          <Box key={key} sx={{
            minWidth: 0,
            px: 2.25,
            textAlign: 'center',
            [theme.breakpoints.down('lg')]: {
              px: 1.75,
              py: 2.25,
            },
            [theme.breakpoints.down('sm')]: {
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              gap: 2.25,
              px: 0,
              py: 1.875,
              textAlign: 'left',
            },
          }}>
            <Typography sx={{
              color: '#ff6a2e',
              fontSize: 'clamp(24px, 2vw, 34px)',
              fontWeight: 500,
              lineHeight: 1.15,
              fontVariantNumeric: 'tabular-nums',
              whiteSpace: 'nowrap',
              [theme.breakpoints.down('lg')]: {
                fontSize: 'clamp(22px, 3.8vw, 30px)',
              },
              [theme.breakpoints.down('sm')]: {
                order: 2,
                fontSize: 23,
              },
            }}>
              {starchildPlatformStats[key].toLocaleString('en-US')}
            </Typography>
            <Typography sx={{
              mt: 1,
              color: 'rgba(213, 213, 213, .62)',
              fontSize: 14,
              letterSpacing: '.02em',
              [theme.breakpoints.down('sm')]: { mt: 0 },
            }}>
              {label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  </ContentCard>
}

function isCompletePlatformStats(stats) {
  if (!stats || typeof stats !== 'object' || Array.isArray(stats)) return false

  return metrics.every(([key]) => (
    Object.prototype.hasOwnProperty.call(stats, key) &&
    typeof stats[key] === 'number' &&
    Number.isFinite(stats[key]) &&
    Number.isInteger(stats[key]) &&
    stats[key] >= 0
  ))
}
