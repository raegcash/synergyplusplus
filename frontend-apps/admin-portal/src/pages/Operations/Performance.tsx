import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Box,
  Typography,
  Paper,
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
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from '@mui/material'
import {
  TrendingUp,
  TrendingDown,
  Assessment,
  Timeline,
  CompareArrows,
} from '@mui/icons-material'
import { operationsAPI } from '../../services/operations'

const PerformanceMonitoring = () => {
  const [tabValue, setTabValue] = useState(0)
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'quarter' | 'year'>('month')
  const [compareMode, setCompareMode] = useState(false)

  const { data: productPerformance = [], isLoading: loadingProducts } = useQuery({
    queryKey: ['productPerformance', timeRange],
    queryFn: () => operationsAPI.getAllProductPerformance(),
  })

  const { data: partnerPerformance = [], isLoading: loadingPartners } = useQuery({
    queryKey: ['partnerPerformance', timeRange],
    queryFn: () => operationsAPI.getAllPartnerPerformance(),
  })

  const { data: transactionSummaries = [] } = useQuery({
    queryKey: ['transactionSummaries', timeRange],
    queryFn: () => operationsAPI.getTransactionSummaries(),
  })

  const isLoading = loadingProducts || loadingPartners

  // Calculate aggregate metrics
  const aggregateMetrics = {
    totalRevenue: productPerformance.reduce((sum, p) => sum + p.totalRevenue, 0),
    totalVolume: productPerformance.reduce((sum, p) => sum + p.transactionVolume, 0),
    totalUsers: productPerformance.reduce((sum, p) => sum + p.totalUsers, 0),
    activeUsers: productPerformance.reduce((sum, p) => sum + p.activeUsers, 0),
    avgReturn: productPerformance.reduce((sum, p) => sum + p.averageReturn, 0) / productPerformance.length || 0,
    avgEngagement: productPerformance.reduce((sum, p) => sum + p.engagementRate, 0) / productPerformance.length || 0,
    avgRetention: productPerformance.reduce((sum, p) => sum + p.retentionRate, 0) / productPerformance.length || 0,
    totalTransactions: transactionSummaries.reduce((sum, t) => sum + t.totalTransactions, 0),
    avgSuccessRate: transactionSummaries.reduce((sum, t) => sum + t.successRate, 0) / transactionSummaries.length || 0,
  }

  const getMetricChange = (current: number) => {
    // Simulate comparison with previous period
    const previousPeriod = current * 0.92 // Mock 8% growth
    const change = ((current - previousPeriod) / previousPeriod) * 100
    return change
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Performance Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Comprehensive performance monitoring and analytics
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              label="Time Range"
            >
              <MenuItem value="day">Today</MenuItem>
              <MenuItem value="week">This Week</MenuItem>
              <MenuItem value="month">This Month</MenuItem>
              <MenuItem value="quarter">This Quarter</MenuItem>
              <MenuItem value="year">This Year</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant={compareMode ? 'contained' : 'outlined'}
            startIcon={<CompareArrows />}
            onClick={() => setCompareMode(!compareMode)}
          >
            Compare
          </Button>
        </Box>
      </Box>

      {isLoading && <LinearProgress sx={{ mb: 3 }} />}

      {/* Key Performance Indicators */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Assessment color="primary" />
                <Typography variant="caption" color="text.secondary">
                  Total Revenue
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>
                PHP {(aggregateMetrics.totalRevenue / 1000000).toFixed(2)}M
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />
                <Typography variant="caption" color="success.main" fontWeight={600}>
                  +{getMetricChange(aggregateMetrics.totalRevenue).toFixed(1)}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  vs last {timeRange}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Timeline color="success" />
                <Typography variant="caption" color="text.secondary">
                  Transaction Volume
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>
                PHP {(aggregateMetrics.totalVolume / 1000000).toFixed(1)}M
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />
                <Typography variant="caption" color="success.main" fontWeight={600}>
                  +{getMetricChange(aggregateMetrics.totalVolume).toFixed(1)}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  vs last {timeRange}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <TrendingUp color="warning" />
                <Typography variant="caption" color="text.secondary">
                  Avg Return Rate
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight={700} color="success.main">
                +{aggregateMetrics.avgReturn.toFixed(1)}%
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />
                <Typography variant="caption" color="success.main" fontWeight={600}>
                  +2.3pp
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  vs last {timeRange}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Assessment color="info" />
                <Typography variant="caption" color="text.secondary">
                  Success Rate
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight={700}>
                {aggregateMetrics.avgSuccessRate.toFixed(1)}%
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />
                <Typography variant="caption" color="success.main" fontWeight={600}>
                  +0.5pp
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  vs last {timeRange}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Secondary Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              User Metrics
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2">Total Users</Typography>
                <Typography variant="body2" fontWeight={600}>
                  {aggregateMetrics.totalUsers.toLocaleString()}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2">Active Users</Typography>
                <Typography variant="body2" fontWeight={600} color="success.main">
                  {aggregateMetrics.activeUsers.toLocaleString()}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Engagement Rate</Typography>
                <Typography variant="body2" fontWeight={600}>
                  {aggregateMetrics.avgEngagement.toFixed(1)}%
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Transaction Metrics
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2">Total Transactions</Typography>
                <Typography variant="body2" fontWeight={600}>
                  {aggregateMetrics.totalTransactions.toLocaleString()}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2">Avg Transaction</Typography>
                <Typography variant="body2" fontWeight={600}>
                  PHP {((aggregateMetrics.totalVolume / aggregateMetrics.totalTransactions) / 1000).toFixed(0)}K
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Success Rate</Typography>
                <Typography variant="body2" fontWeight={600} color="success.main">
                  {aggregateMetrics.avgSuccessRate.toFixed(1)}%
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Retention Metrics
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2">Avg Retention</Typography>
                <Typography variant="body2" fontWeight={600}>
                  {aggregateMetrics.avgRetention.toFixed(1)}%
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2">Avg Engagement</Typography>
                <Typography variant="body2" fontWeight={600}>
                  {aggregateMetrics.avgEngagement.toFixed(1)}%
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">User Satisfaction</Typography>
                <Typography variant="body2" fontWeight={600}>
                  4.7/5.0
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 2 }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab label="Product Performance" />
          <Tab label="Partner Performance" />
          <Tab label="Comparative Analysis" />
          <Tab label="Trends & Insights" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Paper>
        {/* Product Performance Tab */}
        {tabValue === 0 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={3}>
              Product Performance Breakdown
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell align="right">Users</TableCell>
                    <TableCell align="right">Transactions</TableCell>
                    <TableCell align="right">Volume</TableCell>
                    <TableCell align="right">Revenue</TableCell>
                    <TableCell align="right">Return</TableCell>
                    <TableCell align="right">Engagement</TableCell>
                    <TableCell align="right">Retention</TableCell>
                    <TableCell align="right">Score</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {productPerformance
                    .sort((a, b) => b.performanceScore - a.performanceScore)
                    .map((product) => (
                      <TableRow key={product.productId} hover>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {product.productName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {product.productCode} • {product.productType}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {product.activeUsers.toLocaleString()}
                            </Typography>
                            <Typography variant="caption" color="success.main">
                              +{product.newUsers}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          {product.totalTransactions.toLocaleString()}
                        </TableCell>
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

        {/* Partner Performance Tab */}
        {tabValue === 1 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={3}>
              Partner Performance Breakdown
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Partner</TableCell>
                    <TableCell align="right">Volume</TableCell>
                    <TableCell align="right">Transactions</TableCell>
                    <TableCell align="right">Users</TableCell>
                    <TableCell align="right">Success Rate</TableCell>
                    <TableCell align="right">Uptime</TableCell>
                    <TableCell align="right">Revenue</TableCell>
                    <TableCell align="right">Growth</TableCell>
                    <TableCell align="right">Score</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {partnerPerformance
                    .sort((a, b) => b.performanceScore - a.performanceScore)
                    .map((partner) => (
                      <TableRow key={partner.partnerId} hover>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {partner.partnerName}
                            </Typography>
                            <Chip 
                              label={partner.partnerType.replace('_', ' ')} 
                              size="small"
                              sx={{ mt: 0.5 }}
                            />
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          PHP {(partner.totalVolume / 1000000).toFixed(1)}M
                        </TableCell>
                        <TableCell align="right">
                          {partner.transactionCount.toLocaleString()}
                        </TableCell>
                        <TableCell align="right">
                          {partner.activeUsers.toLocaleString()}
                        </TableCell>
                        <TableCell align="right">
                          <Chip 
                            label={`${partner.successRate}%`}
                            color={partner.successRate >= 99 ? 'success' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          {partner.uptime}%
                        </TableCell>
                        <TableCell align="right">
                          PHP {(partner.revenue / 1000).toFixed(0)}K
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="success.main" fontWeight={600}>
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
          </Box>
        )}

        {/* Comparative Analysis Tab */}
        {tabValue === 2 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={3}>
              Comparative Analysis
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Compare performance metrics across products and partners
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 3 }}>
                  <Typography variant="subtitle1" fontWeight={600} mb={2}>
                    Top Performers
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {productPerformance.slice(0, 3).map((product, index) => (
                      <Box key={product.productId} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Chip label={`#${index + 1}`} color="primary" size="small" />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" fontWeight={600}>
                            {product.productName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Score: {product.performanceScore}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="success.main" fontWeight={600}>
                          +{product.averageReturn}%
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 3 }}>
                  <Typography variant="subtitle1" fontWeight={600} mb={2}>
                    Growth Leaders
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {partnerPerformance
                      .sort((a, b) => b.growthRate - a.growthRate)
                      .slice(0, 3)
                      .map((partner, index) => (
                        <Box key={partner.partnerId} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Chip label={`#${index + 1}`} color="success" size="small" />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" fontWeight={600}>
                              {partner.partnerName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {partner.partnerType}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="success.main" fontWeight={600}>
                            +{partner.growthRate}%
                          </Typography>
                        </Box>
                      ))}
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Trends & Insights Tab */}
        {tabValue === 3 && (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={3}>
              Trends & Insights
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Key Insight
                    </Typography>
                    <Typography variant="body2" fontWeight={600} mb={1}>
                      Strong Growth in Stock Trading
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Stock trading products showing +28.5% growth with high user engagement and retention rates.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Opportunity
                    </Typography>
                    <Typography variant="body2" fontWeight={600} mb={1}>
                      Expand UITF Offerings
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      High demand for unit investment trust funds with strong retention metrics. Consider adding more fund options.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Performance Alert
                    </Typography>
                    <Typography variant="body2" fontWeight={600} mb={1}>
                      Partner Reliability High
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      All partners maintaining 99%+ success rates and uptime. Excellent operational performance across the board.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
    </Box>
  )
}

export default PerformanceMonitoring



