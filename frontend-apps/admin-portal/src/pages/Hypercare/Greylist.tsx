import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Card,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  Tabs,
  Tab,
  InputAdornment,
} from '@mui/material'
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Upload as UploadIcon,
  DeleteSweep as RemoveAllIcon,
  Search as SearchIcon,
  PersonAdd as WhitelistIcon,
  Block as BlacklistIcon,
  Schedule as LongTermIcon,
  Group as TotalIcon,
} from '@mui/icons-material'
import { hypercareAPI, GreylistEntry } from '../../services/hypercare'
import { productsAPI } from '../../services/products'

const GreylistManagement = () => {
  const queryClient = useQueryClient()
  const [tabValue, setTabValue] = useState(0)
  const [addDialog, setAddDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [formData, setFormData] = useState({
    msisdn: '',
    userId: '',
    userEmail: '',
    userName: '',
    productId: '',
    listType: 'WHITELIST' as 'WHITELIST' | 'BLACKLIST',
    reason: '',
    isLongTerm: false,
    expiresAt: '',
    addedBy: 'admin@company.com',
  })

  const { data: greylistEntries = [], isLoading } = useQuery({
    queryKey: ['greylistEntries'],
    queryFn: () => hypercareAPI.getAllGreylistEntries(),
  })

  const { data: products = [] } = useQuery({
    queryKey: ['hypercare-products'],
    queryFn: () => productsAPI.getHypercareEligible(),
  })

  const { data: stats } = useQuery({
    queryKey: ['hypercareStats'],
    queryFn: () => hypercareAPI.getHypercareStats(),
  })

  const addEntryMutation = useMutation({
    mutationFn: (data: typeof formData) => {
      const product = products.find(p => p.id === data.productId)
      return hypercareAPI.addGreylistEntry({
        ...data,
        productCode: product?.code || '',
        productName: product?.name || '',
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['greylistEntries'] })
      queryClient.invalidateQueries({ queryKey: ['hypercareStats'] })
      setAddDialog(false)
      setFormData({
        msisdn: '',
        userId: '',
        userEmail: '',
        userName: '',
        productId: '',
        listType: 'WHITELIST',
        reason: '',
        isLongTerm: false,
        expiresAt: '',
        addedBy: 'admin@company.com',
      })
      console.log('Entry added successfully!')
    },
  })

  const removeEntryMutation = useMutation({
    mutationFn: (id: string) => hypercareAPI.removeGreylistEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['greylistEntries'] })
      queryClient.invalidateQueries({ queryKey: ['hypercareStats'] })
      console.log('Entry removed successfully!')
    },
  })

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      hypercareAPI.updateGreylistEntry(id, { status: status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['greylistEntries'] })
    },
  })

  // Calculate stats
  const whitelistCount = greylistEntries.filter(e => e.listType === 'WHITELIST' && e.status === 'ACTIVE').length
  const blacklistCount = greylistEntries.filter(e => e.listType === 'BLACKLIST' && e.status === 'ACTIVE').length
  const longTermCount = greylistEntries.filter(e => !e.expiresAt && e.status === 'ACTIVE').length
  const totalCount = greylistEntries.filter(e => e.status === 'ACTIVE').length

  // Filter entries
  const filteredEntries = greylistEntries
    .filter((entry) => {
      // Tab filter
      if (tabValue === 0) return entry.listType === 'WHITELIST'
      if (tabValue === 1) return entry.listType === 'BLACKLIST'
      return true
    })
    .filter((entry) => {
      // Search filter
      if (!searchQuery) return true
      const query = searchQuery.toLowerCase()
      return (
        (entry as any).msisdn?.toLowerCase().includes(query) ||
        entry.userId.toLowerCase().includes(query) ||
        entry.userEmail.toLowerCase().includes(query)
      )
    })

  const handleRemoveAll = () => {
    if (window.confirm('Are you sure you want to remove all entries?')) {
      filteredEntries.forEach((entry) => {
        removeEntryMutation.mutate(entry.id)
      })
    }
  }

  return (
    <Box>
      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card
            sx={{
              bgcolor: 'success.main',
              color: 'white',
              height: '100%',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Whitelisted Users
                </Typography>
                <WhitelistIcon sx={{ opacity: 0.8 }} />
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
                {whitelistCount}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                {whitelistCount} active entries
              </Typography>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card
            sx={{
              bgcolor: 'error.main',
              color: 'white',
              height: '100%',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Blacklisted Users
                </Typography>
                <BlacklistIcon sx={{ opacity: 0.8 }} />
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
                {blacklistCount}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                {blacklistCount} active blocks
              </Typography>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              height: '100%',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Long Term Access
                </Typography>
                <LongTermIcon sx={{ opacity: 0.8 }} />
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
                {longTermCount}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                LT flagged users
              </Typography>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card
            sx={{
              bgcolor: '#7c3aed',
              color: 'white',
              height: '100%',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Total Managed
                </Typography>
                <TotalIcon sx={{ opacity: 0.8 }} />
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
                {totalCount}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Users in greylist
              </Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ px: 2 }}>
          <Tab
            icon={<WhitelistIcon />}
            iconPosition="start"
            label="Whitelist"
            sx={{ textTransform: 'none', fontWeight: 600 }}
          />
          <Tab
            icon={<BlacklistIcon />}
            iconPosition="start"
            label="Blacklist"
            sx={{ textTransform: 'none', fontWeight: 600 }}
          />
        </Tabs>
      </Paper>

      {/* Actions Bar */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search by MSISDN or User ID..."
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ flexGrow: 1, minWidth: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            color="success"
            startIcon={<AddIcon />}
            onClick={() => setAddDialog(true)}
          >
            Add Entry
          </Button>
          <Button variant="outlined" startIcon={<UploadIcon />}>
            Upload CSV
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<RemoveAllIcon />}
            onClick={handleRemoveAll}
          >
            Remove All
          </Button>
        </Box>
      </Paper>

      {/* Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Status</TableCell>
                <TableCell>MSISDN</TableCell>
                <TableCell>User ID</TableCell>
                <TableCell>Product</TableCell>
                <TableCell>LT</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEntries.map((entry) => (
                <TableRow key={entry.id} hover>
                  <TableCell>
                    <Switch
                      checked={entry.status === 'ACTIVE'}
                      onChange={() =>
                        toggleStatusMutation.mutate({ id: entry.id, status: entry.status })
                      }
                      color="success"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {(entry as any).msisdn || entry.userEmail}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{entry.userId || '-'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {entry.productName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {!entry.expiresAt ? (
                      <Chip
                        label="Yes"
                        size="small"
                        sx={{
                          bgcolor: 'primary.main',
                          color: 'white',
                          borderRadius: '4px',
                          fontWeight: 600,
                        }}
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(entry.addedAt).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => removeEntryMutation.mutate(entry.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {filteredEntries.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No entries found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add Entry Dialog */}
      <Dialog open={addDialog} onClose={() => setAddDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Greylist Entry</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="MSISDN"
                value={formData.msisdn}
                onChange={(e) => setFormData({ ...formData, msisdn: e.target.value })}
                helperText="Mobile number (e.g., +639171234567)"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="User ID"
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                helperText="System user ID (e.g., USER001)"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="User Email"
                type="email"
                value={formData.userEmail}
                onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="User Name"
                value={formData.userName}
                onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Product</InputLabel>
                <Select
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  label="Product"
                >
                  {products
                    .filter((p) => p.status === 'ACTIVE')
                    .map((product) => (
                      <MenuItem key={product.id} value={product.id}>
                        {product.name} ({product.code})
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>List Type</InputLabel>
                <Select
                  value={formData.listType}
                  onChange={(e) =>
                    setFormData({ ...formData, listType: e.target.value as any })
                  }
                  label="List Type"
                >
                  <MenuItem value="WHITELIST">Whitelist (Allow Access)</MenuItem>
                  <MenuItem value="BLACKLIST">Blacklist (Block Access)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Reason"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                helperText="Reason for adding to greylist"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Expires At (Optional)"
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                InputLabelProps={{ shrink: true }}
                helperText="Leave empty for long-term access"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => addEntryMutation.mutate(formData)}
            disabled={
              addEntryMutation.isPending ||
              !formData.msisdn ||
              !formData.userId ||
              !formData.productId
            }
          >
            {addEntryMutation.isPending ? 'Adding...' : 'Add Entry'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default GreylistManagement
