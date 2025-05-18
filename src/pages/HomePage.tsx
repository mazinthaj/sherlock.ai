import { useState, useEffect, useRef } from 'react';
import { Layout } from '../components/layout/Layout';
import { KnowledgeGraphViewer, KnowledgeGraphLegend } from '../components/graph/KnowledgeGraphViewer';
import {
  Button, Box, Typography, alpha, Snackbar, Alert, CircularProgress, Paper, ButtonGroup, Switch, FormControlLabel,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton
} from '@mui/material';
import DatabaseIcon from '@mui/icons-material/Storage';
import HealthCheckIcon from '@mui/icons-material/HealthAndSafety';
import DataObjectIcon from '@mui/icons-material/DataObject';
import BugReportIcon from '@mui/icons-material/BugReport';
import InfoIcon from '@mui/icons-material/Info';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useDrawer } from '../hooks/useDrawer';
import { styled, useTheme } from '@mui/material/styles';
import { seedNeo4jDatabase, testNeo4jConnection, checkNeo4jDatabaseStatus } from '../utils/seedDatabase';
import { neo4jService } from '../services/neo4jService';
import { troubleshootConnection } from '../services/connectionTroubleshooter';
import { useSearch } from '../contexts/SearchContext';
import SearchIcon from '@mui/icons-material/Search';

