import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material'
import { Add as AddIcon, AccountBalanceWallet as WalletIcon, TrendingUp } from '@mui/icons-material'

const Savings = () => {
  const accounts = [
    { id: '1', name: 'Main Wallet', type: 'Checking', balance: 5420.50, apy: 0, status: 'ACTIVE' },
    { id: '2', name: 'High-Yield Savings', type: 'Savings', balance: 8750.00, apy: 2.5, status: 'ACTIVE' },
    { id: '3', name: 'Emergency Fund', type: 'Savings', balance: 15000.00, apy: 2.0, status: 'ACTIVE' },
  ]

  const transactions = [
    { id: '1', date: '2024-11-28', description: 'Salary Deposit', amount: 5000, type: 'CREDIT' },
    { id: '2', date: '2024-11-27', description: 'Rent Payment', amount: -1500, type: 'DEBIT' },
    { id: '3', date: '2024-11-26', description: 'Investment Transfer', amount: -500, type: 'DEBIT' },
    { id: '4', date: '2024-11-25', description: 'Freelance Income', amount: 1200, type: 'CREDIT' },
  ]

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0)

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight={700}>
            Savings & Wallet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your accounts and transactions
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />}>
          Transfer Funds
        </Button>
      </Box>

      {/* Total Balance Card */}
      <Paper
        sx={{
          p: 4,
          mb: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}
      >
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          Total Balance
        </Typography>
        <Typography variant="h3" fontWeight={700}>
          ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          <Chip
            icon={<TrendingUp fontSize="small" />}
            label="+$420.50 this month"
            sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
          />
        </Box>
      </Paper>

      {/* Accounts */}
      <Typography variant="h6" gutterBottom fontWeight={600}>
        Your Accounts
      </Typography>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {accounts.map((account) => (
          <Grid item xs={12} md={4} key={account.id}>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <WalletIcon color="primary" sx={{ fontSize: 32 }} />
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      {account.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {account.type}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="h5" fontWeight={700}>
                  ${account.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </Typography>
                {account.apy > 0 && (
                  <Chip
                    label={`${account.apy}% APY`}
                    color="success"
                    size="small"
                    sx={{ mt: 1 }}
                  />
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recent Transactions */}
      <Typography variant="h6" gutterBottom fontWeight={600}>
        Recent Transactions
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="right">Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell>{new Date(tx.date).toLocaleDateString()}</TableCell>
                <TableCell>{tx.description}</TableCell>
                <TableCell>
                  <Chip
                    label={tx.type}
                    color={tx.type === 'CREDIT' ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    color: tx.amount > 0 ? 'success.main' : 'text.primary',
                    fontWeight: 600,
                  }}
                >
                  {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default Savings




