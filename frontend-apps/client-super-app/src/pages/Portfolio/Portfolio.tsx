import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Button,
  ButtonGroup,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  ShowChart,
  Refresh,
  Sell,
  Visibility,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { usePortfolioSummary, usePortfolioHoldings } from '../../hooks/usePortfolio';
import SellAssetModal from '../../components/common/Modal/SellAssetModal';
import type { Asset } from '../../types/api.types';

function Portfolio() {
  const navigate = useNavigate();
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [selectedHolding, setSelectedHolding] = useState<any>(null);
  
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

  const handleSellClick = (holding: any) => {
    // Convert holding to Asset format for the modal
    const asset: Asset = {
      id: holding.assetId,
      productId: '', // Not needed for sell
      partnerId: '', // Not needed for sell
      name: holding.assetName,
      symbol: holding.assetSymbol,
      assetCode: holding.assetSymbol,
      assetType: holding.assetType,
      description: '',
      currentPrice: holding.currentPrice || 0,
      priceCurrency: 'PHP',
      minInvestment: 0,
      maxInvestment: 0,
      status: 'ACTIVE',
      createdAt: '',
      updatedAt: '',
    };
    
    setSelectedAsset(asset);
    setSelectedHolding(holding);
    setSellModalOpen(true);
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
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }} sx={{ mb: 4 }}>
        <Box sx={{ flex: "1 1 calc(25% - 24px)", minWidth: "250px" }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography color="text.secondary" variant="body2">
                  Total Value
                </Typography>
                <AccountBalance sx={{ color: 'primary.main' }} />
              </Box>
              <Typography variant="h5" fontWeight={700}>
                {formatCurrency(summary?.totalPortfolioValue || 0)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                {(summary?.totalReturns || 0) >= 0 ? (
                  <TrendingUp sx={{ fontSize: 18, color: 'success.main' }} />
                ) : (
                  <TrendingDown sx={{ fontSize: 18, color: 'error.main' }} />
                )}
                <Typography
                  variant="body2"
                  sx={{
                    color: (summary?.totalReturns || 0) >= 0 ? 'success.main' : 'error.main',
                  }}
                >
                  {formatPercentage(summary?.totalReturnsPercent || 0)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: "1 1 calc(25% - 24px)", minWidth: "250px" }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography color="text.secondary" variant="body2">
                  Total Investment
                </Typography>
                <ShowChart sx={{ color: 'primary.main' }} />
              </Box>
              <Typography variant="h5" fontWeight={700}>
                {formatCurrency(summary?.totalInvestments || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: "1 1 calc(25% - 24px)", minWidth: "250px" }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography color="text.secondary" variant="body2">
                  Total Gain/Loss
                </Typography>
                {(summary?.totalReturns || 0) >= 0 ? (
                  <TrendingUp sx={{ color: 'success.main' }} />
                ) : (
                  <TrendingDown sx={{ color: 'error.main' }} />
                )}
              </Box>
              <Typography
                variant="h5"
                fontWeight={700}
                sx={{
                  color: (summary?.totalReturns || 0) >= 0 ? 'success.main' : 'error.main',
                }}
              >
                {formatCurrency(summary?.totalReturns || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: "1 1 calc(25% - 24px)", minWidth: "250px" }}>
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
        </Box>
      </Box>

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
                          <ButtonGroup size="small" variant="outlined">
                            <Button
                              startIcon={<Visibility />}
                              onClick={() => navigate(`/assets/${holding.assetId}`)}
                            >
                              View
                            </Button>
                            <Button
                              color="error"
                              startIcon={<Sell />}
                              onClick={() => handleSellClick(holding)}
                            >
                              Sell
                            </Button>
                          </ButtonGroup>
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

      {/* Sell Asset Modal */}
      {selectedAsset && selectedHolding && (
        <SellAssetModal
          open={sellModalOpen}
          onClose={() => {
            setSellModalOpen(false);
            setSelectedAsset(null);
            setSelectedHolding(null);
          }}
          asset={selectedAsset}
          availableQuantity={selectedHolding.quantity || 0}
          averagePrice={selectedHolding.avgPrice || 0}
        />
      )}
    </Box>
  );
}

export default Portfolio;
