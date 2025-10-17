/**
 * Transaction History Page - Enterprise Grade
 * Comprehensive transaction management with filtering, search, and pagination
 * 
 * @component
 * @version 1.0.0
 * @classification Production-Ready
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  IconButton,
  InputAdornment,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Search,
  FilterList,
  Download,
  Refresh,
  Visibility,
  TrendingUp,
  TrendingDown,
  AccountBalance,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTransactions, useTransactionStatistics, useExportTransactions } from '../../hooks/useTransactions';
import type { TransactionFilters } from '../../services/api/transactions.api';

function TransactionHistory() {
  const navigate = useNavigate();
  
  // Filter state
  const [filters, setFilters] = useState<TransactionFilters>({
    type: undefined,
    status: undefined,
    search: '',
    limit: 20,
    offset: 0,
    sortBy: 'transaction_date',
    sortOrder: 'DESC',
  });

  const [period, setPeriod] = useState('30d');
  const [selectedTab, setSelectedTab] = useState(0);

  // Fetch data
  const { data: transactionData, isLoading, error, refetch } = useTransactions(filters);
  const { data: statistics } = useTransactionStatistics(period);
  const exportMutation = useExportTransactions();

  // Handle filter changes
  const handleFilterChange = (key: keyof TransactionFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      offset: key !== 'offset' ? 0 : value, // Reset to first page on filter change
    }));
  };

  // Handle pagination
  const handlePageChange = (event: unknown, newPage: number) => {
    handleFilterChange('offset', newPage * (filters.limit || 20));
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newLimit = parseInt(event.target.value, 10);
    setFilters(prev => ({
      ...prev,
      limit: newLimit,
      offset: 0,
    }));
  };

  // Handle export
  const handleExport = () => {
    exportMutation.mutate(filters);
  };

  // Handle view details
  const handleViewDetails = (transactionId: string) => {
    navigate(`/transactions/${transactionId}`);
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
    const statusMap = ['', 'COMPLETED', 'PENDING', 'FAILED'];
    handleFilterChange('status', statusMap[newValue] || undefined);
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return `₱${value.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'success';
      case 'PENDING': return 'warning';
      case 'FAILED': return 'error';
      case 'CANCELLED': return 'default';
      default: return 'default';
    }
  };

  // Get type color
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'INVESTMENT': return 'primary';
      case 'WITHDRAWAL': return 'secondary';
      case 'DIVIDEND': return 'success';
      case 'FEE': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Transaction History
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and manage your investment transactions
        </Typography>
      </Box>

      {/* Statistics Cards */}
      {statistics && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AccountBalance color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Total Invested
                  </Typography>
                </Box>
                <Typography variant="h5" fontWeight={700}>
                  {formatCurrency(statistics.amounts.totalInvested)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {statistics.byType.investments} transactions
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TrendingUp color="success" sx={{ mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Total Dividends
                  </Typography>
                </Box>
                <Typography variant="h5" fontWeight={700}>
                  {formatCurrency(statistics.amounts.totalDividends)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {statistics.byType.dividends} payments
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TrendingDown color="warning" sx={{ mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Total Withdrawn
                  </Typography>
                </Box>
                <Typography variant="h5" fontWeight={700}>
                  {formatCurrency(statistics.amounts.totalWithdrawn)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {statistics.byType.withdrawals} transactions
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <FilterList color="info" sx={{ mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Total Transactions
                  </Typography>
                </Box>
                <Typography variant="h5" fontWeight={700}>
                  {statistics.totalTransactions}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {statistics.byStatus.pending} pending
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          {/* Search */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search"
              placeholder="Search by reference number..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Type Filter */}
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={filters.type || ''}
                label="Type"
                onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="INVESTMENT">Investment</MenuItem>
                <MenuItem value="WITHDRAWAL">Withdrawal</MenuItem>
                <MenuItem value="DIVIDEND">Dividend</MenuItem>
                <MenuItem value="FEE">Fee</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Sort By */}
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={filters.sortBy || 'transaction_date'}
                label="Sort By"
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              >
                <MenuItem value="transaction_date">Date</MenuItem>
                <MenuItem value="amount">Amount</MenuItem>
                <MenuItem value="status">Status</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Sort Order */}
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Order</InputLabel>
              <Select
                value={filters.sortOrder || 'DESC'}
                label="Order"
                onChange={(e) => handleFilterChange('sortOrder', e.target.value as 'ASC' | 'DESC')}
              >
                <MenuItem value="DESC">Newest First</MenuItem>
                <MenuItem value="ASC">Oldest First</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Actions */}
          <Grid item xs={12} sm={6} md={2}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={() => refetch()}
                fullWidth
              >
                Refresh
              </Button>
              <IconButton
                color="primary"
                onClick={handleExport}
                disabled={exportMutation.isPending}
              >
                <Download />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Status Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={selectedTab} onChange={handleTabChange}>
          <Tab label="All Transactions" />
          <Tab label="Completed" />
          <Tab label="Pending" />
          <Tab label="Failed" />
        </Tabs>
      </Paper>

      {/* Transactions Table */}
      <Paper>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ m: 3 }}>
            Failed to load transactions. Please try again later.
          </Alert>
        ) : !transactionData?.transactions?.length ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No transactions found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your filters or make your first investment
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Reference</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Asset</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactionData.transactions.map((transaction: any) => (
                    <TableRow key={transaction.id} hover>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(transaction.transactionDate)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {transaction.referenceNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={transaction.type}
                          color={getTypeColor(transaction.type) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {transaction.assetName ? (
                          <>
                            <Typography variant="body2">{transaction.assetName}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {transaction.assetCode}
                            </Typography>
                          </>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            N/A
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          color={
                            transaction.type === 'WITHDRAWAL' || transaction.type === 'FEE'
                              ? 'error.main'
                              : 'success.main'
                          }
                        >
                          {transaction.type === 'WITHDRAWAL' || transaction.type === 'FEE' ? '-' : '+'}
                          {formatCurrency(transaction.amount)}
                        </Typography>
                        {transaction.units && (
                          <Typography variant="caption" color="text.secondary">
                            {transaction.units.toFixed(4)} units
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={transaction.status}
                          color={getStatusColor(transaction.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleViewDetails(transaction.id)}
                          color="primary"
                        >
                          <Visibility />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            {transactionData.pagination && (
              <TablePagination
                component="div"
                count={transactionData.pagination.total}
                page={Math.floor((filters.offset || 0) / (filters.limit || 20))}
                onPageChange={handlePageChange}
                rowsPerPage={filters.limit || 20}
                onRowsPerPageChange={handleRowsPerPageChange}
                rowsPerPageOptions={[10, 20, 50, 100]}
              />
            )}
          </>
        )}
      </Paper>
    </Box>
  );
}

export default TransactionHistory;
