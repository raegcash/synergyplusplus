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
import { partnersAPI, Partner } from '../../services/partners'

const PartnerApprovals = () => {
  const queryClient = useQueryClient()
  const [detailsDialog, setDetailsDialog] = useState(false)
  const [approvalDialog, setApprovalDialog] = useState(false)
  const [rejectionDialog, setRejectionDialog] = useState(false)
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  // Fetch pending partners from API
  const { data: pendingPartners = [], isLoading, error } = useQuery({
    queryKey: ['partners', 'pending'],
    queryFn: () => partnersAPI.getPending(),
    refetchInterval: 5000, // Refresh every 5 seconds
  })

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: (id: string) => partnersAPI.approve(id, 'admin@company.com'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] })
      console.log('Partner approved successfully and is now available for product assignment!')
      setApprovalDialog(false)
      setSelectedPartner(null)
    },
    onError: (error: any) => {
      console.log(`Error approving partner: ${error.response?.data?.message || error.message}`)
    },
  })

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      partnersAPI.reject(id, reason, 'admin@company.com'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] })
      console.log('Partner rejected successfully')
      setRejectionDialog(false)
      setSelectedPartner(null)
      setRejectionReason('')
    },
    onError: (error: any) => {
      console.log(`Error rejecting partner: ${error.response?.data?.message || error.message}`)
    },
  })

  const handleViewDetails = (partner: Partner) => {
    setSelectedPartner(partner)
    setDetailsDialog(true)
  }

  const handleApprove = (partner: Partner) => {
    setSelectedPartner(partner)
    setApprovalDialog(true)
  }

  const handleReject = (partner: Partner) => {
    setSelectedPartner(partner)
    setRejectionDialog(true)
  }

  const confirmApproval = () => {
    if (selectedPartner) {
      approveMutation.mutate(selectedPartner.id)
    }
  }

  const confirmRejection = () => {
    if (selectedPartner && rejectionReason.trim()) {
      rejectMutation.mutate({ id: selectedPartner.id, reason: rejectionReason })
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
        Error loading pending partners: {(error as any).message}
      </Alert>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 0.5, fontWeight: 700 }}>
          Partner Approvals
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Review and approve partners for the ecosystem
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
                {pendingPartners.length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Awaiting review
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Pending Table */}
      {pendingPartners.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <ApproveIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            All Caught Up!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            There are no pending partner approvals at the moment.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Partner</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Contact Email</TableCell>
                <TableCell>Contact Phone</TableCell>
                <TableCell>Submitted At</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingPartners.map((partner) => (
                <TableRow key={partner.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {partner.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                      {partner.code}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={partner.type} size="small" />
                  </TableCell>
                  <TableCell>{partner.contactEmail}</TableCell>
                  <TableCell>{partner.contactPhone || '-'}</TableCell>
                  <TableCell>
                    {new Date(partner.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      startIcon={<ViewIcon />}
                      onClick={() => handleViewDetails(partner)}
                      sx={{ mr: 1 }}
                    >
                      View
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      startIcon={<ApproveIcon />}
                      onClick={() => handleApprove(partner)}
                      sx={{ mr: 1 }}
                    >
                      Approve
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      startIcon={<RejectIcon />}
                      onClick={() => handleReject(partner)}
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
        <DialogTitle>Partner Details</DialogTitle>
        <DialogContent>
          {selectedPartner && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  {selectedPartner.name}
                </Typography>
                <Chip label={selectedPartner.code} size="small" sx={{ mr: 1 }} />
                <Chip label={selectedPartner.type} size="small" color="primary" />
              </Grid>

              <Grid item xs={12}>
                <Divider />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">
                  Partner Type
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {selectedPartner.type}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">
                  Contact Email
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {selectedPartner.contactEmail}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">
                  Contact Phone
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {selectedPartner.contactPhone || '-'}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">
                  Webhook URL
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {selectedPartner.webhookUrl || '-'}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  Submitted At
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {new Date(selectedPartner.createdAt).toLocaleString()}
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
              handleReject(selectedPartner!)
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
              handleApprove(selectedPartner!)
            }}
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>

      {/* Approval Confirmation Dialog */}
      <Dialog open={approvalDialog} onClose={() => setApprovalDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Approve Partner</DialogTitle>
        <DialogContent>
          <Alert severity="success" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Partner:</strong> {selectedPartner?.name}
            </Typography>
            <Typography variant="body2">
              <strong>Type:</strong> {selectedPartner?.type}
            </Typography>
          </Alert>
          <Typography variant="body2" sx={{ mt: 2 }}>
            Are you sure you want to approve this partner? Once approved, it will be available 
            for product assignment and can be selected when creating new products.
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
        <DialogTitle>Reject Partner</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Partner:</strong> {selectedPartner?.name}
            </Typography>
          </Alert>
          <Typography variant="body2" sx={{ mt: 2, mb: 2 }}>
            Please provide a reason for rejecting this partner:
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

export default PartnerApprovals




