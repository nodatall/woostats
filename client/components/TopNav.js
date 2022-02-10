import React from "react"

import AppBar from "@mui/material/AppBar"
import Box from "@mui/material/Box"
import Toolbar from "@mui/material/Toolbar"
import Button from "@mui/material/Button"
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
            <EqualizerIcon fontSize="large" />
          </Button>
          <Button variant="text" to="/" sx={{ ml: 'auto' }}>
            Volume
          </Button>
          <Button variant="text" to="/dao" disabled>
            DAO
          </Button>
          <Button variant="text" to="/token" sx={{ pr: 0 }} disabled>
            Token
          </Button>
        </Toolbar>
      </AppBar>
    </Box>
  )
}
