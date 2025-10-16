/**
 * Asset Price Chart Component
 * Displays price history with interactive time period selection
 */

import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { format } from 'date-fns';

interface PriceDataPoint {
  timestamp: string;
  price: number;
  date: string;
}

interface AssetChartProps {
  assetId: string;
  assetName: string;
  data?: PriceDataPoint[];
  isLoading?: boolean;
  error?: string;
}

type TimePeriod = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL';

function AssetChart({ assetId, assetName, data = [], isLoading = false, error }: AssetChartProps) {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('1M');

  // Generate mock data if no real data available
  const generateMockData = (days: number): PriceDataPoint[] => {
    const mockData: PriceDataPoint[] = [];
    const basePrice = 1000;
    const now = new Date();

    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Generate random price with some trend
      const randomChange = (Math.random() - 0.48) * 50; // Slight upward bias
      const price = basePrice + (days - i) * 2 + randomChange;
      
      mockData.push({
        timestamp: date.toISOString(),
        date: format(date, 'MMM dd'),
        price: Math.max(price, 900), // Minimum price
      });
    }

    return mockData;
  };

  const getDaysForPeriod = (period: TimePeriod): number => {
    switch (period) {
      case '1D': return 1;
      case '1W': return 7;
      case '1M': return 30;
      case '3M': return 90;
      case '6M': return 180;
      case '1Y': return 365;
      case 'ALL': return 365 * 2; // 2 years for demo
      default: return 30;
    }
  };

  const chartData = data.length > 0 ? data : generateMockData(getDaysForPeriod(timePeriod));
  
  // Calculate price change
  const firstPrice = chartData[0]?.price || 0;
  const lastPrice = chartData[chartData.length - 1]?.price || 0;
  const priceChange = lastPrice - firstPrice;
  const priceChangePercent = firstPrice > 0 ? (priceChange / firstPrice) * 100 : 0;
  const isPositive = priceChange >= 0;

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 1.5, border: 1, borderColor: 'divider' }}>
          <Typography variant="body2" fontWeight={600}>
            ₱{payload[0].value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {payload[0].payload.date}
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Loading chart data...
        </Typography>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 3 }}>
        <Box>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Price Chart
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
            <Typography variant="h4" fontWeight={700} color="primary">
              ₱{lastPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
            <Typography
              variant="body1"
              fontWeight={600}
              sx={{ color: isPositive ? 'success.main' : 'error.main' }}
            >
              {isPositive ? '+' : ''}₱{Math.abs(priceChange).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              ({isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}%)
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            {timePeriod} Performance
          </Typography>
        </Box>

        {/* Time Period Selector */}
        <ToggleButtonGroup
          value={timePeriod}
          exclusive
          onChange={(_, newPeriod) => newPeriod && setTimePeriod(newPeriod)}
          size="small"
        >
          <ToggleButton value="1D">1D</ToggleButton>
          <ToggleButton value="1W">1W</ToggleButton>
          <ToggleButton value="1M">1M</ToggleButton>
          <ToggleButton value="3M">3M</ToggleButton>
          <ToggleButton value="6M">6M</ToggleButton>
          <ToggleButton value="1Y">1Y</ToggleButton>
          <ToggleButton value="ALL">ALL</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={350}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop 
                offset="5%" 
                stopColor={isPositive ? '#4caf50' : '#f44336'} 
                stopOpacity={0.3}
              />
              <stop 
                offset="95%" 
                stopColor={isPositive ? '#4caf50' : '#f44336'} 
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            tickMargin={10}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickMargin={10}
            tickFormatter={(value) => `₱${value.toFixed(0)}`}
            domain={['dataMin - 50', 'dataMax + 50']}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="price"
            stroke={isPositive ? '#4caf50' : '#f44336'}
            strokeWidth={2}
            fill="url(#colorPrice)"
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Chart Info */}
      <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            High
          </Typography>
          <Typography variant="body2" fontWeight={600}>
            ₱{Math.max(...chartData.map(d => d.price)).toLocaleString()}
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Low
          </Typography>
          <Typography variant="body2" fontWeight={600}>
            ₱{Math.min(...chartData.map(d => d.price)).toLocaleString()}
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Avg
          </Typography>
          <Typography variant="body2" fontWeight={600}>
            ₱{(chartData.reduce((sum, d) => sum + d.price, 0) / chartData.length).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Change
          </Typography>
          <Typography 
            variant="body2" 
            fontWeight={600}
            sx={{ color: isPositive ? 'success.main' : 'error.main' }}
          >
            {isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}%
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

export default AssetChart;

