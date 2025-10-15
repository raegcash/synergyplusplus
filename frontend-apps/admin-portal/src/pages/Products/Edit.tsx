import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material'
import {
  ArrowBack as BackIcon,
  Save as SaveIcon,
} from '@mui/icons-material'
import { productsAPI } from '../../services/products'

const ProductEdit = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    productType: 'INVESTMENT',
    description: '',
    minInvestment: 1000,
    maxInvestment: 1000000,
    currency: 'PHP',
    termsAndConditions: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const { data: product, isLoading } = useQuery({
    queryKey: ['products', id],
    queryFn: () => productsAPI.getById(id!),
    enabled: !!id,
  })

  useEffect(() => {
    if (product) {
      setFormData({
        code: product.code,
        name: product.name,
        productType: product.productType,
        description: product.description,
        minInvestment: product.minInvestment,
        maxInvestment: product.maxInvestment,
        currency: product.currency,
        termsAndConditions: product.termsAndConditions,
      })
    }
  }, [product])

  const updateMutation = useMutation({
    mutationFn: (data: any) => productsAPI.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      console.log('Product updated successfully!')
      navigate(`/products/${id}`)
    },
    onError: (error: any) => {
      console.log(`Error updating product: ${error.response?.data?.message || error.message}`)
    },
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.code.trim()) newErrors.code = 'Product code is required'
    if (!formData.name.trim()) newErrors.name = 'Product name is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (formData.minInvestment <= 0) newErrors.minInvestment = 'Minimum investment must be greater than 0'
    if (formData.maxInvestment <= formData.minInvestment) {
      newErrors.maxInvestment = 'Maximum investment must be greater than minimum'
    }
    if (!formData.termsAndConditions.trim()) {
      newErrors.termsAndConditions = 'Terms and conditions are required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validateForm()) {
      updateMutation.mutate(formData)
    }
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!product) {
    return (
      <Box>
        <Alert severity="error">Product not found</Alert>
        <Button startIcon={<BackIcon />} onClick={() => navigate('/products')} sx={{ mt: 2 }}>
          Back to Products
        </Button>
      </Box>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate(`/products/${id}`)}
          sx={{ minWidth: 'auto' }}
        >
          Back
        </Button>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Edit Product
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {product.name} ({product.code})
          </Typography>
        </Box>
      </Box>

      {/* Form */}
      <Paper sx={{ p: 4 }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          Product Information
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Product Code"
              value={formData.code}
              onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
              error={!!errors.code}
              helperText={errors.code}
              required
              disabled
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Product Name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              error={!!errors.name}
              helperText={errors.name}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Product Type</InputLabel>
              <Select
                value={formData.productType}
                onChange={(e) => handleInputChange('productType', e.target.value)}
                label="Product Type"
              >
                <MenuItem value="INVESTMENT">Investment</MenuItem>
                <MenuItem value="SAVINGS">Savings</MenuItem>
                <MenuItem value="LENDING">Lending</MenuItem>
                <MenuItem value="INSURANCE">Insurance</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Currency</InputLabel>
              <Select
                value={formData.currency}
                onChange={(e) => handleInputChange('currency', e.target.value)}
                label="Currency"
              >
                <MenuItem value="PHP">PHP - Philippine Peso</MenuItem>
                <MenuItem value="USD">USD - US Dollar</MenuItem>
                <MenuItem value="EUR">EUR - Euro</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              error={!!errors.description}
              helperText={errors.description}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Minimum Investment"
              value={formData.minInvestment}
              onChange={(e) => handleInputChange('minInvestment', parseFloat(e.target.value))}
              error={!!errors.minInvestment}
              helperText={errors.minInvestment}
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>{formData.currency}</Typography>,
              }}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Maximum Investment"
              value={formData.maxInvestment}
              onChange={(e) => handleInputChange('maxInvestment', parseFloat(e.target.value))}
              error={!!errors.maxInvestment}
              helperText={errors.maxInvestment}
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>{formData.currency}</Typography>,
              }}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={6}
              label="Terms and Conditions"
              value={formData.termsAndConditions}
              onChange={(e) => handleInputChange('termsAndConditions', e.target.value)}
              error={!!errors.termsAndConditions}
              helperText={errors.termsAndConditions}
              required
            />
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
          <Button
            variant="outlined"
            onClick={() => navigate(`/products/${id}`)}
            disabled={updateMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSubmit}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      </Paper>
    </Box>
  )
}

export default ProductEdit



