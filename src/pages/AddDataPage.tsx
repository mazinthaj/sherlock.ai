import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import type { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { alpha, styled, useTheme } from '@mui/material/styles';
import LinkIcon from '@mui/icons-material/Link';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import SettingsIcon from '@mui/icons-material/Settings';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';

const GradientBox = styled(Box)(({ theme }) => ({
  backgroundImage: 'linear-gradient(45deg, #111827 0%, #0f172a 100%)',
  borderRadius: theme.shape.borderRadius,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
    zIndex: 0,
  }
}));

interface DataSourceType {
  value: string;
  label: string;
}

interface FormData {
  name: string;
  type: string;
  url: string;
  token: string;
  queryParams: string;
}

export const AddDataPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    type: 'twitter',
    url: '',
    token: '',
    queryParams: '',
  });

  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (event: SelectChangeEvent) => {
    setFormData(prev => ({ ...prev, type: event.target.value }));
  };

  const handleCancel = () => {
    navigate('/home');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Just simulate success without API calls
    setSuccess(true);

    // Reset form after successful submission
    setFormData({
      name: '',
      type: 'twitter',
      url: '',
      token: '',
      queryParams: '',
    });

    // Navigate back to home after 2 seconds
    setTimeout(() => {
      navigate('/home');
    }, 2000);
  };

  const dataSourceTypes: DataSourceType[] = [
    { value: 'twitter', label: 'Twitter' },
    { value: 'news', label: 'News Articles' },
    { value: 'sensor', label: 'Sensor Data' },
    { value: 'historical', label: 'Historical Records' },
  ];

  return (
    <Layout>
      <GradientBox sx={{ p: 3, minHeight: 'calc(100vh - 120px)' }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="500">
            Add Data Source
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Connect new data sources to enhance your knowledge graph and discover new insights
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: 4,
            bgcolor: alpha(theme.palette.background.paper, 0.7),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            borderRadius: 2,
            backdropFilter: 'blur(12px)',
            position: 'relative',
            zIndex: 1,
            maxWidth: 700,
            mx: 'auto',
            boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.1)}`,
          }}
        >
          <Box component="form" onSubmit={handleSubmit} sx={{ '& .MuiTextField-root': { my: 1.5 } }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="data-source-type-label">Data Source Type</InputLabel>
              <Select
                labelId="data-source-type-label"
                id="data-source-type"
                name="type"
                value={formData.type}
                onChange={handleTypeChange}
                label="Data Source Type"
              >
                {dataSourceTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Source Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              variant="outlined"
              placeholder="Enter a name for this data source"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <DriveFileRenameOutlineIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="API Endpoint / URL"
              name="url"
              value={formData.url}
              onChange={handleChange}
              variant="outlined"
              placeholder="https://api.example.com/data"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LinkIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Authentication Token (if required)"
              name="token"
              value={formData.token}
              onChange={handleChange}
              variant="outlined"
              type="password"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <VpnKeyIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Query Parameters"
              name="queryParams"
              value={formData.queryParams}
              onChange={handleChange}
              variant="outlined"
              placeholder="keyword=example&count=100"
              multiline
              rows={2}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SettingsIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                color="inherit"
                onClick={handleCancel}
                sx={{
                  borderRadius: 1,
                  px: 3,
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                sx={{
                  borderRadius: 1,
                  px: 3,
                  boxShadow: `0 4px 10px ${alpha(theme.palette.primary.main, 0.3)}`
                }}
              >
                Connect Data Source
              </Button>
            </Box>
          </Box>
        </Paper>
      </GradientBox>

      {/* Success message */}
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled">
          Data source created successfully!
        </Alert>
      </Snackbar>
    </Layout>
  );
};