import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Box, Typography, Paper, TextField, Button, Grid, FormControl, InputLabel, Select, MenuItem, CircularProgress, Alert,
} from '@mui/material'
import { ArrowBack as BackIcon, Save as SaveIcon } from '@mui/icons-material'
import { partnersAPI } from '../../services/partners'

const PartnerEdit = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState({
    name: '', code: '', type: 'BANK', contactEmail: '', contactPhone: '', webhookUrl: '',
  })

  const { data: partner, isLoading } = useQuery({
    queryKey: ['partners', id],
    queryFn: () => partnersAPI.getById(id!),
    enabled: !!id,
  })

  useEffect(() => {
    if (partner) {
      setFormData({
        name: partner.name, code: partner.code, type: partner.type as any,
        contactEmail: partner.contactEmail, contactPhone: partner.contactPhone || '',
        webhookUrl: partner.webhookUrl || '',
      })
    }
  }, [partner])

  const updateMutation = useMutation({
    mutationFn: (data: any) => partnersAPI.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] })
      console.log('Partner updated!')
      navigate(`/partners/${id}`)
    },
  })

  if (isLoading) return <CircularProgress />
  if (!partner) return <Alert severity="error">Partner not found</Alert>

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <Button startIcon={<BackIcon />} onClick={() => navigate(`/partners/${id}`)}>Back</Button>
        <Box>
          <Typography variant="h4" fontWeight={700}>Edit Partner</Typography>
          <Typography variant="body2" color="text.secondary">{partner.name}</Typography>
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
              <Select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} label="Type">
                <MenuItem value="BANK">Bank</MenuItem>
                <MenuItem value="INVESTMENT">Investment</MenuItem>
                <MenuItem value="INSURANCE">Insurance</MenuItem>
                <MenuItem value="FINTECH">FinTech</MenuItem>
                <MenuItem value="OTHER">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Email" type="email" value={formData.contactEmail} onChange={(e) => setFormData({...formData, contactEmail: e.target.value})} required />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Phone" value={formData.contactPhone} onChange={(e) => setFormData({...formData, contactPhone: e.target.value})} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Webhook URL" value={formData.webhookUrl} onChange={(e) => setFormData({...formData, webhookUrl: e.target.value})} />
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
          <Button variant="outlined" onClick={() => navigate(`/partners/${id}`)}>Cancel</Button>
          <Button variant="contained" startIcon={<SaveIcon />} onClick={() => updateMutation.mutate(formData)}>Save</Button>
        </Box>
      </Paper>
    </Box>
  )
}

export default PartnerEdit



