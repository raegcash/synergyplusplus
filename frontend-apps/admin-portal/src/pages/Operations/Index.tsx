import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
} from '@mui/material'
import {
  TrendingUp,
  People,
  AccountBalance,
  Assessment,
  CheckCircle,
  SwapHoriz,
} from '@mui/icons-material'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { operationsAPI } from '../../services/operations'
import WorkflowDiagram from '../../components/WorkflowDiagram'

// Mock data for charts
const transactionTrendData = [
  { month: 'Jan', transactions: 12400, volume: 142000, revenue: 14200 },
  { month: 'Feb', transactions: 15200, volume: 168000, revenue: 16800 },
  { month: 'Mar', transactions: 18600, volume: 195000, revenue: 19500 },
  { month: 'Apr', transactions: 21300, volume: 223000, revenue: 22300 },
  { month: 'May', transactions: 24100, volume: 251000, revenue: 25100 },
  { month: 'Jun', transactions: 28700, volume: 287000, revenue: 28700 },
]

const userGrowthData = [
  { month: 'Jan', users: 8500, active: 6800 },
  { month: 'Feb', users: 9200, active: 7400 },
  { month: 'Mar', users: 10100, active: 8200 },
  { month: 'Apr', users: 11300, active: 9100 },
  { month: 'May', users: 12800, active: 10400 },
  { month: 'Jun', users: 14500, active: 11800 },
]

const productDistribution = [
  { name: 'GCrypto', value: 4250, color: '#3b82f6' },
  { name: 'GStocks', value: 3800, color: '#10b981' },
  { name: 'GSave', value: 3200, color: '#8b5cf6' },
  { name: 'GFunds', value: 2100, color: '#f59e0b' },
  { name: 'Others', value: 1150, color: '#6b7280' },
]

const partnerTypeDistribution = [
  { name: 'Fund Houses', value: 8, color: '#3b82f6' },
  { name: 'Stock Brokers', value: 6, color: '#10b981' },
  { name: 'Crypto Exchanges', value: 4, color: '#8b5cf6' },
  { name: 'Banks', value: 3, color: '#f59e0b' },
]

const dailyActivity = [
  { day: 'Mon', transactions: 3200, users: 1100, revenue: 32000 },
  { day: 'Tue', transactions: 4100, users: 1300, revenue: 41000 },
  { day: 'Wed', transactions: 3800, users: 1200, revenue: 38000 },
  { day: 'Thu', transactions: 4500, users: 1400, revenue: 45000 },
  { day: 'Fri', transactions: 5200, users: 1600, revenue: 52000 },
  { day: 'Sat', transactions: 3600, users: 1150, revenue: 36000 },
  { day: 'Sun', transactions: 2900, users: 950, revenue: 29000 },
]

