import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  TextField,
  InputAdornment,
  Avatar,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  Alert,
  CircularProgress,
} from '@mui/material'
import {
  Search as SearchIcon,
  TrendingUp as InvestIcon,
  AccountBalance as SavingsIcon,
  CurrencyExchange as LendingIcon,
  Security as InsuranceIcon,
  CurrencyBitcoin as CryptoIcon,
} from '@mui/icons-material'
import { productsAPI, Product, Asset } from '../services/products'

const Marketplace = () => {
  const navigate = useNavigate()
  const [tabValue, setTabValue] = useState(0)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [detailsDialog, setDetailsDialog] = useState(false)

  // Fetch approved products from API
  const { data: approvedProducts = [], isLoading, error } = useQuery({
    queryKey: ['products', 'approved'],
    queryFn: () => productsAPI.getApproved(),
    refetchInterval: 10000, // Refresh every 10 seconds
  })

  // Fetch assets when a product is selected
  const { data: productAssets = [] } = useQuery({
    queryKey: ['assets', selectedProduct?.id],
    queryFn: () => productsAPI.getAssets(selectedProduct!.id),
    enabled: !!selectedProduct,
  })

  // Mock assets if API doesn't return them (fallback)
  const mockAssets: Asset[] = [
    {
      id: '1',
      code: 'GSTOCKS_GLOBAL',
      name: 'GStocks Global',
      productType: 'INVESTMENT',
      description: 'Invest in global stocks from major markets. Access to US, Europe, and Asian markets with real-time trading.',
      partnerName: 'Global Securities',
      assetsCount: 150,
      minInvestment: 1000,
      maxInvestment: 1000000,
      currency: 'PHP',
      status: 'ACTIVE',
    },
    {
      id: '2',
      code: 'GSAVE_PREMIUM',
      name: 'GSave Premium',
      productType: 'SAVINGS',
      description: 'High-yield savings account with flexible terms and instant withdrawals.',
      partnerName: 'Acme Financial',
      assetsCount: 5,
      minInvestment: 5000,
      maxInvestment: 500000,
      currency: 'PHP',
      status: 'ACTIVE',
    },
    {
      id: '3',
      code: 'GCRYPTO_TRADE',
      name: 'GCrypto Trading',
      productType: 'CRYPTO',
      description: 'Trade major cryptocurrencies including Bitcoin, Ethereum, and more.',
      partnerName: 'TechInvest Corp',
      assetsCount: 25,
      minInvestment: 500,
      maxInvestment: 10000000,
      currency: 'PHP',
      status: 'ACTIVE',
    },
    {
      id: '4',
      code: 'GLENDING_MICRO',
      name: 'GLending Micro',
      productType: 'LENDING',
      description: 'Peer-to-peer lending for small businesses with competitive returns.',
      partnerName: 'TechInvest Corp',
      assetsCount: 3,
      minInvestment: 5000,
      maxInvestment: 100000,
      currency: 'PHP',
      status: 'ACTIVE',
    },
  ]

  const mockAssets: Asset[] = [
    { id: '1', name: 'Apple Inc.', symbol: 'AAPL', assetType: 'STOCK', description: 'Technology company', currentPrice: 175.50, change24h: 2.3 },
    { id: '2', name: 'Microsoft Corp.', symbol: 'MSFT', assetType: 'STOCK', description: 'Technology company', currentPrice: 380.25, change24h: 1.8 },
    { id: '3', name: 'Tesla Inc.', symbol: 'TSLA', assetType: 'STOCK', description: 'Electric vehicles', currentPrice: 245.75, change24h: -0.5 },
  ]

  // Use fetched assets or fallback to mock
  const displayAssets = productAssets.length > 0 ? productAssets : mockAssets

  const filteredProducts = tabValue === 0 
    ? approvedProducts 
    : approvedProducts.filter(p => p.productType === ['INVESTMENT', 'SAVINGS', 'LENDING', 'CRYPTO'][tabValue - 1])

  const getProductIcon = (type: string) => {
    switch (type) {
      case 'INVESTMENT': return <InvestIcon fontSize="large" />
      case 'SAVINGS': return <SavingsIcon fontSize="large" />
      case 'LENDING': return <LendingIcon fontSize="large" />
      case 'INSURANCE': return <InsuranceIcon fontSize="large" />
      case 'CRYPTO': return <CryptoIcon fontSize="large" />
      default: return <InvestIcon fontSize="large" />
    }
  }

  const getProductColor = (type: string) => {
    switch (type) {
      case 'INVESTMENT': return '#3b82f6'
      case 'SAVINGS': return '#10b981'
      case 'LENDING': return '#f59e0b'
      case 'INSURANCE': return '#8b5cf6'
      case 'CRYPTO': return '#ef4444'
      default: return '#3b82f6'
    }
  }

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product)
    setDetailsDialog(true)
  }

  const handleInvest = (product: Product) => {
    navigate(`/investment/dashboard`)
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>Loading marketplace...</Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error">
        Error loading products: {(error as any).message}
      </Alert>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
        Marketplace
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Explore approved products from trusted partners ({approvedProducts.length} products)
      </Typography>

      {/* Search */}
      <TextField
        fullWidth
        placeholder="Search products..."
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      {/* Category Tabs */}
      <Tabs
        value={tabValue}
        onChange={(_, newValue) => setTabValue(newValue)}
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="All Products" />
        <Tab label="Investment" />
        <Tab label="Savings" />
        <Tab label="Lending" />
        <Tab label="Crypto" />
      </Tabs>

      {/* Products Grid */}
      <Grid container spacing={3}>
        {filteredProducts.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'all 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 } }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar sx={{ width: 56, height: 56, bgcolor: `${getProductColor(product.productType)}20`, color: getProductColor(product.productType) }}>
                    {getProductIcon(product.productType)}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {product.name}
                    </Typography>
                    <Chip label={product.productType} size="small" sx={{ mt: 0.5 }} />
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {product.description}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Partner
                  </Typography>
                  <Typography variant="caption" fontWeight={500}>
                    {product.partnerName}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Assets Available
                  </Typography>
                  <Chip label={`${product.assetsCount} assets`} size="small" variant="outlined" />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">
                    Min Investment
                  </Typography>
                  <Typography variant="caption" fontWeight={600} color="primary">
                    {product.currency} {product.minInvestment.toLocaleString()}
                  </Typography>
                </Box>
              </CardContent>
              <Divider />
              <CardActions sx={{ p: 2 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => handleViewDetails(product)}
                  sx={{ mr: 1 }}
                >
                  View Details
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => handleInvest(product)}
                  sx={{ boxShadow: 1 }}
                >
                  Invest Now
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredProducts.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="h6" color="text.secondary">
            No products available in this category
          </Typography>
        </Box>
      )}

      {/* Product Details Dialog */}
      <Dialog open={detailsDialog} onClose={() => setDetailsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ width: 48, height: 48, bgcolor: `${getProductColor(selectedProduct?.productType || '')}20`, color: getProductColor(selectedProduct?.productType || '') }}>
              {getProductIcon(selectedProduct?.productType || '')}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                {selectedProduct?.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {selectedProduct?.code}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedProduct && (
            <Box>
              <Alert severity="info" sx={{ mb: 3 }}>
                This product has been approved and is available for investment
              </Alert>

              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Description
              </Typography>
              <Typography variant="body2" sx={{ mb: 3 }}>
                {selectedProduct.description}
              </Typography>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Partner
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {selectedProduct.partnerName}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Product Type
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {selectedProduct.productType}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Min Investment
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {selectedProduct.currency} {selectedProduct.minInvestment.toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Max Investment
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {selectedProduct.currency} {selectedProduct.maxInvestment.toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Available Assets ({selectedProduct.assetsCount})
              </Typography>

              <List dense>
                {displayAssets.slice(0, 5).map((asset) => (
                  <ListItem key={asset.id} sx={{ px: 0 }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" fontWeight={500}>
                            {asset.name}
                          </Typography>
                          <Chip label={asset.symbol} size="small" variant="outlined" />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            {asset.description}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="caption" fontWeight={600}>
                              {selectedProduct.currency} {asset.currentPrice.toLocaleString()}
                            </Typography>
                            {asset.change24h !== undefined && (
                              <Typography
                                variant="caption"
                                sx={{
                                  color: asset.change24h >= 0 ? 'success.main' : 'error.main',
                                  fontWeight: 600,
                                }}
                              >
                                {asset.change24h >= 0 ? '+' : ''}{asset.change24h}%
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>

              {displayAssets.length > 5 && (
                <Typography variant="caption" color="text.secondary">
                  + {displayAssets.length - 5} more assets available
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setDetailsDialog(false)}>Close</Button>
          <Button
            variant="contained"
            onClick={() => {
              setDetailsDialog(false)
              handleInvest(selectedProduct!)
            }}
            sx={{ boxShadow: 1 }}
          >
            Invest Now
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Marketplace
