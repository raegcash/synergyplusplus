import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  CardActionArea,
} from '@mui/material'
import {
  SwapHoriz as TransactionIcon,
  CloudSync as DataIcon,
  AccountBalance as SettlementIcon,
  Assessment as ReportIcon,
  TrendingUp,
  People,
  AccountBalance as FundIcon,
} from '@mui/icons-material'

const IntegrationsIndex = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const integrationModules = [
    {
      title: 'Transaction Integrations',
      description: 'Manage KYC, subscriptions, redemptions, buy/sell orders across all partners',
      icon: <TransactionIcon sx={{ fontSize: 48 }} color="primary" />,
      path: '/integrations/transactions',
      stats: { total: 215, pending: 16 },
      color: '#3b82f6',
    },
    {
      title: 'Data & Price Feeds',
      description: 'Real-time price updates, NAV feeds, market data synchronization',
      icon: <DataIcon sx={{ fontSize: 48 }} color="success" />,
      path: '/integrations/data-feeds',
      stats: { partners: 8, active: 8 },
      color: '#10b981',
    },
    {
      title: 'Settlement & Clearing',
      description: 'Trade settlement, cash movements, confirmations',
      icon: <SettlementIcon sx={{ fontSize: 48 }} color="warning" />,
      path: '/integrations/settlement',
      stats: { pending: 5, completed: 120 },
      color: '#f59e0b',
    },
    {
      title: 'Reporting & Reconciliation',
      description: 'Partner reports, reconciliation files, audit trails',
      icon: <ReportIcon sx={{ fontSize: 48 }} color="info" />,
      path: '/integrations/reporting',
      stats: { reports: 45, lastRun: '2 hours ago' },
      color: '#6366f1',
    },
  ]

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Partner Integrations
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Comprehensive integration management across all partners and asset types
        </Typography>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <People color="primary" />
                <Typography variant="caption" color="text.secondary">
                  Active Partners
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight={700}>12</Typography>
              <Typography variant="caption" color="text.secondary">
                3 fund houses • 5 brokers • 4 exchanges
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <TransactionIcon color="success" />
                <Typography variant="caption" color="text.secondary">
                  Today's Transactions
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight={700}>342</Typography>
              <Typography variant="caption" color="success.main">
                +15% from yesterday
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <DataIcon color="info" />
                <Typography variant="caption" color="text.secondary">
                  Data Feeds Active
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight={700}>8/8</Typography>
              <Typography variant="caption" color="success.main">
                All systems operational
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <TrendingUp color="warning" />
                <Typography variant="caption" color="text.secondary">
                  Success Rate
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight={700}>99.8%</Typography>
              <Typography variant="caption" color="text.secondary">
                Last 30 days
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Integration Modules */}
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
        Integration Modules
      </Typography>

      <Grid container spacing={3}>
        {integrationModules.map((module) => (
          <Grid item xs={12} md={6} key={module.path}>
            <Card 
              sx={{ 
                height: '100%',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
            >
              <CardActionArea
                onClick={() => navigate(module.path)}
                sx={{ height: '100%', p: 3 }}
              >
                <Box sx={{ display: 'flex', gap: 3 }}>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      width: 80,
                      height: 80,
                      borderRadius: 2,
                      bgcolor: `${module.color}15`,
                    }}
                  >
                    {module.icon}
                  </Box>
                  
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight={600} mb={1}>
                      {module.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      {module.description}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      {Object.entries(module.stats).map(([key, value]) => (
                        <Box key={key}>
                          <Typography variant="caption" color="text.secondary" textTransform="capitalize">
                            {key}
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {value}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Box>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Partner Types */}
      <Typography variant="h5" sx={{ fontWeight: 600, mt: 6, mb: 3 }}>
        Integrated Partners by Type
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <FundIcon color="primary" sx={{ fontSize: 32 }} />
              <Typography variant="h6" fontWeight={600}>Fund Houses</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" mb={2}>
              UITF, Mutual Funds, Investment Funds
            </Typography>
            <Typography variant="caption" color="text.secondary">Partners: </Typography>
            <Typography variant="body2" fontWeight={600}>
              BPI Asset Management, BDO Trust, MetroBank
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <TrendingUp color="success" sx={{ fontSize: 32 }} />
              <Typography variant="h6" fontWeight={600}>Stock Brokers</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Stocks, ETFs, Bonds
            </Typography>
            <Typography variant="caption" color="text.secondary">Partners: </Typography>
            <Typography variant="body2" fontWeight={600}>
              COL Financial, BPI Trade, FirstMetroSec
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <DataIcon color="warning" sx={{ fontSize: 32 }} />
              <Typography variant="h6" fontWeight={600}>Crypto Exchanges</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Cryptocurrencies, Digital Assets
            </Typography>
            <Typography variant="caption" color="text.secondary">Partners: </Typography>
            <Typography variant="body2" fontWeight={600}>
              Binance, Coinbase, PDAX, Coins.ph
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default IntegrationsIndex



