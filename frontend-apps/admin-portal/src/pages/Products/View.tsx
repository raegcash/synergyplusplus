import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Card,
  CardContent,
} from '@mui/material'
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material'
import { productsAPI } from '../../services/products'

const ProductView = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['products', id],
    queryFn: () => productsAPI.getById(id!),
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error || !product) {
    return (
      <Box>
        <Alert severity="error">
          Product not found or error loading product details.
        </Alert>
        <Button startIcon={<BackIcon />} onClick={() => navigate('/products')} sx={{ mt: 2 }}>
          Back to Products
        </Button>
      </Box>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success'
      case 'PENDING_APPROVAL':
        return 'warning'
      case 'DRAFT':
        return 'default'
      case 'REJECTED':
        return 'error'
      default:
        return 'default'
    }
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<BackIcon />}
            onClick={() => navigate('/products')}
            sx={{ minWidth: 'auto' }}
          >
            Back
          </Button>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {product.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Product Code: {product.code}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Chip
            label={product.status.replace('_', ' ')}
            color={getStatusColor(product.status)}
            sx={{ fontWeight: 600 }}
          />
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/products/${id}/edit`)}
          >
            Edit Product
          </Button>
        </Box>
      </Box>

      {/* Product Details */}
      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Product Information
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Product Code
                </Typography>
                <Typography variant="body1" fontWeight={500} fontFamily="monospace">
                  {product.code}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Product Type
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {product.productType}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Currency
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {product.currency}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Status
                </Typography>
                <Box>
                  <Chip
                    label={product.status.replace('_', ' ')}
                    color={getStatusColor(product.status)}
                    size="small"
                  />
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  Description
                </Typography>
                <Typography variant="body1" sx={{ mt: 0.5 }}>
                  {product.description}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Minimum Investment
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {product.currency} {product.minInvestment.toLocaleString()}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Maximum Investment
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {product.currency} {product.maxInvestment.toLocaleString()}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  Terms and Conditions
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, mt: 1, bgcolor: 'grey.50' }}>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {product.termsAndConditions}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Partners & Assets */}
        <Grid item xs={12} md={4}>
          {/* Partners */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Partners
              </Typography>
              {product.partners && product.partners.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {product.partners.map((partner) => (
                    <Chip
                      key={partner.id}
                      label={partner.name}
                      color="primary"
                      size="small"
                    />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No partners mapped yet
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Assets */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Assets
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                {product.assetsCount || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total assets in this product
              </Typography>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Metadata
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Created At
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {new Date(product.createdAt).toLocaleDateString()}
                  </Typography>
                </Grid>
                {product.approvedAt && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      Approved At
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {new Date(product.approvedAt).toLocaleDateString()}
                    </Typography>
                  </Grid>
                )}
                {product.submittedBy && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      Submitted By
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {product.submittedBy}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default ProductView



