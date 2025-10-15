import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
  Tabs,
  Tab,
  Menu,
  MenuItem,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material'
import {
  Add as AddIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material'
import { partnersAPI, Partner } from '../../services/partners'

const PartnersList = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [tabValue, setTabValue] = useState(0)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedPartner, setSelectedPartner] = useState<string | null>(null)

  // Fetch partners from API
  const { data: allPartners = [], isLoading, error } = useQuery({
    queryKey: ['partners'],
    queryFn: () => partnersAPI.getAll(),
    refetchInterval: 5000, // Refresh every 5 seconds
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: partnersAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] })
      console.log('Partner deleted successfully')
      handleMenuClose()
    },
    onError: (error: any) => {
      console.log(`Error deleting partner: ${error.response?.data?.message || error.message}`)
    },
  })

  const filteredPartners = allPartners.filter((p) => {
    if (tabValue === 0) return true // All
    if (tabValue === 1) return p.status === 'PENDING'
    if (tabValue === 2) return p.status === 'ACTIVE'
    if (tabValue === 3) return p.status === 'SUSPENDED'
    return true
  })

  const stats = {
    total: allPartners.length,
    pending: allPartners.filter((p) => p.status === 'PENDING').length,
    active: allPartners.filter((p) => p.status === 'ACTIVE').length,
    suspended: allPartners.filter((p) => p.status === 'SUSPENDED').length,
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, partnerId: string) => {
    setAnchorEl(event.currentTarget)
    setSelectedPartner(partnerId)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedPartner(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success'
      case 'PENDING':
        return 'warning'
      case 'SUSPENDED':
        return 'error'
      default:
        return 'default'
    }
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error">
        Error loading partners: {(error as any).message}
      </Alert>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ mb: 0.5, fontWeight: 700 }}>
            Partner Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage all partners in the ecosystem
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/partners/create')}
          sx={{ boxShadow: 1 }}
        >
          Add Partner
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Total Partners
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {stats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Pending Approval
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'warning.main' }}>
                {stats.pending}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Active
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'success.main' }}>
                {stats.active}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Suspended
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'error.main' }}>
                {stats.suspended}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label={`All (${stats.total})`} />
          <Tab label={`Pending (${stats.pending})`} />
          <Tab label={`Active (${stats.active})`} />
          <Tab label={`Suspended (${stats.suspended})`} />
        </Tabs>
      </Paper>

      {/* Partners Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Partner Code</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Products Onboarded</TableCell>
              <TableCell>Contact Email</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Stats</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPartners.map((partner) => (
              <TableRow key={partner.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight={600} fontFamily="monospace">
                    {partner.code}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={500}>
                    {partner.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip label={partner.type} size="small" />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxWidth: 300 }}>
                    {partner.products && partner.products.length > 0 ? (
                      partner.products.map((product) => (
                        <Chip
                          key={product.id}
                          label={product.name}
                          size="small"
                          variant="outlined"
                          color="secondary"
                          sx={{ fontWeight: 500, fontSize: '0.75rem' }}
                        />
                      ))
                    ) : (
                      <Chip label="No products" size="small" variant="outlined" color="default" />
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                    {partner.contactEmail}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={partner.status}
                    color={getStatusColor(partner.status)}
                    size="small"
                    sx={{ fontWeight: 500 }}
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      {partner.productsCount || 0} products
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {partner.assetsCount || 0} assets
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, partner.id)}
                  >
                    <MoreIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { navigate(`/partners/${selectedPartner}`); handleMenuClose(); }}>
          <ViewIcon fontSize="small" sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={() => { navigate(`/partners/${selectedPartner}/edit`); handleMenuClose(); }}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit Partner
        </MenuItem>
        <MenuItem 
          onClick={() => {
            if (selectedPartner && window.confirm('Are you sure you want to delete this partner?')) {
              deleteMutation.mutate(selectedPartner)
            }
          }} 
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete Partner
        </MenuItem>
      </Menu>
    </Box>
  )
}

export default PartnersList