const OperationsDashboard = () => {
  const navigate = useNavigate()

  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['operationalStats'],
    queryFn: () => operationsAPI.getOperationalStats(),
    refetchInterval: 30000,
  })

  const { data: productPerformance = [], isLoading: loadingProducts } = useQuery({
    queryKey: ['productPerformance'],
    queryFn: () => operationsAPI.getAllProductPerformance(),
  })

  const { data: partnerPerformance = [], isLoading: loadingPartners } = useQuery({
    queryKey: ['partnerPerformance'],
    queryFn: () => operationsAPI.getAllPartnerPerformance(),
  })

  const { data: transactionSummaries = [], isLoading: loadingTransactions } = useQuery({
    queryKey: ['transactionSummaries'],
    queryFn: () => operationsAPI.getTransactionSummaries(),
  })

  const isLoading = loadingStats || loadingProducts || loadingPartners || loadingTransactions

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Operations Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Monitor performance, manage users, and generate comprehensive reports
        </Typography>
      </Box>

      {isLoading && <LinearProgress sx={{ mb: 3 }} />}

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <People color="primary" />
                <Typography variant="caption" color="text.secondary">
                  Total Users
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight={700}>
                {stats?.totalUsers.toLocaleString() || '0'}
              </Typography>
              <Typography variant="caption" color="success.main">
                {stats?.activeUsers.toLocaleString() || '0'} active
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <SwapHoriz color="success" />
                <Typography variant="caption" color="text.secondary">
                  Transactions (MTD)
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight={700}>
                {stats?.totalTransactions.toLocaleString() || '0'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {stats?.successRate || '0'}% success rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <AccountBalance color="warning" />
                <Typography variant="caption" color="text.secondary">
                  Transaction Volume
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight={700} sx={{ fontSize: '1.75rem' }}>
                PHP {((stats?.transactionVolume || 0) / 1000000).toFixed(1)}M
              </Typography>
              <Typography variant="caption" color="success.main">
                Revenue: PHP {((stats?.totalRevenue || 0) / 1000).toFixed(0)}K
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CheckCircle color="info" />
                <Typography variant="caption" color="text.secondary">
                  Active Partners
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight={700}>
                {stats?.activePartners || '0'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {stats?.activeProducts || '0'} products
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
          Performance Analytics
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Real-time insights into transactions, revenue, and user activity
        </Typography>

        <Grid container spacing={3}>
          {/* Transaction & Revenue Trends */}
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Transaction & Revenue Trends (Last 6 Months)
              </Typography>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={transactionTrendData}>
                  <defs>
                    <linearGradient id="colorTxn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="transactions"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#colorTxn)"
                    name="Transactions"
                  />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    name="Revenue (K PHP)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Product Distribution */}
          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Active Users by Product
              </Typography>
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={productDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {productDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* User Growth */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                User Growth Trend
              </Typography>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Total Users"
                  />
                  <Line
                    type="monotone"
                    dataKey="active"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Active Users"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Daily Activity */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                This Week's Activity
              </Typography>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={dailyActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="transactions" fill="#3b82f6" name="Transactions" />
                  <Bar dataKey="users" fill="#10b981" name="Active Users" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Transaction Workflow */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
          Transaction Processing Workflow
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Standard flow for all financial transactions in the system
        </Typography>

        <WorkflowDiagram
          orientation="horizontal"
          steps={[
            {
              id: 'initiation',
              label: 'Initiation',
              description: 'User submits transaction',
              status: 'completed',
              substeps: [
                { id: 'sub1', label: 'Request received', status: 'completed' },
                { id: 'sub2', label: 'Validated', status: 'completed' },
              ],
            },
            {
              id: 'verification',
              label: 'Verification',
              description: 'KYC & compliance checks',
              status: 'completed',
              substeps: [
                { id: 'sub3', label: 'KYC verified', status: 'completed' },
                { id: 'sub4', label: 'Limits checked', status: 'completed' },
              ],
            },
            {
              id: 'processing',
              label: 'Processing',
              description: 'Partner integration',
              status: 'active',
              substeps: [
                { id: 'sub5', label: 'Sent to partner', status: 'completed' },
                { id: 'sub6', label: 'Awaiting response', status: 'active' },
              ],
            },
            {
              id: 'settlement',
              label: 'Settlement',
              description: 'Funds transfer',
              status: 'pending',
              substeps: [
                { id: 'sub7', label: 'Balance update', status: 'pending' },
                { id: 'sub8', label: 'Confirmation', status: 'pending' },
              ],
            },
          ]}
        />
      </Box>

      {/* Product Performance */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            Top Products by Performance
          </Typography>
          <Chip label="This Month" size="small" color="primary" />
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Rank</TableCell>
                <TableCell>Product</TableCell>
                <TableCell align="right">Users</TableCell>
                <TableCell align="right">Transactions</TableCell>
                <TableCell align="right">Volume</TableCell>
                <TableCell align="right">Avg Return</TableCell>
                <TableCell align="right">Score</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {productPerformance
                .sort((a, b) => b.performanceScore - a.performanceScore)
                .slice(0, 5)
                .map((product) => (
                  <TableRow 
                    key={product.productId}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/operations/performance?product=${product.productId}`)}
                  >
                    <TableCell>
                      <Chip label={`#${product.popularityRank}`} size="small" color="primary" />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {product.productName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {product.productCode}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={600}>
                        {product.activeUsers.toLocaleString()}
                      </Typography>
                      <Typography variant="caption" color="success.main">
                        +{product.newUsers} new
                      </Typography>
                    </TableCell>
                    <TableCell align="right">{product.totalTransactions.toLocaleString()}</TableCell>
                    <TableCell align="right">
                      PHP {(product.transactionVolume / 1000000).toFixed(1)}M
                    </TableCell>
                    <TableCell align="right">
                      <Typography 
                        variant="body2" 
                        fontWeight={600}
                        color={product.averageReturn > 0 ? 'success.main' : 'error.main'}
                      >
                        {product.averageReturn > 0 ? '+' : ''}{product.averageReturn}%
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-end' }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={product.performanceScore} 
                          sx={{ width: 60, height: 6, borderRadius: 1 }}
                          color={product.performanceScore >= 90 ? 'success' : product.performanceScore >= 70 ? 'warning' : 'error'}
                        />
                        <Typography variant="body2" fontWeight={600}>
                          {product.performanceScore}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Partner Performance */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            Partner Performance Overview
          </Typography>
          <Chip label="Last 30 Days" size="small" color="success" />
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Partner</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Volume</TableCell>
                <TableCell align="right">Transactions</TableCell>
                <TableCell align="right">Success Rate</TableCell>
                <TableCell align="right">Uptime</TableCell>
                <TableCell align="right">Growth</TableCell>
                <TableCell align="right">Score</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {partnerPerformance
                .sort((a, b) => b.performanceScore - a.performanceScore)
                .map((partner) => (
                  <TableRow 
                    key={partner.partnerId}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/operations/performance?partner=${partner.partnerId}`)}
                  >
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {partner.partnerName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {partner.activeUsers.toLocaleString()} active users
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={partner.partnerType.replace('_', ' ')} 
                        size="small"
                        color={
                          partner.partnerType === 'FUND_HOUSE' ? 'primary' :
                          partner.partnerType === 'STOCK_BROKER' ? 'success' :
                          'warning'
                        }
                      />
                    </TableCell>
                    <TableCell align="right">
                      PHP {(partner.totalVolume / 1000000).toFixed(1)}M
                    </TableCell>
                    <TableCell align="right">{partner.transactionCount.toLocaleString()}</TableCell>
                    <TableCell align="right">
                      <Typography 
                        variant="body2" 
                        fontWeight={600}
                        color={partner.successRate >= 99 ? 'success.main' : 'warning.main'}
                      >
                        {partner.successRate}%
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color={partner.uptime >= 99.9 ? 'success.main' : 'warning.main'}>
                        {partner.uptime}%
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography 
                        variant="body2" 
                        fontWeight={600}
                        color="success.main"
                      >
                        +{partner.growthRate}%
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-end' }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={partner.performanceScore} 
                          sx={{ width: 60, height: 6, borderRadius: 1 }}
                          color={partner.performanceScore >= 95 ? 'success' : 'warning'}
                        />
                        <Typography variant="body2" fontWeight={600}>
                          {partner.performanceScore}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  )
}

export default OperationsDashboard

