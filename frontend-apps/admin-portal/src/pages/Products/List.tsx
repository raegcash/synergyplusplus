import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tabs,
  Tab,
  Menu,
  MenuItem,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material'
import {
  Add as AddIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material'
import { productsAPI } from '../../services/products'

const ProductsList = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [tabValue, setTabValue] = useState(0)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)

  // Fetch products from API
  const { data: allProducts = [], isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsAPI.getAll(),
    refetchInterval: 5000, // Refresh every 5 seconds
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: productsAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      console.log('Product deleted successfully')
      handleMenuClose()
    },
    onError: (error: any) => {
      console.log(`Error deleting product: ${error.response?.data?.message || error.message}`)
    },
  })

  const filteredProducts = allProducts.filter((p) => {
    if (tabValue === 0) return true // All
    if (tabValue === 1) return p.status === 'PENDING_APPROVAL'
    if (tabValue === 2) return p.status === 'ACTIVE'
    if (tabValue === 3) return p.status === 'DRAFT'
    return true
  })

  const stats = {
    total: allProducts.length,
    pending: allProducts.filter((p) => p.status === 'PENDING_APPROVAL').length,
    active: allProducts.filter((p) => p.status === 'ACTIVE').length,
    draft: allProducts.filter((p) => p.status === 'DRAFT').length,
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
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

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, productId: string) => {
    setAnchorEl(event.currentTarget)
    setSelectedProduct(productId)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedProduct(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
      case 'APPROVED':
        return 'success'
      case 'PENDING_APPROVAL':
        return 'warning'
      case 'DRAFT':
        return 'default'
      case 'REJECTED':
      case 'SUSPENDED':
        return 'error'
      default:
        return 'default'
    }
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ mb: 0.5, fontWeight: 700 }}>
            Products Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage all products in the marketplace
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/products/create')}
          sx={{ boxShadow: 1 }}
        >
          Create Product
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Total Products
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {stats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Pending Approval
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'warning.main' }}>
                {stats.pending}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Active
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'success.main' }}>
                {stats.active}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Draft
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                {stats.draft}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label={`All (${stats.total})`} />
          <Tab label={`Pending (${stats.pending})`} />
          <Tab label={`Active (${stats.active})`} />
          <Tab label={`Draft (${stats.draft})`} />
        </Tabs>
      </Paper>

      {/* Products Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product Code</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Partners Onboarded</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Assets</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight={600} fontFamily="monospace">
                    {product.code}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={500}>
                    {product.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip label={product.productType} size="small" />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {product.partners && product.partners.length > 0 ? (
                      product.partners.map((partner) => (
                        <Chip
                          key={partner.id}
                          label={partner.name}
                          size="small"
                          variant="outlined"
                          color="primary"
                          sx={{ fontWeight: 500, fontSize: '0.75rem' }}
                        />
                      ))
                    ) : (
                      <Chip label={product.partnerName} size="small" variant="outlined" color="default" />
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={product.status.replace('_', ' ')}
                    color={getStatusColor(product.status)}
                    size="small"
                    sx={{ fontWeight: 500 }}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={`${product.assetsCount} assets`}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, product.id)}
                  >
                    <MoreIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { navigate(`/products/${selectedProduct}`); handleMenuClose(); }}>
          <ViewIcon fontSize="small" sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={() => { navigate(`/products/${selectedProduct}/edit`); handleMenuClose(); }}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit Product
        </MenuItem>
        <MenuItem 
          onClick={() => {
            if (selectedProduct && window.confirm('Are you sure you want to delete this product?')) {
              deleteMutation.mutate(selectedProduct)
            }
          }} 
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete Product
        </MenuItem>
      </Menu>
    </Box>
  )
}

export default ProductsList

