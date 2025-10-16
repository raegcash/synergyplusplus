import { useState } from 'react'
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Switch,
  Avatar,
  LinearProgress,
  Chip,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material'
import {
  Visibility as ViewIcon,
  MoreVert as MoreIcon,
} from '@mui/icons-material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productsAPI } from '../../services/products'
import { featuresAPI } from '../../services/features'
import { changeRequestsAPI } from '../../services/changeRequests'
import FeatureManagementDrawer from '../../components/FeatureManagementDrawer'

interface MetricCardProps {
  title: string
  value: string
  subtitle: string
  color: string
}

const MetricCard = ({ title, value, subtitle, color }: MetricCardProps) => (
  <Card>
    <CardContent>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {title}
      </Typography>
      <Typography variant="h3" sx={{ mb: 0.5, fontWeight: 700, color }}>
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {subtitle}
      </Typography>
    </CardContent>
  </Card>
)

const ProductsAndFeatures = () => {
  const queryClient = useQueryClient()
  const [selectedProduct, setSelectedProduct] = useState<{ code: string; name: string } | null>(null)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [menuProductCode, setMenuProductCode] = useState<string>('')

  // Fetch hypercare-eligible products (ACTIVE with ACTIVE partners having ACTIVE assets)
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['hypercare-products'],
    queryFn: () => productsAPI.getHypercareEligible(),
  })

  // Fetch all features
  const { data: allFeatures = [] } = useQuery({
    queryKey: ['features'],
    queryFn: () => featuresAPI.getAll(),
  })

  // Fetch pending change requests to show "in progress" state
  const { data: pendingChangeRequests = [] } = useQuery({
    queryKey: ['changeRequests', 'pending'],
    queryFn: () => changeRequestsAPI.getPending(),
    refetchInterval: 3000, // Refresh every 3 seconds
  })

  // Helper function to check if a change is pending for a product
  const getPendingChange = (productId: string, action: 'OPERATIONAL_TOGGLE' | 'WHITELIST_TOGGLE' | 'MAINTENANCE_TOGGLE') => {
    return pendingChangeRequests.find(
      cr => cr.productId === productId && cr.action === action && cr.status === 'PENDING'
    )
  }

  // Mutations - Toggle changes are applied immediately AND create approval request
  const toggleMaintenanceMutation = useMutation({
    mutationFn: async (data: { id: string; code: string; name: string; currentValue: boolean }) => {
      // First, update the database immediately
      await productsAPI.toggleMaintenance(data.id)
      
      // Then create a change request for tracking/approval
      return changeRequestsAPI.create({
        action: 'MAINTENANCE_TOGGLE',
        productId: data.id,
        productCode: data.code,
        productName: data.name,
        currentValue: data.currentValue,
        proposedValue: !data.currentValue,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['changeRequests'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      console.log('Maintenance mode changed and submitted for approval.')
    },
    onError: (error) => {
      console.error('Failed to toggle maintenance mode:', error)
      // Revert the change if it fails
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })

  const toggleWhitelistMutation = useMutation({
    mutationFn: async (data: { id: string; code: string; name: string; currentValue: boolean }) => {
      // First, update the database immediately
      await productsAPI.toggleWhitelist(data.id)
      
      // Then create a change request for tracking/approval
      return changeRequestsAPI.create({
        action: 'WHITELIST_TOGGLE',
        productId: data.id,
        productCode: data.code,
        productName: data.name,
        currentValue: data.currentValue,
        proposedValue: !data.currentValue,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['changeRequests'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      console.log('Whitelist mode changed and submitted for approval.')
    },
    onError: (error) => {
      console.error('Failed to toggle whitelist mode:', error)
      // Revert the change if it fails
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })

  const toggleOperationalMutation = useMutation({
    mutationFn: async (data: { id: string; code: string; name: string; currentValue: string }) => {
      const newStatus = data.currentValue === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'
      
      // First, update the database immediately
      await productsAPI.update(data.id, { status: newStatus } as any)
      
      // Then create a change request for tracking/approval
      return changeRequestsAPI.create({
        action: 'OPERATIONAL_TOGGLE',
        productId: data.id,
        productCode: data.code,
        productName: data.name,
        currentValue: data.currentValue,
        proposedValue: newStatus,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['changeRequests'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      console.log('Operational status changed and submitted for approval.')
    },
    onError: (error) => {
      console.error('Failed to toggle operational status:', error)
      // Revert the change if it fails
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, productCode: string) => {
    setAnchorEl(event.currentTarget)
    setMenuProductCode(productCode)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setMenuProductCode('')
  }

  const handleViewFeatures = () => {
    const product = products.find(p => p.code === menuProductCode)
    if (product) {
      setSelectedProduct({ code: product.code, name: product.name })
    }
    handleMenuClose()
  }

  // Calculate metrics
  const totalProducts = products.length
  const maintenanceCount = products.filter(p => p.maintenanceMode).length
  const totalFeatures = products.reduce((sum, p) => sum + (p.featuresCount || 0), 0)
  const enabledFeatures = products.reduce((sum, p) => sum + (p.enabledFeaturesCount || 0), 0)

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
            Products & Features
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage product settings and feature toggles
          </Typography>
        </Box>
      </Box>

      {/* Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Products"
            value={totalProducts.toString()}
            subtitle="Active in system"
            color="primary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Maintenance"
            value={maintenanceCount.toString()}
            subtitle="Under maintenance"
            color="error.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Features"
            value={totalFeatures.toString()}
            subtitle="Across all products"
            color="info.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Enabled Features"
            value={enabledFeatures.toString()}
            subtitle={`${totalFeatures > 0 ? Math.round((enabledFeatures / totalFeatures) * 100) : 0}% active`}
            color="success.main"
          />
        </Grid>
      </Grid>

      {/* Products Grid */}
      {isLoading ? (
        <Typography color="text.secondary">Loading products...</Typography>
      ) : products.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No active products yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Products must be created and approved in the Products module before they appear here
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {products.map((product) => {
            const productFeatures = allFeatures.filter(f => f.productId === product.code)
            const featuresTotal = productFeatures.length
            const featuresEnabled = productFeatures.filter(f => f.enabled).length
            const featureProgress = featuresTotal > 0 ? (featuresEnabled / featuresTotal) * 100 : 0

            return (
              <Grid item xs={12} sm={6} md={4} key={product.id}>
                <Card>
                  <CardContent>
                    {/* Product Header */}
                    <Box sx={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          sx={{
                            width: 40,
                            height: 40,
                            bgcolor: product.maintenanceMode ? 'warning.main' : 'primary.main',
                            fontWeight: 700,
                            fontSize: '0.875rem',
                          }}
                        >
                          {product.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                              {product.name}
                            </Typography>
                            <Chip
                              label={product.status}
                              size="small"
                              color={
                                product.status === 'ACTIVE' ? 'success' :
                                product.status === 'PENDING_APPROVAL' ? 'warning' :
                                product.status === 'SUSPENDED' ? 'error' : 'default'
                              }
                              sx={{ height: 20, fontSize: '0.65rem' }}
                            />
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {product.code}
                          </Typography>
                        </Box>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, product.code)}
                      >
                        <MoreIcon />
                      </IconButton>
                    </Box>

                    {/* Operational Toggle */}
                    {(() => {
                      const pendingChange = getPendingChange(product.id, 'OPERATIONAL_TOGGLE')
                      const isPending = !!pendingChange
                      return (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            py: 1,
                            borderRadius: 1,
                            bgcolor: isPending ? 'warning.lighter' : 
                                     product.status === 'SUSPENDED' ? 'error.lighter' : 'success.lighter',
                            px: 1.5,
                            mb: 1,
                            transition: 'all 0.2s',
                            border: isPending ? '2px solid' : 'none',
                            borderColor: 'warning.main',
                          }}
                        >
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              Operational Status
                              {isPending && (
                                <Chip
                                  label="Pending Approval"
                                  size="small"
                                  color="warning"
                                  sx={{ ml: 1, height: 20, fontSize: '0.65rem' }}
                                />
                              )}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {isPending 
                                ? `Change to ${pendingChange.proposedValue} pending approval`
                                : product.status === 'ACTIVE' ? 'Product is active' : 'Product suspended'}
                            </Typography>
                          </Box>
                          <Switch
                            checked={product.status === 'ACTIVE'}
                            onChange={() => {
                              if (!isPending && !toggleOperationalMutation.isPending) {
                                toggleOperationalMutation.mutate({
                                  id: product.id,
                                  code: product.code,
                                  name: product.name,
                                  currentValue: product.status
                                })
                              }
                            }}
                            disabled={toggleOperationalMutation.isPending || isPending}
                            size="small"
                            color={isPending ? 'warning' : product.status === 'ACTIVE' ? 'success' : 'error'}
                            sx={isPending ? {
                              '& .MuiSwitch-thumb': {
                                bgcolor: 'warning.main',
                              },
                              '& .MuiSwitch-track': {
                                bgcolor: 'warning.light',
                              },
                            } : {}}
                          />
                        </Box>
                      )
                    })()}

                    {/* Whitelist Mode */}
                    {(() => {
                      const pendingChange = getPendingChange(product.id, 'WHITELIST_TOGGLE')
                      const isPending = !!pendingChange
                      return (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            py: 1,
                            borderRadius: 1,
                            bgcolor: isPending || product.whitelistMode ? 'warning.lighter' : 'transparent',
                            px: isPending || product.whitelistMode ? 1.5 : 0,
                            mb: 1,
                            transition: 'all 0.2s',
                            border: isPending ? '2px solid' : 'none',
                            borderColor: 'warning.main',
                          }}
                        >
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              Whitelist Mode
                              {isPending && (
                                <Chip
                                  label="Pending Approval"
                                  size="small"
                                  color="warning"
                                  sx={{ ml: 1, height: 20, fontSize: '0.65rem' }}
                                />
                              )}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {isPending 
                                ? `Change to ${pendingChange.proposedValue ? 'ON' : 'OFF'} pending approval`
                                : 'Restrict to whitelist'}
                            </Typography>
                          </Box>
                          <Switch
                            checked={product.whitelistMode}
                            onChange={() => {
                              if (!isPending && !toggleWhitelistMutation.isPending) {
                                toggleWhitelistMutation.mutate({
                                  id: product.id,
                                  code: product.code,
                                  name: product.name,
                                  currentValue: product.whitelistMode
                                })
                              }
                            }}
                            disabled={toggleWhitelistMutation.isPending || isPending}
                            size="small"
                            color="warning"
                            sx={isPending ? {
                              '& .MuiSwitch-thumb': {
                                bgcolor: 'warning.main',
                              },
                              '& .MuiSwitch-track': {
                                bgcolor: 'warning.light',
                              },
                            } : {}}
                          />
                        </Box>
                      )
                    })()}

                    {/* Maintenance Mode */}
                    {(() => {
                      const pendingChange = getPendingChange(product.id, 'MAINTENANCE_TOGGLE')
                      const isPending = !!pendingChange
                      return (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            py: 1,
                            borderRadius: 1,
                            bgcolor: isPending ? 'warning.lighter' :
                                     product.maintenanceMode ? 'error.lighter' : 'transparent',
                            px: isPending || product.maintenanceMode ? 1.5 : 0,
                            mb: 2,
                            transition: 'all 0.2s',
                            border: isPending ? '2px solid' : 'none',
                            borderColor: 'warning.main',
                          }}
                        >
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              Maintenance Mode
                              {isPending && (
                                <Chip
                                  label="Pending Approval"
                                  size="small"
                                  color="warning"
                                  sx={{ ml: 1, height: 20, fontSize: '0.65rem' }}
                                />
                              )}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {isPending 
                                ? `Change to ${pendingChange.proposedValue ? 'ON' : 'OFF'} pending approval`
                                : 'Temporarily disable'}
                            </Typography>
                          </Box>
                          <Switch
                            checked={product.maintenanceMode}
                            onChange={() => {
                              if (!isPending && !toggleMaintenanceMutation.isPending) {
                                toggleMaintenanceMutation.mutate({
                                  id: product.id,
                                  code: product.code,
                                  name: product.name,
                                  currentValue: product.maintenanceMode
                                })
                              }
                            }}
                            disabled={toggleMaintenanceMutation.isPending || isPending}
                            size="small"
                            color={isPending ? 'warning' : 'error'}
                            sx={isPending ? {
                              '& .MuiSwitch-thumb': {
                                bgcolor: 'warning.main',
                              },
                              '& .MuiSwitch-track': {
                                bgcolor: 'warning.light',
                              },
                            } : {}}
                          />
                        </Box>
                      )
                    })()}

                    {/* Feature Status */}
                    <Box sx={{ mb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" fontWeight={500}>
                          Feature Status
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {featuresEnabled}/{featuresTotal}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={featureProgress}
                        sx={{
                          height: 6,
                          borderRadius: 1,
                          bgcolor: 'action.hover',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: featureProgress === 100 ? 'success.main' : 'primary.main',
                          },
                        }}
                      />
                    </Box>

                    {/* View Features Button */}
                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      startIcon={<ViewIcon />}
                      onClick={() => setSelectedProduct({ code: product.code, name: product.name })}
                      sx={{ mt: 2 }}
                    >
                      View Features
                    </Button>

                    {/* Last Updated */}
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                      Updated {new Date(product.updatedAt || product.createdAt).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewFeatures}>
          <ViewIcon fontSize="small" sx={{ mr: 1 }} />
          View Features
        </MenuItem>
        <MenuItem onClick={() => {
          navigate(`/products/${menuProductCode}`)
          handleMenuClose()
        }}>
          View Product Details
        </MenuItem>
      </Menu>

      {/* Feature Management Drawer */}
      {selectedProduct && (
        <FeatureManagementDrawer
          open={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          productCode={selectedProduct.code}
          productName={selectedProduct.name}
        />
      )}
    </Box>
  )
}

export default ProductsAndFeatures

