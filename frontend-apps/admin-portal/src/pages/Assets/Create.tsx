import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNotification } from '../../contexts/NotificationContext'
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
  InputAdornment,
  Alert,
  Chip,
  IconButton,
} from '@mui/material'
import {
  ArrowBack as BackIcon,
  Save as SaveIcon,
  LinkOff as LinkOffIcon,
  Close as CloseIcon,
} from '@mui/icons-material'
import { assetsAPI } from '../../services/assets'
import { productsAPI } from '../../services/products'
import { partnersAPI } from '../../services/partners'

const AssetCreate = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { showSuccess, showError, showWarning } = useNotification()

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    assetType: 'STOCK' as 'STOCK' | 'BOND' | 'CRYPTO' | 'FUND' | 'ETF' | 'COMMODITY' | 'FOREX' | 'UITF' | 'MUTUAL_FUND' | 'OTHER',
    category: '',
    description: '',
    productId: '',
    partnerId: '',
    minInvestment: 0,
    currentPrice: 0,
    currency: 'PHP',
    marketCap: '',
    // UITF/Fund specific fields
    fundManager: '',
    fundHouse: '',
    navPerUnit: 0,
    fundSize: '',
    riskRating: '' as '' | 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH',
    // Investment calculation fields
    investmentAmount: 1000,
    indicativeNavpu: 0,
  })

  // Calculate indicative units based on amount and NAVPU
  const indicativeUnits = useMemo(() => {
    if (formData.investmentAmount > 0 && formData.indicativeNavpu > 0) {
      return formData.investmentAmount / formData.indicativeNavpu
    }
    return 0
  }, [formData.investmentAmount, formData.indicativeNavpu])

  const isUITFOrFund = formData.assetType === 'UITF' || formData.assetType === 'MUTUAL_FUND' || formData.assetType === 'FUND'

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fetch ACTIVE products (products that have been approved by admin)
  const { data: allProducts = [], isLoading: productsLoading } = useQuery({
    queryKey: ['products', 'ACTIVE'],
    queryFn: async () => {
      console.log('Fetching ACTIVE products...')
      const products = await productsAPI.getAll('ACTIVE')
      console.log('Fetched products:', products.length, 'Products with partners:', products.filter(p => p.partners?.length > 0).length)
      return products
    },
  })

  // Fetch ACTIVE partners (partners that have been approved by admin)
  const { data: allPartners = [], isLoading: partnersLoading } = useQuery({
    queryKey: ['partners', 'ACTIVE'],
    queryFn: async () => {
      console.log('Fetching ACTIVE partners...')
      const partners = await partnersAPI.getAll('ACTIVE')
      console.log('Fetched partners:', partners.length, 'Partners with products:', partners.filter(p => p.products?.length > 0).length)
      return partners
    },
  })

  // Filter products based on selected partner
  const filteredProducts = useMemo(() => {
    if (!formData.partnerId) {
      return allProducts // Show all products if no partner selected
    }
    // Only show products that this partner is mapped to
    const selectedPartner = allPartners.find(p => p.id === formData.partnerId)
    if (!selectedPartner?.products) {
      return []
    }
    return allProducts.filter(product => 
      selectedPartner.products?.some(p => p.id === product.id)
    )
  }, [formData.partnerId, allProducts, allPartners])

  // Filter partners based on selected product
  const filteredPartners = useMemo(() => {
    if (!formData.productId) {
      console.log('No product selected, showing all partners:', allPartners.length)
      return allPartners // Show all partners if no product selected
    }
    // Only show partners that are mapped to this product
    const selectedProduct = allProducts.find(p => p.id === formData.productId)
    console.log('Selected product:', selectedProduct?.name, 'Partners in product:', selectedProduct?.partners)
    
    if (!selectedProduct?.partners) {
      console.warn('Selected product has no partners array or is empty')
      return []
    }
    
    const filtered = allPartners.filter(partner => 
      selectedProduct.partners?.some(p => p.id === partner.id)
    )
    console.log('Filtered partners count:', filtered.length, 'Partners:', filtered.map(p => p.name))
    return filtered
  }, [formData.productId, allPartners, allProducts])

  // When product changes, validate if current partner is still valid
  useEffect(() => {
    if (formData.productId && formData.partnerId) {
      const isPartnerValid = filteredPartners.some(p => p.id === formData.partnerId)
      if (!isPartnerValid) {
        setFormData(prev => ({ ...prev, partnerId: '' }))
        setErrors(prev => ({ 
          ...prev, 
          partnerId: 'Selected partner is not mapped to this product. Please select a valid partner.' 
        }))
        showWarning('Selected partner is not mapped to this product. Please choose a different partner.')
      }
    }
  }, [formData.productId, filteredPartners, formData.partnerId, showWarning])

  // When partner changes, validate if current product is still valid
  useEffect(() => {
    if (formData.partnerId && formData.productId) {
      const isProductValid = filteredProducts.some(p => p.id === formData.productId)
      if (!isProductValid) {
        setFormData(prev => ({ ...prev, productId: '' }))
        setErrors(prev => ({ 
          ...prev, 
          productId: 'Selected product is not mapped to this partner. Please select a valid product.' 
        }))
        showWarning('Selected product is not mapped to this partner. Please choose a different product.')
      }
    }
  }, [formData.partnerId, filteredProducts, formData.productId, showWarning])

  // Create asset mutation
  const createAssetMutation = useMutation({
    mutationFn: (data: typeof formData) => assetsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      showSuccess('Asset created successfully and submitted for approval!')
      navigate('/assets')
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create asset'
      showError(`Error creating asset: ${errorMessage}`)
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

    if (!formData.code.trim()) newErrors.code = 'Asset code is required'
    if (!formData.name.trim()) newErrors.name = 'Asset name is required'
    if (!formData.category.trim()) newErrors.category = 'Category is required'
    if (!formData.productId) newErrors.productId = 'Please select a product'
    if (!formData.partnerId) newErrors.partnerId = 'Please select a partner'
    if (formData.currentPrice <= 0) newErrors.currentPrice = 'Current price must be greater than 0'
    if (formData.minInvestment <= 0) newErrors.minInvestment = 'Minimum investment must be greater than 0'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validateForm()) {
      // Prepare submission data
      const submissionData = {
        ...formData,
        // Add calculated fields for UITF/Fund types
        ...(isUITFOrFund && {
          indicativeUnits,
          navAsOfDate: new Date().toISOString(), // Current timestamp
          navPerUnit: formData.indicativeNavpu, // Use indicativeNavpu as the actual navPerUnit
        }),
      }
      createAssetMutation.mutate(submissionData)
    }
  }

  const selectedProduct = allProducts.find(p => p.id === formData.productId)
  const selectedPartner = allPartners.find(p => p.id === formData.partnerId)

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate('/assets')}
          sx={{ minWidth: 'auto' }}
        >
          Back
        </Button>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Create New Asset
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Asset will be submitted for approval after creation
          </Typography>
        </Box>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
          Workflow Note:
        </Typography>
        <Typography variant="body2">
          • Select a product and partner that are already mapped together
          <br />
          • Only ACTIVE partners mapped to the selected product will appear in the dropdown
          <br />
          • Asset becomes ACTIVE after admin approval
        </Typography>
      </Alert>

      {/* Form */}
      <Paper sx={{ p: 4 }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          Asset Information
        </Typography>

        <Grid container spacing={3}>
          {/* Asset Code */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Asset Code"
              placeholder="e.g., AAPL, BTC"
              value={formData.code}
              onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
              error={!!errors.code}
              helperText={errors.code || 'Unique asset ticker or symbol'}
              required
            />
          </Grid>

          {/* Asset Name */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Asset Name"
              placeholder="e.g., Apple Inc., Bitcoin"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              error={!!errors.name}
              helperText={errors.name}
              required
            />
          </Grid>

          {/* Asset Type */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Asset Type</InputLabel>
              <Select
                value={formData.assetType}
                onChange={(e) => handleInputChange('assetType', e.target.value)}
                label="Asset Type"
              >
                <MenuItem value="UITF">UITF (Unit Investment Trust Fund)</MenuItem>
                <MenuItem value="MUTUAL_FUND">Mutual Fund</MenuItem>
                <MenuItem value="FUND">Fund</MenuItem>
                <MenuItem value="STOCK">Stock</MenuItem>
                <MenuItem value="BOND">Bond</MenuItem>
                <MenuItem value="CRYPTO">Cryptocurrency</MenuItem>
                <MenuItem value="ETF">ETF</MenuItem>
                <MenuItem value="COMMODITY">Commodity</MenuItem>
                <MenuItem value="FOREX">Forex</MenuItem>
                <MenuItem value="OTHER">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Category */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Category"
              placeholder="e.g., Technology, Healthcare"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              error={!!errors.category}
              helperText={errors.category}
              required
            />
          </Grid>

          {/* Description */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              placeholder="Brief description of the asset..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
            />
          </Grid>

          {/* Divider */}
          <Grid item xs={12}>
            <Box sx={{ borderBottom: '2px solid', borderColor: 'primary.main', my: 2 }} />
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Product & Partner Mapping
            </Typography>
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Important:</strong> You can select either product or partner first. 
                The other dropdown will automatically filter to show only ACTIVE and valid mappings.
                Use the X button to clear your selection if needed.
              </Typography>
            </Alert>
          </Grid>

          {/* Product Selection */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required error={!!errors.productId}>
              <InputLabel>Select Product</InputLabel>
              <Select
                value={formData.productId}
                onChange={(e) => handleInputChange('productId', e.target.value)}
                label="Select Product"
                disabled={productsLoading}
                MenuProps={{
                  autoFocus: false,
                }}
                endAdornment={
                  formData.productId ? (
                    <IconButton
                      size="small"
                      sx={{ mr: 2 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleInputChange('productId', '')
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  ) : null
                }
              >
                {productsLoading ? (
                  <MenuItem disabled>Loading products...</MenuItem>
                ) : filteredProducts.length === 0 ? (
                  <MenuItem disabled>
                    {formData.partnerId 
                      ? 'No products mapped to selected partner'
                      : 'No active products available'}
                  </MenuItem>
                ) : (
                  filteredProducts.map((product) => (
                    <MenuItem key={product.id} value={product.id}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {product.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {product.code} • {product.productType}
                          {product.partners && ` • ${product.partners.length} partner(s)`}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))
                )}
              </Select>
              {errors.productId && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                  {errors.productId}
                </Typography>
              )}
              {!errors.productId && formData.partnerId && (
                <Typography variant="caption" color="info.main" sx={{ mt: 0.5, ml: 2 }}>
                  Showing products mapped to selected partner
                </Typography>
              )}
            </FormControl>
          </Grid>

          {/* Partner Selection */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required error={!!errors.partnerId}>
              <InputLabel>Select Partner</InputLabel>
              <Select
                value={formData.partnerId}
                onChange={(e) => handleInputChange('partnerId', e.target.value)}
                label="Select Partner"
                disabled={partnersLoading}
                MenuProps={{
                  autoFocus: false,
                }}
                endAdornment={
                  formData.partnerId ? (
                    <IconButton
                      size="small"
                      sx={{ mr: 2 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleInputChange('partnerId', '')
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  ) : null
                }
              >
                {partnersLoading ? (
                  <MenuItem disabled>Loading partners...</MenuItem>
                ) : filteredPartners.length === 0 ? (
                  <MenuItem disabled>
                    {formData.productId 
                      ? 'No partners mapped to selected product'
                      : 'No active partners available'}
                  </MenuItem>
                ) : (
                  filteredPartners.map((partner) => (
                    <MenuItem key={partner.id} value={partner.id}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {partner.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {partner.code} • {partner.type}
                          {partner.products && ` • ${partner.products.length} product(s)`}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))
                )}
              </Select>
              {errors.partnerId && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                  {errors.partnerId}
                </Typography>
              )}
              {!errors.partnerId && formData.productId && (
                <Typography variant="caption" color="info.main" sx={{ mt: 0.5, ml: 2 }}>
                  Showing partners mapped to selected product
                </Typography>
              )}
            </FormControl>
          </Grid>

          {/* Selection Summary */}
          {(formData.productId || formData.partnerId) && (
            <Grid item xs={12}>
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  bgcolor: formData.productId && formData.partnerId 
                    ? 'rgba(46, 125, 50, 0.08)' 
                    : 'rgba(237, 108, 2, 0.08)' 
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  {formData.productId && formData.partnerId ? '✓ Valid Mapping' : '⚠ Incomplete Selection'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {selectedProduct ? (
                    <Chip 
                      label={`Product: ${selectedProduct.name}`} 
                      color="info" 
                      variant="filled" 
                      size="small"
                    />
                  ) : (
                    <Chip 
                      label="No product selected" 
                      icon={<LinkOffIcon />}
                      variant="outlined" 
                      size="small"
                    />
                  )}
                  {selectedPartner ? (
                    <Chip 
                      label={`Partner: ${selectedPartner.name}`} 
                      color="primary" 
                      variant="filled" 
                      size="small"
                    />
                  ) : (
                    <Chip 
                      label="No partner selected" 
                      icon={<LinkOffIcon />}
                      variant="outlined" 
                      size="small"
                    />
                  )}
                </Box>
              </Paper>
            </Grid>
          )}

          {/* Divider */}
          <Grid item xs={12}>
            <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', my: 2 }} />
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Pricing & Investment Details
            </Typography>
          </Grid>

          {/* Current Price */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="number"
              label="Current Price"
              value={formData.currentPrice || ''}
              onChange={(e) => handleInputChange('currentPrice', parseFloat(e.target.value) || 0)}
              error={!!errors.currentPrice}
              helperText={errors.currentPrice}
              InputProps={{
                startAdornment: <InputAdornment position="start">{formData.currency}</InputAdornment>,
              }}
              required
            />
          </Grid>

          {/* Minimum Investment */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="number"
              label="Minimum Investment"
              value={formData.minInvestment || ''}
              onChange={(e) => handleInputChange('minInvestment', parseFloat(e.target.value) || 0)}
              error={!!errors.minInvestment}
              helperText={errors.minInvestment}
              InputProps={{
                startAdornment: <InputAdornment position="start">{formData.currency}</InputAdornment>,
              }}
              required
            />
          </Grid>

          {/* Currency */}
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Currency</InputLabel>
              <Select
                value={formData.currency}
                onChange={(e) => handleInputChange('currency', e.target.value)}
                label="Currency"
              >
                <MenuItem value="PHP">PHP - Philippine Peso</MenuItem>
                <MenuItem value="USD">USD - US Dollar</MenuItem>
                <MenuItem value="EUR">EUR - Euro</MenuItem>
                <MenuItem value="GBP">GBP - British Pound</MenuItem>
                <MenuItem value="JPY">JPY - Japanese Yen</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Market Cap */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Market Cap (Optional)"
              placeholder="e.g., 2.8T, 150B"
              value={formData.marketCap}
              onChange={(e) => handleInputChange('marketCap', e.target.value)}
              helperText="Approximate market capitalization"
            />
          </Grid>

          {/* UITF / Fund Specific Fields - Only show for UITF, Mutual Fund, or Fund types */}
          {isUITFOrFund && (
            <>
              {/* Divider */}
              <Grid item xs={12}>
                <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', my: 2 }} />
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    UITF / Fund Specific Information
                  </Typography>
                  <Typography variant="caption">
                    These fields are specific to Unit Investment Trust Funds and Mutual Funds
                  </Typography>
                </Alert>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Fund Details
                </Typography>
              </Grid>

              {/* Fund Manager */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Fund Manager"
                  placeholder="e.g., BPI Asset Management"
                  value={formData.fundManager}
                  onChange={(e) => handleInputChange('fundManager', e.target.value)}
                  helperText="Name of the fund manager"
                />
              </Grid>

              {/* Fund House */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Fund House"
                  placeholder="e.g., BPI Investment Management Inc."
                  value={formData.fundHouse}
                  onChange={(e) => handleInputChange('fundHouse', e.target.value)}
                  helperText="Fund house or management company"
                />
              </Grid>

              {/* Risk Rating */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Risk Rating</InputLabel>
                  <Select
                    value={formData.riskRating}
                    onChange={(e) => handleInputChange('riskRating', e.target.value)}
                    label="Risk Rating"
                  >
                    <MenuItem value="">None</MenuItem>
                    <MenuItem value="LOW">Low Risk</MenuItem>
                    <MenuItem value="MODERATE">Moderate Risk</MenuItem>
                    <MenuItem value="HIGH">High Risk</MenuItem>
                    <MenuItem value="VERY_HIGH">Very High Risk</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Fund Size */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Fund Size (Optional)"
                  placeholder="e.g., PHP 5.2B"
                  value={formData.fundSize}
                  onChange={(e) => handleInputChange('fundSize', e.target.value)}
                  helperText="Total fund size / AUM"
                />
              </Grid>

              {/* Investment Calculator Section */}
              <Grid item xs={12}>
                <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', my: 2 }} />
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                  Investment Calculator
                </Typography>
                <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                  Calculate indicative units based on investment amount and NAVPU
                </Typography>
              </Grid>

              {/* Investment Amount */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Investment Amount"
                  value={formData.investmentAmount || ''}
                  onChange={(e) => handleInputChange('investmentAmount', parseFloat(e.target.value) || 0)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">{formData.currency}</InputAdornment>,
                  }}
                  helperText="Amount to invest"
                />
              </Grid>

              {/* Indicative NAVPU */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Indicative NAVPU"
                  value={formData.indicativeNavpu || ''}
                  onChange={(e) => handleInputChange('indicativeNavpu', parseFloat(e.target.value) || 0)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">{formData.currency}</InputAdornment>,
                  }}
                  helperText="Net Asset Value Per Unit"
                  inputProps={{ step: '0.0001' }}
                />
              </Grid>

              {/* Indicative Units (Calculated) */}
              <Grid item xs={12}>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 3, 
                    bgcolor: 'primary.lighter',
                    border: '2px solid',
                    borderColor: 'primary.main',
                  }}
                >
                  <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                    Indicative Units (Calculated)
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
                    {indicativeUnits.toFixed(4)} units
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formData.investmentAmount > 0 && formData.indicativeNavpu > 0
                      ? `${formData.currency} ${formData.investmentAmount.toLocaleString()} ÷ ${formData.currency} ${formData.indicativeNavpu.toFixed(4)} = ${indicativeUnits.toFixed(4)} units`
                      : 'Enter investment amount and NAVPU to calculate units'}
                  </Typography>
                </Paper>
              </Grid>
            </>
          )}
        </Grid>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/assets')}
            disabled={createAssetMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSubmit}
            disabled={createAssetMutation.isPending}
          >
            {createAssetMutation.isPending ? 'Creating...' : 'Create Asset'}
          </Button>
        </Box>
      </Paper>
    </Box>
  )
}

export default AssetCreate
