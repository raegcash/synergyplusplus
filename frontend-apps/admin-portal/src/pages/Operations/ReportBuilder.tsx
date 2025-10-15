import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Step,
  StepLabel,
  Stepper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Checkbox,
  Alert,
} from '@mui/material'
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  PlayArrow as RunIcon,
  Save as SaveIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material'
import { reportBuilderAPI, DataSource, ReportDefinition, ReportColumn, ReportFilter } from '../../services/reportBuilder'

const steps = ['Select Data Source', 'Choose Columns', 'Add Filters', 'Preview & Export']

const OPERATORS = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Not Equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'not_contains', label: 'Does Not Contain' },
  { value: 'greater_than', label: 'Greater Than' },
  { value: 'less_than', label: 'Less Than' },
  { value: 'between', label: 'Between' },
  { value: 'in', label: 'In' },
  { value: 'not_in', label: 'Not In' },
  { value: 'is_null', label: 'Is Null' },
  { value: 'is_not_null', label: 'Is Not Null' },
]

const AGGREGATES = [
  { value: 'none', label: 'No Aggregate' },
  { value: 'count', label: 'Count' },
  { value: 'sum', label: 'Sum' },
  { value: 'avg', label: 'Average' },
  { value: 'min', label: 'Minimum' },
  { value: 'max', label: 'Maximum' },
]

