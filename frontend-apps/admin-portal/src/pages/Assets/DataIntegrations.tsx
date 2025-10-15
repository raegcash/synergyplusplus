import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  LinearProgress,
  Divider,
  CircularProgress,
} from '@mui/material'
import {
  ArrowBack as BackIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Timeline as TimelineIcon,
  Storage as StorageIcon,
  CloudSync as SyncIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Settings as SettingsIcon,
  PlayArrow as PlayIcon,
  Api as ApiIcon,
  FolderOpen as FolderIcon,
  CloudUpload as CloudIcon,
  Webhook as WebhookIcon,
} from '@mui/icons-material'
import { assetsAPI } from '../../services/assets'
import { assetDataAPI, AssetDataPoint } from '../../services/assetData'
import { assetIntegrationsAPI, AssetIntegration, IntegrationLog, IntegrationType } from '../../services/assetIntegrations'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const AssetDataIntegrations = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [tabValue, setTabValue] = useState(0)
  const [addIntegrationDialog, setAddIntegrationDialog] = useState(false)
  const [selectedIntegration, setSelectedIntegration] = useState<AssetIntegration | null>(null)
  const [viewLogsDialog, setViewLogsDialog] = useState(false)

  // Fetch asset details
  const { data: asset, isLoading: loadingAsset } = useQuery({
    queryKey: ['asset', id],
    queryFn: () => assetsAPI.getById(id!),
  })

  // Fetch asset data points
  const { data: dataPoints = [], isLoading: loadingData } = useQuery({
    queryKey: ['assetData', id],
    queryFn: () => assetDataAPI.getByAssetId(id!),
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  // Fetch integrations
  const { data: integrations = [], isLoading: loadingIntegrations } = useQuery({
    queryKey: ['assetIntegrations', id],
    queryFn: () => assetIntegrationsAPI.getByAssetId(id!),
  })

  // Fetch integration logs
  const { data: allLogs = [] } = useQuery({
    queryKey: ['integrationLogs'],
    queryFn: () => assetIntegrationsAPI.getRecentLogs(),
  })

  // Fetch performance data
  const { data: performance } = useQuery({
    queryKey: ['assetPerformance', id],
    queryFn: () => assetDataAPI.getPerformance(id!),
  })

  // Test connection mutation
  const testConnectionMutation = useMutation({
    mutationFn: (integrationId: string) => assetIntegrationsAPI.testConnection(integrationId),
    onSuccess: (result) => {
      console.log(result.success ? `✅ ${result.message}` : `❌ ${result.message}`)
    },
  })

  // Trigger sync mutation
  const triggerSyncMutation = useMutation({
    mutationFn: (integrationId: string) => assetIntegrationsAPI.triggerSync(integrationId),
    onSuccess: () => {
      console.log('Sync triggered successfully!')
      queryClient.invalidateQueries({ queryKey: ['integrationLogs'] })
      queryClient.invalidateQueries({ queryKey: ['assetData'] })
    },
  })

  if (loadingAsset) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!asset) {
    return (
      <Box>
        <Alert severity="error">Asset not found</Alert>
      </Box>
    )
  }

  // Get latest NAV data point
  const latestNav = dataPoints
    .filter(dp => dp.dataType === 'NAV')
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]

  // Prepare chart data
  const navHistory = dataPoints
    .filter(dp => dp.dataType === 'NAV')
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map(dp => ({
      date: new Date(dp.timestamp).toLocaleDateString(),
      value: dp.value,
    }))

  const getIntegrationIcon = (type: IntegrationType) => {
    switch (type) {
      case 'API': return <ApiIcon />
      case 'SFTP': return <FolderIcon />
      case 'CLOUD_STORAGE': return <CloudIcon />
      case 'WEBHOOK': return <WebhookIcon />
      default: return <StorageIcon />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success'
      case 'INACTIVE': return 'default'
      case 'ERROR': return 'error'
      case 'TESTING': return 'info'
      case 'PENDING_SETUP': return 'warning'
      default: return 'default'
    }
  }

  const assetLogs = allLogs.filter(log => 
    integrations.some(int => int.id === log.integrationId)
  )

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate('/assets')}>
          <BackIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" fontWeight={700}>
            {asset.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {asset.code} • Data & Integrations
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setAddIntegrationDialog(true)}
        >
          Add Integration
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <TimelineIcon color="primary" />
                <Typography variant="caption" color="text.secondary">
                  Current NAV
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>
                {latestNav ? `${asset.currency} ${latestNav.value.toFixed(4)}` : 'N/A'}
              </Typography>
              {latestNav && (
                <Typography variant="caption" color="text.secondary">
                  Updated {new Date(latestNav.timestamp).toLocaleString()}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <SyncIcon color="success" />
                <Typography variant="caption" color="text.secondary">
                  Integrations
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>
                {integrations.length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {integrations.filter(i => i.status === 'ACTIVE').length} active
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <StorageIcon color="info" />
                <Typography variant="caption" color="text.secondary">
                  Data Points
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>
                {dataPoints.length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Historical records
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                {performance?.changePercent && performance.changePercent > 0 ? (
                  <SuccessIcon color="success" />
                ) : (
                  <ErrorIcon color="error" />
                )}
                <Typography variant="caption" color="text.secondary">
                  24h Change
                </Typography>
              </Box>
              <Typography 
                variant="h4" 
                fontWeight={700}
                color={performance?.changePercent && performance.changePercent > 0 ? 'success.main' : 'error.main'}
              >
                {performance ? `${performance.changePercent > 0 ? '+' : ''}${performance.changePercent.toFixed(2)}%` : 'N/A'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {performance ? `${asset.currency} ${performance.changeAmount.toFixed(4)}` : ''}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* UITF/Fund Specific Cards - Only show for fund types */}
        {(asset.assetType === 'UITF' || asset.assetType === 'MUTUAL_FUND' || asset.assetType === 'FUND') && (
          <>
            {asset.investmentAmount && (
              <Grid item xs={12} md={3}>
                <Card sx={{ bgcolor: 'primary.lighter' }}>
                  <CardContent>
                    <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                      Investment Amount
                    </Typography>
                    <Typography variant="h5" fontWeight={700} color="primary.main">
                      {asset.currency} {asset.investmentAmount.toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {asset.indicativeUnits && (
              <Grid item xs={12} md={3}>
                <Card sx={{ bgcolor: 'success.lighter' }}>
                  <CardContent>
                    <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                      Indicative Units
                    </Typography>
                    <Typography variant="h5" fontWeight={700} color="success.main">
                      {asset.indicativeUnits.toFixed(4)} units
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {asset.indicativeNavpu && (
              <Grid item xs={12} md={3}>
                <Card sx={{ bgcolor: 'info.lighter' }}>
                  <CardContent>
                    <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                      Indicative NAVPU
                    </Typography>
                    <Typography variant="h5" fontWeight={700} color="info.main">
                      {asset.currency} {asset.indicativeNavpu.toFixed(4)}
                    </Typography>
                    {asset.navAsOfDate && (
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                        As of {new Date(asset.navAsOfDate).toLocaleString()}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            )}

            {asset.fundManager && (
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                      Fund Manager
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {asset.fundManager}
                    </Typography>
                    {asset.fundHouse && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        {asset.fundHouse}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            )}
          </>
        )}
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab label="Data History" icon={<TimelineIcon />} iconPosition="start" />
          <Tab label="Integrations" icon={<SyncIcon />} iconPosition="start" />
          <Tab label="Sync Logs" icon={<StorageIcon />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Tab 0: Data History */}
      {tabValue === 0 && (
        <Box>
          {/* NAV Chart */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              NAV History
            </Typography>
            {navHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={navHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#1976d2" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Alert severity="info">No historical data available</Alert>
            )}
          </Paper>

          {/* Data Points Table */}
          <Paper>
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight={600}>
                All Data Points
              </Typography>
              <IconButton 
                size="small"
                onClick={() => queryClient.invalidateQueries({ queryKey: ['assetData'] })}
              >
                <RefreshIcon />
              </IconButton>
            </Box>
            <Divider />
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Timestamp</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Value</TableCell>
                    <TableCell>Source</TableCell>
                    <TableCell>Metadata</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dataPoints.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                          No data points yet
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    dataPoints.map((dp) => (
                      <TableRow key={dp.id} hover>
                        <TableCell>
                          {new Date(dp.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Chip label={dp.dataType} size="small" color="primary" variant="outlined" />
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight={500}>
                            {dp.currency} {dp.value.toFixed(4)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" fontFamily="monospace">
                            {dp.source}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {dp.metadata && Object.keys(dp.metadata).length > 0 && (
                            <Chip 
                              label={`${Object.keys(dp.metadata).length} fields`} 
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      )}

      {/* Tab 1: Integrations */}
      {tabValue === 1 && (
        <Box>
          <Grid container spacing={3}>
            {integrations.length === 0 ? (
              <Grid item xs={12}>
                <Paper sx={{ p: 6, textAlign: 'center' }}>
                  <StorageIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    No integrations configured
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Add an integration to start receiving data from external sources
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setAddIntegrationDialog(true)}
                  >
                    Add Integration
                  </Button>
                </Paper>
              </Grid>
            ) : (
              integrations.map((integration) => (
                <Grid item xs={12} md={6} key={integration.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'start', gap: 2, mb: 2 }}>
                        <Box 
                          sx={{ 
                            p: 1, 
                            borderRadius: 1, 
                            bgcolor: 'primary.lighter',
                            display: 'flex',
                          }}
                        >
                          {getIntegrationIcon(integration.type)}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <Box>
                              <Typography variant="h6" fontWeight={600}>
                                {integration.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {integration.partnerName} • {integration.type}
                              </Typography>
                            </Box>
                            <Chip 
                              label={integration.status}
                              size="small"
                              color={getStatusColor(integration.status) as any}
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {integration.description}
                          </Typography>
                        </Box>
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            Sync Frequency
                          </Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {integration.syncFrequency}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            Last Sync
                          </Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {integration.lastSync 
                              ? new Date(integration.lastSync).toLocaleString()
                              : 'Never'}
                          </Typography>
                        </Grid>
                      </Grid>

                      {integration.lastSyncStatus && (
                        <Alert 
                          severity={integration.lastSyncStatus === 'SUCCESS' ? 'success' : 'error'}
                          sx={{ mb: 2 }}
                        >
                          Last sync: {integration.lastSyncStatus}
                        </Alert>
                      )}

                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<PlayIcon />}
                          onClick={() => triggerSyncMutation.mutate(integration.id)}
                          disabled={triggerSyncMutation.isPending}
                        >
                          Sync Now
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<SettingsIcon />}
                          onClick={() => testConnectionMutation.mutate(integration.id)}
                          disabled={testConnectionMutation.isPending}
                        >
                          Test
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            setSelectedIntegration(integration)
                            setViewLogsDialog(true)
                          }}
                        >
                          Logs
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </Box>
      )}

      {/* Tab 2: Sync Logs */}
      {tabValue === 2 && (
        <Paper>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight={600}>
              Integration Sync Logs
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Last 24 hours
            </Typography>
          </Box>
          <Divider />
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>Integration</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Records</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Error</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assetLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                        No sync logs yet
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  assetLogs.map((log) => (
                    <TableRow key={log.id} hover>
                      <TableCell>
                        {new Date(log.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {log.integrationName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={log.status}
                          size="small"
                          color={log.status === 'SUCCESS' ? 'success' : log.status === 'FAILED' ? 'error' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {log.recordsProcessed}
                          {log.recordsFailed > 0 && (
                            <Typography component="span" color="error" sx={{ ml: 1 }}>
                              ({log.recordsFailed} failed)
                            </Typography>
                          )}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {log.duration}s
                      </TableCell>
                      <TableCell>
                        {log.errorMessage && (
                          <Typography variant="caption" color="error">
                            {log.errorMessage}
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Add Integration Dialog */}
      <Dialog
        open={addIntegrationDialog}
        onClose={() => setAddIntegrationDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add New Integration</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            Configure a data integration to automatically receive market data, NAV updates, and other information from external sources.
          </Alert>

          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            Integration Type
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {(['API', 'SFTP', 'CLOUD_STORAGE', 'WEBHOOK'] as IntegrationType[]).map((type) => (
              <Grid item xs={6} key={type}>
                <Card 
                  sx={{ 
                    p: 2, 
                    textAlign: 'center', 
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                >
                  <Box sx={{ mb: 1 }}>
                    {getIntegrationIcon(type)}
                  </Box>
                  <Typography variant="body2" fontWeight={500}>
                    {type}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Typography variant="body2" color="text.secondary">
            Full configuration interface coming soon...
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddIntegrationDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Logs Dialog */}
      <Dialog
        open={viewLogsDialog}
        onClose={() => setViewLogsDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Integration Logs
          {selectedIntegration && (
            <Typography variant="caption" display="block" color="text.secondary">
              {selectedIntegration.name}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Detailed logs view coming soon...
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewLogsDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default AssetDataIntegrations

