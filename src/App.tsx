import { useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { AddDataPage } from './pages/AddDataPage';
import { AboutPage } from './pages/AboutPage';
import { ThemeProvider, createTheme, responsiveFontSizes } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { SearchProvider } from './contexts/SearchContext';

// Create a responsive dark theme
const createAppTheme = () => {
  let darkTheme = createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#2196f3',
        light: '#64b5f6',
        dark: '#1976d2',
      },
      secondary: {
        main: '#f50057',
      },
      background: {
        default: '#111827',
        paper: '#1e293b',
      },
      text: {
        primary: '#f3f4f6',
        secondary: '#cbd5e1',
      },
      divider: 'rgba(148, 163, 184, 0.12)',
    },
    typography: {
      fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
      h1: { fontWeight: 600 },
      h2: { fontWeight: 600 },
      h3: { fontWeight: 600 },
      h4: { fontWeight: 500 },
      h5: { fontWeight: 500 },
      h6: { fontWeight: 500 },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: '#0f172a',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: '#1e293b',
            borderRight: 'none',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: 'none',
            fontWeight: 600,
          },
          containedPrimary: {
            backgroundColor: '#2563eb',
            '&:hover': {
              backgroundColor: '#1d4ed8',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiCssBaseline: {
        styleOverrides: {
          '*': {
            boxSizing: 'border-box',
          },
          html: {
            height: '100%',
            width: '100%',
          },
          body: {
            height: '100%',
            margin: 0,
            padding: 0,
            scrollBehavior: 'smooth',
          },
          '#root': {
            height: '100%',
          },
          '::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '::-webkit-scrollbar-track': {
            background: '#1e293b',
          },
          '::-webkit-scrollbar-thumb': {
            background: '#475569',
            borderRadius: '4px',
          },
          '::-webkit-scrollbar-thumb:hover': {
            background: '#64748b',
          },
        },
      },
    },
  });

  // Make fonts responsive
  darkTheme = responsiveFontSizes(darkTheme);

  return darkTheme;
};

function App() {
  // Memoize theme creation to avoid unnecessary re-renders
  const theme = useMemo(() => createAppTheme(), []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SearchProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/home" element={<HomePage />} />
            <Route path="/add-data" element={<AddDataPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/" element={<Navigate to="/home" replace />} />
          </Routes>
        </BrowserRouter>
      </SearchProvider>
    </ThemeProvider>
  );
}

export default App;