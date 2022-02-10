import React from "react"

import Container from "@mui/material/Container"
import Box from "@mui/material/Box"

import TopNav from "./TopNav"

export default function Layout({ children }) {
  return (
    <Box sx={{ backgroundColor: "background.default", minHeight: "100vh" }}>
      <TopNav />
      <Container maxWidth="lg" sx={{ p: 2, pt: 6 }}>{children}</Container>
    </Box>
  )
}
