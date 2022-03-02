import React from "react"

import Container from "@mui/material/Container"
import Box from "@mui/material/Box"
import Stack from "@mui/material/Stack"
import GitHubIcon from '@mui/icons-material/GitHub'
import TwitterIcon from '@mui/icons-material/Twitter'
import Typography from '@mui/material/Typography'

import TopNav from "./TopNav"

export default function Layout({ children }) {
  return (
    <Box sx={{ backgroundColor: 'background.default' }}>
      <TopNav />
      <Container {...{
        maxWidth: 'lg',
        sx: {
          p: 2,
          pt: 16,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '100vh',
        },
      }}
      >
        <Box>{children}</Box>
        <Footer />
      </Container>
    </Box>
  )
}


function Footer() {
  return <Stack>
    <Stack sx={{ pb: 1, flexDirection: 'row', justifyContent: 'center'}}>
      <a {...{
        href: 'https://github.com/nodatall/woostats',
        target: '_blank'
      }}>
        <GitHubIcon
          fontSize="medium"
          color="disabled"
          sx={{ mr: 2 }}
        />
      </a>
      <a {...{
        href: 'https://twitter.com/7heThreeWords',
        target: '_blank'
      }}>
        <TwitterIcon
          fontSize="medium"
          color="disabled"
        />
      </a>
    </Stack>
    <Typography
      variant="body1"
      sx={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.3)', pb: 2 }}
    >
      Unofficial community site for the WOO Network & DAO
    </ Typography>
  </Stack>
}
