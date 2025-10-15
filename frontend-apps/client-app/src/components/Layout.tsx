import { ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Container,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
} from '@mui/material'
import {
  Home as HomeIcon,
  Store as MarketplaceIcon,
  ShowChart as InvestmentIcon,
  AccountBalance as LendingIcon,
  AccountBalanceWallet as SavingsIcon,
  Person as ProfileIcon,
} from '@mui/icons-material'

interface LayoutProps {
  children: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    { label: 'Home', icon: <HomeIcon />, path: '/' },
    { label: 'Marketplace', icon: <MarketplaceIcon />, path: '/marketplace' },
    { label: 'Invest', icon: <InvestmentIcon />, path: '/investment' },
    { label: 'Lending', icon: <LendingIcon />, path: '/lending' },
    { label: 'Savings', icon: <SavingsIcon />, path: '/savings' },
  ]

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Top App Bar */}
      <AppBar position="fixed" elevation={0} sx={{ bgcolor: 'white', color: 'text.primary' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700, color: 'primary.main' }}>
            Super App
          </Typography>
          <Button color="inherit" onClick={() => navigate('/profile')}>
            <ProfileIcon sx={{ mr: 1 }} /> Profile
          </Button>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, mt: 8, mb: 8 }}>
        <Container maxWidth="lg" sx={{ py: 3 }}>
          {children}
        </Container>
      </Box>

      {/* Bottom Navigation */}
      <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
        <BottomNavigation
          value={location.pathname}
          onChange={(_, newValue) => navigate(newValue)}
        >
          {navItems.map((item) => (
            <BottomNavigationAction
              key={item.path}
              label={item.label}
              icon={item.icon}
              value={item.path}
            />
          ))}
        </BottomNavigation>
      </Paper>
    </Box>
  )
}

export default Layout




