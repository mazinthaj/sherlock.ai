import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import TwitterIcon from '@mui/icons-material/Twitter';
import ArticleIcon from '@mui/icons-material/Article';
import SensorsIcon from '@mui/icons-material/Sensors';
import HistoryIcon from '@mui/icons-material/History';
import StorageIcon from '@mui/icons-material/Storage';

interface DataSourceItem {
  title: string;
  icon: React.ReactNode;
}

interface LeftDrawerProps {
  open: boolean;
  onClose: () => void;
}

export const LeftDrawer = ({ open, onClose }: LeftDrawerProps) => {
  const theme = useTheme();

  const dataSources: DataSourceItem[] = [
    { title: 'Twitter Data', icon: <TwitterIcon color="primary" /> },
    { title: 'News Articles', icon: <ArticleIcon color="primary" /> },
    { title: 'Sensor Data', icon: <SensorsIcon color="primary" /> },
    { title: 'Historical Records', icon: <HistoryIcon color="primary" /> },
  ];

  const drawerContent = (
    <Box
      sx={{
        width: 280,
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
      role="presentation"
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          p: 2,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          backgroundColor: alpha(theme.palette.primary.main, 0.04)
        }}
      >
        <Typography variant="h6" noWrap component="div" fontWeight="500">
          Data Sources
        </Typography>
      </Box>

      <List sx={{ flexGrow: 1, pt: 1 }}>
        {dataSources.map((item, index) => (
          <ListItem key={item.title} disablePadding>
            <ListItemButton
              sx={{
                borderRadius: 1,
                mx: 1,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08)
                }
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.title} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ opacity: 0.6 }} />

      <Box sx={{ p: 1 }}>
        <ListItem disablePadding>
          <ListItemButton
            sx={{
              borderRadius: 1,
              mx: 1,
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.08)
              }
            }}
          >
            <ListItemIcon>
              <StorageIcon color="primary" />
            </ListItemIcon>
            <ListItemText primary="Manage Data Sources" />
          </ListItemButton>
        </ListItem>
      </Box>
    </Box>
  );

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      variant="temporary"
      sx={{
        '& .MuiDrawer-paper': {
          boxSizing: 'border-box',
          width: 280,
          borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.15)}`
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};