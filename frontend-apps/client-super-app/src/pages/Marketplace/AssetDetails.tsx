import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
} from '@mui/material';
import { ArrowBack, Star, StarBorder, TrendingUp, TrendingDown } from '@mui/icons-material';
import { useAsset } from '../../hooks/useAssets';
import BuyAssetModal from '../../components/common/Modal/BuyAssetModal';

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

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="text.secondary">
                Asset Type
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                {asset.assetType}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="text.secondary">
                Symbol
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                {asset.symbol}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="text.secondary">
                Current Price
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                ₱{asset.currentPrice?.toLocaleString() || '0.00'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="body2" color="text.secondary">
                Status
              </Typography>
              <Chip
                label={asset.status || 'ACTIVE'}
                color={asset.status === 'ACTIVE' ? 'success' : 'default'}
                size="small"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Asset Details */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                About {asset.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {asset.description || 'No detailed information available.'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Quick Stats
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Current Price
                  </Typography>
                  <Typography variant="h6">
                    ₱{asset.currentPrice?.toLocaleString() || '0.00'}
                  </Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Asset Type
                  </Typography>
                  <Typography variant="body1">{asset.assetType}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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
