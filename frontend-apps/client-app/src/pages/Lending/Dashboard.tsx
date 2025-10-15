import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Paper,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material'
import { Add as AddIcon, AccountBalance as LoanIcon } from '@mui/icons-material'

const Lending = () => {
  const loans = [
    {
      id: '1',
      type: 'Personal Loan',
      amount: 5000,
      remaining: 2500,
      rate: 5.99,
      nextPayment: 250,
      nextDue: '2024-12-01',
      status: 'ACTIVE',
    },
    {
      id: '2',
      type: 'Business Loan',
      amount: 10000,
      remaining: 8500,
      rate: 6.5,
      nextPayment: 500,
      nextDue: '2024-12-05',
      status: 'ACTIVE',
    },
  ]

  const calculateProgress = (amount: number, remaining: number) => {
    return ((amount - remaining) / amount) * 100
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight={700}>
            My Loans
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your loans and apply for new ones
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />}>
          Apply for Loan
        </Button>
      </Box>

      {/* Summary */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Total Borrowed
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                $15,000
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Total Outstanding
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                $11,000
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Next Payment
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                $750
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Due: Dec 1, 2024
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Loans */}
      <Typography variant="h6" gutterBottom fontWeight={600}>
        Active Loans
      </Typography>
      <Grid container spacing={3}>
        {loans.map((loan) => (
          <Grid item xs={12} md={6} key={loan.id}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <LoanIcon color="primary" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      {loan.type}
                    </Typography>
                    <Chip label={loan.status} color="success" size="small" />
                  </Box>
                </Box>
                <Typography variant="h6" fontWeight={700}>
                  ${loan.amount.toLocaleString()}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Progress</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {calculateProgress(loan.amount, loan.remaining).toFixed(0)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={calculateProgress(loan.amount, loan.remaining)}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              <List dense>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText primary="Remaining Balance" />
                  <Typography variant="body2" fontWeight={600}>
                    ${loan.remaining.toLocaleString()}
                  </Typography>
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText primary="Interest Rate" />
                  <Typography variant="body2" fontWeight={600}>
                    {loan.rate}% APR
                  </Typography>
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText primary="Next Payment" />
                  <Typography variant="body2" fontWeight={600}>
                    ${loan.nextPayment}
                  </Typography>
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText primary="Due Date" />
                  <Typography variant="body2" fontWeight={600}>
                    {new Date(loan.nextDue).toLocaleDateString()}
                  </Typography>
                </ListItem>
              </List>

              <Button variant="outlined" fullWidth sx={{ mt: 2 }}>
                Make Payment
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default Lending




