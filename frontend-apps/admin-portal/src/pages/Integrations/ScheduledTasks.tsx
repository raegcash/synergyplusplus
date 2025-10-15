import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Tooltip,
  Tab,
  Tabs,
  Alert,
} from '@mui/material'
import {
  Add as AddIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  History as HistoryIcon,
  Schedule as ScheduleIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from '@mui/icons-material'
import { scheduledTasksAPI, ScheduledTask } from '../../services/scheduledTasks'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

export default function ScheduledTasksPage() {
  const queryClient = useQueryClient()
  const [tabValue, setTabValue] = useState(0)
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedTask, setSelectedTask] = useState<ScheduledTask | null>(null)
  const [viewHistoryTask, setViewHistoryTask] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    taskType: 'KYC_SUBMISSION' as ScheduledTask['taskType'],
    dataType: '',
    partnerId: '',
    productId: '',
    scheduleType: 'DAILY' as ScheduledTask['scheduleType'],
    cronExpression: '',
    scheduleTime: '00:00',
    scheduleDays: [] as number[],
    scheduleDate: 1,
    timezone: 'Asia/Manila',
    endpoint: '',
    method: 'POST' as 'GET' | 'POST' | 'PUT' | 'PATCH',
    generateFile: true,
    fileFormat: 'CSV' as 'CSV' | 'JSON' | 'XML' | 'EXCEL' | 'FIXED_WIDTH',
    deliveryMethod: 'SFTP' as 'SFTP' | 'API' | 'EMAIL' | 'CLOUD_STORAGE',
    sftpHost: '',
    sftpPath: '',
    apiEndpoint: '',
    email: '',
    bucket: '',
    notifyOnSuccess: false,
    notifyOnFailure: true,
    notificationEmail: '',
  })

  // Queries
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['scheduled-tasks'],
    queryFn: scheduledTasksAPI.getAll,
  })

  const { data: recentExecutions = [] } = useQuery({
    queryKey: ['recent-executions'],
    queryFn: () => scheduledTasksAPI.getRecentExecutions(20),
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: scheduledTasksAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-tasks'] })
      setOpenDialog(false)
      resetForm()
    },
  })

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'ACTIVE' | 'PAUSED' }) =>
      scheduledTasksAPI.toggleStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-tasks'] })
    },
  })

  const runNowMutation = useMutation({
    mutationFn: scheduledTasksAPI.runNow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recent-executions'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: scheduledTasksAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-tasks'] })
    },
  })

  const handleSubmit = () => {
    createMutation.mutate({
      ...formData,
      status: 'ACTIVE',
      isRunning: false,
      totalRuns: 0,
      successfulRuns: 0,
      failedRuns: 0,
      deliveryConfig: {
        sftpHost: formData.sftpHost,
        sftpPath: formData.sftpPath,
        apiEndpoint: formData.apiEndpoint,
        email: formData.email,
        bucket: formData.bucket,
      },
      createdBy: 'admin@superapp.com',
    } as any)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      taskType: 'KYC_SUBMISSION',
      dataType: '',
      partnerId: '',
      productId: '',
      scheduleType: 'DAILY',
      cronExpression: '',
      scheduleTime: '00:00',
      scheduleDays: [],
      scheduleDate: 1,
      timezone: 'Asia/Manila',
      endpoint: '',
      method: 'POST',
      generateFile: true,
      fileFormat: 'CSV',
      deliveryMethod: 'SFTP',
      sftpHost: '',
      sftpPath: '',
      apiEndpoint: '',
      email: '',
      bucket: '',
      notifyOnSuccess: false,
      notifyOnFailure: true,
      notificationEmail: '',
    })
  }

  const getTaskTypeColor = (type: string) => {
    const colors: Record<string, any> = {
      KYC_SUBMISSION: 'primary',
      TRANSACTION_SYNC: 'secondary',
      PORTFOLIO_UPDATE: 'info',
      SETTLEMENT: 'warning',
      REPORTING: 'success',
      DATA_SYNC: 'default',
    }
    return colors[type] || 'default'
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, any> = {
      ACTIVE: 'success',
      PAUSED: 'warning',
      DISABLED: 'error',
    }
    return colors[status] || 'default'
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Scheduled Tasks & Integrations
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Create New Task
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Tasks
              </Typography>
              <Typography variant="h4">{tasks.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Tasks
              </Typography>
              <Typography variant="h4" color="success.main">
                {tasks.filter(t => t.status === 'ACTIVE').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Running Now
              </Typography>
              <Typography variant="h4" color="info.main">
                {tasks.filter(t => t.isRunning).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Success Rate
              </Typography>
              <Typography variant="h4" color="success.main">
                {tasks.length > 0
                  ? Math.round(
                      (tasks.reduce((sum, t) => sum + t.successfulRuns, 0) /
                        tasks.reduce((sum, t) => sum + t.totalRuns, 1)) *
                        100
                    )
                  : 0}
                %
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="Active Tasks" icon={<ScheduleIcon />} iconPosition="start" />
          <Tab label="Recent Executions" icon={<HistoryIcon />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Task Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Schedule</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Last Run</TableCell>
                <TableCell>Next Run</TableCell>
                <TableCell>Success Rate</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>
                    <Box>
                      <Typography variant="body1" fontWeight="bold">
                        {task.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {task.description}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={task.taskType.replace('_', ' ')}
                      color={getTaskTypeColor(task.taskType)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{task.scheduleType}</Typography>
                    {task.scheduleTime && (
                      <Typography variant="caption" color="textSecondary">
                        {task.scheduleTime}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={task.status}
                      color={getStatusColor(task.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {task.lastRun ? (
                      <Box>
                        <Typography variant="body2">
                          {new Date(task.lastRun).toLocaleString()}
                        </Typography>
                        <Chip
                          icon={
                            task.lastRunStatus === 'SUCCESS' ? (
                              <SuccessIcon />
                            ) : (
                              <ErrorIcon />
                            )
                          }
                          label={task.lastRunStatus}
                          color={task.lastRunStatus === 'SUCCESS' ? 'success' : 'error'}
                          size="small"
                        />
                      </Box>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    {task.nextRun ? new Date(task.nextRun).toLocaleString() : '-'}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {task.totalRuns > 0
                        ? Math.round((task.successfulRuns / task.totalRuns) * 100)
                        : 0}
                      %
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {task.successfulRuns}/{task.totalRuns}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Tooltip title={task.status === 'ACTIVE' ? 'Pause' : 'Resume'}>
                      <IconButton
                        size="small"
                        onClick={() =>
                          toggleStatusMutation.mutate({
                            id: task.id,
                            status: task.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE',
                          })
                        }
                      >
                        {task.status === 'ACTIVE' ? <PauseIcon /> : <PlayIcon />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Run Now">
                      <IconButton
                        size="small"
                        onClick={() => runNowMutation.mutate(task.id)}
                        disabled={task.isRunning}
                      >
                        <PlayIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="View History">
                      <IconButton
                        size="small"
                        onClick={() => setViewHistoryTask(task.id)}
                      >
                        <HistoryIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={() => {
                          if (window.confirm('Delete this task?')) {
                            deleteMutation.mutate(task.id)
                          }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Task Name</TableCell>
                <TableCell>Started At</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Records</TableCell>
                <TableCell>File</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentExecutions.map((execution) => (
                <TableRow key={execution.id}>
                  <TableCell>{execution.taskName}</TableCell>
                  <TableCell>
                    {new Date(execution.startedAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {execution.duration
                      ? `${(execution.duration / 1000).toFixed(1)}s`
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={
                        execution.status === 'SUCCESS' ? (
                          <SuccessIcon />
                        ) : execution.status === 'FAILED' ? (
                          <ErrorIcon />
                        ) : (
                          <InfoIcon />
                        )
                      }
                      label={execution.status}
                      color={
                        execution.status === 'SUCCESS'
                          ? 'success'
                          : execution.status === 'FAILED'
                          ? 'error'
                          : 'default'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        Total: {execution.recordsProcessed}
                      </Typography>
                      <Typography variant="caption" color="success.main">
                        Success: {execution.recordsSuccess}
                      </Typography>
                      {execution.recordsFailed > 0 && (
                        <Typography variant="caption" color="error.main">
                          , Failed: {execution.recordsFailed}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {execution.fileGenerated && execution.fileName ? (
                      <Chip
                        label={execution.fileName}
                        size="small"
                        variant="outlined"
                      />
                    ) : (
                      '-'
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Create Task Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Scheduled Task</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Task Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Task Type</InputLabel>
                <Select
                  value={formData.taskType}
                  label="Task Type"
                  onChange={(e) =>
                    setFormData({ ...formData, taskType: e.target.value as any })
                  }
                >
                  <MenuItem value="KYC_SUBMISSION">KYC Submission</MenuItem>
                  <MenuItem value="TRANSACTION_SYNC">Transaction Sync</MenuItem>
                  <MenuItem value="PORTFOLIO_UPDATE">Portfolio Update</MenuItem>
                  <MenuItem value="SETTLEMENT">Settlement</MenuItem>
                  <MenuItem value="REPORTING">Reporting</MenuItem>
                  <MenuItem value="DATA_SYNC">Data Sync</MenuItem>
                  <MenuItem value="CUSTOM">Custom</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Schedule Type</InputLabel>
                <Select
                  value={formData.scheduleType}
                  label="Schedule Type"
                  onChange={(e) =>
                    setFormData({ ...formData, scheduleType: e.target.value as any })
                  }
                >
                  <MenuItem value="ONCE">Once</MenuItem>
                  <MenuItem value="DAILY">Daily</MenuItem>
                  <MenuItem value="WEEKLY">Weekly</MenuItem>
                  <MenuItem value="MONTHLY">Monthly</MenuItem>
                  <MenuItem value="CRON">Cron Expression</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {formData.scheduleType === 'CRON' ? (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Cron Expression"
                  value={formData.cronExpression}
                  onChange={(e) =>
                    setFormData({ ...formData, cronExpression: e.target.value })
                  }
                  helperText="E.g., 0 * * * * (every hour)"
                />
              </Grid>
            ) : (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="time"
                  label="Schedule Time"
                  value={formData.scheduleTime}
                  onChange={(e) =>
                    setFormData({ ...formData, scheduleTime: e.target.value })
                  }
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.generateFile}
                    onChange={(e) =>
                      setFormData({ ...formData, generateFile: e.target.checked })
                    }
                  />
                }
                label="Generate File"
              />
            </Grid>

            {formData.generateFile && (
              <>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>File Format</InputLabel>
                    <Select
                      value={formData.fileFormat}
                      label="File Format"
                      onChange={(e) =>
                        setFormData({ ...formData, fileFormat: e.target.value as any })
                      }
                    >
                      <MenuItem value="CSV">CSV</MenuItem>
                      <MenuItem value="JSON">JSON</MenuItem>
                      <MenuItem value="XML">XML</MenuItem>
                      <MenuItem value="EXCEL">Excel</MenuItem>
                      <MenuItem value="FIXED_WIDTH">Fixed Width</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Delivery Method</InputLabel>
                    <Select
                      value={formData.deliveryMethod}
                      label="Delivery Method"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          deliveryMethod: e.target.value as any,
                        })
                      }
                    >
                      <MenuItem value="SFTP">SFTP</MenuItem>
                      <MenuItem value="API">API</MenuItem>
                      <MenuItem value="EMAIL">Email</MenuItem>
                      <MenuItem value="CLOUD_STORAGE">Cloud Storage</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {formData.deliveryMethod === 'SFTP' && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="SFTP Host"
                        value={formData.sftpHost}
                        onChange={(e) =>
                          setFormData({ ...formData, sftpHost: e.target.value })
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="SFTP Path"
                        value={formData.sftpPath}
                        onChange={(e) =>
                          setFormData({ ...formData, sftpPath: e.target.value })
                        }
                      />
                    </Grid>
                  </>
                )}

                {formData.deliveryMethod === 'API' && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="API Endpoint"
                      value={formData.apiEndpoint}
                      onChange={(e) =>
                        setFormData({ ...formData, apiEndpoint: e.target.value })
                      }
                    />
                  </Grid>
                )}

                {formData.deliveryMethod === 'EMAIL' && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </Grid>
                )}
              </>
            )}

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.notifyOnFailure}
                    onChange={(e) =>
                      setFormData({ ...formData, notifyOnFailure: e.target.checked })
                    }
                  />
                }
                label="Notify on Failure"
              />
            </Grid>

            {formData.notifyOnFailure && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notification Email"
                  type="email"
                  value={formData.notificationEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, notificationEmail: e.target.value })
                  }
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!formData.name || !formData.taskType}
          >
            Create Task
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}



