import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import { TrendingUp, TrendingDown, Add as AddIcon } from '@mui/icons-material'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const Investment = () => {
  const portfolioData = [
    { date: 'Jan', value: 10000 },
    { date: 'Feb', value: 10500 },
    { date: 'Mar', value: 11200 },
    { date: 'Apr', value: 10800 },
    { date: 'May', value: 12100 },
    { date: 'Jun', value: 12800 },
  ]

  const positions = [
    { symbol: 'AAPL', name: 'Apple Inc.', shares: 10, avgPrice: 150, currentPrice: 178, change: +18.67 },
    { symbol: 'TSLA', name: 'Tesla Inc.', shares: 5, avgPrice: 200, currentPrice: 245, change: +22.5 },
    { symbol: 'BTC', name: 'Bitcoin', shares: 0.5, avgPrice: 45000, currentPrice: 52000, change: +15.56 },
  ]

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight={700}>
            Investment Portfolio
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Trade stocks, crypto, and forex
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />}>
          New Trade
        </Button>
      </Box>

      {/* Portfolio Summary */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Total Value
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                $12,845.50
              </Typography>
              <Chip
                icon={<TrendingUp fontSize="small" />}
                label="+$845.50 (7.0%)"
                color="success"
                size="small"
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Total Invested
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                $12,000.00
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Today's Change
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                +$125.40
              </Typography>
              <Chip label="+0.98%" color="success" size="small" sx={{ mt: 1 }} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Portfolio Chart */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          Portfolio Performance
        </Typography>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={portfolioData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Paper>

      {/* Positions */}
      <Typography variant="h6" gutterBottom fontWeight={600}>
        Your Positions
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Symbol</TableCell>
              <TableCell>Shares</TableCell>
              <TableCell align="right">Avg Price</TableCell>
              <TableCell align="right">Current Price</TableCell>
              <TableCell align="right">Change</TableCell>
              <TableCell align="right">Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {positions.map((position) => (
              <TableRow key={position.symbol}>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {position.symbol}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {position.name}
                  </Typography>
                </TableCell>
                <TableCell>{position.shares}</TableCell>
                <TableCell align="right">${position.avgPrice.toFixed(2)}</TableCell>
                <TableCell align="right">${position.currentPrice.toFixed(2)}</TableCell>
                <TableCell align="right">
                  <Chip
                    icon={position.change > 0 ? <TrendingUp fontSize="small" /> : <TrendingDown fontSize="small" />}
                    label={`${position.change > 0 ? '+' : ''}${position.change.toFixed(2)}%`}
                    color={position.change > 0 ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  ${(position.shares * position.currentPrice).toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default Investment




