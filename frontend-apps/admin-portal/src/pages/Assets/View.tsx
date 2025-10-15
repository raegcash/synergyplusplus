import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Box, Typography, Paper, Button, Grid, Chip, Divider, CircularProgress, Alert, Card, CardContent,
} from '@mui/material'
import { ArrowBack as BackIcon, Edit as EditIcon, Storage as DataIcon, TrendingUp, TrendingDown } from '@mui/icons-material'
import { assetsAPI } from '../../services/assets'
import { assetDataAPI } from '../../services/assetData'

const AssetView = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: rawAsset, isLoading: loadingAsset, error } = useQuery({
    queryKey: ['assets', id],
    queryFn: () => assetsAPI.getById(id!),
    enabled: !!id,
  })

  // Fetch latest data from integrations
  const { data: latestNav, isLoading: loadingNav } = useQuery({
    queryKey: ['assetData', id, 'NAV'],
    queryFn: () => assetDataAPI.getLatestByAssetAndType(id!, 'NAV'),
    enabled: !!id,
  })

  // Fetch performance data
  const { data: performance, isLoading: loadingPerf } = useQuery({
    queryKey: ['assetPerformance', id],
    queryFn: () => assetDataAPI.getPerformance(id!),
    enabled: !!id,
  })

  const isLoading = loadingAsset || loadingNav || loadingPerf

  // Enrich asset with latest data
  const asset = rawAsset && latestNav ? {
    ...rawAsset,
    currentPrice: latestNav.value,
    navPerUnit: latestNav.value,
    lastDataUpdate: latestNav.timestamp,
    hasDataIntegration: true,
  } : rawAsset

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
  if (error || !asset) return <Box><Alert severity="error">Asset not found</Alert><Button startIcon={<BackIcon />} onClick={() => navigate('/assets')} sx={{ mt: 2 }}>Back</Button></Box>

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button startIcon={<BackIcon />} onClick={() => navigate('/assets')}>Back</Button>
          <Box>
            <Typography variant="h4" fontWeight={700}>{asset.name}</Typography>
            <Typography variant="body2" color="text.secondary">{asset.code} • {asset.assetType}</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Chip label={asset.status.replace('_', ' ')} color={asset.status === 'ACTIVE' ? 'success' : 'warning'} />
          <Button variant="contained" startIcon={<EditIcon />} onClick={() => navigate(`/assets/${id}/edit`)}>Edit</Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={3}>Asset Information</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}><Typography variant="caption" color="text.secondary">Code</Typography><Typography variant="body1" fontWeight={500}>{asset.code}</Typography></Grid>
              <Grid item xs={6}><Typography variant="caption" color="text.secondary">Type</Typography><Typography variant="body1" fontWeight={500}>{asset.assetType}</Typography></Grid>
              <Grid item xs={6}><Typography variant="caption" color="text.secondary">Category</Typography><Typography variant="body1" fontWeight={500}>{asset.category}</Typography></Grid>
              <Grid item xs={6}><Typography variant="caption" color="text.secondary">Currency</Typography><Typography variant="body1" fontWeight={500}>{asset.currency}</Typography></Grid>
              <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>
              <Grid item xs={12}><Typography variant="caption" color="text.secondary">Description</Typography><Typography variant="body1">{asset.description}</Typography></Grid>
              <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">Current Price / NAV</Typography>
                <Typography variant="h6" fontWeight={600}>{asset.currency} {asset.currentPrice.toFixed(4)}</Typography>
                {latestNav && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                    <DataIcon fontSize="small" color="primary" />
                    <Typography variant="caption" color="primary">
                      From integration • {new Date(latestNav.timestamp).toLocaleString()}
                    </Typography>
                  </Box>
                )}
              </Grid>
              <Grid item xs={6}><Typography variant="caption" color="text.secondary">Min Investment</Typography><Typography variant="h6" fontWeight={600}>{asset.currency} {asset.minInvestment.toLocaleString()}</Typography></Grid>
              {performance && (
                <>
                  <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary" mb={1} display="block">Performance</Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">24h Change</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          {performance.changePercent > 0 ? <TrendingUp color="success" /> : <TrendingDown color="error" />}
                          <Typography 
                            variant="body2" 
                            fontWeight={600}
                            color={performance.changePercent > 0 ? 'success.main' : 'error.main'}
                          >
                            {performance.changePercent > 0 ? '+' : ''}{performance.changePercent.toFixed(2)}%
                          </Typography>
                        </Box>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">YTD</Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {performance.ytdReturn > 0 ? '+' : ''}{performance.ytdReturn.toFixed(2)}%
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">1 Year</Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {performance.oneYearReturn > 0 ? '+' : ''}{performance.oneYearReturn.toFixed(2)}%
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </>
              )}

              {/* UITF / Fund Specific Information */}
              {(asset.assetType === 'UITF' || asset.assetType === 'MUTUAL_FUND' || asset.assetType === 'FUND') && (
                <>
                  <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>
                  <Grid item xs={12}>
                    <Typography variant="h6" fontWeight={600} mb={2}>UITF / Fund Details</Typography>
                  </Grid>
                  
                  {asset.fundManager && (
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Fund Manager</Typography>
                      <Typography variant="body1" fontWeight={500}>{asset.fundManager}</Typography>
                    </Grid>
                  )}
                  
                  {asset.fundHouse && (
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Fund House</Typography>
                      <Typography variant="body1" fontWeight={500}>{asset.fundHouse}</Typography>
                    </Grid>
                  )}
                  
                  {asset.riskRating && (
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Risk Rating</Typography>
                      <Chip 
                        label={asset.riskRating.replace('_', ' ')} 
                        color={
                          asset.riskRating === 'LOW' ? 'success' :
                          asset.riskRating === 'MODERATE' ? 'info' :
                          asset.riskRating === 'HIGH' ? 'warning' : 'error'
                        }
                        size="small"
                        sx={{ mt: 0.5 }}
                      />
                    </Grid>
                  )}
                  
                  {asset.fundSize && (
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Fund Size / AUM</Typography>
                      <Typography variant="body1" fontWeight={500}>{asset.fundSize}</Typography>
                    </Grid>
                  )}

                  {/* Investment Calculator Results */}
                  {(asset.investmentAmount || asset.indicativeUnits || asset.indicativeNavpu) && (
                    <>
                      <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>
                      <Grid item xs={12}>
                        <Alert severity="info" sx={{ mb: 1 }}>
                          <Typography variant="body2" fontWeight={600}>Investment Calculation</Typography>
                        </Alert>
                      </Grid>

                      {asset.investmentAmount && (
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary">Amount</Typography>
                          <Typography variant="h6" fontWeight={600} color="primary.main">
                            {asset.currency} {asset.investmentAmount.toLocaleString()}
                          </Typography>
                        </Grid>
                      )}

                      {asset.indicativeNavpu && (
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary">Indicative NAVPU</Typography>
                          <Typography variant="h6" fontWeight={600} color="info.main">
                            {asset.currency} {asset.indicativeNavpu.toFixed(4)}
                          </Typography>
                          {asset.navAsOfDate && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              As of {new Date(asset.navAsOfDate).toLocaleDateString()}
                            </Typography>
                          )}
                        </Grid>
                      )}

                      {asset.indicativeUnits && (
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary">Indicative Units</Typography>
                          <Typography variant="h6" fontWeight={600} color="success.main">
                            {asset.indicativeUnits.toFixed(4)}
                          </Typography>
                        </Grid>
                      )}
                    </>
                  )}
                </>
              )}
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Linked To</Typography>
              <Typography variant="body2" color="text.secondary" mb={1}>Product</Typography>
              <Chip label={asset.productName} color="info" size="small" sx={{ mb: 2 }} />
              <Typography variant="body2" color="text.secondary" mb={1}>Partner</Typography>
              <Chip label={asset.partnerName} color="primary" size="small" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Actions</Typography>
              <Button 
                fullWidth 
                variant="outlined" 
                startIcon={<DataIcon />}
                onClick={() => navigate(`/assets/${id}/data-integrations`)}
                sx={{ mb: 1 }}
              >
                View Data & Integrations
              </Button>
              <Button 
                fullWidth 
                variant="outlined" 
                startIcon={<EditIcon />}
                onClick={() => navigate(`/assets/${id}/edit`)}
              >
                Edit Asset
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default AssetView

