import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Box, Typography, Paper, Button, Grid, Chip, Divider, CircularProgress, Alert, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material'
import { ArrowBack as BackIcon, Edit as EditIcon } from '@mui/icons-material'
import { partnersAPI } from '../../services/partners'
import { assetsAPI } from '../../services/assets'

const PartnerView = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: partner, isLoading, error } = useQuery({
    queryKey: ['partners', id],
    queryFn: () => partnersAPI.getById(id!),
    enabled: !!id,
  })

  const { data: allAssets = [] } = useQuery({
    queryKey: ['assets'],
    queryFn: () => assetsAPI.getAll(),
  })

  // Filter assets for this partner
  const partnerAssets = allAssets.filter(asset => asset.partnerId === id)

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
  if (error || !partner) return <Box><Alert severity="error">Partner not found</Alert><Button startIcon={<BackIcon />} onClick={() => navigate('/partners')} sx={{ mt: 2 }}>Back</Button></Box>

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button startIcon={<BackIcon />} onClick={() => navigate('/partners')}>Back</Button>
          <Box>
            <Typography variant="h4" fontWeight={700}>{partner.name}</Typography>
            <Typography variant="body2" color="text.secondary">{partner.code} • {partner.type}</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Chip label={partner.status} color={partner.status === 'ACTIVE' ? 'success' : 'warning'} />
          <Button variant="contained" startIcon={<EditIcon />} onClick={() => navigate(`/partners/${id}/edit`)}>Edit</Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={3}>Partner Information</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}><Typography variant="caption" color="text.secondary">Code</Typography><Typography variant="body1" fontWeight={500}>{partner.code}</Typography></Grid>
              <Grid item xs={6}><Typography variant="caption" color="text.secondary">Type</Typography><Typography variant="body1" fontWeight={500}>{partner.type}</Typography></Grid>
              <Grid item xs={6}><Typography variant="caption" color="text.secondary">Email</Typography><Typography variant="body1" fontWeight={500}>{partner.contactEmail}</Typography></Grid>
              <Grid item xs={6}><Typography variant="caption" color="text.secondary">Phone</Typography><Typography variant="body1" fontWeight={500}>{partner.contactPhone || 'N/A'}</Typography></Grid>
              <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>
              <Grid item xs={12}><Typography variant="caption" color="text.secondary">Webhook URL</Typography><Typography variant="body2">{partner.webhookUrl || 'Not configured'}</Typography></Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Products</Typography>
              {partner.products && partner.products.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {partner.products.map((p) => <Chip key={p.id} label={p.name} color="info" size="small" />)}
                </Box>
              ) : <Typography variant="body2" color="text.secondary">No products</Typography>}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Stats</Typography>
              <Typography variant="body2" color="text.secondary">Products: {partner.productsCount || 0}</Typography>
              <Typography variant="body2" color="text.secondary">Assets: {partnerAssets.length}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Assets List */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={3}>Assets ({partnerAssets.length})</Typography>
            {partnerAssets.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Code</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Product</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {partnerAssets.map((asset) => (
                      <TableRow key={asset.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontFamily="monospace" fontWeight={500}>
                            {asset.code}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>{asset.name}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={asset.assetType} size="small" />
                        </TableCell>
                        <TableCell>
                          <Chip label={asset.productName} size="small" color="info" />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {asset.currency} {asset.currentPrice.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={asset.status.replace('_', ' ')}
                            size="small"
                            color={asset.status === 'ACTIVE' ? 'success' : 'warning'}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert severity="info">No assets mapped to this partner yet.</Alert>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default PartnerView

