import React from "react"

import AppBar from "@mui/material/AppBar"
import Box from "@mui/material/Box"
import Toolbar from "@mui/material/Toolbar"
import Button from "@mui/material/Button"
import Link from "@mui/material/Link"
import wooLogo from "../assets/woo-logo-small.png"
import EqualizerIcon from '@mui/icons-material/Equalizer'

export default function TopNav() {
  const appBarStyles = theme => ({
    p: 1,
    pr: 4,
    pl: 4,
    boxShadow: 'none',
    backgroundColor: 'background.dark',
    backgroundImage: 'none',
    [theme.breakpoints.down('sm')]: {
      pr: 1,
      pl: 1,
    }
  })
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="static"
        sx={appBarStyles}
      >
        <Toolbar
          disableGutters
          sx={{
            display: "flex",
            justifyContent: "flex-start",
          }}
        >
          <Button sx={{ display: "flex", alignItems: "center", ml: -1, pr: 0 }} to="/">
            <img src={wooLogo} style={{ marginRight: "10px" }} />
            <EqualizerIcon fontSize="large" color="secondary" />
          </Button>
          <Link underline="none" variant="h6" color="text.light" to="/" sx={{ ml: 'auto' }}>
            Volume
          </Link>
          <Link underline="none" variant="h6" color="text.light" to="/dao" disabled sx={{ pl: 2 }}>
            DAO
          </Link>
          <Link underline="none" variant="h6" color="text.light" to="/token" sx={{ pr: 0, pl: 2 }} disabled>
            Token
          </Link>
        </Toolbar>
      </AppBar>
    </Box>
  )
}
