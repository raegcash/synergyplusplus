import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
} from '@mui/material';
import { ArrowBack, Star, StarBorder, TrendingUp, TrendingDown, ShowChart, Security, Timeline } from '@mui/icons-material';
import { useAsset } from '../../hooks/useAssets';
import BuyAssetModal from '../../components/common/Modal/BuyAssetModal';
import AssetChart from '../../components/features/AssetChart';

function AssetDetails() {
  const { assetId } = useParams<{ assetId: string }>();
  const navigate = useNavigate();
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);

  const { data: asset, isLoading, error } = useAsset(assetId!);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !asset) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/marketplace')}
          sx={{ mb: 3 }}
        >
          Back to Marketplace
        </Button>
        <Alert severity="error">Failed to load asset details.</Alert>
      </Box>
    );
  }

  const priceChange = 0; // TODO: Calculate from asset data
  const isPositive = priceChange >= 0;

  return (
    <Box>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/marketplace')}
        sx={{ mb: 3 }}
      >
        Back to Marketplace
      </Button>

      {/* Asset Header */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 3 }}>
            <Box sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Typography variant="h4" fontWeight={700}>
                  {asset.name}
                </Typography>
                <IconButton onClick={() => setIsInWatchlist(!isInWatchlist)}>
                  {isInWatchlist ? (
                    <Star sx={{ color: 'warning.main' }} />
                  ) : (
                    <StarBorder />
                  )}
                </IconButton>
              </Box>

              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Chip label={asset.assetType} color="primary" />
                <Chip label={asset.symbol} variant="outlined" />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="h3" fontWeight={700} color="primary">
                  ₱{asset.currentPrice?.toLocaleString() || '0.00'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {isPositive ? (
                    <TrendingUp sx={{ fontSize: 20, color: 'success.main' }} />
                  ) : (
                    <TrendingDown sx={{ fontSize: 20, color: 'error.main' }} />
                  )}
                  <Typography
                    variant="body1"
                    sx={{ color: isPositive ? 'success.main' : 'error.main' }}
                  >
                    {isPositive ? '+' : ''}
                    {priceChange.toFixed(2)}% today
                  </Typography>
                </Box>
              </Box>

              <Typography variant="body1" color="text.secondary" paragraph>
                {asset.description || 'No description available'}
              </Typography>
            </Box>

            <Button
              variant="contained"
              size="large"
              onClick={() => setBuyModalOpen(true)}
              sx={{ minWidth: 120 }}
            >
              Buy Now
            </Button>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
            <Box sx={{ flex: "1 1 calc(25% - 24px)", minWidth: "250px" }}>
              <Typography variant="body2" color="text.secondary">
                Asset Type
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                {asset.assetType}
              </Typography>
            </Box>
            <Box sx={{ flex: "1 1 calc(25% - 24px)", minWidth: "250px" }}>
              <Typography variant="body2" color="text.secondary">
                Symbol
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                {asset.symbol}
              </Typography>
            </Box>
            <Box sx={{ flex: "1 1 calc(25% - 24px)", minWidth: "250px" }}>
              <Typography variant="body2" color="text.secondary">
                Current Price
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                ₱{asset.currentPrice?.toLocaleString() || '0.00'}
              </Typography>
            </Box>
            <Box sx={{ flex: "1 1 calc(25% - 24px)", minWidth: "250px" }}>
              <Typography variant="body2" color="text.secondary">
                Status
              </Typography>
              <Chip
                label={asset.status || 'ACTIVE'}
                color={asset.status === 'ACTIVE' ? 'success' : 'default'}
                size="small"
              />
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Price Chart */}
      <Box sx={{ mb: 3 }}>
        <AssetChart
          assetId={asset.id}
          assetName={asset.name}
        />
      </Box>

      {/* Asset Details Grid */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
        {/* About Section */}
        <Box sx={{ flex: "1 1 calc(66.666% - 12px)", minWidth: "500px" }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                About {asset.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {asset.description || 'No detailed information available.'}
              </Typography>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Timeline color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  Performance Metrics
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                <Box sx={{ flex: "1 1 calc(50% - 12px)", minWidth: "200px" }}>
                  <Typography variant="caption" color="text.secondary">
                    1 Month Return
                  </Typography>
                  <Typography variant="h6" color="success.main" fontWeight={600}>
                    +5.2%
                  </Typography>
                </Box>
                <Box sx={{ flex: "1 1 calc(50% - 12px)", minWidth: "200px" }}>
                  <Typography variant="caption" color="text.secondary">
                    3 Month Return
                  </Typography>
                  <Typography variant="h6" color="success.main" fontWeight={600}>
                    +12.8%
                  </Typography>
                </Box>
                <Box sx={{ flex: "1 1 calc(50% - 12px)", minWidth: "200px" }}>
                  <Typography variant="caption" color="text.secondary">
                    6 Month Return
                  </Typography>
                  <Typography variant="h6" color="success.main" fontWeight={600}>
                    +18.5%
                  </Typography>
                </Box>
                <Box sx={{ flex: "1 1 calc(50% - 12px)", minWidth: "200px" }}>
                  <Typography variant="caption" color="text.secondary">
                    Year to Date
                  </Typography>
                  <Typography variant="h6" color="success.main" fontWeight={600}>
                    +24.3%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Right Sidebar */}
        <Box sx={{ flex: "1 1 calc(33.333% - 20px)", minWidth: "300px" }}>
          {/* Quick Stats */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <ShowChart color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  Quick Stats
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Current Price
                  </Typography>
                  <Typography variant="h6" fontWeight={600}>
                    ₱{asset.currentPrice?.toLocaleString() || '0.00'}
                  </Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Min Investment
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    ₱{asset.minInvestment?.toLocaleString() || '1,000'}
                  </Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Asset Type
                  </Typography>
                  <Chip label={asset.assetType} color="primary" size="small" />
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Risk Profile */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Security color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  Risk Profile
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Risk Level
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip 
                      label={asset.riskLevel || 'MEDIUM'} 
                      color={
                        asset.riskLevel === 'LOW' ? 'success' :
                        asset.riskLevel === 'HIGH' ? 'error' :
                        'warning'
                      }
                      size="small"
                    />
                  </Box>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Volatility
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    Moderate
                  </Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Recommended For
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Long-term investors seeking steady growth
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Buy Modal */}
      {asset && (
        <BuyAssetModal
          open={buyModalOpen}
          onClose={() => setBuyModalOpen(false)}
          asset={asset}
        />
      )}
    </Box>
  );
}

export default AssetDetails;
