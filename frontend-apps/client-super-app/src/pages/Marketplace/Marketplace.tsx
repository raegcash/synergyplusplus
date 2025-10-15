import { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Grid,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { useProducts } from '../../hooks/useProducts';
import { useAssets } from '../../hooks/useAssets';
import ProductCard from '../../components/common/Card/ProductCard';
import AssetCard from '../../components/common/Card/AssetCard';
import { PRODUCT_TYPES } from '../../config/constants';

function Marketplace() {
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [productTypeFilter, setProductTypeFilter] = useState('');

  // Fetch products and assets
  const {
    data: productsData,
    isLoading: productsLoading,
    error: productsError,
  } = useProducts({
    status: 'ACTIVE',
    productType: productTypeFilter || undefined,
  });

  const {
    data: assetsData,
    isLoading: assetsLoading,
    error: assetsError,
  } = useAssets({});

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const isLoading = productsLoading || assetsLoading;
  const error = productsError || assetsError;

  // Filter data based on search query
  const filteredProducts = productsData?.data?.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAssets = assetsData?.data?.filter((asset) =>
    asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.symbol?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Product Marketplace
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Explore investment opportunities across UITF, Stocks, Crypto, and more
        </Typography>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="All Products" />
          <Tab label="All Assets" />
          <Tab label="UITF" />
          <Tab label="Stocks" />
          <Tab label="Crypto" />
        </Tabs>
      </Paper>

      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={8}>
          <TextField
            fullWidth
            placeholder="Search products or assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth>
            <InputLabel>Product Type</InputLabel>
            <Select
              value={productTypeFilter}
              label="Product Type"
              onChange={(e) => setProductTypeFilter(e.target.value)}
            >
              <MenuItem value="">All Types</MenuItem>
              <MenuItem value={PRODUCT_TYPES.UITF}>UITF</MenuItem>
              <MenuItem value={PRODUCT_TYPES.STOCKS}>Stocks</MenuItem>
              <MenuItem value={PRODUCT_TYPES.CRYPTO}>Crypto</MenuItem>
              <MenuItem value={PRODUCT_TYPES.SAVINGS}>Savings</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Loading State */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load marketplace data. Please try again later.
        </Alert>
      )}

      {/* Content */}
      {!isLoading && !error && (
        <>
          {/* Products Tab */}
          {(tabValue === 0 || tabValue >= 2) && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Products
              </Typography>
              {filteredProducts && filteredProducts.length > 0 ? (
                <Grid container spacing={3}>
                  {filteredProducts.map((product) => (
                    <Grid item xs={12} sm={6} md={4} key={product.id}>
                      <ProductCard product={product} />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Alert severity="info">
                  No products found. Try adjusting your filters.
                </Alert>
              )}
            </Box>
          )}

          {/* Assets Tab */}
          {(tabValue === 0 || tabValue === 1) && (
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Assets
              </Typography>
              {filteredAssets && filteredAssets.length > 0 ? (
                <Grid container spacing={3}>
                  {filteredAssets.map((asset) => (
                    <Grid item xs={12} sm={6} md={4} key={asset.id}>
                      <AssetCard asset={asset} />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Alert severity="info">
                  No assets found. Try adjusting your filters.
                </Alert>
              )}
            </Box>
          )}
        </>
      )}
    </Box>
  );
}

export default Marketplace;
