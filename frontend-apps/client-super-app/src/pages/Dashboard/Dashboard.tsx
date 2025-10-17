/**
 * Dashboard Page - Enterprise Grade
 * Complete dashboard with real-time metrics, charts, and activity feed
 * 
 * @component
 * @version 2.0.0
 * @classification Production-Ready
 */

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  AddCircle,
  RemoveCircle,
  SwapHoriz,
  Refresh,
  ArrowForward,
  ShowChart,
  Assessment,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import { useDashboardSummary, useRefreshDashboard } from '../../hooks/useDashboard';
import { useInsights, useRecommendations } from '../../hooks/useAI';
import InsightCard from '../../components/AI/InsightCard';
import RecommendationCard from '../../components/AI/RecommendationCard';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

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

const ASSET_COLORS = {
  UITF: '#3b82f6',
  STOCK: '#10b981',
  CRYPTO: '#f59e0b',
  BOND: '#8b5cf6',
  default: '#6b7280',
};

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  
  // Fetch dashboard data
  const { data: dashboard, isLoading, error, refetch } = useDashboardSummary();
  const refreshMutation = useRefreshDashboard();
  
  // Fetch AI insights and recommendations
  const { data: insights } = useInsights();
  const { data: recommendations } = useRecommendations(undefined, 3);

  // Handle refresh
  const handleRefresh = async () => {
    await refreshMutation.mutateAsync();
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return `₱${value.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-PH', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'success';
      case 'PENDING': return 'warning';
      case 'FAILED': return 'error';
      default: return 'default';
    }
  };

  // Get type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'INVESTMENT': return <AddCircle fontSize="small" />;
      case 'WITHDRAWAL': return <RemoveCircle fontSize="small" />;
      case 'DIVIDEND': return <TrendingUp fontSize="small" />;
      default: return <SwapHoriz fontSize="small" />;
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !dashboard) {
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        Failed to load dashboard data. Please try again later.
      </Alert>
    );
  }

  return (
    <Box>
      {/* Welcome Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Welcome back, {user?.firstName || 'Investor'}! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's your investment overview for today
        </Typography>
      </Box>

      {/* Action Bar */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={handleRefresh}
          disabled={refreshMutation.isPending}
        >
          Refresh
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Current Value"
            value={formatCurrency(dashboard?.quickStats?.currentValue || 0)}
            change={dashboard?.quickStats?.totalReturnsPercent !== undefined ? `${dashboard.quickStats.totalReturnsPercent >= 0 ? '+' : ''}${dashboard.quickStats.totalReturnsPercent.toFixed(2)}%` : undefined}
            isPositive={(dashboard?.quickStats?.totalReturnsPercent || 0) >= 0}
            icon={<AccountBalance />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Total Invested"
            value={formatCurrency(dashboard?.quickStats?.totalInvested || 0)}
            icon={<TrendingUp />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Total Returns"
            value={formatCurrency(dashboard?.quickStats?.totalReturns || 0)}
            change={dashboard?.quickStats?.totalReturnsPercent !== undefined ? `${dashboard.quickStats.totalReturnsPercent.toFixed(2)}%` : undefined}
            isPositive={(dashboard?.quickStats?.totalReturns || 0) >= 0}
            icon={<Assessment />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Total Holdings"
            value={(dashboard?.quickStats?.totalHoldings || 0).toString()}
            icon={<ShowChart />}
          />
        </Grid>
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Recent Activity */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                Recent Activity
              </Typography>
              <Button
                size="small"
                endIcon={<ArrowForward />}
                onClick={() => navigate('/transactions')}
              >
                View All
              </Button>
            </Box>
            <List>
              {dashboard.recentActivity.slice(0, 5).map((activity, index) => (
                <React.Fragment key={activity.id}>
                  {index > 0 && <Divider />}
                  <ListItem>
                    <ListItemIcon>
                      {getTypeIcon(activity.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={activity.description}
                      secondary={
                        <>
                          {formatDate(activity.date)}
                          {activity.asset && ` • ${activity.asset.name}`}
                        </>
                      }
                    />
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color={activity.type === 'WITHDRAWAL' ? 'error.main' : 'success.main'}
                      >
                        {activity.type === 'WITHDRAWAL' ? '-' : '+'}
                        {formatCurrency(activity.amount)}
                      </Typography>
                      <Chip
                        label={activity.status}
                        color={getStatusColor(activity.status) as any}
                        size="small"
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Asset Allocation */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Asset Allocation
            </Typography>
            {dashboard.assetAllocation.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={dashboard.assetAllocation}
                    dataKey="value"
                    nameKey="assetType"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(entry) => `${entry.assetType}: ${entry.percentage.toFixed(1)}%`}
                  >
                    {dashboard.assetAllocation.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={ASSET_COLORS[entry.assetType as keyof typeof ASSET_COLORS] || ASSET_COLORS.default}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  No assets yet. Start investing to see your allocation!
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Top Performers */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                Top Performers
              </Typography>
              <Button
                size="small"
                endIcon={<ArrowForward />}
                onClick={() => navigate('/portfolio')}
              >
                View Portfolio
              </Button>
            </Box>
            {dashboard.topPerformers.length > 0 ? (
              <List>
                {dashboard.topPerformers.map((asset, index) => (
                  <React.Fragment key={asset.id}>
                    {index > 0 && <Divider />}
                    <ListItem>
                      <ListItemText
                        primary={asset.assetName}
                        secondary={`${asset.assetCode} • ${asset.assetType}`}
                      />
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body2" fontWeight={600}>
                          {formatCurrency(asset.currentValue)}
                        </Typography>
                        <Typography
                          variant="caption"
                          color={asset.returnsPercent >= 0 ? 'success.main' : 'error.main'}
                        >
                          {asset.returnsPercent >= 0 ? '+' : ''}
                          {asset.returnsPercent.toFixed(2)}%
                        </Typography>
                      </Box>
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  No holdings yet
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Risk Distribution */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Risk Distribution
            </Typography>
            {Object.keys(dashboard.riskDistribution).length > 0 ? (
              <Box sx={{ mt: 2 }}>
                {Object.entries(dashboard.riskDistribution).map(([level, data]) => (
                  <Box key={level} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">{level}</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {data.percentage.toFixed(1)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={data.percentage}
                      sx={{ height: 8, borderRadius: 1 }}
                      color={
                        level === 'LOW' ? 'success' :
                        level === 'MEDIUM' ? 'warning' :
                        level === 'HIGH' ? 'error' : 'info'
                      }
                    />
                  </Box>
                ))}
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  No risk distribution data
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={4}>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  startIcon={<AddCircle />}
                  onClick={() => navigate('/marketplace')}
                >
                  New Investment
                </Button>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button
                  variant="outlined"
                  size="large"
                  fullWidth
                  startIcon={<ShowChart />}
                  onClick={() => navigate('/portfolio')}
                >
                  View Portfolio
                </Button>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button
                  variant="outlined"
                  size="large"
                  fullWidth
                  startIcon={<Assessment />}
                  onClick={() => navigate('/transactions')}
                >
                  Transaction History
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;
