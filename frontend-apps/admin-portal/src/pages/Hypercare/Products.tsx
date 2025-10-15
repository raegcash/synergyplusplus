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
  IconButton,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from '@mui/material'
import { Add as AddIcon, Build as MaintenanceIcon } from '@mui/icons-material'
import { productsAPI } from '../../services/products'

const Products = () => {
  const [maintenanceDialog, setMaintenanceDialog] = useState<{ open: boolean; product?: any }>({
    open: false,
  })
  const [maintenanceMessage, setMaintenanceMessage] = useState('')
  
  const queryClient = useQueryClient()
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsAPI.getAll(),
  })

  const maintenanceMutation = useMutation({
    mutationFn: ({ productId, enabled }: any) =>
      productsAPI.update(productId, { maintenanceMode: enabled } as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      setMaintenanceDialog({ open: false })
      setMaintenanceMessage('')
    },
  })

  const statusMutation = useMutation({
    mutationFn: ({ productId, status }: any) => 
      productsAPI.update(productId, { status } as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })

  const handleMaintenanceToggle = (product: any) => {
    if (!product.maintenanceMode) {
      setMaintenanceDialog({ open: true, product })
    } else {
      maintenanceMutation.mutate({
        productId: product.id,
        enabled: false,
      })
    }
  }

  const handleMaintenanceConfirm = () => {
    if (maintenanceDialog.product) {
      maintenanceMutation.mutate({
        productId: maintenanceDialog.product.id,
        enabled: true,
        message: maintenanceMessage,
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success'
      case 'SUSPENDED': return 'warning'
      case 'RETIRED': return 'error'
      default: return 'default'
    }
  }

  if (isLoading) return <Typography>Loading...</Typography>
  if (error) return <Alert severity="error">Error loading products</Alert>

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ mb: 0.5, fontWeight: 700 }}>
            Hypercare Products
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage products and maintenance mode
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} sx={{ boxShadow: 1 }}>
          Add Product
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Maintenance</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products?.map((product: any) => (
              <TableRow key={product.id}>
                <TableCell>{product.code}</TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.productType}</TableCell>
                <TableCell>
                  <Chip
                    label={product.status}
                    color={getStatusColor(product.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Switch
                      checked={product.maintenanceMode}
                      onChange={() => handleMaintenanceToggle(product)}
                      color="warning"
                    />
                    {product.maintenanceMode && <MaintenanceIcon color="warning" fontSize="small" />}
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Button size="small" onClick={() => statusMutation.mutate({ 
                    productId: product.id, 
                    status: product.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' 
                  })}>
                    {product.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Maintenance Mode Dialog */}
      <Dialog open={maintenanceDialog.open} onClose={() => setMaintenanceDialog({ open: false })}>
        <DialogTitle>Enable Maintenance Mode</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Entering maintenance mode will make this product unavailable to users.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Maintenance Message"
            placeholder="e.g., We're performing scheduled maintenance. Service will resume shortly."
            value={maintenanceMessage}
            onChange={(e) => setMaintenanceMessage(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMaintenanceDialog({ open: false })}>Cancel</Button>
          <Button onClick={handleMaintenanceConfirm} variant="contained" color="warning">
            Enable Maintenance
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Products

