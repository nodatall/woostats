import { Link } from 'react-router-dom'

import { createTheme } from '@mui/material/styles'

let theme = createTheme({
  typography: {
    fontFamily: ['Maven Pro', 'Avenir', 'Helvetica', 'sans-serif'].join(','),
  },
  palette: {
    mode: 'dark',
    primary: {
      main: '#73BEF4',
      second: '#8CFAAA',
    },
    background: {
      default: '#181c23',
      paper: '#141824',
      dark: 'rgba(13,14,17,.85)',
    },
    text: {
      primary: 'rgb(213, 213, 213)',
      light: 'rgb(213, 213, 213, .5)',
    },
    success: {
      main: '#34815e',
    },
  },
  breakpoints: {
    values: {
      xs: 475,
      sm: 600,
      md: 765,
      lg: 1200,
      xl: 1536,
    },
  },
})

theme = createTheme(theme, {
  components: {
    MuiButtonBase: {
      defaultProps: {
        LinkComponent: Link,
      },
    },
    MuiLink: {
      defaultProps: {
        component: Link,
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: '15px',
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        caption: {
          color: theme.palette.text.light,
        },
      },
    },
    MuiButton: {
      variants: [
        {
          props: { variant: 'topnav' },
          style: {
            border: '2px solid transparent',
            borderRadius: '10px',
            // backgroundImage: `linear-gradient(${theme.palette.background.default},${theme.palette.background.default}),radial-gradient(circle at left top, ${theme.palette.primary.main},${theme.palette.primary.second})`,
            backgroundOrigin: 'border-box',
            backgroundClip: 'padding-box,border-box',
            marginLeft: '15px',
          },
        },
      ],
    },
  },
})

export default theme