export default function ReportBuilderPage() {
  const [activeStep, setActiveStep] = useState(0)
  const [reportName, setReportName] = useState('')
  const [reportDescription, setReportDescription] = useState('')
  const [selectedDataSource, setSelectedDataSource] = useState<DataSource | null>(null)
  const [selectedColumns, setSelectedColumns] = useState<ReportColumn[]>([])
  const [filters, setFilters] = useState<ReportFilter[]>([])
  const [previewData, setPreviewData] = useState<any>(null)
  const [showSaveDialog, setShowSaveDialog] = useState(false)

  // Queries
  const { data: dataSources = [] } = useQuery({
    queryKey: ['data-sources'],
    queryFn: reportBuilderAPI.getDataSources,
  })

  const executeReportMutation = useMutation({
    mutationFn: reportBuilderAPI.executeReport,
    onSuccess: (data) => {
      setPreviewData(data)
    },
  })

  const saveReportMutation = useMutation({
    mutationFn: reportBuilderAPI.saveReport,
    onSuccess: () => {
      setShowSaveDialog(false)
      console.log('Report saved successfully!')
    },
  })

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1)
  }

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
  }

  const handleReset = () => {
    setActiveStep(0)
    setSelectedDataSource(null)
    setSelectedColumns([])
    setFilters([])
    setPreviewData(null)
    setReportName('')
    setReportDescription('')
  }

  const handleColumnToggle = (fieldId: string) => {
    const field = selectedDataSource?.fields.find((f) => f.id === fieldId)
    if (!field) return

    const exists = selectedColumns.find((c) => c.field === fieldId)
    if (exists) {
      setSelectedColumns(selectedColumns.filter((c) => c.field !== fieldId))
    } else {
      setSelectedColumns([
        ...selectedColumns,
        { field: fieldId, label: field.name },
      ])
    }
  }

  const handleAggregateChange = (fieldId: string, aggregate: string) => {
    setSelectedColumns(
      selectedColumns.map((c) =>
        c.field === fieldId
          ? { ...c, aggregate: aggregate === 'none' ? undefined : (aggregate as any) }
          : c
      )
    )
  }

  const addFilter = () => {
    if (!selectedDataSource?.fields.length) return
    const firstField = selectedDataSource.fields[0]
    setFilters([
      ...filters,
      {
        field: firstField.id,
        operator: 'equals',
        value: '',
      },
    ])
  }

  const updateFilter = (index: number, updates: Partial<ReportFilter>) => {
    const newFilters = [...filters]
    newFilters[index] = { ...newFilters[index], ...updates }
    setFilters(newFilters)
  }

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index))
  }

  const handlePreview = () => {
    if (!selectedDataSource) return

    const report: ReportDefinition = {
      name: reportName || 'Untitled Report',
      description: reportDescription,
      dataSource: selectedDataSource.id,
      columns: selectedColumns,
      filters,
      groupBy: selectedColumns
        .filter((c) => c.aggregate)
        .map((c) => c.field),
      orderBy: [],
      limit: 100,
    }

    executeReportMutation.mutate(report)
    handleNext()
  }

  const handleSave = () => {
    if (!selectedDataSource || !reportName) {
      console.log('Please enter a report name')
      return
    }

    const report: ReportDefinition = {
      name: reportName,
      description: reportDescription,
      dataSource: selectedDataSource.id,
      columns: selectedColumns,
      filters,
      groupBy: selectedColumns
        .filter((c) => c.aggregate)
        .map((c) => c.field),
      orderBy: [],
    }

    saveReportMutation.mutate(report)
  }

  const handleExport = async (format: 'CSV' | 'EXCEL' | 'PDF') => {
    if (!selectedDataSource) return

    const report: ReportDefinition = {
      name: reportName || 'Untitled Report',
      description: reportDescription,
      dataSource: selectedDataSource.id,
      columns: selectedColumns,
      filters,
      groupBy: [],
      orderBy: [],
    }

    try {
      const blob = await reportBuilderAPI.exportReport(report, format)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${reportName || 'report'}.${format.toLowerCase()}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Export failed:', error)
      console.log('Export failed. Please try again.')
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Custom Report Builder
        </Typography>
        <Button variant="outlined" onClick={handleReset}>
          Start New Report
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step 1: Select Data Source */}
        {activeStep === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Select a Data Source
            </Typography>
            <Grid container spacing={2} sx={{ mt: 2 }}>
              {dataSources.map((source) => (
                <Grid item xs={12} sm={6} md={4} key={source.id}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      border: selectedDataSource?.id === source.id ? 2 : 0,
                      borderColor: 'primary.main',
                    }}
                    onClick={() => setSelectedDataSource(source)}
                  >
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {source.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {source.description}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        {source.fields.length} fields available
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!selectedDataSource}
              >
                Next
              </Button>
            </Box>
          </Box>
        )}

        {/* Step 2: Choose Columns */}
        {activeStep === 1 && selectedDataSource && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Choose Columns
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Select the fields you want to include in your report
            </Typography>

            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2, maxHeight: 400, overflow: 'auto' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Available Fields
                  </Typography>
                  <List>
                    {selectedDataSource.fields.map((field) => (
                      <ListItem key={field.id} disablePadding>
                        <ListItemButton onClick={() => handleColumnToggle(field.id)}>
                          <Checkbox
                            edge="start"
                            checked={selectedColumns.some((c) => c.field === field.id)}
                            tabIndex={-1}
                            disableRipple
                          />
                          <ListItemText
                            primary={field.name}
                            secondary={field.type}
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2, maxHeight: 400, overflow: 'auto' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Selected Columns ({selectedColumns.length})
                  </Typography>
                  {selectedColumns.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No columns selected yet
                    </Typography>
                  ) : (
                    <List>
                      {selectedColumns.map((column, index) => {
                        const field = selectedDataSource.fields.find((f) => f.id === column.field)
                        return (
                          <ListItem key={index}>
                            <ListItemText primary={column.label} />
                            {field?.aggregatable && (
                              <Select
                                size="small"
                                value={column.aggregate || 'none'}
                                onChange={(e) =>
                                  handleAggregateChange(column.field, e.target.value)
                                }
                                sx={{ mr: 1 }}
                              >
                                {AGGREGATES.map((agg) => (
                                  <MenuItem key={agg.value} value={agg.value}>
                                    {agg.label}
                                  </MenuItem>
                                ))}
                              </Select>
                            )}
                            <IconButton
                              size="small"
                              onClick={() => handleColumnToggle(column.field)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </ListItem>
                        )
                      })}
                    </List>
                  )}
                </Paper>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={handleBack}>Back</Button>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={selectedColumns.length === 0}
              >
                Next
              </Button>
            </Box>
          </Box>
        )}

        {/* Step 3: Add Filters */}
        {activeStep === 2 && selectedDataSource && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Add Filters (Optional)
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Filter the data to show only what you need
            </Typography>

            <Button
              startIcon={<AddIcon />}
              onClick={addFilter}
              sx={{ mt: 2, mb: 2 }}
            >
              Add Filter
            </Button>

            {filters.length > 0 && (
              <Box>
                {filters.map((filter, index) => {
                  const field = selectedDataSource.fields.find((f) => f.id === filter.field)
                  return (
                    <Paper key={index} sx={{ p: 2, mb: 2 }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={3}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Field</InputLabel>
                            <Select
                              value={filter.field}
                              label="Field"
                              onChange={(e) =>
                                updateFilter(index, { field: e.target.value })
                              }
                            >
                              {selectedDataSource.fields.map((f) => (
                                <MenuItem key={f.id} value={f.id}>
                                  {f.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Operator</InputLabel>
                            <Select
                              value={filter.operator}
                              label="Operator"
                              onChange={(e) =>
                                updateFilter(index, { operator: e.target.value as any })
                              }
                            >
                              {OPERATORS.map((op) => (
                                <MenuItem key={op.value} value={op.value}>
                                  {op.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        {!['is_null', 'is_not_null'].includes(filter.operator) && (
                          <Grid item xs={12} sm={5}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Value"
                              value={filter.value}
                              onChange={(e) =>
                                updateFilter(index, { value: e.target.value })
                              }
                              type={field?.type === 'number' || field?.type === 'currency' ? 'number' : field?.type === 'date' ? 'date' : 'text'}
                              InputLabelProps={field?.type === 'date' ? { shrink: true } : undefined}
                            />
                          </Grid>
                        )}
                        <Grid item xs={12} sm={1}>
                          <IconButton onClick={() => removeFilter(index)}>
                            <DeleteIcon />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </Paper>
                  )
                })}
              </Box>
            )}

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={handleBack}>Back</Button>
              <Button variant="contained" onClick={handlePreview}>
                Preview Report
              </Button>
            </Box>
          </Box>
        )}

        {/* Step 4: Preview & Export */}
        {activeStep === 3 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                Report Preview
              </Typography>
              <Box>
                <Button
                  startIcon={<SaveIcon />}
                  onClick={() => setShowSaveDialog(true)}
                  sx={{ mr: 1 }}
                >
                  Save Report
                </Button>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={() => handleExport('CSV')}
                >
                  Export CSV
                </Button>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={() => handleExport('EXCEL')}
                  sx={{ ml: 1 }}
                >
                  Export Excel
                </Button>
              </Box>
            </Box>

            {executeReportMutation.isPending && (
              <Alert severity="info">Executing report...</Alert>
            )}

            {previewData && (
              <>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Showing {previewData.data.length} of {previewData.totalRows} rows
                  (Execution time: {previewData.executionTime}ms)
                </Typography>

                <TableContainer component={Paper} sx={{ mt: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        {previewData.columns.map((col: any) => (
                          <TableCell key={col.field}>
                            <strong>{col.label}</strong>
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {previewData.data.map((row: any, index: number) => (
                        <TableRow key={index}>
                          {previewData.columns.map((col: any) => (
                            <TableCell key={col.field}>
                              {col.type === 'currency'
                                ? `₱${Number(row[col.field] || 0).toLocaleString()}`
                                : col.type === 'date'
                                ? row[col.field]
                                  ? new Date(row[col.field]).toLocaleDateString()
                                  : '-'
                                : row[col.field] || '-'}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button onClick={handleBack}>Back</Button>
              <Button variant="outlined" onClick={handleReset}>
                Create New Report
              </Button>
            </Box>
          </Box>
        )}
      </Paper>

      {/* Save Report Dialog */}
      <Dialog open={showSaveDialog} onClose={() => setShowSaveDialog(false)}>
        <DialogTitle>Save Report</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Report Name"
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
            sx={{ mt: 2, mb: 2 }}
          />
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Description"
            value={reportDescription}
            onChange={(e) => setReportDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSaveDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!reportName}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}



