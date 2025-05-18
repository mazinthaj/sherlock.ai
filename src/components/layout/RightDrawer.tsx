import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Slider from '@mui/material/Slider';
import SearchIcon from '@mui/icons-material/Search';
import { alpha, useTheme } from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';

interface RightDrawerProps {
  open: boolean;
  onClose: () => void;
}

interface FilterSection {
  title: string;
  content: React.ReactNode;
}

export const RightDrawer = ({ open, onClose }: RightDrawerProps) => {
  const theme = useTheme();

  // Filter sections to make the component more maintainable
  const filterSections: FilterSection[] = [
    {
      title: 'Search',
      content: (
        <TextField
          fullWidth
          size="small"
          placeholder="Search entities..."
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: alpha(theme.palette.primary.main, 0.5),
              },
            }
          }}
        />
      )
    },
    {
      title: 'Persons',
      content: (
        <FormGroup>
          <FormControlLabel
            control={<Checkbox defaultChecked size="small" />}
            label={<Typography variant="body2">Trump</Typography>}
          />
          <FormControlLabel
            control={<Checkbox size="small" />}
            label={<Typography variant="body2">Hillary</Typography>}
          />
        </FormGroup>
      )
    },
    {
      title: 'Places',
      content: (
        <FormGroup>
          <FormControlLabel
            control={<Checkbox defaultChecked size="small" />}
            label={<Typography variant="body2">USA</Typography>}
          />
        </FormGroup>
      )
    },
    {
      title: 'Node Display',
      content: (
        <>
          <Box sx={{ mt: 2, mb: 3 }}>
            <Typography variant="body2" gutterBottom color="text.secondary">
              Node Size
            </Typography>
            <Slider
              defaultValue={30}
              aria-label="Node Size"
              valueLabelDisplay="auto"
              size="small"
              sx={{
                color: theme.palette.primary.main,
                '& .MuiSlider-thumb': {
                  width: 14,
                  height: 14,
                  '&:hover, &.Mui-focusVisible': {
                    boxShadow: `0px 0px 0px 8px ${alpha(theme.palette.primary.main, 0.16)}`
                  }
                }
              }}
            />
          </Box>

          <Box sx={{ mt: 2, mb: 3 }}>
            <Typography variant="body2" gutterBottom color="text.secondary">
              Node Color
            </Typography>
            <FormGroup>
              <FormControlLabel
                control={<Checkbox defaultChecked size="small" />}
                label={<Typography variant="body2">By Type</Typography>}
              />
              <FormControlLabel
                control={<Checkbox size="small" />}
                label={<Typography variant="body2">By Importance</Typography>}
              />
            </FormGroup>
          </Box>
        </>
      )
    }
  ];

  const drawerContent = (
    <Box sx={{ width: 350, height: '100%' }} role="presentation" onClick={(e) => e.stopPropagation()}>
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
          Filters & Controls
        </Typography>
      </Box>

      <Box sx={{ overflow: 'auto', height: 'calc(100% - 57px)' }}>
        {filterSections.map((section, index) => (
          <Box key={section.title}>
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom fontWeight="500">
                {section.title}
              </Typography>
              {section.content}
            </Box>
            {index < filterSections.length - 1 && (
              <Divider sx={{ opacity: 0.6 }} />
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      variant="temporary"
      sx={{
        '& .MuiDrawer-paper': {
          boxSizing: 'border-box',
          width: 350,
          overflowX: 'hidden',
          borderLeft: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.15)}`,
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};