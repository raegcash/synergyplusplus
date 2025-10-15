import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
} from '@mui/material'
import {
  CloudSync as SyncIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  PlayArrow as PlayIcon,
  Refresh as RefreshIcon,
  Description as FileIcon,
  Visibility as ViewIcon,
  Settings as SettingsIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  AccountBalance as FundIcon,
} from '@mui/icons-material'
import {
  partnerIntegrationsAPI,
  TransactionType,
  IntegrationStatus,
  IntegrationBatch,
  AuditLog,
  PartnerType,
  AssetType,
} from '../../services/partnerIntegrations'

const TransactionIntegrations = () => {
  const queryClient = useQueryClient()
  const [tabValue, setTabValue] = useState(0)
  const [manualRunDialog, setManualRunDialog] = useState(false)
  const [selectedPartner, setSelectedPartner] = useState('')
  const [selectedTransactionType, setSelectedTransactionType] = useState<TransactionType>('SUBSCRIPTION')
  const [selectedBatch, setSelectedBatch] = useState<IntegrationBatch | null>(null)
  const [batchDetailsDialog, setBatchDetailsDialog] = useState(false)

  // Fetch data
  const { data: statistics, isLoading: loadingStats } = useQuery({
    queryKey: ['integrationStatistics'],
    queryFn: () => partnerIntegrationsAPI.getStatistics(),
    refetchInterval: 10000, // Refresh every 10 seconds
  })

  const { data: batches = [], isLoading: loadingBatches } = useQuery({
    queryKey: ['integrationBatches'],
    queryFn: () => partnerIntegrationsAPI.getAllBatches(),
    refetchInterval: 10000,
  })

  const { data: configs = [] } = useQuery({
    queryKey: ['integrationConfigs'],
    queryFn: () => partnerIntegrationsAPI.getAllConfigs(),
  })

  const { data: auditLogs = [], isLoading: loadingAudit } = useQuery({
    queryKey: ['integrationAuditLogs'],
    queryFn: () => partnerIntegrationsAPI.getAllAuditLogs(),
    refetchInterval: 10000,
  })

  const { data: kycSubmissions = [] } = useQuery({
    queryKey: ['kycSubmissions'],
    queryFn: () => partnerIntegrationsAPI.getAllKYC(),
  })

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: () => partnerIntegrationsAPI.getAllSubscriptions(),
  })

  const { data: redemptions = [] } = useQuery({
    queryKey: ['redemptions'],
    queryFn: () => partnerIntegrationsAPI.getAllRedemptions(),
  })

  // Manual run mutation
  const manualRunMutation = useMutation({
    mutationFn: ({ partnerId, transactionType }: { partnerId: string; transactionType: TransactionType }) =>
      partnerIntegrationsAPI.triggerManualRun(partnerId, transactionType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrationBatches'] })
      queryClient.invalidateQueries({ queryKey: ['integrationStatistics'] })
      queryClient.invalidateQueries({ queryKey: ['integrationAuditLogs'] })
      setManualRunDialog(false)
      console.log('Manual integration run triggered successfully!')
    },
  })

  const handleManualRun = () => {
    if (selectedPartner && selectedTransactionType) {
      manualRunMutation.mutate({
        partnerId: selectedPartner,
        transactionType: selectedTransactionType,
      })
    }
  }

  const getStatusColor = (status: IntegrationStatus) => {
    switch (status) {
      case 'ACKNOWLEDGED': return 'success'
      case 'SENT': return 'info'
      case 'PROCESSING': return 'warning'
      case 'FAILED': case 'REJECTED': return 'error'
      default: return 'default'
    }
  }

  const getStatusIcon = (status: IntegrationStatus) => {
    switch (status) {
      case 'ACKNOWLEDGED': return <SuccessIcon />
      case 'SENT': return <SyncIcon />
      case 'PROCESSING': return <ScheduleIcon />
      case 'FAILED': case 'REJECTED': return <ErrorIcon />
      default: return <ScheduleIcon />
    }
  }

  const getTransactionTypeColor = (type: TransactionType) => {
    switch (type) {
      case 'KYC_SUBMISSION': return 'info'
      case 'SUBSCRIPTION': return 'success'
      case 'REDEMPTION': return 'warning'
      default: return 'default'
    }
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignments: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Transaction Integrations
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Monitor KYC, subscriptions, redemptions, buy/sell orders across all partners (funds, stocks, crypto)
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['integrationBatches'] })
              queryClient.invalidateQueries({ queryKey: ['integrationStatistics'] })
            }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<PlayIcon />}
            onClick={() => setManualRunDialog(true)}
          >
            Trigger Manual Run
          </Button>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <PeopleIcon color="info" />
                <Typography variant="caption" color="text.secondary">
                  KYC Submissions
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>
                {statistics?.totalKYC || 0}
              </Typography>
              <Typography variant="caption" color="warning.main">
                {statistics?.pendingKYC || 0} pending
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <TrendingUpIcon color="success" />
                <Typography variant="caption" color="text.secondary">
                  Subscriptions
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>
                {statistics?.totalSubscriptions || 0}
              </Typography>
              <Typography variant="caption" color="warning.main">
                {statistics?.pendingSubscriptions || 0} pending
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <FundIcon color="warning" />
                <Typography variant="caption" color="text.secondary">
                  Redemptions
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>
                {statistics?.totalRedemptions || 0}
              </Typography>
              <Typography variant="caption" color="warning.main">
                {statistics?.pendingRedemptions || 0} pending
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <FileIcon color="primary" />
                <Typography variant="caption" color="text.secondary">
                  Files Generated
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>
                {statistics?.totalFilesGenerated || 0}
              </Typography>
              <Typography variant="caption" color="success.main">
                {statistics?.totalRecordsProcessed || 0} records
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab label="Integration Batches" icon={<SyncIcon />} iconPosition="start" />
          <Tab label="Audit Logs" icon={<FileIcon />} iconPosition="start" />
          <Tab label="Configuration" icon={<SettingsIcon />} iconPosition="start" />
          <Tab label="Pending Transactions" icon={<ScheduleIcon />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {/* Batches Tab */}
      {tabValue === 0 && (
        <Paper>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={2}>
              Recent Integration Batches
            </Typography>
            {loadingBatches ? (
              <LinearProgress />
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Batch Number</TableCell>
                      <TableCell>Partner</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Records</TableCell>
                      <TableCell>File</TableCell>
                      <TableCell>Generated</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {batches.map((batch) => (
                      <TableRow key={batch.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {batch.batchNumber}
                          </Typography>
                        </TableCell>
                        <TableCell>{batch.partnerName}</TableCell>
                        <TableCell>
                          <Chip
                            label={batch.transactionType.replace('_', ' ')}
                            color={getTransactionTypeColor(batch.transactionType)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {batch.totalRecords} total
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {batch.processedRecords} processed
                              {batch.failedRecords > 0 && `, ${batch.failedRecords} failed`}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Tooltip title={batch.fileName}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <FileIcon fontSize="small" />
                              <Typography variant="caption" noWrap sx={{ maxWidth: 150 }}>
                                {batch.fileName}
                              </Typography>
                            </Box>
                          </Tooltip>
                          <Typography variant="caption" color="text.secondary">
                            {(batch.fileSize / 1024).toFixed(2)} KB
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">
                            {new Date(batch.generatedAt).toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={getStatusIcon(batch.status)}
                            label={batch.status}
                            color={getStatusColor(batch.status)}
                            size="small"
                          />
                          {batch.status === 'PROCESSING' && (
                            <LinearProgress sx={{ mt: 1 }} />
                          )}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedBatch(batch)
                              setBatchDetailsDialog(true)
                            }}
                          >
                            <ViewIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </Paper>
      )}

      {/* Audit Logs Tab */}
      {tabValue === 1 && (
        <Paper>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={2}>
              Audit Trail
            </Typography>
            {loadingAudit ? (
              <LinearProgress />
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Timestamp</TableCell>
                      <TableCell>Action</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Partner</TableCell>
                      <TableCell>User</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Details</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {auditLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <Typography variant="caption">
                            {new Date(log.timestamp).toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {log.action.replace('_', ' ')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={log.transactionType.replace('_', ' ')}
                            color={getTransactionTypeColor(log.transactionType)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{log.partnerName}</TableCell>
                        <TableCell>{log.userName}</TableCell>
                        <TableCell>
                          <Chip
                            label={log.status}
                            color={getStatusColor(log.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">
                            {log.details}
                          </Typography>
                          {log.fileName && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                              <FileIcon fontSize="small" />
                              <Typography variant="caption">{log.fileName}</Typography>
                            </Box>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </Paper>
      )}

      {/* Configuration Tab */}
      {tabValue === 2 && (
        <Paper>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={2}>
              Integration Configurations
            </Typography>
            <Grid container spacing={3}>
              {configs.map((config) => (
                <Grid item xs={12} key={config.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                        <Box>
                          <Typography variant="h6" fontWeight={600}>
                            {config.partnerName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Asset Types: {config.assetTypes.join(', ')}
                          </Typography>
                        </Box>
                        <Chip
                          label={config.isActive ? 'Active' : 'Inactive'}
                          color={config.isActive ? 'success' : 'default'}
                          size="small"
                        />
                      </Box>

                      <Grid container spacing={2}>
                        <Grid item xs={6} md={3}>
                          <Typography variant="caption" color="text.secondary">File Format</Typography>
                          <Typography variant="body2" fontWeight={600}>{config.fileFormat}</Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Typography variant="caption" color="text.secondary">Delivery Method</Typography>
                          <Typography variant="body2" fontWeight={600}>{config.deliveryMethod}</Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Typography variant="caption" color="text.secondary">Schedule</Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {config.scheduleEnabled ? config.cronExpression : 'Manual Only'}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Typography variant="caption" color="text.secondary">Batch Size</Typography>
                          <Typography variant="body2" fontWeight={600}>{config.batchSize} records</Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Alert severity="info" sx={{ mt: 1 }}>
                            <Typography variant="caption">
                              <strong>Last Run:</strong> {config.lastRunAt ? new Date(config.lastRunAt).toLocaleString() : 'Never'}
                              {' | '}
                              <strong>Next Run:</strong> {config.nextRunAt ? new Date(config.nextRunAt).toLocaleString() : 'N/A'}
                            </Typography>
                          </Alert>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Paper>
      )}

      {/* Pending Transactions Tab */}
      {tabValue === 3 && (
        <Paper>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={2}>
              Pending Transactions
            </Typography>
            
            {/* KYC Submissions */}
            <Typography variant="subtitle1" fontWeight={600} mt={3} mb={1}>
              KYC Submissions ({kycSubmissions.filter(k => k.status === 'PENDING' || k.status === 'PROCESSING').length})
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Partner</TableCell>
                    <TableCell>Asset</TableCell>
                    <TableCell>Submitted</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {kycSubmissions.filter(k => k.status === 'PENDING' || k.status === 'PROCESSING').map((kyc) => (
                    <TableRow key={kyc.id}>
                      <TableCell>{kyc.userName}</TableCell>
                      <TableCell>{kyc.partnerName}</TableCell>
                      <TableCell>{kyc.assetCode}</TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {new Date(kyc.submittedAt).toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={kyc.status} color={getStatusColor(kyc.status)} size="small" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Subscriptions */}
            <Typography variant="subtitle1" fontWeight={600} mt={3} mb={1}>
              Subscriptions ({subscriptions.filter(s => s.status === 'PENDING' || s.status === 'PROCESSING').length})
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Ref</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>Asset</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Units</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {subscriptions.filter(s => s.status === 'PENDING' || s.status === 'PROCESSING').map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell>{sub.transactionRef}</TableCell>
                      <TableCell>{sub.userName}</TableCell>
                      <TableCell>{sub.assetCode}</TableCell>
                      <TableCell>{sub.currency} {sub.amount.toLocaleString()}</TableCell>
                      <TableCell>{sub.indicativeUnits.toFixed(4)}</TableCell>
                      <TableCell>
                        <Chip label={sub.status} color={getStatusColor(sub.status)} size="small" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Redemptions */}
            <Typography variant="subtitle1" fontWeight={600} mt={3} mb={1}>
              Redemptions ({redemptions.filter(r => r.status === 'PENDING' || r.status === 'PROCESSING').length})
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Ref</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>Asset</TableCell>
                    <TableCell>Units</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {redemptions.filter(r => r.status === 'PENDING' || r.status === 'PROCESSING').map((red) => (
                    <TableRow key={red.id}>
                      <TableCell>{red.transactionRef}</TableCell>
                      <TableCell>{red.userName}</TableCell>
                      <TableCell>{red.assetCode}</TableCell>
                      <TableCell>{red.unitsToRedeem.toFixed(4)}</TableCell>
                      <TableCell>{red.currency} {red.estimatedAmount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Chip label={red.status} color={getStatusColor(red.status)} size="small" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Paper>
      )}

      {/* Manual Run Dialog */}
      <Dialog open={manualRunDialog} onClose={() => setManualRunDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Trigger Manual Integration Run</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            This will immediately generate and send a batch file for the selected partner and transaction type.
          </Alert>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Partner</InputLabel>
            <Select
              value={selectedPartner}
              onChange={(e) => setSelectedPartner(e.target.value)}
              label="Partner"
            >
              {configs.map((config) => (
                <MenuItem key={config.id} value={config.partnerId}>
                  {config.partnerName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Transaction Type</InputLabel>
            <Select
              value={selectedTransactionType}
              onChange={(e) => setSelectedTransactionType(e.target.value as TransactionType)}
              label="Transaction Type"
            >
              <MenuItem value="KYC_SUBMISSION">KYC Submission</MenuItem>
              <MenuItem value="SUBSCRIPTION">Subscription (Funds)</MenuItem>
              <MenuItem value="REDEMPTION">Redemption (Funds)</MenuItem>
              <MenuItem value="BUY_ORDER">Buy Order (Stocks/Crypto)</MenuItem>
              <MenuItem value="SELL_ORDER">Sell Order (Stocks/Crypto)</MenuItem>
              <MenuItem value="TRANSFER">Transfer</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setManualRunDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleManualRun}
            disabled={!selectedPartner || manualRunMutation.isPending}
          >
            {manualRunMutation.isPending ? 'Processing...' : 'Run Now'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Batch Details Dialog */}
      <Dialog
        open={batchDetailsDialog}
        onClose={() => setBatchDetailsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Batch Details</DialogTitle>
        <DialogContent>
          {selectedBatch && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Batch Number</Typography>
                  <Typography variant="body1" fontWeight={600}>{selectedBatch.batchNumber}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Partner</Typography>
                  <Typography variant="body1" fontWeight={600}>{selectedBatch.partnerName}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Transaction Type</Typography>
                  <Chip
                    label={selectedBatch.transactionType.replace('_', ' ')}
                    color={getTransactionTypeColor(selectedBatch.transactionType)}
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Status</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      icon={getStatusIcon(selectedBatch.status)}
                      label={selectedBatch.status}
                      color={getStatusColor(selectedBatch.status)}
                      size="small"
                    />
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Alert severity="info">
                    <Typography variant="body2">
                      <strong>File:</strong> {selectedBatch.fileName} ({(selectedBatch.fileSize / 1024).toFixed(2)} KB)
                      <br />
                      <strong>Format:</strong> {selectedBatch.fileFormat} | <strong>Delivery:</strong> {selectedBatch.deliveryMethod}
                    </Typography>
                  </Alert>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">Total Records</Typography>
                  <Typography variant="h5" fontWeight={700}>{selectedBatch.totalRecords}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">Processed</Typography>
                  <Typography variant="h5" fontWeight={700} color="success.main">
                    {selectedBatch.processedRecords}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">Failed</Typography>
                  <Typography variant="h5" fontWeight={700} color="error.main">
                    {selectedBatch.failedRecords}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Timeline</Typography>
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2">
                      • Generated: {new Date(selectedBatch.generatedAt).toLocaleString()}
                    </Typography>
                    {selectedBatch.sentAt && (
                      <Typography variant="body2">
                        • Sent: {new Date(selectedBatch.sentAt).toLocaleString()}
                      </Typography>
                    )}
                    {selectedBatch.acknowledgedAt && (
                      <Typography variant="body2">
                        • Acknowledged: {new Date(selectedBatch.acknowledgedAt).toLocaleString()}
                      </Typography>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBatchDetailsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default TransactionIntegrations

