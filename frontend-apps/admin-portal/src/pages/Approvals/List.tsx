import { useState } from 'react'
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
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material'
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material'
import { productsAPI, Product } from '../../services/products'

const ApprovalsList = () => {
  const queryClient = useQueryClient()
  const [detailsDialog, setDetailsDialog] = useState(false)
  const [approvalDialog, setApprovalDialog] = useState(false)
  const [rejectionDialog, setRejectionDialog] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  // Fetch pending products from API
  const { data: pendingProducts = [], isLoading, error } = useQuery({
    queryKey: ['products', 'pending'],
    queryFn: () => productsAPI.getPending(),
    refetchInterval: 5000, // Refresh every 5 seconds
  })

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: (id: string) => productsAPI.approve(id, 'admin@company.com'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      console.log('Product approved successfully and is now available in the marketplace!')
      setApprovalDialog(false)
      setSelectedProduct(null)
    },
    onError: (error: any) => {
      console.log(`Error approving product: ${error.response?.data?.message || error.message}`)
    },
  })

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      productsAPI.reject(id, reason, 'admin@company.com'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      console.log('Product rejected successfully')
      setRejectionDialog(false)
      setSelectedProduct(null)
      setRejectionReason('')
    },
    onError: (error: any) => {
      console.log(`Error rejecting product: ${error.response?.data?.message || error.message}`)
    },
  })

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product)
    setDetailsDialog(true)
  }

  const handleApprove = (product: Product) => {
    setSelectedProduct(product)
    setApprovalDialog(true)
  }

  const handleReject = (product: Product) => {
    setSelectedProduct(product)
    setRejectionDialog(true)
  }

  const confirmApproval = () => {
    if (selectedProduct) {
      approveMutation.mutate(selectedProduct.id)
    }
  }

  const confirmRejection = () => {
    if (selectedProduct && rejectionReason.trim()) {
      rejectMutation.mutate({ id: selectedProduct.id, reason: rejectionReason })
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
        Error loading pending products: {(error as any).message}
      </Alert>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 0.5, fontWeight: 700 }}>
          Pending Approvals
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Review and approve products for the marketplace
        </Typography>
      </Box>

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Pending Approval
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'warning.main' }}>
                {pendingProducts.length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Awaiting review
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Pending Table */}
      {pendingProducts.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <ApproveIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            All Caught Up!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            There are no pending product approvals at the moment.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Partner</TableCell>
                <TableCell>Submitted By</TableCell>
                <TableCell>Submitted At</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingProducts.map((product) => (
                <TableRow key={product.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {product.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                      {product.code}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={product.productType} size="small" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{product.partnerName}</Typography>
                  </TableCell>
                  <TableCell>{product.submittedBy || 'Admin'}</TableCell>
                  <TableCell>
                    {product.submittedAt 
                      ? new Date(product.submittedAt).toLocaleDateString()
                      : new Date(product.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      startIcon={<ViewIcon />}
                      onClick={() => handleViewDetails(product)}
                      sx={{ mr: 1 }}
                    >
                      View
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      startIcon={<ApproveIcon />}
                      onClick={() => handleApprove(product)}
                      sx={{ mr: 1 }}
                    >
                      Approve
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      startIcon={<RejectIcon />}
                      onClick={() => handleReject(product)}
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
        <DialogTitle>Product Details</DialogTitle>
        <DialogContent>
          {selectedProduct && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  {selectedProduct.name}
                </Typography>
                <Chip label={selectedProduct.code} size="small" sx={{ mr: 1 }} />
                <Chip label={selectedProduct.productType} size="small" color="primary" />
              </Grid>

              <Grid item xs={12}>
                <Divider />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">
                  Partner
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {selectedProduct.partnerName}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">
                  Partner Type
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {selectedProduct.partnerType}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">
                  Min Investment
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {selectedProduct.currency} {selectedProduct.minInvestment.toLocaleString()}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">
                  Max Investment
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {selectedProduct.currency} {selectedProduct.maxInvestment.toLocaleString()}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  Description
                </Typography>
                <Typography variant="body2">
                  {selectedProduct.description}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">
                  Assets Available
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {selectedProduct.assetsCount} assets
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">
                  Submitted By
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {selectedProduct.submittedBy}
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
              handleReject(selectedProduct!)
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
              handleApprove(selectedProduct!)
            }}
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>

      {/* Approval Confirmation Dialog */}
      <Dialog open={approvalDialog} onClose={() => setApprovalDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Approve Product</DialogTitle>
        <DialogContent>
          <Alert severity="success" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Product:</strong> {selectedProduct?.name}
            </Typography>
            <Typography variant="body2">
              <strong>Partner:</strong> {selectedProduct?.partnerName}
            </Typography>
          </Alert>
          <Typography variant="body2" sx={{ mt: 2 }}>
            Are you sure you want to approve this product? Once approved, it will be immediately 
            available in the client marketplace for users to invest in.
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
        <DialogTitle>Reject Product</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Product:</strong> {selectedProduct?.name}
            </Typography>
          </Alert>
          <Typography variant="body2" sx={{ mt: 2, mb: 2 }}>
            Please provide a reason for rejecting this product:
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Rejection Reason"
            placeholder="e.g., Incomplete documentation, regulatory concerns, etc."
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

export default ApprovalsList

