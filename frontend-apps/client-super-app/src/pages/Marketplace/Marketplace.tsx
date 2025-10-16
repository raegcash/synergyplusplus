import { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';
import { useProducts } from '../../hooks/useProducts';
import { useAssets } from '../../hooks/useAssets';
import AssetCard from '../../components/common/Card/AssetCard';

function Marketplace() {
  const [tabValue, setTabValue] = useState(0);

  // Fetch products and assets
  const {
    data: productsData,
    isLoading: productsLoading,
    error: productsError,
  } = useProducts({
    status: 'ACTIVE',
  });

  const {
    data: assetsData,
    isLoading: assetsLoading,
    error: assetsError,
  } = useAssets({
    status: 'ACTIVE',
  });

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const isLoading = productsLoading || assetsLoading;
  const error = productsError || assetsError;

  // Filter assets based on selected tab
  const getFilteredAssets = () => {
    const assets = assetsData?.data || [];
    
    switch (tabValue) {
      case 0: // All Products
        return assets;
      case 1: // UITF
        return assets.filter((asset) => asset.assetType === 'UITF');
      case 2: // Stocks
        return assets.filter((asset) => asset.assetType === 'STOCK');
      case 3: // Crypto
        return assets.filter((asset) => asset.assetType === 'CRYPTO');
      default:
        return assets;
    }
  };

  const filteredAssets = getFilteredAssets();

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Investment Marketplace
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Browse and invest in UITF, Stocks, and Cryptocurrency assets
        </Typography>
      </Box>

      {/* Category Tabs */}
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="All Assets" />
          <Tab label="UITF" />
          <Tab label="Stocks" />
          <Tab label="Crypto" />
        </Tabs>
      </Paper>

      {/* Assets Content */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load marketplace data. Please try again later.
        </Alert>
      ) : (
        <>
          {/* Category Header */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" fontWeight={600}>
              {tabValue === 0 && 'All Investment Assets'}
              {tabValue === 1 && 'UITF - Unit Investment Trust Funds'}
              {tabValue === 2 && 'Stocks - Philippine Stock Exchange'}
              {tabValue === 3 && 'Crypto - Cryptocurrency Trading'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {filteredAssets?.length || 0} asset{filteredAssets?.length !== 1 ? 's' : ''} available
            </Typography>
          </Box>

          {/* Assets Grid */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {filteredAssets && filteredAssets.length > 0 ? (
              filteredAssets.map((asset) => (
                <Box
                  key={asset.id}
                  sx={{
                    flex: '1 1 calc(33.333% - 20px)',
                    minWidth: '300px',
                  }}
                >
                  <AssetCard asset={asset} />
                </Box>
              ))
            ) : (
              <Box sx={{ width: '100%', textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No assets found in this category
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Assets configured in the admin portal will appear here
                </Typography>
              </Box>
            )}
          </Box>
        </>
      )}
    </Box>
  );
}

export default Marketplace;
