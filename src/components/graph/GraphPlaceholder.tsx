import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';

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

export const GraphPlaceholder = () => {
  return (
    <GradientBox sx={{ p: 3, minHeight: 'calc(100vh - 120px)' }}>
      {/* Knowledge Graph Content */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Knowledge Graph Explorer
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Visualize and explore relationships between entities in real-time data
        </Typography>
      </Box>
      
      {/* Graph Placeholder */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          bgcolor: 'rgba(30, 41, 59, 0.7)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          height: 'calc(100vh - 250px)',
          borderRadius: 2,
          backdropFilter: 'blur(12px)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Graph Network Placeholder */}
        <Box
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            position: 'relative',
          }}
        >
          {/* Placeholder nodes and edges - visually representing a graph */}
          <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
            {/* Overlay text */}
            <Box 
              sx={{ 
                position: 'absolute',
                bottom: 20,
                left: 0,
                right: 0,
                textAlign: 'center',
                p: 2,
                borderRadius: 2,
                bgcolor: 'rgba(15, 23, 42, 0.7)',
                backdropFilter: 'blur(4px)',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                The actual knowledge graph visualization will be implemented here, showing
                relationships between entities with interactive nodes and edges.
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>
    </GradientBox>
  );
};