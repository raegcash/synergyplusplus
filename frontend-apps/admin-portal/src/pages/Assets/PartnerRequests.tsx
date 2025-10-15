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
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider,
} from '@mui/material'
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Api as ApiIcon,
} from '@mui/icons-material'
import { assetsAPI, Asset } from '../../services/assets'

const PartnerAssetRequests = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [detailsDialog, setDetailsDialog] = useState(false)
  const [approvalDialog, setApprovalDialog] = useState(false)
  const [rejectionDialog, setRejectionDialog] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  // Fetch partner-submitted assets
  const { data: partnerAssets = [], isLoading, error } = useQuery({
    queryKey: ['assets', 'partner-submitted'],
    queryFn: () => assetsAPI.getPartnerSubmitted(),
    refetchInterval: 5000,
  })

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: (id: string) => assetsAPI.approve(id, 'admin@company.com'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      console.log('Partner asset approved successfully!')
      setApprovalDialog(false)
      setSelectedAsset(null)
    },
    onError: (error: any) => {
      console.log(`Error: ${error.message}`)
    },
  })

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      assetsAPI.reject(id, reason, 'admin@company.com'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      console.log('Partner asset rejected')
      setRejectionDialog(false)
      setSelectedAsset(null)
      setRejectionReason('')
    },
  })

  const handleViewDetails = (asset: Asset) => {
    setSelectedAsset(asset)
    setDetailsDialog(true)
  }

  const handleApprove = (asset: Asset) => {
    setSelectedAsset(asset)
    setApprovalDialog(true)
  }

  const handleReject = (asset: Asset) => {
    setSelectedAsset(asset)
    setRejectionDialog(true)
  }

  const confirmApproval = () => {
    if (selectedAsset) {
      approveMutation.mutate(selectedAsset.id)
    }
  }

  const confirmRejection = () => {
    if (selectedAsset && rejectionReason.trim()) {
      rejectMutation.mutate({ id: selectedAsset.id, reason: rejectionReason })
    }
  }

  const pendingAssets = partnerAssets.filter(a => a.status === 'PENDING_APPROVAL')
  const processedAssets = partnerAssets.filter(a => a.status !== 'PENDING_APPROVAL')

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
        Error loading partner asset requests: {(error as any).message}
      </Alert>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 0.5, fontWeight: 700 }}>
          Partner Asset Requests
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Review assets submitted by partners via API
        </Typography>
      </Box>

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <ApiIcon color="primary" />
                <Typography variant="body2" color="text.secondary">
                  Total API Submissions
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {partnerAssets.length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                All partner-submitted assets
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Pending Review
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'warning.main' }}>
                {pendingAssets.length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Awaiting approval
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Processed
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'success.main' }}>
                {processedAssets.length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Approved or rejected
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Pending Requests */}
      {pendingAssets.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <ApiIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Pending Requests
          </Typography>
          <Typography variant="body2" color="text.secondary">
            All partner asset submissions have been reviewed.
          </Typography>
        </Paper>
      ) : (
        <>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Pending Approval
          </Typography>
          <TableContainer component={Paper} sx={{ mb: 4 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Code</TableCell>
                  <TableCell>Asset Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Partner</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Change 24h</TableCell>
                  <TableCell>Submitted At</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingAssets.map((asset) => (
                  <TableRow key={asset.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ApiIcon fontSize="small" color="primary" />
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
                      <Typography variant="body2" fontWeight={500}>
                        {asset.partnerName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Via API
                      </Typography>
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
                      <Typography variant="body2">
                        {new Date(asset.submittedAt!).toLocaleDateString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(asset.submittedAt!).toLocaleTimeString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        startIcon={<ViewIcon />}
                        onClick={() => handleViewDetails(asset)}
                        sx={{ mr: 1 }}
                      >
                        View
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={<ApproveIcon />}
                        onClick={() => handleApprove(asset)}
                        sx={{ mr: 1 }}
                      >
                        Approve
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<RejectIcon />}
                        onClick={() => handleReject(asset)}
                      >
                        Reject
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Details Dialog */}
      <Dialog open={detailsDialog} onClose={() => setDetailsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ApiIcon />
            <Typography variant="h6">Partner Asset Request Details</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedAsset && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Alert severity="info" icon={<ApiIcon />}>
                  <Typography variant="body2">
                    <strong>Submitted via Partner API</strong> by {selectedAsset.submittedBy}
                  </Typography>
                </Alert>
              </Grid>

              <Grid item xs={12}>
                <Divider />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">
                  Asset Code
                </Typography>
                <Typography variant="body2" fontWeight={500} fontFamily="monospace">
                  {selectedAsset.code}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">
                  Asset Name
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {selectedAsset.name}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">
                  Asset Type
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {selectedAsset.assetType}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">
                  Category
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {selectedAsset.category}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">
                  Partner
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {selectedAsset.partnerName}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">
                  Product
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {selectedAsset.productName}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">
                  Current Price
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {selectedAsset.currency} {selectedAsset.currentPrice.toLocaleString()}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">
                  Minimum Investment
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {selectedAsset.currency} {selectedAsset.minInvestment.toLocaleString()}
                </Typography>
              </Grid>

              {selectedAsset.marketCap && (
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">
                    Market Cap
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {selectedAsset.marketCap}
                  </Typography>
                </Grid>
              )}

              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  Description
                </Typography>
                <Typography variant="body2">
                  {selectedAsset.description}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  Submitted At
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {new Date(selectedAsset.submittedAt!).toLocaleString()}
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
              handleReject(selectedAsset!)
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
              handleApprove(selectedAsset!)
            }}
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>

      {/* Approval Dialog */}
      <Dialog open={approvalDialog} onClose={() => setApprovalDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Approve Partner Asset</DialogTitle>
        <DialogContent>
          <Alert severity="success" sx={{ mt: 2 }} icon={<ApiIcon />}>
            <Typography variant="body2">
              <strong>Partner:</strong> {selectedAsset?.partnerName}
            </Typography>
            <Typography variant="body2">
              <strong>Asset:</strong> {selectedAsset?.name} ({selectedAsset?.code})
            </Typography>
            <Typography variant="body2">
              <strong>Submitted via:</strong> Partner API
            </Typography>
          </Alert>
          <Typography variant="body2" sx={{ mt: 2 }}>
            Are you sure you want to approve this partner-submitted asset? 
            It will be available for users to invest in.
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
        <DialogTitle>Reject Partner Asset</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Asset:</strong> {selectedAsset?.name} ({selectedAsset?.code})
            </Typography>
            <Typography variant="body2">
              <strong>Partner:</strong> {selectedAsset?.partnerName}
            </Typography>
          </Alert>
          <Typography variant="body2" sx={{ mt: 2, mb: 2 }}>
            Please provide a reason for rejecting this partner asset submission:
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Rejection Reason"
            placeholder="e.g., Pricing not competitive, compliance issues, duplicate asset, etc."
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

export default PartnerAssetRequests




