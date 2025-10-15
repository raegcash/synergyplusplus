import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { productsAPI } from '../../services/products'
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
  Alert,
} from '@mui/material'
import {
  ArrowBack as BackIcon,
  Save as SaveIcon,
} from '@mui/icons-material'

const ProductCreate = () => {
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

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: (data: any) => productsAPI.create({
      ...data,
      partnerId: 'temp', // Will be assigned later through partner mapping
      assets: [], // Will be added later through asset management
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      console.log('Product created successfully and submitted for approval!')
      navigate('/products')
    },
    onError: (error: any) => {
      console.log(`Error creating product: ${error.response?.data?.message || error.message}`)
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
      createProductMutation.mutate(formData)
    }
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate('/products')}
          sx={{ minWidth: 'auto' }}
        >
          Back
        </Button>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Create New Product
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Product will be submitted for approval after creation
          </Typography>
        </Box>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
          Workflow Note:
        </Typography>
        <Typography variant="body2">
          • Partners and assets will be mapped after product approval
          <br />
          • Product becomes ACTIVE after approval and when it has at least 1 partner and 1 asset
        </Typography>
      </Alert>

      {/* Form */}
      <Paper sx={{ p: 4 }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          Product Information
        </Typography>

        <Grid container spacing={3}>
          {/* Product Code */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Product Code"
              placeholder="e.g., GSTOCKS_GLOBAL"
              value={formData.code}
              onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
              error={!!errors.code}
              helperText={errors.code || 'Unique identifier for the product'}
              required
            />
          </Grid>

          {/* Product Name */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Product Name"
              placeholder="e.g., GStocks Global"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              error={!!errors.name}
              helperText={errors.name}
              required
            />
          </Grid>

          {/* Product Type */}
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

          {/* Currency */}
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

          {/* Description */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Description"
              placeholder="Describe the product and its key features..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              error={!!errors.description}
              helperText={errors.description}
              required
            />
          </Grid>

          {/* Min Investment */}
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

          {/* Max Investment */}
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

          {/* Terms and Conditions */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={6}
              label="Terms and Conditions"
              placeholder="Enter the terms and conditions for this product..."
              value={formData.termsAndConditions}
              onChange={(e) => handleInputChange('termsAndConditions', e.target.value)}
              error={!!errors.termsAndConditions}
              helperText={errors.termsAndConditions || 'Legal terms that users must agree to'}
              required
            />
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/products')}
            disabled={createProductMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSubmit}
            disabled={createProductMutation.isPending}
          >
            {createProductMutation.isPending ? 'Creating...' : 'Create Product'}
          </Button>
        </Box>
      </Paper>
    </Box>
  )
}

export default ProductCreate
