import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  ShowChart,
  Refresh,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { usePortfolioSummary, usePortfolioHoldings } from '../../hooks/usePortfolio';

function Portfolio() {
  const navigate = useNavigate();
  const { data: summary, isLoading: summaryLoading, refetch: refetchSummary } = usePortfolioSummary();
  const { data: holdings, isLoading: holdingsLoading, refetch: refetchHoldings } = usePortfolioHoldings();

  const isLoading = summaryLoading || holdingsLoading;

  const formatCurrency = (value: number) => {
    return `₱${value.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  const handleRefresh = () => {
    refetchSummary();
    refetchHoldings();
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            My Portfolio
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track your investments and performance
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={handleRefresh}
        >
          Refresh
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography color="text.secondary" variant="body2">
                  Total Value
                </Typography>
                <AccountBalance sx={{ color: 'primary.main' }} />
              </Box>
              <Typography variant="h5" fontWeight={700}>
                {formatCurrency(summary?.totalValue || 0)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                {(summary?.totalGainLoss || 0) >= 0 ? (
                  <TrendingUp sx={{ fontSize: 18, color: 'success.main' }} />
                ) : (
                  <TrendingDown sx={{ fontSize: 18, color: 'error.main' }} />
                )}
                <Typography
                  variant="body2"
                  sx={{
                    color: (summary?.totalGainLoss || 0) >= 0 ? 'success.main' : 'error.main',
                  }}
                >
                  {formatPercentage(summary?.totalGainLossPercent || 0)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography color="text.secondary" variant="body2">
                  Total Investment
                </Typography>
                <ShowChart sx={{ color: 'primary.main' }} />
              </Box>
              <Typography variant="h5" fontWeight={700}>
                {formatCurrency(summary?.totalInvested || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography color="text.secondary" variant="body2">
                  Total Gain/Loss
                </Typography>
                {(summary?.totalGainLoss || 0) >= 0 ? (
                  <TrendingUp sx={{ color: 'success.main' }} />
                ) : (
                  <TrendingDown sx={{ color: 'error.main' }} />
                )}
              </Box>
              <Typography
                variant="h5"
                fontWeight={700}
                sx={{
                  color: (summary?.totalGainLoss || 0) >= 0 ? 'success.main' : 'error.main',
                }}
              >
                {formatCurrency(summary?.totalGainLoss || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography color="text.secondary" variant="body2">
                  Holdings
                </Typography>
                <AccountBalance sx={{ color: 'primary.main' }} />
              </Box>
              <Typography variant="h5" fontWeight={700}>
                {holdings?.length || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Holdings Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            My Holdings
          </Typography>

          {holdings && holdings.length > 0 ? (
            <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Asset</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Avg Price</TableCell>
                    <TableCell align="right">Current Price</TableCell>
                    <TableCell align="right">Market Value</TableCell>
                    <TableCell align="right">Gain/Loss</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {holdings.map((holding: any) => {
                    const gainLossPercent = holding.gainLossPercent || 0;
                    const isPositive = gainLossPercent >= 0;

                    return (
                      <TableRow key={holding.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {holding.assetName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {holding.assetSymbol}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={holding.assetType} size="small" />
                        </TableCell>
                        <TableCell align="right">{holding.quantity}</TableCell>
                        <TableCell align="right">
                          {formatCurrency(holding.avgPrice || 0)}
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(holding.currentPrice || 0)}
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight={600}>
                            {formatCurrency(holding.marketValue || 0)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Box>
                            <Typography
                              variant="body2"
                              fontWeight={600}
                              sx={{ color: isPositive ? 'success.main' : 'error.main' }}
                            >
                              {formatCurrency(holding.gainLoss || 0)}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: isPositive ? 'success.main' : 'error.main' }}
                            >
                              {formatPercentage(gainLossPercent)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => navigate(`/assets/${holding.assetId}`)}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Holdings Yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Start investing to build your portfolio
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/marketplace')}
              >
                Browse Marketplace
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default Portfolio;
