import { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  AddCircle,
  RemoveCircle,
  SwapHoriz,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';

// Dashboard Summary Card Component
function SummaryCard({
  title,
  value,
  change,
  isPositive,
  icon,
}: {
  title: string;
  value: string;
  change?: string;
  isPositive?: boolean;
  icon: React.ReactNode;
}) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography color="text.secondary" variant="body2">
            {title}
          </Typography>
          <Box sx={{ color: 'primary.main' }}>{icon}</Box>
        </Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          {value}
        </Typography>
        {change && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {isPositive ? (
              <TrendingUp sx={{ fontSize: 20, color: 'success.main' }} />
            ) : (
              <TrendingDown sx={{ fontSize: 20, color: 'error.main' }} />
            )}
            <Typography
              variant="body2"
              sx={{ color: isPositive ? 'success.main' : 'error.main' }}
            >
              {change}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading dashboard data
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Welcome Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Welcome back, {user?.firstName}! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's your investment overview for today
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Total Portfolio Value"
            value="₱0.00"
            change="+0.00%"
            isPositive={true}
            icon={<AccountBalance />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Today's Gain/Loss"
            value="₱0.00"
            change="+0.00%"
            isPositive={true}
            icon={<TrendingUp />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Total Investments"
            value="₱0.00"
            icon={<AccountBalance />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Available Cash"
            value="₱0.00"
            icon={<AccountBalance />}
          />
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Quick Actions
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddCircle />}
              onClick={() => navigate('/marketplace')}
            >
              Buy Assets
            </Button>
            <Button
              variant="outlined"
              startIcon={<RemoveCircle />}
              onClick={() => navigate('/portfolio')}
            >
              Sell Assets
            </Button>
            <Button
              variant="outlined"
              startIcon={<SwapHoriz />}
              onClick={() => navigate('/transactions')}
            >
              View Transactions
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Getting Started */}
      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="body2" fontWeight={600} gutterBottom>
          Get Started with Investing
        </Typography>
        <Typography variant="body2">
          Browse our marketplace to discover investment opportunities in UITF, Stocks, and Crypto.
          Start building your portfolio today!
        </Typography>
        <Button
          size="small"
          variant="contained"
          sx={{ mt: 2 }}
          onClick={() => navigate('/marketplace')}
        >
          Explore Marketplace
        </Button>
      </Alert>

      {/* Recent Transactions */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Recent Transactions
          </Typography>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">No transactions yet</Typography>
            <Button
              variant="outlined"
              sx={{ mt: 2 }}
              onClick={() => navigate('/marketplace')}
            >
              Start Investing
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Dashboard;

