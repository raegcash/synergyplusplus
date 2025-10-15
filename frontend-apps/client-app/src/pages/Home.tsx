import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  Paper,
} from '@mui/material'
import {
  ShowChart as InvestIcon,
  AccountBalance as LendIcon,
  Savings as SavingsIcon,
  TrendingUp as TrendingIcon,
} from '@mui/icons-material'

const Home = () => {
  const navigate = useNavigate()

  const quickActions = [
    { title: 'Investment', subtitle: 'Trade stocks, crypto, forex', icon: <InvestIcon sx={{ fontSize: 48 }} />, path: '/investment', color: '#2563eb' },
    { title: 'Lending', subtitle: 'Apply for loans', icon: <LendIcon sx={{ fontSize: 48 }} />, path: '/lending', color: '#10b981' },
    { title: 'Savings', subtitle: 'Manage your wallet', icon: <SavingsIcon sx={{ fontSize: 48 }} />, path: '/savings', color: '#f59e0b' },
    { title: 'Marketplace', subtitle: 'Explore products', icon: <TrendingIcon sx={{ fontSize: 48 }} />, path: '/marketplace', color: '#8b5cf6' },
  ]

  return (
    <Box>
      {/* Hero Section */}
      <Paper
        sx={{
          p: 4,
          mb: 4,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: 3,
        }}
      >
        <Typography variant="h4" gutterBottom fontWeight={700}>
          Welcome to Your Financial Hub
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          Manage investments, loans, savings, and more in one place
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Chip label="Total Balance: $12,345.67" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600 }} />
        </Box>
      </Paper>

      {/* Quick Actions */}
      <Typography variant="h5" gutterBottom fontWeight={600}>
        Quick Actions
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {quickActions.map((action) => (
          <Grid item xs={12} sm={6} md={3} key={action.title}>
            <Card elevation={2}>
              <CardActionArea onClick={() => navigate(action.path)} sx={{ p: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <Box sx={{ color: action.color, mb: 2 }}>
                      {action.icon}
                    </Box>
                    <Typography variant="h6" gutterBottom fontWeight={600}>
                      {action.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {action.subtitle}
                    </Typography>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recent Activity */}
      <Typography variant="h5" gutterBottom fontWeight={600}>
        Recent Activity
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body2" color="text.secondary">
          No recent activity
        </Typography>
      </Paper>
    </Box>
  )
}

export default Home




