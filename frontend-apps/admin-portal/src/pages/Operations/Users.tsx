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
  CardContent,
  LinearProgress,
  Tabs,
  Tab,
} from '@mui/material'
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Assessment as ReportIcon,
} from '@mui/icons-material'
import { operationsAPI, UserAccount } from '../../services/operations'

const UserManagement = () => {
  const queryClient = useQueryClient()
  const [tabValue, setTabValue] = useState(0)
  const [addUserDialog, setAddUserDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null)
  const [viewUserDialog, setViewUserDialog] = useState(false)

  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
  })

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => operationsAPI.getAllUsers(),
  })

  const createUserMutation = useMutation({
    mutationFn: (data: typeof formData) => operationsAPI.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setAddUserDialog(false)
      setFormData({ email: '', firstName: '', lastName: '', phoneNumber: '' })
      console.log('User created successfully!')
    },
  })

  const filteredUsers = users.filter(user => {
    if (tabValue === 0) return true // All
    if (tabValue === 1) return user.status === 'ACTIVE'
    if (tabValue === 2) return user.kycStatus === 'PENDING'
    return true
  })

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'ACTIVE').length,
    pending: users.filter(u => u.kycStatus === 'PENDING').length,
    suspended: users.filter(u => u.status === 'SUSPENDED').length,
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success'
      case 'INACTIVE': return 'default'
      case 'SUSPENDED': return 'error'
      case 'PENDING_VERIFICATION': return 'warning'
      default: return 'default'
    }
  }

  const getKYCStatusColor = (status: string) => {
    switch (status) {
      case 'VERIFIED': return 'success'
      case 'PENDING': return 'warning'
      case 'REJECTED': return 'error'
      case 'NOT_STARTED': return 'default'
      default: return 'default'
    }
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            User Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Centralized user management and product onboarding
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ReportIcon />}
            onClick={() => console.log('Generate user report')}
          >
            Generate Report
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddUserDialog(true)}
          >
            Add User
          </Button>
        </Box>
      </Box>

      {/* Statistics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">Total Users</Typography>
              <Typography variant="h4" fontWeight={700}>{stats.total}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">Active</Typography>
              <Typography variant="h4" fontWeight={700} color="success.main">{stats.active}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">Pending KYC</Typography>
              <Typography variant="h4" fontWeight={700} color="warning.main">{stats.pending}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">Suspended</Typography>
              <Typography variant="h4" fontWeight={700} color="error.main">{stats.suspended}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab label={`All Users (${stats.total})`} />
          <Tab label={`Active (${stats.active})`} />
          <Tab label={`Pending (${stats.pending})`} />
        </Tabs>
      </Paper>

      {/* Users Table */}
      <Paper>
        {isLoading && <LinearProgress />}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>KYC Status</TableCell>
                <TableCell>Onboarded Products</TableCell>
                <TableCell align="right">Portfolio Value</TableCell>
                <TableCell align="right">Return</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {user.firstName} {user.lastName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {user.transactionCount} transactions
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{user.email}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user.phoneNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={user.status.replace('_', ' ')} 
                      color={getStatusColor(user.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={user.kycStatus.replace('_', ' ')} 
                      color={getKYCStatusColor(user.kycStatus) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {user.onboardedProducts.map((product) => (
                        <Chip 
                          key={product.productId}
                          label={product.productCode}
                          size="small"
                          variant="outlined"
                          color={product.status === 'ACTIVE' ? 'primary' : 'default'}
                        />
                      ))}
                      {user.onboardedProducts.length === 0 && (
                        <Typography variant="caption" color="text.secondary">
                          None
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={600}>
                      PHP {user.currentValue.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography 
                      variant="body2" 
                      fontWeight={600}
                      color={user.returnPercentage >= 0 ? 'success.main' : 'error.main'}
                    >
                      {user.returnPercentage >= 0 ? '+' : ''}{user.returnPercentage}%
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      size="small"
                      onClick={() => {
                        setSelectedUser(user)
                        setViewUserDialog(true)
                      }}
                    >
                      <ViewIcon />
                    </IconButton>
                    <IconButton size="small">
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add User Dialog */}
      <Dialog open={addUserDialog} onClose={() => setAddUserDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddUserDialog(false)}>Cancel</Button>
          <Button 
            variant="contained"
            onClick={() => createUserMutation.mutate(formData)}
            disabled={createUserMutation.isPending}
          >
            {createUserMutation.isPending ? 'Creating...' : 'Create User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View User Dialog */}
      <Dialog open={viewUserDialog} onClose={() => setViewUserDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>User Details</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">Full Name</Typography>
                <Typography variant="body1" fontWeight={600}>
                  {selectedUser.firstName} {selectedUser.lastName}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">Email</Typography>
                <Typography variant="body1" fontWeight={600}>{selectedUser.email}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">Phone</Typography>
                <Typography variant="body1" fontWeight={600}>{selectedUser.phoneNumber}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">Status</Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip 
                    label={selectedUser.status} 
                    color={getStatusColor(selectedUser.status) as any}
                    size="small"
                  />
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight={600} mb={2}>Onboarded Products</Typography>
                {selectedUser.onboardedProducts.map((product) => (
                  <Paper key={product.productId} variant="outlined" sx={{ p: 2, mb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>{product.productName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {product.productCode} • Onboarded {new Date(product.onboardedAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Chip 
                        label={product.status} 
                        color={product.status === 'ACTIVE' ? 'success' : 'default'}
                        size="small"
                      />
                    </Box>
                  </Paper>
                ))}
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" fontWeight={600} mb={2}>Portfolio Summary</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Total Investment</Typography>
                    <Typography variant="h6">PHP {selectedUser.totalInvestment.toLocaleString()}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Current Value</Typography>
                    <Typography variant="h6">PHP {selectedUser.currentValue.toLocaleString()}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Total Return</Typography>
                    <Typography 
                      variant="h6" 
                      color={selectedUser.totalReturn >= 0 ? 'success.main' : 'error.main'}
                    >
                      PHP {selectedUser.totalReturn.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Return %</Typography>
                    <Typography 
                      variant="h6"
                      color={selectedUser.returnPercentage >= 0 ? 'success.main' : 'error.main'}
                    >
                      {selectedUser.returnPercentage >= 0 ? '+' : ''}{selectedUser.returnPercentage}%
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewUserDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default UserManagement



