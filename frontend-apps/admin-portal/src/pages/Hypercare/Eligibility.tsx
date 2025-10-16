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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  Divider,
  Badge,
  Avatar,
} from '@mui/material'
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Storage as DatabaseIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
} from '@mui/icons-material'
import { hypercareAPI, EligibilityCriteria, EligibilityRule } from '../../services/hypercare'
import { productsAPI } from '../../services/products'

const EligibilityManagement = () => {
  const queryClient = useQueryClient()
  const [addDialog, setAddDialog] = useState(false)
  const [productFilter, setProductFilter] = useState('all')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    productId: '',
    isActive: true,
    rules: [] as EligibilityRule[],
  })

  const { data: criteria = [], isLoading } = useQuery({
    queryKey: ['eligibilityCriteria'],
    queryFn: () => hypercareAPI.getAllEligibilityCriteria(),
  })

  const { data: products = [] } = useQuery({
    queryKey: ['hypercare-products'],
    queryFn: () => productsAPI.getHypercareEligible(),
  })

  const { data: dataPoints = [] } = useQuery({
    queryKey: ['dataPoints'],
    queryFn: () => hypercareAPI.getAllDataPoints(),
  })

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => {
      const product = products.find((p) => p.id === data.productId)
      return hypercareAPI.createEligibilityCriteria({
        ...data,
        productCode: product?.code || '',
        productName: product?.name || '',
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eligibilityCriteria'] })
      queryClient.invalidateQueries({ queryKey: ['hypercareStats'] })
      resetForm()
      console.log('Criteria created successfully!')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<EligibilityCriteria> }) =>
      hypercareAPI.updateEligibilityCriteria(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eligibilityCriteria'] })
      console.log('Criteria updated successfully!')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => hypercareAPI.deleteEligibilityCriteria(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eligibilityCriteria'] })
      queryClient.invalidateQueries({ queryKey: ['hypercareStats'] })
      console.log('Criteria deleted successfully!')
    },
  })

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      productId: '',
      isActive: true,
      rules: [],
    })
    setAddDialog(false)
  }

  const addRule = () => {
    setFormData({
      ...formData,
      rules: [
        ...formData.rules,
        {
          id: `rule-${Date.now()}`,
          dataPointId: '',
          dataPointKey: '',
          operator: 'EQUALS',
          value: '',
          logicalOperator: formData.rules.length > 0 ? 'AND' : undefined,
        },
      ],
    })
  }

  const updateRule = (index: number, updates: Partial<EligibilityRule>) => {
    const newRules = [...formData.rules]
    newRules[index] = { ...newRules[index], ...updates }

    // If dataPointId changed, update dataPointKey
    if (updates.dataPointId) {
      const dataPoint = dataPoints.find((dp) => dp.id === updates.dataPointId)
      if (dataPoint) {
        newRules[index].dataPointKey = dataPoint.key
      }
    }

    setFormData({ ...formData, rules: newRules })
  }

  const removeRule = (index: number) => {
    const newRules = formData.rules.filter((_, i) => i !== index)
    setFormData({ ...formData, rules: newRules })
  }

  const toggleActive = (id: string, isActive: boolean) => {
    updateMutation.mutate({ id, data: { isActive: !isActive } })
  }

  const getOperatorLabel = (operator: string) => {
    const labels: Record<string, string> = {
      EQUALS: 'Equals',
      NOT_EQUALS: 'Not Equals',
      GREATER_THAN: 'Greater Than',
      LESS_THAN: 'Less Than',
      GREATER_THAN_OR_EQUAL: 'Greater or Equal',
      LESS_THAN_OR_EQUAL: 'Less or Equal',
      CONTAINS: 'Contains',
      IN: 'In List',
      NOT_IN: 'Not In List',
    }
    return labels[operator] || operator
  }

  const getDatabaseColor = (dbType: string) => {
    const colors: Record<string, string> = {
      postgresql: '#336791',
      mongodb: '#47A248',
      redis: '#DC382D',
      'external-api': '#FF6C37',
      'internal-service': '#0066CC',
    }
    return colors[dbType] || '#666'
  }

  // Calculate stats
  const totalCount = criteria.length
  const activeCount = criteria.filter((c) => c.isActive).length
  const inactiveCount = criteria.filter((c) => !c.isActive).length

  // Filter criteria
  const filteredCriteria = criteria.filter((c) => {
    if (productFilter === 'all') return true
    return c.productId === productFilter
  })

  return (
    <Box>
      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              bgcolor: '#7c3aed',
              color: 'white',
              height: '100%',
            }}
          >
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Total Criteria
                </Typography>
                <DatabaseIcon sx={{ opacity: 0.8 }} />
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
                {totalCount}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                For selected product
              </Typography>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            sx={{
              bgcolor: 'success.main',
              color: 'white',
              height: '100%',
            }}
          >
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Active Criteria
                </Typography>
                <ActiveIcon sx={{ opacity: 0.8 }} />
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
                {activeCount}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Currently enforced
              </Typography>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            sx={{
              bgcolor: '#6b7280',
              color: 'white',
              height: '100%',
            }}
          >
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Inactive Criteria
                </Typography>
                <InactiveIcon sx={{ opacity: 0.8 }} />
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
                {inactiveCount}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Not enforced
              </Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Actions Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'space-between' }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Product</InputLabel>
            <Select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              label="Filter by Product"
            >
              <MenuItem value="all">All Products</MenuItem>
              {products
                .filter((p) => p.status === 'ACTIVE')
                .map((product) => (
                  <MenuItem key={product.id} value={product.id}>
                    {product.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddDialog(true)}
            sx={{ bgcolor: '#000', '&:hover': { bgcolor: '#333' } }}
          >
            Add Criteria
          </Button>
        </Box>
      </Paper>

      {/* Criteria Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width={80}>Priority</TableCell>
                <TableCell width={100}>Status</TableCell>
                <TableCell>Criteria</TableCell>
                <TableCell>Data Source</TableCell>
                <TableCell>Comparator</TableCell>
                <TableCell>Value</TableCell>
                <TableCell>Description</TableCell>
                <TableCell width={100}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCriteria.map((item, index) => (
                <TableRow key={item.id} hover>
                  <TableCell>
                    <Avatar
                      sx={{
                        bgcolor: '#7c3aed',
                        width: 32,
                        height: 32,
                        fontSize: '0.875rem',
                        fontWeight: 700,
                      }}
                    >
                      {index + 1}
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={item.isActive}
                      onChange={() => toggleActive(item.id, item.isActive)}
                      color="success"
                    />
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {item.name}
                      </Typography>
                      <Chip
                        label={item.isActive ? 'Active' : 'Inactive'}
                        size="small"
                        color={item.isActive ? 'success' : 'default'}
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    {item.rules.length > 0 ? (
                      <Box>
                        {item.rules.slice(0, 2).map((rule, rIdx) => {
                          const dp = dataPoints.find((d) => d.id === rule.dataPointId)
                          return (
                            <Box key={rIdx} sx={{ mb: rIdx < item.rules.length - 1 ? 1 : 0 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Chip
                                  icon={<DatabaseIcon />}
                                  label={dp?.databaseType || 'N/A'}
                                  size="small"
                                  sx={{
                                    bgcolor: getDatabaseColor(dp?.databaseType || ''),
                                    color: 'white',
                                    fontWeight: 600,
                                  }}
                                />
                                <Typography variant="caption" color="text.secondary">
                                  {dp?.databaseName || 'unknown'}
                                </Typography>
                              </Box>
                              <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>
                                {rule.dataPointKey}
                              </Typography>
                            </Box>
                          )
                        })}
                        {item.rules.length > 2 && (
                          <Typography variant="caption" color="text.secondary">
                            +{item.rules.length - 2} more
                          </Typography>
                        )}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No rules
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.rules.slice(0, 2).map((rule, rIdx) => (
                      <Box key={rIdx} sx={{ mb: rIdx < Math.min(item.rules.length, 2) - 1 ? 1 : 0 }}>
                        <Chip
                          label={getOperatorLabel(rule.operator)}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    ))}
                    {item.rules.length > 2 && (
                      <Typography variant="caption" color="text.secondary">
                        +{item.rules.length - 2} more
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.rules.slice(0, 2).map((rule, rIdx) => (
                      <Box key={rIdx} sx={{ mb: rIdx < Math.min(item.rules.length, 2) - 1 ? 1 : 0 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            bgcolor: '#f3f4f6',
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            display: 'inline-block',
                            fontFamily: 'monospace',
                          }}
                        >
                          {rule.value}
                        </Typography>
                      </Box>
                    ))}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {item.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton size="small" color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => deleteMutation.mutate(item.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {filteredCriteria.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No criteria found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={addDialog} onClose={resetForm} maxWidth="md" fullWidth>
        <DialogTitle>Add Eligibility Criteria</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Criteria Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                helperText="e.g., 'Age Requirement', 'Account Status Check'"
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
                helperText="Describe what this criteria checks"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Product</InputLabel>
                <Select
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  label="Product"
                >
                  {products
                    .filter((p) => p.status === 'ACTIVE')
                    .map((product) => (
                      <MenuItem key={product.id} value={product.id}>
                        {product.name} ({product.code})
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography variant="subtitle1" fontWeight={600}>
                  Rules
                </Typography>
                <Button size="small" startIcon={<AddIcon />} onClick={addRule}>
                  Add Rule
                </Button>
              </Box>
            </Grid>

            {/* Rules Builder */}
            {formData.rules.map((rule, index) => (
              <Grid item xs={12} key={rule.id}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 2,
                    }}
                  >
                    <Typography variant="body2" fontWeight={600}>
                      Rule {index + 1}
                    </Typography>
                    <IconButton size="small" onClick={() => removeRule(index)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>

                  <Grid container spacing={2}>
                    {index > 0 && (
                      <Grid item xs={12}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Logical Operator</InputLabel>
                          <Select
                            value={rule.logicalOperator || 'AND'}
                            onChange={(e) =>
                              updateRule(index, {
                                logicalOperator: e.target.value as 'AND' | 'OR',
                              })
                            }
                            label="Logical Operator"
                          >
                            <MenuItem value="AND">AND (All rules must match)</MenuItem>
                            <MenuItem value="OR">OR (Any rule can match)</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    )}

                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Data Point</InputLabel>
                        <Select
                          value={rule.dataPointId}
                          onChange={(e) => updateRule(index, { dataPointId: e.target.value })}
                          label="Data Point"
                        >
                          {dataPoints.map((dp) => (
                            <MenuItem key={dp.id} value={dp.id}>
                              {dp.key} ({dp.source})
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Operator</InputLabel>
                        <Select
                          value={rule.operator}
                          onChange={(e) => updateRule(index, { operator: e.target.value as any })}
                          label="Operator"
                        >
                          <MenuItem value="EQUALS">Equals (=)</MenuItem>
                          <MenuItem value="NOT_EQUALS">Not Equals (≠)</MenuItem>
                          <MenuItem value="GREATER_THAN">Greater Than (&gt;)</MenuItem>
                          <MenuItem value="LESS_THAN">Less Than (&lt;)</MenuItem>
                          <MenuItem value="GREATER_THAN_OR_EQUAL">
                            Greater Than or Equal (≥)
                          </MenuItem>
                          <MenuItem value="LESS_THAN_OR_EQUAL">Less Than or Equal (≤)</MenuItem>
                          <MenuItem value="CONTAINS">Contains</MenuItem>
                          <MenuItem value="IN">In List</MenuItem>
                          <MenuItem value="NOT_IN">Not In List</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Value"
                        value={rule.value}
                        onChange={(e) => updateRule(index, { value: e.target.value })}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            ))}

            {formData.rules.length === 0 && (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                  No rules added yet. Click "Add Rule" to start building criteria.
                </Typography>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={resetForm}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => createMutation.mutate(formData)}
            disabled={
              createMutation.isPending ||
              !formData.name ||
              !formData.productId ||
              formData.rules.length === 0
            }
          >
            {createMutation.isPending ? 'Creating...' : 'Create Criteria'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default EligibilityManagement
