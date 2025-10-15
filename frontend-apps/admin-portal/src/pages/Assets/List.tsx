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
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Api as ApiIcon,
  Storage as StorageIcon,
} from '@mui/icons-material'
import { assetsAPI, Asset } from '../../services/assets'
import { assetDataAPI, AssetDataPoint } from '../../services/assetData'
import { enrichAssetsWithLatestData } from '../../utils/assetDataSync'

const AssetsList = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [tabValue, setTabValue] = useState(0)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null)

  // Fetch assets from API
  const { data: rawAssets = [], isLoading: loadingAssets, error } = useQuery({
    queryKey: ['assets'],
    queryFn: () => assetsAPI.getAll(),
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  // Fetch all asset data points to enrich assets with latest prices
  const { data: allDataPoints = [], isLoading: loadingData } = useQuery({
    queryKey: ['allAssetData'],
    queryFn: () => assetDataAPI.getAll(),
    refetchInterval: 30000,
  })

  // Enrich assets with latest data points
  const allAssets = rawAssets.map(asset => {
    // Find latest NAV or market price for this asset
    const assetDataPoints = allDataPoints.filter(dp => dp.assetId === asset.id)
    const latestNav = assetDataPoints
      .filter(dp => dp.dataType === 'NAV')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
    
    const latestPrice = assetDataPoints
      .filter(dp => dp.dataType === 'MARKET_PRICE')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
    
    const latestData = latestNav || latestPrice
    
    if (latestData) {
      // Override price with latest data
      return {
        ...asset,
        currentPrice: latestData.value,
        navPerUnit: latestData.value,
        lastDataUpdate: latestData.timestamp,
        hasDataIntegration: true,
      }
    }
    
    return asset
  })

  const isLoading = loadingAssets || loadingData

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: assetsAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      console.log('Asset deleted successfully')
      handleMenuClose()
    },
    onError: (error: any) => {
      console.log(`Error deleting asset: ${error.response?.data?.message || error.message}`)
    },
  })

  const filteredAssets = allAssets.filter((a) => {
    if (tabValue === 0) return true // All
    if (tabValue === 1) return a.status === 'PENDING_APPROVAL'
    if (tabValue === 2) return a.status === 'ACTIVE'
    if (tabValue === 3) return a.status === 'REJECTED'
    return true
  })

  const stats = {
    total: allAssets.length,
    pending: allAssets.filter((a) => a.status === 'PENDING_APPROVAL').length,
    active: allAssets.filter((a) => a.status === 'ACTIVE').length,
    rejected: allAssets.filter((a) => a.status === 'REJECTED').length,
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, assetId: string) => {
    setAnchorEl(event.currentTarget)
    setSelectedAsset(assetId)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedAsset(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success'
      case 'PENDING_APPROVAL':
        return 'warning'
      case 'REJECTED':
        return 'error'
      default:
        return 'default'
    }
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
        Error loading assets: {(error as any).message}
      </Alert>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ mb: 0.5, fontWeight: 700 }}>
            Asset Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage all assets across products and partners
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ApiIcon />}
            onClick={() => navigate('/assets/partner-requests')}
          >
            Partner Requests
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/assets/create')}
            sx={{ boxShadow: 1 }}
          >
            Add Asset
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Total Assets
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
                Rejected
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'error.main' }}>
                {stats.rejected}
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
          <Tab label={`Rejected (${stats.rejected})`} />
        </Tabs>
      </Paper>

      {/* Assets Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Product</TableCell>
              <TableCell>Partner</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Change 24h</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAssets.map((asset) => (
              <TableRow key={asset.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {asset.submissionSource === 'PARTNER_API' && (
                      <ApiIcon fontSize="small" color="primary" titleAccess="Submitted via Partner API" />
                    )}
                    <Typography variant="body2" fontWeight={600} fontFamily="monospace">
                      {asset.code}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={500}>
                    {asset.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {asset.category}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip label={asset.assetType} size="small" />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={asset.productName} 
                    size="small" 
                    variant="filled"
                    color="info"
                    sx={{ fontWeight: 500, fontSize: '0.75rem' }}
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={asset.partnerName} 
                    size="small" 
                    variant="filled"
                    color="primary"
                    sx={{ fontWeight: 500, fontSize: '0.75rem' }}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={500}>
                    {asset.currency} {asset.currentPrice.toLocaleString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  {asset.change24h !== undefined && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {asset.change24h >= 0 ? (
                        <TrendingUpIcon fontSize="small" color="success" />
                      ) : (
                        <TrendingDownIcon fontSize="small" color="error" />
                      )}
                      <Typography
                        variant="body2"
                        fontWeight={500}
                        color={asset.change24h >= 0 ? 'success.main' : 'error.main'}
                      >
                        {asset.change24h >= 0 ? '+' : ''}{asset.change24h}%
                      </Typography>
                    </Box>
                  )}
                </TableCell>
                <TableCell>
                  <Chip
                    label={asset.status}
                    color={getStatusColor(asset.status)}
                    size="small"
                    sx={{ fontWeight: 500 }}
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, asset.id)}
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
        <MenuItem onClick={() => { navigate(`/assets/${selectedAsset}`); handleMenuClose(); }}>
          <ViewIcon fontSize="small" sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={() => { navigate(`/assets/${selectedAsset}/edit`); handleMenuClose(); }}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit Asset
        </MenuItem>
        <MenuItem onClick={() => { navigate(`/assets/${selectedAsset}/data-integrations`); handleMenuClose(); }}>
          <StorageIcon fontSize="small" sx={{ mr: 1 }} />
          Data & Integrations
        </MenuItem>
        <MenuItem 
          onClick={() => {
            if (selectedAsset && window.confirm('Are you sure you want to delete this asset?')) {
              deleteMutation.mutate(selectedAsset)
            }
          }} 
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete Asset
        </MenuItem>
      </Menu>
    </Box>
  )
}

export default AssetsList

