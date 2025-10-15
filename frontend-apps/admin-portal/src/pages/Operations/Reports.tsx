import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  LinearProgress,
} from '@mui/material'
import {
  Download as DownloadIcon,
  FilterList as FilterIcon,
  Assessment as ReportIcon,
} from '@mui/icons-material'
import { operationsAPI } from '../../services/operations'

const Reports = () => {
  const [tabValue, setTabValue] = useState(0)
  const [format, setFormat] = useState<'PDF' | 'CSV' | 'EXCEL' | 'JSON'>('PDF')
  const [dateRange, setDateRange] = useState({
    start: '2025-10-01',
    end: '2025-10-31',
  })

  // Fetch all data
  const { data: transactionSummaries = [], isLoading: loadingTransactions } = useQuery({
    queryKey: ['transactionSummaries'],
    queryFn: () => operationsAPI.getTransactionSummaries(),
  })

  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: () => operationsAPI.getAllUsers(),
  })

  const { data: partnerPerformance = [], isLoading: loadingPartners } = useQuery({
    queryKey: ['partnerPerformance'],
    queryFn: () => operationsAPI.getAllPartnerPerformance(),
  })

  const { data: productPerformance = [], isLoading: loadingProducts } = useQuery({
    queryKey: ['productPerformance'],
    queryFn: () => operationsAPI.getAllProductPerformance(),
  })

  const generateReportMutation = useMutation({
    mutationFn: (config: any) => operationsAPI.generateReport(config),
    onSuccess: (filename) => {
      console.log(`Report generated: ${filename}\n\nDownload will start automatically.`)
    },
  })

  const handleExport = (reportType: string) => {
    generateReportMutation.mutate({
      type: reportType,
      format,
      dateRange,
    })
  }

  const isLoading = loadingTransactions || loadingUsers || loadingPartners || loadingProducts

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Reports & Analytics
        </Typography>
        <Typography variant="body2" color="text.secondary">
          View data and generate comprehensive reports
        </Typography>
      </Box>

      {/* Export Controls */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight={600} mb={2}>
          Export Settings
        </Typography>
        
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Format</InputLabel>
              <Select
                value={format}
                onChange={(e) => setFormat(e.target.value as any)}
                label="Format"
              >
                <MenuItem value="PDF">PDF</MenuItem>
                <MenuItem value="CSV">CSV</MenuItem>
                <MenuItem value="EXCEL">Excel</MenuItem>
                <MenuItem value="JSON">JSON</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Start Date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="End Date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <Chip 
              icon={<FilterIcon />} 
              label={`${dateRange.start} to ${dateRange.end}`}
              color="primary"
              variant="outlined"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Statistics Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">Total Transactions</Typography>
              <Typography variant="h4" fontWeight={700}>
                {transactionSummaries.reduce((sum, t) => sum + t.totalTransactions, 0)}
              </Typography>
              <Typography variant="caption" color="success.main">
                {transactionSummaries.length} products
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">Total Users</Typography>
              <Typography variant="h4" fontWeight={700}>{users.length}</Typography>
              <Typography variant="caption" color="success.main">
                {users.filter(u => u.status === 'ACTIVE').length} active
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">Partners</Typography>
              <Typography variant="h4" fontWeight={700}>{partnerPerformance.length}</Typography>
              <Typography variant="caption" color="text.secondary">
                Avg score: {(partnerPerformance.reduce((s, p) => s + p.performanceScore, 0) / partnerPerformance.length).toFixed(1)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary">Products</Typography>
              <Typography variant="h4" fontWeight={700}>{productPerformance.length}</Typography>
              <Typography variant="caption" color="text.secondary">
                Avg return: +{(productPerformance.reduce((s, p) => s + p.averageReturn, 0) / productPerformance.length).toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 2 }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab label="Transaction Summary" />
          <Tab label="User Portfolios" />
          <Tab label="Partner Performance" />
          <Tab label="Product Analytics" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Paper>
        {isLoading && <LinearProgress />}

        {/* Transaction Summary Tab */}
        {tabValue === 0 && (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight={600}>
                Transaction Summary by Product & Partner
              </Typography>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={() => handleExport('TRANSACTION')}
                disabled={generateReportMutation.isPending}
              >
                {generateReportMutation.isPending ? 'Generating...' : `Export as ${format}`}
              </Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell>Partner</TableCell>
                    <TableCell align="right">Total Trans.</TableCell>
                    <TableCell align="right">Successful</TableCell>
                    <TableCell align="right">Failed</TableCell>
                    <TableCell align="right">Pending</TableCell>
                    <TableCell align="right">Volume</TableCell>
                    <TableCell align="right">Avg Size</TableCell>
                    <TableCell align="right">Success Rate</TableCell>
                    <TableCell align="right">Satisfaction</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactionSummaries.map((summary) => (
                    <TableRow key={`${summary.productId}-${summary.partnerId}`} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {summary.productName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {summary.productCode}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">{summary.partnerName}</Typography>
                          <Chip label={summary.partnerType} size="small" sx={{ mt: 0.5 }} />
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={600}>
                          {summary.totalTransactions}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="success.main">
                          {summary.successfulTransactions}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="error.main">
                          {summary.failedTransactions}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="warning.main">
                          {summary.pendingTransactions}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={600}>
                          {summary.currency} {(summary.totalVolume / 1000000).toFixed(2)}M
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        {summary.currency} {(summary.averageTransactionSize / 1000).toFixed(0)}K
                      </TableCell>
                      <TableCell align="right">
                        <Chip 
                          label={`${summary.successRate}%`}
                          color={summary.successRate >= 95 ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {summary.customerSatisfactionScore?.toFixed(1) || 'N/A'} / 5
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* User Portfolios Tab */}
        {tabValue === 1 && (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight={600}>
                User Portfolios & Holdings
              </Typography>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={() => handleExport('USER')}
                disabled={generateReportMutation.isPending}
              >
                {generateReportMutation.isPending ? 'Generating...' : `Export as ${format}`}
              </Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Contact</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Onboarded Products</TableCell>
                    <TableCell align="right">Total Investment</TableCell>
                    <TableCell align="right">Current Value</TableCell>
                    <TableCell align="right">Return</TableCell>
                    <TableCell align="right">Return %</TableCell>
                    <TableCell align="right">Transactions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {user.firstName} {user.lastName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{user.email}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {user.phoneNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={user.status} 
                          color={user.status === 'ACTIVE' ? 'success' : 'default'}
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
                            />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        PHP {user.totalInvestment.toLocaleString()}
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={600}>
                          PHP {user.currentValue.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography 
                          variant="body2"
                          color={user.totalReturn >= 0 ? 'success.main' : 'error.main'}
                        >
                          PHP {user.totalReturn.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Chip 
                          label={`${user.returnPercentage >= 0 ? '+' : ''}${user.returnPercentage}%`}
                          color={user.returnPercentage >= 0 ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">{user.transactionCount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Partner Performance Tab */}
        {tabValue === 2 && (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight={600}>
                Partner Performance Metrics
              </Typography>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={() => handleExport('PERFORMANCE')}
                disabled={generateReportMutation.isPending}
              >
                {generateReportMutation.isPending ? 'Generating...' : `Export as ${format}`}
              </Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Partner</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell align="right">Volume</TableCell>
                    <TableCell align="right">Transactions</TableCell>
                    <TableCell align="right">Active Users</TableCell>
                    <TableCell align="right">Success Rate</TableCell>
                    <TableCell align="right">Uptime</TableCell>
                    <TableCell align="right">Revenue</TableCell>
                    <TableCell align="right">Commission</TableCell>
                    <TableCell align="right">Performance</TableCell>
                    <TableCell align="right">Rating</TableCell>
                    <TableCell align="right">Growth</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {partnerPerformance.map((partner) => (
                    <TableRow key={partner.partnerId} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {partner.partnerName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={partner.partnerType.replace('_', ' ')} 
                          size="small"
                          color={
                            partner.partnerType === 'FUND_HOUSE' ? 'primary' :
                            partner.partnerType === 'STOCK_BROKER' ? 'success' : 'warning'
                          }
                        />
                      </TableCell>
                      <TableCell align="right">
                        PHP {(partner.totalVolume / 1000000).toFixed(1)}M
                      </TableCell>
                      <TableCell align="right">{partner.transactionCount.toLocaleString()}</TableCell>
                      <TableCell align="right">{partner.activeUsers.toLocaleString()}</TableCell>
                      <TableCell align="right">
                        <Chip 
                          label={`${partner.successRate}%`}
                          color={partner.successRate >= 99 ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography 
                          variant="body2"
                          color={partner.uptime >= 99.9 ? 'success.main' : 'warning.main'}
                        >
                          {partner.uptime}%
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        PHP {(partner.revenue / 1000).toFixed(0)}K
                      </TableCell>
                      <TableCell align="right">
                        PHP {(partner.commission / 1000).toFixed(0)}K
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
                      <TableCell align="right">
                        <Typography variant="body2">
                          ⭐ {partner.customerRating.toFixed(1)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="success.main" fontWeight={600}>
                          +{partner.growthRate}%
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Product Analytics Tab */}
        {tabValue === 3 && (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight={600}>
                Product Analytics & Performance
              </Typography>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={() => handleExport('PRODUCT')}
                disabled={generateReportMutation.isPending}
              >
                {generateReportMutation.isPending ? 'Generating...' : `Export as ${format}`}
              </Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Rank</TableCell>
                    <TableCell>Product</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell align="right">Total Users</TableCell>
                    <TableCell align="right">Active Users</TableCell>
                    <TableCell align="right">New Users</TableCell>
                    <TableCell align="right">Transactions</TableCell>
                    <TableCell align="right">Volume</TableCell>
                    <TableCell align="right">Revenue</TableCell>
                    <TableCell align="right">Avg Return</TableCell>
                    <TableCell align="right">Engagement</TableCell>
                    <TableCell align="right">Retention</TableCell>
                    <TableCell align="right">Score</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {productPerformance
                    .sort((a, b) => a.popularityRank - b.popularityRank)
                    .map((product) => (
                      <TableRow key={product.productId} hover>
                        <TableCell>
                          <Chip 
                            label={`#${product.popularityRank}`}
                            color="primary"
                            size="small"
                          />
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
                        <TableCell>
                          <Chip label={product.productType} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell align="right">{product.totalUsers.toLocaleString()}</TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={600}>
                            {product.activeUsers.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="success.main">
                            +{product.newUsers}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">{product.totalTransactions.toLocaleString()}</TableCell>
                        <TableCell align="right">
                          PHP {(product.transactionVolume / 1000000).toFixed(1)}M
                        </TableCell>
                        <TableCell align="right">
                          PHP {(product.totalRevenue / 1000).toFixed(0)}K
                        </TableCell>
                        <TableCell align="right">
                          <Chip 
                            label={`${product.averageReturn >= 0 ? '+' : ''}${product.averageReturn}%`}
                            color={product.averageReturn >= 0 ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">{product.engagementRate}%</TableCell>
                        <TableCell align="right">{product.retentionRate}%</TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-end' }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={product.performanceScore} 
                              sx={{ width: 60, height: 6, borderRadius: 1 }}
                              color={product.performanceScore >= 90 ? 'success' : 'warning'}
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
          </Box>
        )}
      </Paper>
    </Box>
  )
}

export default Reports
