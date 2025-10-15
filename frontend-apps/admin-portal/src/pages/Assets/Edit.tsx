import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Box, Typography, Paper, TextField, Button, Grid, FormControl, InputLabel, Select, MenuItem, CircularProgress, Alert, InputAdornment,
} from '@mui/material'
import { ArrowBack as BackIcon, Save as SaveIcon } from '@mui/icons-material'
import { assetsAPI } from '../../services/assets'

const AssetEdit = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState({
    name: '', code: '', assetType: 'STOCK', category: '', description: '', currentPrice: 0, minInvestment: 0, currency: 'PHP',
  })

  const { data: asset, isLoading } = useQuery({
    queryKey: ['assets', id],
    queryFn: () => assetsAPI.getById(id!),
    enabled: !!id,
  })

  useEffect(() => {
    if (asset) {
      setFormData({
        name: asset.name, code: asset.code, assetType: asset.assetType as any, category: asset.category,
        description: asset.description, currentPrice: asset.currentPrice, minInvestment: asset.minInvestment, currency: asset.currency,
      })
    }
  }, [asset])

  const updateMutation = useMutation({
    mutationFn: (data: any) => assetsAPI.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      console.log('Asset updated!')
      navigate(`/assets/${id}`)
    },
  })

  if (isLoading) return <CircularProgress />
  if (!asset) return <Alert severity="error">Asset not found</Alert>

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <Button startIcon={<BackIcon />} onClick={() => navigate(`/assets/${id}`)}>Back</Button>
        <Box>
          <Typography variant="h4" fontWeight={700}>Edit Asset</Typography>
          <Typography variant="body2" color="text.secondary">{asset.name}</Typography>
        </Box>
      </Box>

      <Paper sx={{ p: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Code" value={formData.code} disabled />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select value={formData.assetType} onChange={(e) => setFormData({...formData, assetType: e.target.value})} label="Type">
                <MenuItem value="STOCK">Stock</MenuItem>
                <MenuItem value="BOND">Bond</MenuItem>
                <MenuItem value="CRYPTO">Crypto</MenuItem>
                <MenuItem value="FUND">Fund</MenuItem>
                <MenuItem value="ETF">ETF</MenuItem>
                <MenuItem value="COMMODITY">Commodity</MenuItem>
                <MenuItem value="FOREX">Forex</MenuItem>
                <MenuItem value="OTHER">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Category" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} required />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth multiline rows={3} label="Description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth type="number" label="Current Price" value={formData.currentPrice} onChange={(e) => setFormData({...formData, currentPrice: parseFloat(e.target.value)})} InputProps={{ startAdornment: <InputAdornment position="start">{formData.currency}</InputAdornment> }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth type="number" label="Min Investment" value={formData.minInvestment} onChange={(e) => setFormData({...formData, minInvestment: parseFloat(e.target.value)})} InputProps={{ startAdornment: <InputAdornment position="start">{formData.currency}</InputAdornment> }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Currency</InputLabel>
              <Select value={formData.currency} onChange={(e) => setFormData({...formData, currency: e.target.value})} label="Currency">
                <MenuItem value="PHP">PHP</MenuItem>
                <MenuItem value="USD">USD</MenuItem>
                <MenuItem value="EUR">EUR</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
          <Button variant="outlined" onClick={() => navigate(`/assets/${id}`)}>Cancel</Button>
          <Button variant="contained" startIcon={<SaveIcon />} onClick={() => updateMutation.mutate(formData)}>Save</Button>
        </Box>
      </Paper>
    </Box>
  )
}

export default AssetEdit



