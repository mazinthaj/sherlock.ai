import { type ReactNode } from 'react';
import { Box, alpha, useTheme } from '@mui/material';
import { Navbar } from './Navbar';
import { RightDrawer } from './RightDrawer';
import { useDrawer } from '../../hooks/useDrawer';

interface LayoutProps {
  children: ReactNode;
  showRightDrawer?: boolean;
}

export const Layout = ({
  children,
  showRightDrawer = false,
}: LayoutProps) => {
  const theme = useTheme();

  const {
    rightDrawerOpen,
    toggleRightDrawer,
    closeRightDrawer
  } = useDrawer();

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'hidden',
      backgroundColor: theme.palette.background.default,
    }}>
      <Navbar />

      <Box sx={{
        display: 'flex',
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            overflowY: 'auto',
            scrollBehavior: 'smooth',
            transition: theme.transitions.create(['margin', 'width'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
            '&::-webkit-scrollbar': {
              display: 'none'
            },
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            position: 'relative',
            zIndex: 1,
            // Subtle radial gradient background
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `radial-gradient(circle at center, ${alpha(theme.palette.primary.main, 0.04)} 0%, transparent 70%)`,
              pointerEvents: 'none',
              zIndex: -1,
            }
          }}
        >
          {children}
        </Box>

        {showRightDrawer && (
          <RightDrawer open={rightDrawerOpen} onClose={closeRightDrawer} />
        )}
      </Box>
    </Box>
  );
};