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
} from '@mui/material';
import { ArrowBack, TrendingUp } from '@mui/icons-material';
import { useProduct } from '../../hooks/useProducts';
import { useAssetsByProduct } from '../../hooks/useAssets';
import AssetCard from '../../components/common/Card/AssetCard';

function ProductDetails() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();

  const { data: product, isLoading: productLoading, error: productError } = useProduct(
    productId!
  );

  const {
    data: assetsData,
    isLoading: assetsLoading,
    error: assetsError,
  } = useAssetsByProduct(productId!);

  const isLoading = productLoading || assetsLoading;
  const error = productError || assetsError;

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !product) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/marketplace')}
          sx={{ mb: 3 }}
        >
          Back to Marketplace
        </Button>
        <Alert severity="error">Failed to load product details.</Alert>
      </Box>
    );
  }

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

      {/* Product Header */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Box>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                {product.name}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Chip label={product.productType} color="primary" />
                <Chip
                  label={product.status}
                  color={product.status === 'ACTIVE' ? 'success' : 'default'}
                />
              </Box>
            </Box>
          </Box>

          <Typography variant="body1" color="text.secondary" paragraph>
            {product.description || 'No description available'}
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color="text.secondary">
                Minimum Investment
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                ₱{product.minimumInvestment?.toLocaleString() || '0'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color="text.secondary">
                Product Type
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                {product.productType}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color="text.secondary">
                Available Assets
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                {assetsData?.data?.length || 0}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Assets */}
      <Box>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Available Assets
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Browse and invest in assets under this product
        </Typography>

        {assetsData?.data && assetsData.data.length > 0 ? (
          <Grid container spacing={3}>
            {assetsData.data.map((asset) => (
              <Grid item xs={12} sm={6} md={4} key={asset.id}>
                <AssetCard asset={asset} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Alert severity="info">No assets available for this product.</Alert>
        )}
      </Box>
    </Box>
  );
}

export default ProductDetails;
