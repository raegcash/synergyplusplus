import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Divider,
  Switch,
} from '@mui/material'
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  Category as ProductIcon,
  BusinessCenter as PartnerIcon,
  ShowChart as AssetIcon,
  Settings as ChangeIcon,
} from '@mui/icons-material'
import { productsAPI, Product } from '../../services/products'
import { partnersAPI, Partner } from '../../services/partners'
import { assetsAPI, Asset } from '../../services/assets'
import { changeRequestsAPI, ChangeRequest } from '../../services/changeRequests'
import { 
  WorkflowIndicator, 
  getProductWorkflow, 
  getPartnerWorkflow, 
  getAssetWorkflow 
} from '../../components/WorkflowIndicator'

type ApprovalItem = {
  id: string
  type: 'PRODUCT' | 'PARTNER' | 'ASSET' | 'CHANGE_REQUEST'
  code: string
  name: string
  category: string
  submittedBy?: string
  submittedAt: string
  metadata?: any
}

const ApprovalsIndex = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [tabValue, setTabValue] = useState(0) // 0 = All, 1 = Products, 2 = Partners, 3 = Assets
  const [detailsDialog, setDetailsDialog] = useState(false)
  const [approvalDialog, setApprovalDialog] = useState(false)
  const [rejectionDialog, setRejectionDialog] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ApprovalItem | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  // Fetch pending products
  const { data: pendingProducts = [], isLoading: loadingProducts } = useQuery({
    queryKey: ['products', 'pending'],
    queryFn: () => productsAPI.getPending(),
    refetchInterval: 5000,
  })

  // Fetch pending partners
  const { data: pendingPartners = [], isLoading: loadingPartners } = useQuery({
    queryKey: ['partners', 'pending'],
    queryFn: () => partnersAPI.getPending(),
    refetchInterval: 5000,
  })

  // Fetch pending assets
  const { data: pendingAssets = [], isLoading: loadingAssets } = useQuery({
    queryKey: ['assets', 'pending'],
    queryFn: () => assetsAPI.getPending(),
    refetchInterval: 5000,
  })

  // Fetch pending change requests
  const { data: pendingChangeRequests = [], isLoading: loadingChangeRequests } = useQuery({
    queryKey: ['changeRequests', 'pending'],
    queryFn: () => changeRequestsAPI.getPending(),
    refetchInterval: 5000,
  })

  // Product approve mutation
  const approveProductMutation = useMutation({
    mutationFn: (id: string) => productsAPI.approve(id, 'admin@company.com'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      console.log('Product approved successfully!')
      setApprovalDialog(false)
      setSelectedItem(null)
    },
    onError: (error: any) => {
      console.log(`Error: ${error.message}`)
    },
  })

  // Partner approve mutation
  const approvePartnerMutation = useMutation({
    mutationFn: (id: string) => partnersAPI.approve(id, 'admin@company.com'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] })
      console.log('Partner approved successfully!')
      setApprovalDialog(false)
      setSelectedItem(null)
    },
    onError: (error: any) => {
      console.log(`Error: ${error.message}`)
    },
  })

  // Product reject mutation
  const rejectProductMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      productsAPI.reject(id, reason, 'admin@company.com'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      console.log('Product rejected')
      setRejectionDialog(false)
      setSelectedItem(null)
      setRejectionReason('')
    },
  })

  // Partner reject mutation
  const rejectPartnerMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      partnersAPI.reject(id, reason, 'admin@company.com'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] })
      console.log('Partner rejected')
      setRejectionDialog(false)
      setSelectedItem(null)
      setRejectionReason('')
    },
  })

  // Asset approve mutation
  const approveAssetMutation = useMutation({
    mutationFn: (id: string) => assetsAPI.approve(id, 'admin@company.com'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      console.log('Asset approved successfully!')
      setApprovalDialog(false)
      setSelectedItem(null)
    },
    onError: (error: any) => {
      console.log(`Error: ${error.message}`)
    },
  })

  // Asset reject mutation
  const rejectAssetMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      assetsAPI.reject(id, reason, 'admin@company.com'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      console.log('Asset rejected')
      setRejectionDialog(false)
      setSelectedItem(null)
      setRejectionReason('')
    },
  })

  // Change request approve mutation
  const approveChangeRequestMutation = useMutation({
    mutationFn: async (id: string) => {
      // Change is already applied in the database, just approve the request for tracking
      const changeRequest = await changeRequestsAPI.approve(id, 'admin@company.com')
      return changeRequest
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['changeRequests'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      console.log('Change request approved! (Change was already applied)')
      setApprovalDialog(false)
      setSelectedItem(null)
    },
    onError: (error: any) => {
      console.log(`Error: ${error.message}`)
    },
  })

  // Change request reject mutation
  const rejectChangeRequestMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      // Get the change request to know what to revert
      const changeRequest = pendingChangeRequests.find(cr => cr.id === id)
      
      if (changeRequest) {
        // Revert the change back to original value
        const { action, productId, currentValue } = changeRequest
        
        if (action === 'OPERATIONAL_TOGGLE') {
          // Revert status to original value
          await productsAPI.update(productId, { status: currentValue } as any)
        } else if (action === 'WHITELIST_TOGGLE') {
          // Toggle back if current state doesn't match original
          await productsAPI.toggleWhitelist(productId)
        } else if (action === 'MAINTENANCE_TOGGLE') {
          // Toggle back if current state doesn't match original
          await productsAPI.toggleMaintenance(productId)
        }
      }
      
      // Then reject the change request
      return changeRequestsAPI.reject(id, reason, 'admin@company.com')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['changeRequests'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      console.log('Change request rejected and reverted')
      setRejectionDialog(false)
      setSelectedItem(null)
      setRejectionReason('')
    },
    onError: (error: any) => {
      console.log(`Error: ${error.message}`)
    },
  })

  // Combine all pending items
  const allPendingItems: ApprovalItem[] = [
    ...pendingProducts.map((p: Product) => ({
      id: p.id,
      type: 'PRODUCT' as const,
      code: p.code,
      name: p.name,
      category: p.productType,
      submittedBy: p.submittedBy,
      submittedAt: p.submittedAt || p.createdAt,
      metadata: p,
    })),
    ...pendingPartners.map((p: Partner) => ({
      id: p.id,
      type: 'PARTNER' as const,
      code: p.code,
      name: p.name,
      category: p.type,
      submittedAt: p.createdAt,
      metadata: p,
    })),
    ...pendingAssets.map((a: Asset) => ({
      id: a.id,
      type: 'ASSET' as const,
      code: a.code,
      name: a.name,
      category: a.assetType,
      submittedBy: a.submittedBy,
      submittedAt: a.submittedAt || a.createdAt,
      metadata: a,
    })),
    ...pendingChangeRequests.map((cr: ChangeRequest) => ({
      id: cr.id,
      type: 'CHANGE_REQUEST' as const,
      code: cr.productCode,
      name: cr.productName,
      category: cr.action.replace('_', ' '),
      submittedBy: cr.requestedBy,
      submittedAt: cr.requestedAt,
      metadata: cr,
    })),
  ].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())

  const filteredItems = allPendingItems.filter((item) => {
    if (tabValue === 0) return true // All
    if (tabValue === 1) return item.type === 'PRODUCT'
    if (tabValue === 2) return item.type === 'PARTNER'
    if (tabValue === 3) return item.type === 'ASSET'
    if (tabValue === 4) return item.type === 'CHANGE_REQUEST'
    return true
  })

  const stats = {
    total: allPendingItems.length,
    products: pendingProducts.length,
    partners: pendingPartners.length,
    assets: pendingAssets.length,
    changes: pendingChangeRequests.length,
  }

  const handleViewDetails = (item: ApprovalItem) => {
    setSelectedItem(item)
    setDetailsDialog(true)
  }

  const handleApprove = (item: ApprovalItem) => {
    setSelectedItem(item)
    setApprovalDialog(true)
  }

  const handleReject = (item: ApprovalItem) => {
    setSelectedItem(item)
    setRejectionDialog(true)
  }

  const confirmApproval = () => {
    if (!selectedItem) return

    if (selectedItem.type === 'PRODUCT') {
      approveProductMutation.mutate(selectedItem.id)
    } else if (selectedItem.type === 'PARTNER') {
      approvePartnerMutation.mutate(selectedItem.id)
    } else if (selectedItem.type === 'ASSET') {
      approveAssetMutation.mutate(selectedItem.id)
    } else if (selectedItem.type === 'CHANGE_REQUEST') {
      approveChangeRequestMutation.mutate(selectedItem.id)
    }
  }

  const confirmRejection = () => {
    if (!selectedItem || !rejectionReason.trim()) return

    if (selectedItem.type === 'PRODUCT') {
      rejectProductMutation.mutate({ id: selectedItem.id, reason: rejectionReason })
    } else if (selectedItem.type === 'PARTNER') {
      rejectPartnerMutation.mutate({ id: selectedItem.id, reason: rejectionReason })
    } else if (selectedItem.type === 'ASSET') {
      rejectAssetMutation.mutate({ id: selectedItem.id, reason: rejectionReason })
    } else if (selectedItem.type === 'CHANGE_REQUEST') {
      rejectChangeRequestMutation.mutate({ id: selectedItem.id, reason: rejectionReason })
    }
  }

  const isLoading = loadingProducts || loadingPartners || loadingAssets || loadingChangeRequests

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 0.5, fontWeight: 700 }}>
          Approvals Center
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Review and approve all pending requests
        </Typography>
      </Box>

      {/* Workflow Hierarchy Info */}
      <Alert severity="info" sx={{ mb: 3 }} variant="outlined">
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
          📊 Workflow Hierarchy & Approval Process
        </Typography>
        <Typography variant="body2" component="div">
          <strong>Level 1: Products</strong> - Create and approve products first. Products become ACTIVE after approval.
          <br />
          <strong>Level 2: Partners</strong> - Create partners and map them to ACTIVE products. Partners become ACTIVE after approval.
          <br />
          <strong>Level 3: Assets</strong> - Create assets and link to ACTIVE products and their mapped partners. Assets become ACTIVE after approval.
          <br /><br />
          <em>💡 Each approval item shows its current workflow status. Use the workflow indicators to see where each item is in the process.</em>
        </Typography>
      </Alert>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ cursor: 'pointer', transition: 'all 0.2s', '&:hover': { boxShadow: 3 } }} onClick={() => setTabValue(0)}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Total Pending
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'warning.main' }}>
                {stats.total}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                All approval requests
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ cursor: 'pointer', transition: 'all 0.2s', '&:hover': { boxShadow: 3 } }} onClick={() => setTabValue(1)}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <ProductIcon fontSize="small" color="primary" />
                <Typography variant="body2" color="text.secondary">
                  Products
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {stats.products}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Pending product approvals
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ cursor: 'pointer', transition: 'all 0.2s', '&:hover': { boxShadow: 3 } }} onClick={() => setTabValue(2)}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <PartnerIcon fontSize="small" color="secondary" />
                <Typography variant="body2" color="text.secondary">
                  Partners
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'secondary.main' }}>
                {stats.partners}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Pending partner approvals
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ cursor: 'pointer', transition: 'all 0.2s', '&:hover': { boxShadow: 3 } }} onClick={() => setTabValue(3)}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <AssetIcon fontSize="small" color="success" />
                <Typography variant="body2" color="text.secondary">
                  Assets
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'success.main' }}>
                {stats.assets}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Pending asset approvals
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
          <Tab label={`Products (${stats.products})`} icon={<ProductIcon />} iconPosition="start" />
          <Tab label={`Partners (${stats.partners})`} icon={<PartnerIcon />} iconPosition="start" />
          <Tab label={`Assets (${stats.assets})`} icon={<AssetIcon />} iconPosition="start" />
          <Tab label={`Changes (${stats.changes})`} sx={{ textTransform: 'none' }} />
        </Tabs>
      </Paper>

      {/* Approvals Table */}
      {filteredItems.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <ApproveIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            All Caught Up!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            There are no pending approvals at the moment.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Code</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Workflow Status</TableCell>
                <TableCell>Submitted By</TableCell>
                <TableCell>Submitted At</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={`${item.type}-${item.id}`} hover>
                  <TableCell>
                    <Chip
                      icon={
                        item.type === 'PRODUCT' ? <ProductIcon /> :
                        item.type === 'PARTNER' ? <PartnerIcon /> :
                        item.type === 'ASSET' ? <AssetIcon /> :
                        <ChangeIcon />
                      }
                      label={item.type === 'CHANGE_REQUEST' ? 'CHANGE' : item.type}
                      color={
                        item.type === 'PRODUCT' ? 'primary' :
                        item.type === 'PARTNER' ? 'secondary' :
                        item.type === 'ASSET' ? 'success' :
                        'warning'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace" fontWeight={500}>
                      {item.code}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {item.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={item.category} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    {item.type === 'PRODUCT' && (
                      <WorkflowIndicator
                        steps={getProductWorkflow(
                          'PENDING_APPROVAL',
                          false,
                          false
                        )}
                        size="small"
                        orientation="vertical"
                      />
                    )}
                    {item.type === 'PARTNER' && (
                      <WorkflowIndicator
                        steps={getPartnerWorkflow(
                          'PENDING',
                          item.metadata?.productsCount > 0
                        )}
                        size="small"
                        orientation="vertical"
                      />
                    )}
                    {item.type === 'ASSET' && (
                      <WorkflowIndicator
                        steps={getAssetWorkflow(
                          'PENDING_APPROVAL',
                          item.metadata?.productName,
                          item.metadata?.partnerName
                        )}
                        size="small"
                        orientation="vertical"
                      />
                    )}
                  </TableCell>
                  <TableCell>{item.submittedBy || 'Admin'}</TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(item.submittedAt).toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(item.submittedAt).toLocaleTimeString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      startIcon={<ViewIcon />}
                      onClick={() => handleViewDetails(item)}
                      sx={{ mr: 1 }}
                    >
                      View
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      startIcon={<ApproveIcon />}
                      onClick={() => handleApprove(item)}
                      sx={{ mr: 1 }}
                    >
                      Approve
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      startIcon={<RejectIcon />}
                      onClick={() => handleReject(item)}
                    >
                      Reject
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Details Dialog */}
      <Dialog open={detailsDialog} onClose={() => setDetailsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {selectedItem?.type === 'PRODUCT' ? <ProductIcon /> :
             selectedItem?.type === 'PARTNER' ? <PartnerIcon /> :
             <AssetIcon />}
            <Typography variant="h6">{selectedItem?.type} Details</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  {selectedItem.name}
                </Typography>
                <Chip label={selectedItem.code} size="small" sx={{ mr: 1 }} />
                <Chip
                  label={selectedItem.type}
                  color={
                    selectedItem.type === 'PRODUCT' ? 'primary' :
                    selectedItem.type === 'PARTNER' ? 'secondary' :
                    'success'
                  }
                  size="small"
                />
              </Grid>

              <Grid item xs={12}>
                <Divider />
              </Grid>

              {selectedItem.type === 'PRODUCT' && (
                <>
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" color="text.secondary">
                      Product Type
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {selectedItem.category}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" color="text.secondary">
                      Partner
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {(selectedItem.metadata as Product).partnerName}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      Description
                    </Typography>
                    <Typography variant="body2">
                      {(selectedItem.metadata as Product).description}
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                      Product Configuration
                    </Typography>
                  </Grid>

                  {/* Operational Status Toggle */}
                  <Grid item xs={12}>
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'success.lighter' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            Operational Status
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Enable this to make the product active after approval
                          </Typography>
                        </Box>
                        <Switch
                          checked={(selectedItem.metadata as Product).status === 'ACTIVE' || true}
                          color="success"
                          disabled
                        />
                      </Box>
                    </Paper>
                  </Grid>

                  {/* Whitelist Mode Toggle */}
                  <Grid item xs={12}>
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: (selectedItem.metadata as Product).whitelistMode ? 'warning.lighter' : 'background.paper' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            Whitelist Mode
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Restrict access to whitelisted users only
                          </Typography>
                        </Box>
                        <Chip
                          label={(selectedItem.metadata as Product).whitelistMode ? 'Enabled' : 'Disabled'}
                          size="small"
                          color={(selectedItem.metadata as Product).whitelistMode ? 'warning' : 'default'}
                        />
                      </Box>
                    </Paper>
                  </Grid>

                  {/* Maintenance Mode Toggle */}
                  <Grid item xs={12}>
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: (selectedItem.metadata as Product).maintenanceMode ? 'error.lighter' : 'background.paper' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            Maintenance Mode
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Temporarily disable product access
                          </Typography>
                        </Box>
                        <Chip
                          label={(selectedItem.metadata as Product).maintenanceMode ? 'Enabled' : 'Disabled'}
                          size="small"
                          color={(selectedItem.metadata as Product).maintenanceMode ? 'error' : 'default'}
                        />
                      </Box>
                    </Paper>
                  </Grid>
                </>
              )}

              {selectedItem.type === 'PARTNER' && (
                <>
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" color="text.secondary">
                      Partner Type
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {selectedItem.category}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" color="text.secondary">
                      Contact Email
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {(selectedItem.metadata as Partner).contactEmail}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" color="text.secondary">
                      Contact Phone
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {(selectedItem.metadata as Partner).contactPhone || '-'}
                    </Typography>
                  </Grid>
                </>
              )}

              {selectedItem.type === 'ASSET' && (
                <>
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" color="text.secondary">
                      Asset Type
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {selectedItem.category}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" color="text.secondary">
                      Product
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {(selectedItem.metadata as Asset).productName}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" color="text.secondary">
                      Partner
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {(selectedItem.metadata as Asset).partnerName}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" color="text.secondary">
                      Current Price
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {(selectedItem.metadata as Asset).currency} {((selectedItem.metadata as Asset).currentPrice || (selectedItem.metadata as Asset).price || 0).toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      Description
                    </Typography>
                    <Typography variant="body2">
                      {(selectedItem.metadata as Asset).description}
                    </Typography>
                  </Grid>
                </>
              )}

              {selectedItem.type === 'CHANGE_REQUEST' && (
                <>
                  <Grid item xs={12}>
                    <Alert severity="warning" variant="outlined">
                      <Typography variant="body2" fontWeight={600} gutterBottom>
                        Configuration Change Request
                      </Typography>
                      <Typography variant="caption">
                        This is a request to change a product configuration setting.
                      </Typography>
                    </Alert>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" color="text.secondary">
                      Action Type
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {selectedItem.category}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" color="text.secondary">
                      Product
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {(selectedItem.metadata as ChangeRequest).productName}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" color="text.secondary">
                      Current Value
                    </Typography>
                    <Chip 
                      label={String((selectedItem.metadata as ChangeRequest).currentValue)}
                      size="small"
                      color="default"
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" color="text.secondary">
                      Proposed Value
                    </Typography>
                    <Chip 
                      label={String((selectedItem.metadata as ChangeRequest).proposedValue)}
                      size="small"
                      color="warning"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Alert severity="info" variant="outlined">
                      <Typography variant="caption">
                        Approving this request will immediately apply the configuration change to the product.
                      </Typography>
                    </Alert>
                  </Grid>
                </>
              )}

              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  Submitted At
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {new Date(selectedItem.submittedAt).toLocaleString()}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialog(false)}>Close</Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<RejectIcon />}
            onClick={() => {
              setDetailsDialog(false)
              handleReject(selectedItem!)
            }}
          >
            Reject
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<ApproveIcon />}
            onClick={() => {
              setDetailsDialog(false)
              handleApprove(selectedItem!)
            }}
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>

      {/* Approval Confirmation Dialog */}
      <Dialog open={approvalDialog} onClose={() => setApprovalDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Approve {selectedItem?.type}</DialogTitle>
        <DialogContent>
          <Alert severity="success" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Type:</strong> {selectedItem?.type}
            </Typography>
            <Typography variant="body2">
              <strong>Name:</strong> {selectedItem?.name}
            </Typography>
            <Typography variant="body2">
              <strong>Code:</strong> {selectedItem?.code}
            </Typography>
          </Alert>
          <Typography variant="body2" sx={{ mt: 2 }}>
            Are you sure you want to approve this {selectedItem?.type.toLowerCase()}?
            {selectedItem?.type === 'PRODUCT' && ' It will be available in the marketplace.'}
            {selectedItem?.type === 'PARTNER' && ' It will be available for product assignment.'}
            {selectedItem?.type === 'ASSET' && ' It will be available for users to invest in.'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApprovalDialog(false)}>Cancel</Button>
          <Button variant="contained" color="success" onClick={confirmApproval} startIcon={<ApproveIcon />}>
            Confirm Approval
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={rejectionDialog} onClose={() => setRejectionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject {selectedItem?.type}</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>{selectedItem?.type}:</strong> {selectedItem?.name}
            </Typography>
          </Alert>
          <Typography variant="body2" sx={{ mt: 2, mb: 2 }}>
            Please provide a reason for rejection:
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Rejection Reason"
            placeholder="e.g., Incomplete documentation, compliance issues, etc."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectionDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={confirmRejection}
            disabled={!rejectionReason.trim()}
            startIcon={<RejectIcon />}
          >
            Confirm Rejection
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ApprovalsIndex

