import { Link } from 'react-router-dom'

import { createTheme, responsiveFontSizes } from '@mui/material/styles'

let theme = createTheme({
  typography: {
    fontFamily: ['Maven Pro', 'Avenir', 'Helvetica', 'sans-serif'].join(','),
    allVariants: {
      color: 'white',
    }
  },
  palette: {
    mode: 'dark',
    primary: {
      main: '#73BEF4',
    },
    secondary: {
      main: '#8CFAAA',
      subtle: '#73c689',
    },
    background: {
      default: '#181c23',
      paper: '#15181D',
      dark: 'rgba(13,14,17,.85)',
    },
    text: {
      primary: 'rgb(213, 213, 213)',
      light: 'rgb(213, 213, 213, .5)',
      grey: '#57585A',
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
        root: {
          color: '#c8c8c8',
        },
        caption: {
          color: theme.palette.text.grey,
        },
      },
    },
  },
})

theme = responsiveFontSizes(theme)

export default theme
