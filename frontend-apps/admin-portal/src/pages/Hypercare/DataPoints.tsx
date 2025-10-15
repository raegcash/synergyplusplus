import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Box,
  Typography,
  Paper,
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
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Storage as DatabaseIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
} from '@mui/icons-material'
import { hypercareAPI, DataPoint } from '../../services/hypercare'

const DataPointsManagement = () => {
  const queryClient = useQueryClient()
  const [addDialog, setAddDialog] = useState(false)
  const [formData, setFormData] = useState({
    database: 'postgresql' as 'postgresql' | 'mongodb' | 'redis' | 'api' | 'internal',
    databaseName: '',
    source: '',
    key: '',
    dataType: 'string' as 'string' | 'number' | 'boolean' | 'date',
    description: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
    connectionId: '',
  })

  const { data: dataPoints = [], isLoading } = useQuery({
    queryKey: ['dataPoints'],
    queryFn: () => hypercareAPI.getAllDataPoints(),
  })

  const { data: connections = [] } = useQuery({
    queryKey: ['databaseConnections'],
    queryFn: () => hypercareAPI.getAllConnections(),
  })

  const { data: stats } = useQuery({
    queryKey: ['hypercareStats'],
    queryFn: () => hypercareAPI.getHypercareStats(),
  })

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => hypercareAPI.createDataPoint(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dataPoints'] })
      queryClient.invalidateQueries({ queryKey: ['hypercareStats'] })
      resetForm()
      console.log('Data point created successfully!')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => hypercareAPI.deleteDataPoint(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dataPoints'] })
      queryClient.invalidateQueries({ queryKey: ['hypercareStats'] })
      console.log('Data point deleted successfully!')
    },
  })

  const resetForm = () => {
    setFormData({
      database: 'postgresql',
      databaseName: '',
      source: '',
      key: '',
      dataType: 'string',
      description: '',
      status: 'ACTIVE',
      connectionId: '',
    })
    setAddDialog(false)
  }

  const getDatabaseIcon = (database: string) => {
    return <DatabaseIcon />
  }

  const getDatabaseColor = (database: string) => {
    switch (database) {
      case 'postgresql': return 'primary'
      case 'mongodb': return 'success'
      case 'redis': return 'error'
      case 'api': return 'warning'
      case 'internal': return 'info'
      default: return 'default'
    }
  }

  // Auto-set connection and database name when database type changes
  const handleDatabaseChange = (dbType: typeof formData.database) => {
    const connection = connections.find(c => c.type === dbType)
    setFormData({
      ...formData,
      database: dbType,
      connectionId: connection?.id || '',
      databaseName: connection?.name || '',
    })
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Data Points Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure data sources from different databases and services for eligibility validation
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setAddDialog(true)}
        >
          Add Data Point
        </Button>
      </Box>

      {/* Info Alert */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2" fontWeight={600} mb={0.5}>
          Data Sources & Keys
        </Typography>
        <Typography variant="caption">
          Define data points from various databases and services for eligibility criteria
        </Typography>
      </Alert>

      {/* Statistics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">Total Data Points</Typography>
              <Typography variant="h4" fontWeight={700}>{stats?.dataPoints.total || 0}</Typography>
              <Typography variant="caption" color="text.secondary">Available for criteria</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">Active</Typography>
              <Typography variant="h4" fontWeight={700} color="success.main">
                {stats?.dataPoints.active || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">Currently enabled</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">Connections</Typography>
              <Typography variant="h4" fontWeight={700} color="primary.main">
                {stats?.dataPoints.connections || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">Unique databases</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">Inactive</Typography>
              <Typography variant="h4" fontWeight={700}>
                {stats?.dataPoints.inactive || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">Disabled</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Data Points Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Database</TableCell>
                <TableCell>Source</TableCell>
                <TableCell>Key</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dataPoints.map((dp) => (
                <TableRow key={dp.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getDatabaseIcon(dp.database)}
                      <Box>
                        <Chip
                          label={dp.database}
                          size="small"
                          color={getDatabaseColor(dp.database) as any}
                        />
                        <Typography variant="caption" display="block" color="text.secondary">
                          {dp.databaseName}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600} fontFamily="monospace">
                      {dp.source}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600} fontFamily="monospace">
                      {dp.key}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={dp.dataType}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{dp.description}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={dp.status === 'ACTIVE' ? <ActiveIcon /> : <InactiveIcon />}
                      label={dp.status}
                      color={dp.status === 'ACTIVE' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => deleteMutation.mutate(dp.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add Data Point Dialog */}
      <Dialog open={addDialog} onClose={resetForm} maxWidth="md" fullWidth>
        <DialogTitle>Add Data Point</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Database Type</InputLabel>
                <Select
                  value={formData.database}
                  onChange={(e) => handleDatabaseChange(e.target.value as any)}
                  label="Database Type"
                >
                  <MenuItem value="postgresql">PostgreSQL</MenuItem>
                  <MenuItem value="mongodb">MongoDB</MenuItem>
                  <MenuItem value="redis">Redis</MenuItem>
                  <MenuItem value="api">External API</MenuItem>
                  <MenuItem value="internal">Internal Service</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Database Name"
                value={formData.databaseName}
                onChange={(e) => setFormData({ ...formData, databaseName: e.target.value })}
                helperText="e.g., primary_db, subscriptions_db"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Source (Table/Collection)"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                helperText="Table or collection name"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Key (Field/Column)"
                value={formData.key}
                onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                helperText="Field or column name"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Data Type</InputLabel>
                <Select
                  value={formData.dataType}
                  onChange={(e) => setFormData({ ...formData, dataType: e.target.value as any })}
                  label="Data Type"
                >
                  <MenuItem value="string">String</MenuItem>
                  <MenuItem value="number">Number</MenuItem>
                  <MenuItem value="boolean">Boolean</MenuItem>
                  <MenuItem value="date">Date</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  label="Status"
                >
                  <MenuItem value="ACTIVE">Active</MenuItem>
                  <MenuItem value="INACTIVE">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                helperText="Describe what this data point represents"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={resetForm}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => createMutation.mutate(formData)}
            disabled={createMutation.isPending || !formData.source || !formData.key}
          >
            {createMutation.isPending ? 'Creating...' : 'Add Data Point'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default DataPointsManagement
