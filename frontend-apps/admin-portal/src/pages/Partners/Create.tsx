import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
  Alert,
  Chip,
  OutlinedInput,
  SelectChangeEvent,
} from '@mui/material'
import {
  ArrowBack as BackIcon,
  Save as SaveIcon,
} from '@mui/icons-material'
import { partnersAPI } from '../../services/partners'
import { productsAPI } from '../../services/products'

const PartnerCreate = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'BANK' as 'BANK' | 'INVESTMENT' | 'INSURANCE' | 'FINTECH' | 'OTHER',
    contactEmail: '',
    contactPhone: '',
    website: '',
    address: '',
    description: '',
    webhookUrl: '',
    apiKey: '',
    productIds: [] as string[], // Selected product IDs
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fetch APPROVED products (products that have been approved by admin)
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['products', 'APPROVED'],
    queryFn: () => productsAPI.getAll('APPROVED'),
  })

  // Create partner mutation
  const createPartnerMutation = useMutation({
    mutationFn: (data: typeof formData) => partnersAPI.create({
      code: data.code,
      name: data.name,
      type: data.type,
      status: 'PENDING',
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      webhookUrl: data.webhookUrl,
      productIds: data.productIds, // Pass selected products
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] })
      console.log('Partner created successfully and submitted for approval!')
      navigate('/partners')
    },
    onError: (error: any) => {
      console.log(`Error creating partner: ${error.response?.data?.message || error.message}`)
    },
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleProductsChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value
    handleInputChange('productIds', typeof value === 'string' ? value.split(',') : value)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.code.trim()) newErrors.code = 'Partner code is required'
    if (!formData.name.trim()) newErrors.name = 'Partner name is required'
    if (!formData.contactEmail.trim()) newErrors.contactEmail = 'Contact email is required'
    if (formData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Invalid email format'
    }
    if (formData.productIds.length === 0) {
      newErrors.productIds = 'Please select at least one product to map with'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validateForm()) {
      createPartnerMutation.mutate(formData)
    }
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate('/partners')}
          sx={{ minWidth: 'auto' }}
        >
          Back
        </Button>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Create New Partner
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Partner will be submitted for approval after creation
          </Typography>
        </Box>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
          Workflow Note:
        </Typography>
        <Typography variant="body2">
          • Select APPROVED products to map this partner with
          <br />
          • Partner becomes APPROVED after admin approval
          <br />
          • Assets can then be added to this partner-product combination
        </Typography>
      </Alert>

      {/* Form */}
      <Paper sx={{ p: 4 }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          Partner Information
        </Typography>

        <Grid container spacing={3}>
          {/* Partner Code */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Partner Code"
              placeholder="e.g., ACME_FINANCIAL"
              value={formData.code}
              onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
              error={!!errors.code}
              helperText={errors.code || 'Unique identifier for the partner'}
              required
            />
          </Grid>

          {/* Partner Name */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Partner Name"
              placeholder="e.g., Acme Financial Services"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              error={!!errors.name}
              helperText={errors.name}
              required
            />
          </Grid>

          {/* Partner Type */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Partner Type</InputLabel>
              <Select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                label="Partner Type"
              >
                <MenuItem value="BANK">Bank</MenuItem>
                <MenuItem value="INVESTMENT">Investment Firm</MenuItem>
                <MenuItem value="INSURANCE">Insurance Provider</MenuItem>
                <MenuItem value="FINTECH">FinTech Company</MenuItem>
                <MenuItem value="OTHER">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Contact Email */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="email"
              label="Contact Email"
              placeholder="contact@partner.com"
              value={formData.contactEmail}
              onChange={(e) => handleInputChange('contactEmail', e.target.value)}
              error={!!errors.contactEmail}
              helperText={errors.contactEmail || 'Primary contact email'}
              required
            />
          </Grid>

          {/* Contact Phone */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Contact Phone"
              placeholder="+63 xxx xxx xxxx"
              value={formData.contactPhone}
              onChange={(e) => handleInputChange('contactPhone', e.target.value)}
            />
          </Grid>

          {/* Website */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Website"
              placeholder="https://www.partner.com"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
            />
          </Grid>

          {/* Description */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              placeholder="Brief description of the partner and their services..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
            />
          </Grid>

          {/* Address */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Address"
              placeholder="Partner's physical address..."
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
            />
          </Grid>

          {/* Divider */}
          <Grid item xs={12}>
            <Box sx={{ borderBottom: '2px solid', borderColor: 'primary.main', my: 2 }} />
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Product Mapping
            </Typography>
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Important:</strong> Select which APPROVED products this partner will be associated with. 
                Only APPROVED products are available for mapping.
              </Typography>
            </Alert>
          </Grid>

          {/* Product Selection */}
          <Grid item xs={12}>
            <FormControl fullWidth error={!!errors.productIds} required>
              <InputLabel>Select Products to Map</InputLabel>
              <Select
                multiple
                value={formData.productIds}
                onChange={handleProductsChange}
                input={<OutlinedInput label="Select Products to Map" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const product = products.find(p => p.id === value)
                      return (
                        <Chip
                          key={value}
                          label={product?.name || value}
                          size="small"
                          color="info"
                        />
                      )
                    })}
                  </Box>
                )}
              >
                {productsLoading ? (
                  <MenuItem disabled>Loading products...</MenuItem>
                ) : products.length === 0 ? (
                  <MenuItem disabled>
                    No approved products available. Please create and approve products first.
                  </MenuItem>
                ) : (
                  products.map((product) => (
                    <MenuItem key={product.id} value={product.id}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {product.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {product.code} • {product.productType}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))
                )}
              </Select>
              {errors.productIds && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                  {errors.productIds}
                </Typography>
              )}
              {!errors.productIds && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 2 }}>
                  Select one or more products to associate with this partner
                </Typography>
              )}
            </FormControl>
          </Grid>

          {/* Selected Products Summary */}
          {formData.productIds.length > 0 && (
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'rgba(33, 150, 243, 0.08)' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Selected Products ({formData.productIds.length})
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {formData.productIds.map((productId) => {
                    const product = products.find(p => p.id === productId)
                    return product ? (
                      <Chip
                        key={productId}
                        label={`${product.name} (${product.code})`}
                        color="info"
                        variant="filled"
                      />
                    ) : null
                  })}
                </Box>
              </Paper>
            </Grid>
          )}

          {/* Divider */}
          <Grid item xs={12}>
            <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', my: 2 }} />
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Integration Details (Optional)
            </Typography>
          </Grid>

          {/* Webhook URL */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Webhook URL"
              placeholder="https://api.partner.com/webhook"
              value={formData.webhookUrl}
              onChange={(e) => handleInputChange('webhookUrl', e.target.value)}
              helperText="Optional: Webhook endpoint for real-time notifications"
            />
          </Grid>

          {/* API Key */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="API Key"
              placeholder="Partner's API key for integration"
              value={formData.apiKey}
              onChange={(e) => handleInputChange('apiKey', e.target.value)}
              type="password"
              helperText="Optional: API key for partner integration (for asset submissions)"
            />
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/partners')}
            disabled={createPartnerMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSubmit}
            disabled={createPartnerMutation.isPending}
          >
            {createPartnerMutation.isPending ? 'Creating...' : 'Create Partner'}
          </Button>
        </Box>
      </Paper>
    </Box>
  )
}

export default PartnerCreate
