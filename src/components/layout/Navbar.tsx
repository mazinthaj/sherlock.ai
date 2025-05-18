import { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { alpha, styled, useTheme } from '@mui/material/styles';
import HomeIcon from '@mui/icons-material/Home';
import AddIcon from '@mui/icons-material/Add';
import InfoIcon from '@mui/icons-material/Info';

interface NavbarProps {
  activeTab?: number;
}

interface NavTab {
  value: number;
  label: string;
  icon: React.ReactElement;
  path: string;
}

const BlueAccentText = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontWeight: 800,
  letterSpacing: '0.05em',
  fontSize: '2.2rem',
  textShadow: `0 2px 10px ${alpha(theme.palette.primary.main, 0.3)}`,
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  '& .MuiTabs-indicator': {
    height: 3,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  minWidth: 120,
  padding: theme.spacing(1.5, 3),
  marginRight: theme.spacing(2),
  fontWeight: 500,
  textTransform: 'none',
  fontSize: '1rem',
  transition: 'all 0.2s',
  opacity: 0.7,
  '&:hover': {
    opacity: 1,
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
  },
  '&.Mui-selected': {
    opacity: 1,
    fontWeight: 600,
  },
  '& .MuiSvgIcon-root': {
    marginRight: theme.spacing(1),
    fontSize: '1.2rem',
  },
}));

export const Navbar = ({
  activeTab
}: NavbarProps) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const tabs: NavTab[] = useMemo(() => [
    { value: 0, label: 'Home', icon: <HomeIcon fontSize="small" />, path: '/home' },
    { value: 1, label: 'Add Data', icon: <AddIcon fontSize="small" />, path: '/add-data' },
    { value: 2, label: 'About', icon: <InfoIcon fontSize="small" />, path: '/about' },
  ], []);

  // Determine active tab based on current path
  const currentTab = useMemo(() => {
    const tab = tabs.find(tab => tab.path === location.pathname);
    return tab?.value || 0;
  }, [location.pathname, tabs]);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    const selectedTab = tabs.find(tab => tab.value === newValue);
    if (selectedTab) {
      navigate(selectedTab.path);
    }
  };

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        backgroundColor: 'background.paper',
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      }}
    >
      <Toolbar sx={{ height: 80 }}>
        {/* Logo section */}
        <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
          <BlueAccentText>SHERLOCK</BlueAccentText>
        </Box>

        {/* Center section with tabs */}
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
          <StyledTabs
            value={currentTab}
            onChange={handleChange}
            textColor="primary"
            indicatorColor="primary"
          >
            {tabs.map(tab => (
              <StyledTab
                key={tab.path}
                icon={tab.icon}
                label={tab.label}
                iconPosition="start"
              />
            ))}
          </StyledTabs>
        </Box>

        {/* Empty box on the right to balance the layout */}
        <Box sx={{ width: '180px' }} />
      </Toolbar>
    </AppBar>
  );
};