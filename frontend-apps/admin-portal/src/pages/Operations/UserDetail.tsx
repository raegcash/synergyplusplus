import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Paper,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Avatar,
  Divider,
  LinearProgress,
} from '@mui/material'
import {
  ArrowBack as BackIcon,
  TrendingUp as GainIcon,
  TrendingDown as LossIcon,
  AccountBalance as PortfolioIcon,
  Receipt as TransactionIcon,
  CheckCircle as VerifiedIcon,
  Warning as WarningIcon,
} from '@mui/icons-material'

// Mock comprehensive user data
const mockUserData = {
  id: 'user-123',
  userId: 'USR-2024-001',
  email: 'john.doe@email.com',
  firstName: 'John',
  lastName: 'Doe',
  phone: '+639171234567',
  kycStatus: 'VERIFIED',
  kycTier: 'TIER_3',
  accountStatus: 'ACTIVE',
  registrationDate: '2024-01-15T10:00:00Z',
  lastLogin: '2025-10-13T14:30:00Z',
  
  // Portfolio Summary
  portfolio: {
    totalInvestments: 250000,
    currentValue: 285000,
    totalGains: 35000,
    gainsPercentage: 14.0,
    totalLosses: 0,
    activeProducts: 3,
  },
  
  // Products onboarded
  products: [
    {
      id: 'prod-1',
      name: 'UITF Investment',
      onboardedAt: '2024-01-20T10:00:00Z',
      status: 'ACTIVE',
      investments: 100000,
      currentValue: 115000,
      gains: 15000,
      gainsPercent: 15.0,
      assetsCount: 5,
    },
    {
      id: 'prod-2',
      name: 'Mutual Funds',
      onboardedAt: '2024-03-10T10:00:00Z',
      status: 'ACTIVE',
      investments: 100000,
      currentValue: 110000,
      gains: 10000,
      gainsPercent: 10.0,
      assetsCount: 3,
    },
    {
      id: 'prod-3',
      name: 'GStocks Global',
      onboardedAt: '2024-06-01T10:00:00Z',
      status: 'ACTIVE',
      investments: 50000,
      currentValue: 60000,
      gains: 10000,
      gainsPercent: 20.0,
      assetsCount: 8,
    },
  ],
  
  // Transaction History
  transactions: [
    {
      id: 'txn-1',
      transactionId: 'TXN-2025-10-001',
      date: '2025-10-10T09:00:00Z',
      product: 'UITF Investment',
      asset: 'BPI Equity Fund',
      type: 'SUBSCRIPTION',
      amount: 10000,
      units: 100,
      navpu: 100.00,
      fee: 50,
      status: 'COMPLETED',
    },
    {
      id: 'txn-2',
      transactionId: 'TXN-2025-10-002',
      date: '2025-10-05T14:30:00Z',
      product: 'GStocks Global',
      asset: 'AAPL',
      type: 'BUY',
      amount: 5000,
      units: 25,
      price: 200.00,
      fee: 25,
      status: 'COMPLETED',
    },
    {
      id: 'txn-3',
      transactionId: 'TXN-2025-09-028',
      date: '2025-09-28T11:15:00Z',
      product: 'Mutual Funds',
      asset: 'Growth Fund A',
      type: 'SUBSCRIPTION',
      amount: 15000,
      units: 150,
      navpu: 100.00,
      fee: 75,
      status: 'COMPLETED',
    },
    {
      id: 'txn-4',
      transactionId: 'TXN-2025-09-015',
      date: '2025-09-15T16:45:00Z',
      product: 'GStocks Global',
      asset: 'TSLA',
      type: 'SELL',
      amount: 3000,
      units: 10,
      price: 300.00,
      fee: 15,
      status: 'COMPLETED',
    },
    {
      id: 'txn-5',
      transactionId: 'TXN-2025-09-001',
      date: '2025-09-01T10:00:00Z',
      product: 'UITF Investment',
      asset: 'Metrobank Money Market Fund',
      type: 'SUBSCRIPTION',
      amount: 20000,
      units: 200,
      navpu: 100.00,
      fee: 100,
      status: 'COMPLETED',
    },
  ],
  
  // Portfolio Breakdown
  portfolioBreakdown: [
    { product: 'UITF Investment', percentage: 40.35, value: 115000, color: '#2196F3' },
    { product: 'Mutual Funds', percentage: 38.60, value: 110000, color: '#4CAF50' },
    { product: 'GStocks Global', percentage: 21.05, value: 60000, color: '#FF9800' },
  ],
  
  // Asset Holdings
  holdings: [
    { asset: 'BPI Equity Fund', product: 'UITF', units: 500, avgPrice: 90.00, currentPrice: 105.00, value: 52500, gain: 7500, gainPercent: 16.67 },
    { asset: 'Metrobank Money Market', product: 'UITF', units: 600, avgPrice: 100.00, currentPrice: 104.17, value: 62500, gain: 2500, gainPercent: 4.17 },
    { asset: 'Growth Fund A', product: 'Mutual Funds', units: 800, avgPrice: 95.00, currentPrice: 107.50, value: 86000, gain: 10000, gainPercent: 13.16 },
    { asset: 'Income Fund B', product: 'Mutual Funds', units: 200, avgPrice: 100.00, currentPrice: 120.00, value: 24000, gain: 4000, gainPercent: 20.00 },
    { asset: 'AAPL', product: 'Stocks', units: 75, avgPrice: 180.00, currentPrice: 200.00, value: 15000, gain: 1500, gainPercent: 11.11 },
    { asset: 'TSLA', product: 'Stocks', units: 100, avgPrice: 250.00, currentPrice: 280.00, value: 28000, gain: 3000, gainPercent: 12.00 },
    { asset: 'MSFT', product: 'Stocks', units: 50, avgPrice: 300.00, currentPrice: 340.00, value: 17000, gain: 2000, gainPercent: 13.33 },
  ],
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

export default function UserDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tabValue, setTabValue] = useState(0)
  
  const user = mockUserData // In real app, fetch by id

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button startIcon={<BackIcon />} onClick={() => navigate('/operations/users')}>
          Back
        </Button>
        <Typography variant="h4" fontWeight="bold" sx={{ ml: 2 }}>
          User Details
        </Typography>
      </Box>

      {/* User Profile Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3} sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{ width: 100, height: 100, mx: 'auto', mb: 2, bgcolor: 'primary.main', fontSize: 40 }}
              >
                {user.firstName[0]}{user.lastName[0]}
              </Avatar>
              <Typography variant="h6">
                {user.firstName} {user.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user.userId}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Chip
                  icon={<VerifiedIcon />}
                  label={user.kycStatus}
                  color="success"
                  size="small"
                  sx={{ mr: 1 }}
                />
                <Chip
                  label={user.kycTier}
                  color="info"
                  size="small"
                />
              </Box>
            </Grid>

            <Grid item xs={12} md={9}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Email</Typography>
                  <Typography variant="body1">{user.email}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Phone</Typography>
                  <Typography variant="body1">{user.phone}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Registration Date</Typography>
                  <Typography variant="body1">
                    {new Date(user.registrationDate).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Last Login</Typography>
                  <Typography variant="body1">
                    {new Date(user.lastLogin).toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Portfolio Summary */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Investments
              </Typography>
              <Typography variant="h5">
                ₱{user.portfolio.totalInvestments.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Current Value
              </Typography>
              <Typography variant="h5" color="primary.main">
                ₱{user.portfolio.currentValue.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography color="textSecondary" gutterBottom>
                  Total Gains
                </Typography>
                <GainIcon color="success" />
              </Box>
              <Typography variant="h5" color="success.main">
                ₱{user.portfolio.totalGains.toLocaleString()}
              </Typography>
              <Typography variant="caption" color="success.main">
                +{user.portfolio.gainsPercentage.toFixed(2)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Products
              </Typography>
              <Typography variant="h5">
                {user.portfolio.activeProducts}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="Portfolio" icon={<PortfolioIcon />} iconPosition="start" />
          <Tab label="Transactions" icon={<TransactionIcon />} iconPosition="start" />
          <Tab label="Holdings" />
          <Tab label="Products" />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Portfolio Distribution
              </Typography>
              {user.portfolioBreakdown.map((item) => (
                <Box key={item.product} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">{item.product}</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {item.percentage.toFixed(2)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={item.percentage}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: 'grey.200',
                      '& .MuiLinearProgress-bar': { bgcolor: item.color },
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    ₱{item.value.toLocaleString()}
                  </Typography>
                </Box>
              ))}
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Performance Metrics
              </Typography>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Overall Return
                </Typography>
                <Typography variant="h4" color="success.main">
                  +{user.portfolio.gainsPercentage.toFixed(2)}%
                </Typography>
                <Typography variant="body2" color="success.main">
                  ₱{user.portfolio.totalGains.toLocaleString()} gains
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Best Performing Product
                </Typography>
                <Typography variant="h6" color="success.main">
                  GStocks Global (+20.0%)
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Transaction ID</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Product</TableCell>
                <TableCell>Asset</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell align="right">Units</TableCell>
                <TableCell align="right">Price</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {user.transactions.map((txn) => (
                <TableRow key={txn.id}>
                  <TableCell>{txn.transactionId}</TableCell>
                  <TableCell>{new Date(txn.date).toLocaleDateString()}</TableCell>
                  <TableCell>{txn.product}</TableCell>
                  <TableCell>{txn.asset}</TableCell>
                  <TableCell>
                    <Chip
                      label={txn.type}
                      size="small"
                      color={
                        txn.type.includes('BUY') || txn.type === 'SUBSCRIPTION'
                          ? 'success'
                          : 'warning'
                      }
                    />
                  </TableCell>
                  <TableCell align="right">₱{txn.amount.toLocaleString()}</TableCell>
                  <TableCell align="right">{txn.units}</TableCell>
                  <TableCell align="right">
                    ₱{(txn.navpu || txn.price || 0).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Chip label={txn.status} size="small" color="success" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Asset</TableCell>
                <TableCell>Product</TableCell>
                <TableCell align="right">Units</TableCell>
                <TableCell align="right">Avg Price</TableCell>
                <TableCell align="right">Current Price</TableCell>
                <TableCell align="right">Value</TableCell>
                <TableCell align="right">Gain/Loss</TableCell>
                <TableCell align="right">%</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {user.holdings.map((holding, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {holding.asset}
                    </Typography>
                  </TableCell>
                  <TableCell>{holding.product}</TableCell>
                  <TableCell align="right">{holding.units}</TableCell>
                  <TableCell align="right">₱{holding.avgPrice.toFixed(2)}</TableCell>
                  <TableCell align="right">₱{holding.currentPrice.toFixed(2)}</TableCell>
                  <TableCell align="right">₱{holding.value.toLocaleString()}</TableCell>
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      color={holding.gain >= 0 ? 'success.main' : 'error.main'}
                    >
                      {holding.gain >= 0 ? '+' : ''}₱{holding.gain.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      icon={holding.gainPercent >= 0 ? <GainIcon /> : <LossIcon />}
                      label={`${holding.gainPercent >= 0 ? '+' : ''}${holding.gainPercent.toFixed(2)}%`}
                      size="small"
                      color={holding.gainPercent >= 0 ? 'success' : 'error'}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Grid container spacing={3}>
          {user.products.map((product) => (
            <Grid item xs={12} key={product.id}>
              <Card>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" gutterBottom>
                        {product.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Onboarded: {new Date(product.onboardedAt).toLocaleDateString()}
                      </Typography>
                      <Chip label={product.status} color="success" size="small" sx={{ mt: 1 }} />
                    </Grid>
                    <Grid item xs={6} md={2}>
                      <Typography variant="caption" color="text.secondary">
                        Investments
                      </Typography>
                      <Typography variant="h6">
                        ₱{product.investments.toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} md={2}>
                      <Typography variant="caption" color="text.secondary">
                        Current Value
                      </Typography>
                      <Typography variant="h6" color="primary.main">
                        ₱{product.currentValue.toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} md={2}>
                      <Typography variant="caption" color="text.secondary">
                        Gains
                      </Typography>
                      <Typography variant="h6" color="success.main">
                        +₱{product.gains.toLocaleString()}
                      </Typography>
                      <Typography variant="caption" color="success.main">
                        +{product.gainsPercent.toFixed(2)}%
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>
    </Box>
  )
}