export const HomePage = () => {
  const theme = useTheme();
  const { rightDrawerOpen } = useDrawer();
  const [useMockData, setUseMockData] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [testing, setTesting] = useState(false);
  const [troubleshooting, setTroubleshooting] = useState(false);
  const [checking, setChecking] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<boolean | null>(null);
  const [graphRefreshKey, setGraphRefreshKey] = useState(0);
  const [dbStatus, setDbStatus] = useState<{ active: boolean; message: string } | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'info' | 'warning' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  // Get search context hooks
  const { searchQuery, setSearchQuery, performSearch, isSearching } = useSearch();

  const handleSeedDatabase = async () => {
    try {
      setSeeding(true);
      await seedNeo4jDatabase(useMockData);
      setSnackbar({
        open: true,
        message: 'Database seeded successfully! Refresh the page to see the data.',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error seeding database:', error);
      setSnackbar({
        open: true,
        message: 'Failed to seed database. Check console for details.',
        severity: 'error'
      });
    } finally {
      setSeeding(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setConnectionStatus(null);
    try {
      console.log('Testing Neo4j connection...');
      const isConnected = await testNeo4jConnection();
      setConnectionStatus(isConnected);

      setSnackbar({
        open: true,
        message: isConnected
          ? 'Successfully connected to Neo4j database!'
          : 'Failed to connect to Neo4j database. Check console for details.',
        severity: isConnected ? 'success' : 'error'
      });
    } catch (error) {
      console.error('Error testing connection:', error);
      setConnectionStatus(false);
      setSnackbar({
        open: true,
        message: 'Error occurred while testing connection. See console for details.',
        severity: 'error'
      });
    } finally {
      setTesting(false);
    }
  };

  const handleTroubleshootConnection = async () => {
    setTroubleshooting(true);
    try {
      setSnackbar({
        open: true,
        message: 'Running connection troubleshooting. Check console for detailed results.',
        severity: 'info'
      });
      await troubleshootConnection();
    } catch (error) {
      console.error('Error during troubleshooting:', error);
      setSnackbar({
        open: true,
        message: 'Error occurred during troubleshooting. See console for details.',
        severity: 'error'
      });
    } finally {
      setTroubleshooting(false);
    }
  };

  const handleCheckDatabaseStatus = async () => {
    setChecking(true);
    try {
      const uri = "neo4j+s://2c1a2b01.databases.neo4j.io";
      const status = await checkNeo4jDatabaseStatus(uri);
      setDbStatus(status);
      setStatusDialogOpen(true);
    } catch (error) {
      console.error('Error checking database status:', error);
      setSnackbar({
        open: true,
        message: 'Failed to check database status.',
        severity: 'error'
      });
    } finally {
      setChecking(false);
    }
  };

  const handleCloseStatusDialog = () => {
    setStatusDialogOpen(false);
  };

  const handleToggleMockData = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUseMockData(event.target.checked);
    if (event.target.checked) {
      setSnackbar({
        open: true,
        message: 'Using local mock data for knowledge graph visualization',
        severity: 'info'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Force a refresh of the knowledge graph
  const handleForceRefreshGraph = () => {
    console.log("Force refreshing knowledge graph from HomePage");
    // Increment refresh key to force a complete remount of the KnowledgeGraphViewer component
    setGraphRefreshKey(prevKey => prevKey + 1);
  };

  // Add search handler
  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await performSearch(searchQuery);
    // Force refresh the graph to display new search results
    handleForceRefreshGraph();
  };

  return (
    <Layout showRightDrawer={true}>
      <Box
        sx={{
          position: 'relative',
          height: 'calc(100vh - 150px)',
          overflow: 'hidden',
        }}
      >
        {/* Connection Status Panel */}
        <Paper sx={{
          mb: 2,
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: useMockData
            ? alpha(theme.palette.info.main, 0.1)
            : connectionStatus === null
              ? alpha(theme.palette.info.main, 0.1)
              : connectionStatus
                ? alpha(theme.palette.success.main, 0.1)
                : alpha(theme.palette.error.main, 0.1)
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="body1">
              {useMockData
                ? 'Using local mock data'
                : connectionStatus === null
                  ? 'Neo4j database connection status unknown'
                  : connectionStatus
                    ? 'Connected to Neo4j database'
                    : 'Not connected to Neo4j database'}
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={useMockData}
                  onChange={handleToggleMockData}
                  color="primary"
                  size="small"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <DataObjectIcon fontSize="small" />
                  <Typography variant="body2">Use Local Data</Typography>
                </Box>
              }
              sx={{ ml: 2 }}
            />
          </Box>

          <ButtonGroup variant="outlined" size="small">
            <Button
              startIcon={checking ? <CircularProgress size={16} /> : <InfoIcon />}
              onClick={handleCheckDatabaseStatus}
              disabled={checking}
              color="info"
            >
              {checking ? 'Checking...' : 'DB Status'}
            </Button>
            <Button
              startIcon={troubleshooting ? <CircularProgress size={16} /> : <BugReportIcon />}
              onClick={handleTroubleshootConnection}
              disabled={troubleshooting}
              color="warning"
            >
              {troubleshooting ? 'Diagnosing...' : 'Troubleshoot'}
            </Button>
            <Button
              startIcon={testing ? <CircularProgress size={16} /> : <HealthCheckIcon />}
              onClick={handleTestConnection}
              disabled={testing || useMockData || troubleshooting}
              color={connectionStatus === null ? "primary" : connectionStatus ? "success" : "error"}
            >
              {testing ? 'Testing...' : 'Test Connection'}
            </Button>
            <Button
              startIcon={seeding ? <CircularProgress size={16} /> : <DatabaseIcon />}
              onClick={handleSeedDatabase}
              disabled={seeding || (connectionStatus !== true && !useMockData) || troubleshooting}
              color="primary"
            >
              {seeding ? 'Seeding...' : 'Seed Test Data'}
            </Button>
          </ButtonGroup>
        </Paper>

        {/* Graph Area */}
        <Box
          sx={{
            position: 'relative',
            height: 'calc(100% - 72px)', // Full height for graph box
            borderRadius: 2,
            backgroundColor: alpha(theme.palette.background.paper, 0.4),
            backdropFilter: 'blur(8px)',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.08)}`,
            padding: 2,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" component="h1" fontWeight="500">
              Knowledge Graph {useMockData && '(Local Mock Data)'}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* Search input */}
              <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
                <TextField
                  variant="outlined"
                  placeholder="Search knowledge graph..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ ml: 1, mr: 0.5, color: 'text.secondary' }} />,
                  }}
                  size="small"
                  disabled={isSearching}
                  sx={{ width: '280px' }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="secondary"
                  disabled={isSearching || !searchQuery.trim()}
                  sx={{ minWidth: '100px' }}
                >
                  {isSearching ? (
                    <>
                      <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                      Loading...
                    </>
                  ) : 'Search'}
                </Button>
              </form>

              <Button
                variant="contained"
                color="primary"
                startIcon={<RefreshIcon />}
                onClick={handleForceRefreshGraph}
                sx={{
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.3)',
                  },
                }}
              >
                Refresh Graph
              </Button>
            </Box>
          </Box>

          <Box
            sx={{
              height: 'calc(100% - 60px)',
              overflowY: 'auto',
              '&::-webkit-scrollbar': { display: 'none' },
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              borderRadius: 1,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            <KnowledgeGraphViewer
              useMockData={useMockData}
              key={`graph-${useMockData ? 'mock' : 'neo4j'}-${graphRefreshKey}`}
            />
          </Box>
        </Box>

        {/* Legend Component - Outside and below the graph box */}
        <Box sx={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          position: 'absolute',
          bottom: 20,
          left: 0,
          zIndex: 5
        }}>
          <KnowledgeGraphLegend />
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Database Status Dialog */}
      <Dialog open={statusDialogOpen} onClose={handleCloseStatusDialog}>
        <DialogTitle>Neo4j Database Status</DialogTitle>
        <DialogContent>
          {dbStatus && (
            <Box>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 2,
                p: 2,
                backgroundColor: dbStatus.active
                  ? alpha(theme.palette.info.main, 0.1)
                  : alpha(theme.palette.error.main, 0.1),
                borderRadius: 1
              }}>
                <Typography variant="body1">{dbStatus.message}</Typography>
              </Box>
              <Typography variant="body2" sx={{ mt: 2 }}>
                To check if your Neo4j Aura database is active and with valid credentials:
              </Typography>
              <Box component="ul" sx={{ mt: 1, ml: 2 }}>
                <Typography component="li" variant="body2">Visit <a href="https://console.neo4j.io" target="_blank" rel="noopener noreferrer">Neo4j Aura Console</a></Typography>
                <Typography component="li" variant="body2">Check if your database instance is started and active</Typography>
                <Typography component="li" variant="body2">If needed, reset your password or create a new database</Typography>
                <Typography component="li" variant="body2">Update the credentials in your application</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStatusDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};