import { Layout } from '../components/layout/Layout';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { alpha, styled, useTheme } from '@mui/material/styles';
import StorageIcon from '@mui/icons-material/Storage';
import HistoryIcon from '@mui/icons-material/History';
import ShareIcon from '@mui/icons-material/Share';

// Custom styled components
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

const FeatureCard = styled(Card)(({ theme }) => ({
  height: '100%',
  backgroundColor: alpha(theme.palette.background.paper, 0.4),
  backdropFilter: 'blur(8px)',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
  borderRadius: theme.shape.borderRadius,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 10px 20px ${alpha(theme.palette.common.black, 0.12)}`,
    borderColor: alpha(theme.palette.primary.main, 0.3),
  }
}));

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactElement;
}

export const AboutPage = () => {
  const theme = useTheme();

  const features: FeatureCardProps[] = [
    {
      title: 'Real-time Data Integration',
      description: 'Collect and structure data from social media, news wires, and sensors to provide up-to-the-minute information.',
      icon: <StorageIcon color="primary" fontSize="large" />
    },
    {
      title: 'Historical Context',
      description: 'Link current events to past events, trends, and key players to provide a deeper understanding of breaking news.',
      icon: <HistoryIcon color="primary" fontSize="large" />
    },
    {
      title: 'Relationship Visualization',
      description: 'Show connections between entities to uncover hidden patterns and provide insights that might otherwise be missed.',
      icon: <ShareIcon color="primary" fontSize="large" />
    }
  ];

  return (
    <Layout>
      <GradientBox sx={{ p: 3, minHeight: 'calc(100vh - 120px)' }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="500">
            About Knowledge Graph Explorer
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
            Learn more about our project and how it improves breaking news coverage
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
            maxWidth: 1000,
            mx: 'auto',
            boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.1)}`,
          }}
        >
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom fontWeight="500">
              Project Overview
            </Typography>
            <Typography paragraph>
              Our Knowledge Graph Explorer connects real-time data sources with historical context,
              enabling faster, more accurate, and more insightful decision-making and reporting for breaking news.
            </Typography>
            <Typography paragraph>
              By linking entities such as people, organizations, and events, we uncover hidden patterns
              and relationships that provide deeper context for current events.
            </Typography>
          </Box>

          <Typography variant="h5" sx={{ mt: 4, mb: 3 }} fontWeight="500">
            Key Features
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
            {features.map((feature, index) => (
              <FeatureCard key={index}>
                <CardContent sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  height: '100%',
                }}>
                  <Box sx={{ mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" color="primary.main" gutterBottom fontWeight="500">
                    {feature.title}
                  </Typography>
                  <Typography variant="body2">
                    {feature.description}
                  </Typography>
                </CardContent>
              </FeatureCard>
            ))}
          </Box>

          <Box sx={{ mt: 4, pt: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
            <Typography variant="h5" sx={{ mb: 2 }} fontWeight="500">
              Built With
            </Typography>
            <Typography>
              React, TypeScript, Material UI, and modern graph visualization technologies.
            </Typography>
          </Box>
        </Paper>
      </GradientBox>
    </Layout>
  );
};