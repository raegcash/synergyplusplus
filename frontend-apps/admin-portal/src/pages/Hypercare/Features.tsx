import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Switch,
  Slider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import { Add as AddIcon } from '@mui/icons-material'
import { productsAPI } from '../../services/products'
import { featuresAPI } from '../../services/features'

const Features = () => {
  const [createDialog, setCreateDialog] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState('')
  
  const queryClient = useQueryClient()
  
  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsAPI.getAll(),
  })

  const { data: features, isLoading, error } = useQuery({
    queryKey: ['features', selectedProduct],
    queryFn: () => featuresAPI.getAll(selectedProduct || undefined),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ featureId, enabled }: any) => 
      featuresAPI.update(featureId, { enabled } as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['features'] })
    },
  })

  const rolloutMutation = useMutation({
    mutationFn: ({ featureId, percentage }: any) => 
      featuresAPI.update(featureId, { rolloutPercentage: percentage } as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['features'] })
    },
  })

  const handleRolloutChange = (featureId: string, value: number) => {
    rolloutMutation.mutate({ featureId, percentage: value })
  }

  if (isLoading) return <Typography>Loading...</Typography>
  if (error) return <Alert severity="error">Error loading features</Alert>

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ mb: 0.5, fontWeight: 700 }}>
            Feature Flags
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Enable/disable features and control rollout percentage
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl sx={{ minWidth: 200 }} size="small">
            <InputLabel>Filter by Product</InputLabel>
            <Select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              label="Filter by Product"
            >
              <MenuItem value="">All Products</MenuItem>
              {products?.map((product: any) => (
                <MenuItem key={product.id} value={product.id}>
                  {product.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateDialog(true)} sx={{ boxShadow: 1 }}>
            Add Feature
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Product</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Rollout %</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {features?.map((feature: any) => {
              const product = products?.find((p: any) => p.id === feature.productId)
              return (
                <TableRow key={feature.id}>
                  <TableCell>{feature.code}</TableCell>
                  <TableCell>
                    <Typography variant="body2">{feature.name}</Typography>
                    {feature.description && (
                      <Typography variant="caption" color="text.secondary">
                        {feature.description}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{product?.name || 'Unknown'}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Switch
                        checked={feature.enabled}
                        onChange={(e) => toggleMutation.mutate({
                          featureId: feature.id,
                          enabled: e.target.checked,
                        })}
                        color="primary"
                      />
                      <Chip
                        label={feature.enabled ? 'Enabled' : 'Disabled'}
                        color={feature.enabled ? 'success' : 'default'}
                        size="small"
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ width: 200 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Slider
                          value={feature.rolloutPercentage}
                          onChange={(_, value) => handleRolloutChange(feature.id, value as number)}
                          disabled={!feature.enabled}
                          valueLabelDisplay="auto"
                          step={5}
                          marks
                          min={0}
                          max={100}
                        />
                        <Typography variant="body2" sx={{ minWidth: 40 }}>
                          {feature.rolloutPercentage}%
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Button size="small">Edit</Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create Feature Dialog */}
      <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Feature Flag</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Create a new feature flag to control feature availability
          </Typography>
          <TextField fullWidth label="Feature Code" margin="normal" placeholder="e.g., SOCIAL_TRADING" />
          <TextField fullWidth label="Feature Name" margin="normal" placeholder="e.g., Social Trading" />
          <TextField fullWidth multiline rows={2} label="Description" margin="normal" />
          <FormControl fullWidth margin="normal">
            <InputLabel>Product</InputLabel>
            <Select label="Product">
              {products?.map((product: any) => (
                <MenuItem key={product.id} value={product.id}>
                  {product.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog(false)}>Cancel</Button>
          <Button variant="contained">Create Feature</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Features

