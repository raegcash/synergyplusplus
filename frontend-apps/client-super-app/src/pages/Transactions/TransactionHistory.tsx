import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Button,
} from '@mui/material';
import { Download, Refresh } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { transactionsApi } from '../../services/api/transactions.api';

const TransactionStatusColor = {
  COMPLETED: 'success',
  PENDING: 'warning',
  FAILED: 'error',
  CANCELLED: 'default',
} as const;

const TransactionTypeColor = {
  BUY: 'primary',
  SELL: 'secondary',
  SUBSCRIBE: 'info',
  REDEEM: 'warning',
} as const;

function TransactionHistory() {
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['transactions', typeFilter, statusFilter],
    queryFn: async () => {
      const response = await transactionsApi.getHistory({
        type: typeFilter || undefined,
        status: statusFilter || undefined,
        limit: 50,
      });
      return response;
    },
  });

  const formatCurrency = (value: number) => {
    return `₱${value.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Transaction History
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View all your past transactions
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<Download />}>
            Export
          </Button>
          <Button variant="outlined" startIcon={<Refresh />} onClick={() => refetch()}>
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Transaction Type</InputLabel>
            <Select
              value={typeFilter}
              label="Transaction Type"
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <MenuItem value="">All Types</MenuItem>
              <MenuItem value="BUY">Buy</MenuItem>
              <MenuItem value="SELL">Sell</MenuItem>
              <MenuItem value="SUBSCRIBE">Subscribe</MenuItem>
              <MenuItem value="REDEEM">Redeem</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="COMPLETED">Completed</MenuItem>
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="FAILED">Failed</MenuItem>
              <MenuItem value="CANCELLED">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Transactions Table */}
      <Card>
        <CardContent>
          {data?.data && data.data.length > 0 ? (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date & Time</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Asset</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="right">Total Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Transaction ID</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.data.map((transaction: any) => (
                    <TableRow key={transaction.id} hover>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(transaction.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={transaction.type}
                          size="small"
                          color={TransactionTypeColor[transaction.type as keyof typeof TransactionTypeColor]}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {transaction.assetName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {transaction.assetSymbol}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">{transaction.quantity}</TableCell>
                      <TableCell align="right">
                        {formatCurrency(transaction.price || 0)}
                      </TableCell>
                      <TableCell align="right">
                        <Typography fontWeight={600}>
                          {formatCurrency(transaction.totalAmount || 0)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={transaction.status}
                          size="small"
                          color={TransactionStatusColor[transaction.status as keyof typeof TransactionStatusColor]}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" fontFamily="monospace">
                          {transaction.id.substring(0, 8)}...
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Transactions Yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your transaction history will appear here
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default TransactionHistory;
