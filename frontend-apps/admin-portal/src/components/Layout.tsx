import { ReactNode, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
  Avatar,
  Menu,
  MenuItem,
  Collapse,
} from '@mui/material'
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Dashboard as DashboardIcon,
  LocalHospital as HypercareIcon,
  CheckCircle as ApprovalIcon,
  Assessment as DataIcon,
  Settings as SettingsIcon,
  Business as OperationsIcon,
  BusinessCenter as PartnerIcon,
  Category as CatalogIcon,
  History as AuditIcon,
  MoreVert as MoreIcon,
  ExpandLess,
  ExpandMore,
  BugReport as IncidentsIcon,
  TrendingUp as MetricsIcon,
  Check as CheckIcon,
  CloudSync as SyncIcon,
  AdminPanelSettings as AdminIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  People as CustomersIcon,
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'

const drawerWidth = 240

interface LayoutProps {
  children: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [hypercareOpen, setHypercareOpen] = useState(false)
  const [integrationsOpen, setIntegrationsOpen] = useState(false)
  const [operationsOpen, setOperationsOpen] = useState(false)
  const [adminOpen, setAdminOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const menuItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/dashboard' },
    { text: 'Products', icon: <CatalogIcon />, path: '/products' },
    { text: 'Partners', icon: <PartnerIcon />, path: '/partners' },
    { text: 'Assets', icon: <DataIcon />, path: '/assets' },
    { 
      text: 'Hypercare', 
      icon: <HypercareIcon />, 
      path: '/hypercare',
      hasSubmenu: true,
      submenu: [
        { text: 'Products & Features', icon: <CatalogIcon />, path: '/hypercare' },
        { text: 'Greylist', icon: <IncidentsIcon />, path: '/hypercare?tab=1' },
        { text: 'Eligibility', icon: <CheckIcon />, path: '/hypercare?tab=2' },
        { text: 'Data Points', icon: <MetricsIcon />, path: '/hypercare?tab=3' },
      ]
    },
    { divider: true },
    {
      text: 'Operations',
      icon: <OperationsIcon />,
      path: '/operations',
      hasSubmenu: true,
      submenu: [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/operations' },
        { text: 'Analytics', icon: <DataIcon />, path: '/operations/analytics' },
        { text: 'Customer Management', icon: <CustomersIcon />, path: '/operations/customers' },
        { text: 'Performance', icon: <MetricsIcon />, path: '/operations/performance' },
        { text: 'Reports', icon: <AuditIcon />, path: '/operations/reports' },
        { text: 'Report Builder', icon: <DataIcon />, path: '/operations/report-builder' },
        { divider: true },
        { text: 'Integrations Overview', icon: <SyncIcon />, path: '/integrations' },
        { text: 'Scheduled Tasks', icon: <CheckIcon />, path: '/integrations/scheduled-tasks' },
        { text: 'Transactions', icon: <CheckIcon />, path: '/integrations/transactions' },
        { text: 'Data Feeds', icon: <MetricsIcon />, path: '/integrations/data-feeds' },
        { text: 'Settlement', icon: <IncidentsIcon />, path: '/integrations/settlement' },
        { text: 'Reporting', icon: <DataIcon />, path: '/integrations/reporting' },
      ]
    },
    { divider: true },
    {
      text: 'Admin & IAM',
      icon: <AdminIcon />,
      path: '/admin',
      hasSubmenu: true,
      submenu: [
        { text: 'Admin Users', icon: <PersonIcon />, path: '/admin/users' },
        { text: 'User Groups', icon: <GroupIcon />, path: '/admin/groups' },
      ]
    },
    { text: 'Approvals', icon: <ApprovalIcon />, path: '/approvals' },
  ]

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#ffffff' }}>
      <Box sx={{ p: 2.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
          Management Portal
        </Typography>
      </Box>
      <Divider />
      <List sx={{ flexGrow: 1, pt: 1 }}>
        {menuItems.map((item, index) => {
          if (item.divider) {
            return <Divider key={`divider-${index}`} sx={{ my: 1 }} />
          }

          const isSelected = location.pathname === item.path || location.pathname.startsWith(item.path + '/')

          return (
            <Box key={item.text}>
              <ListItem disablePadding sx={{ px: 1 }}>
                <ListItemButton
                  selected={isSelected && !item.hasSubmenu}
                  onClick={() => {
                    if (item.hasSubmenu) {
                      if (item.text === 'Hypercare') {
                        setHypercareOpen(!hypercareOpen)
                      } else if (item.text === 'Integrations') {
                        setIntegrationsOpen(!integrationsOpen)
                      } else if (item.text === 'Operations') {
                        setOperationsOpen(!operationsOpen)
                      } else if (item.text === 'Admin & IAM') {
                        setAdminOpen(!adminOpen)
                      }
                    } else {
                      navigate(item.path!)
                    }
                  }}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'white',
                      },
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, color: isSelected && !item.hasSubmenu ? 'white' : 'text.secondary' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                      fontWeight: isSelected && !item.hasSubmenu ? 600 : 400,
                    }}
                  />
                  {item.hasSubmenu && (
                    (item.text === 'Hypercare' ? hypercareOpen : 
                     item.text === 'Integrations' ? integrationsOpen : 
                     item.text === 'Operations' ? operationsOpen :
                     adminOpen) 
                      ? <ExpandLess /> 
                      : <ExpandMore />
                  )}
                </ListItemButton>
              </ListItem>

              {/* Submenu */}
              {item.hasSubmenu && item.submenu && (
                <Collapse 
                  in={item.text === 'Hypercare' ? hypercareOpen : 
                      item.text === 'Integrations' ? integrationsOpen : 
                      item.text === 'Operations' ? operationsOpen :
                      adminOpen} 
                  timeout="auto" 
                  unmountOnExit
                >
                  <List component="div" disablePadding>
                    {item.submenu.map((subItem: any, subIndex: number) => {
                      if (subItem.divider) {
                        return <Divider key={`submenu-divider-${subIndex}`} sx={{ my: 1, ml: 6 }} />
                      }

                      const isSubSelected = location.pathname === subItem.path || 
                                          (subItem.path.includes('?tab=') && location.pathname === '/hypercare' && location.search === subItem.path.split('?')[1])
                      
                      return (
                        <ListItem key={subItem.text} disablePadding sx={{ px: 1 }}>
                          <ListItemButton
                            selected={isSubSelected}
                            onClick={() => {
                              if (subItem.path.includes('?tab=')) {
                                const [path, query] = subItem.path.split('?')
                                navigate(`${path}?${query}`)
                              } else {
                                navigate(subItem.path)
                              }
                            }}
                            sx={{
                              borderRadius: 1,
                              mb: 0.5,
                              pl: 6,
                              '&.Mui-selected': {
                                bgcolor: 'primary.light',
                                color: 'primary.main',
                                '&:hover': {
                                  bgcolor: 'primary.light',
                                },
                                '& .MuiListItemIcon-root': {
                                  color: 'primary.main',
                                },
                              },
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 30, color: isSubSelected ? 'primary.main' : 'text.secondary' }}>
                              {subItem.icon}
                            </ListItemIcon>
                            <ListItemText 
                              primary={subItem.text}
                              primaryTypographyProps={{
                                fontSize: '0.8125rem',
                                fontWeight: isSubSelected ? 600 : 400,
                              }}
                            />
                          </ListItemButton>
                        </ListItem>
                      )
                    })}
                  </List>
                </Collapse>
              )}
            </Box>
          )
        })}
      </List>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', width: '100%', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: 'white',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            {location.pathname.includes('hypercare') ? 'Hypercare Management' : 'Dashboard'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.875rem' }}>
              {user?.first_name?.charAt(0) || 'A'}
            </Avatar>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                {user ? `${user.first_name} ${user.last_name}` : 'Admin User'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.2 }}>
                {user?.email || 'admin@company.com'}
              </Typography>
            </Box>
            <IconButton size="small" onClick={handleMenuOpen}>
              <MoreIcon fontSize="small" />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>
          <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Profile</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { handleMenuClose(); logout(); }}>
          <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </Menu>
      
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              border: 'none',
              borderRight: '1px solid',
              borderColor: 'divider',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
          bgcolor: 'background.default',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        {children}
      </Box>
    </Box>
  )
}

export default Layout

