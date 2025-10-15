import { useNavigate } from 'react-router-dom'
import { Grid, Paper, Typography, Box, Card, CardContent, Button } from '@mui/material'
import {
  ShoppingCart as ProductIcon,
  People as UsersIcon,
  Build as MaintenanceIcon,
  Rule as RulesIcon,
  TrendingUp,
  ArrowForward,
  BusinessCenter as PartnerIcon,
  ShowChart as AssetIcon,
  CheckCircle as ApprovalIcon,
  Speed as HypercareIcon,
} from '@mui/icons-material'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import WorkflowDiagram from '../components/WorkflowDiagram'

interface StatCardProps {
  title: string
  value: string
  subtitle: string
  color: string
  trendUp?: boolean
}

const StatCard = ({ title, value, subtitle, color, trendUp }: StatCardProps) => (
  <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
    <CardContent>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
        {title}
      </Typography>
      <Typography variant="h3" sx={{ mb: 0.5, fontWeight: 700, color }}>
        {value}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {trendUp && <TrendingUp fontSize="small" sx={{ color: 'success.main' }} />}
        <Typography variant="caption" color="text.secondary">
          {subtitle}
        </Typography>
      </Box>
    </CardContent>
  </Card>
)

interface QuickActionProps {
  title: string
  description: string
  path: string
}

const QuickActionCard = ({ title, description, path }: QuickActionProps) => {
  const navigate = useNavigate()
  
  return (
    <Card sx={{ height: '100%', cursor: 'pointer', transition: 'all 0.2s', '&:hover': { boxShadow: 3 } }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {description}
        </Typography>
        <Button 
          endIcon={<ArrowForward />} 
          onClick={() => navigate(path)}
          sx={{ p: 0, minWidth: 0, fontWeight: 500 }}
        >
          Open
        </Button>
      </CardContent>
    </Card>
  )
}

// Mock data for charts
const trendData = [
  { month: 'Jan', products: 18, partners: 12, assets: 45 },
  { month: 'Feb', products: 19, partners: 14, assets: 52 },
  { month: 'Mar', products: 20, partners: 15, assets: 58 },
  { month: 'Apr', products: 21, partners: 17, assets: 64 },
  { month: 'May', products: 22, partners: 19, assets: 71 },
  { month: 'Jun', products: 24, partners: 21, assets: 78 },
]

const activityData = [
  { day: 'Mon', transactions: 245, users: 128 },
  { day: 'Tue', transactions: 312, users: 156 },
  { day: 'Wed', transactions: 289, users: 142 },
  { day: 'Thu', transactions: 334, users: 171 },
  { day: 'Fri', transactions: 398, users: 194 },
  { day: 'Sat', transactions: 267, users: 135 },
  { day: 'Sun', transactions: 223, users: 118 },
]

const approvalData = [
  { category: 'Products', pending: 5, approved: 18, rejected: 2 },
  { category: 'Partners', pending: 3, approved: 15, rejected: 1 },
  { category: 'Assets', pending: 8, approved: 42, rejected: 3 },
  { category: 'Changes', pending: 12, approved: 56, rejected: 4 },
]

const Dashboard = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Welcome to your management portal
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Products"
            value="24"
            subtitle="+2 from last week"
            color="#3b82f6"
            trendUp
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Whitelisted Users"
            value="1,429"
            subtitle="+12% this month"
            color="#10b981"
            trendUp
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Maintenance Mode"
            value="3"
            subtitle="2 scheduled"
            color="#f59e0b"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Rules"
            value="156"
            subtitle="All operational"
            color="#8b5cf6"
          />
        </Grid>
      </Grid>

      {/* Growth Trends Chart */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
          Growth Trends
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Track marketplace growth across products, partners, and assets
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Marketplace Growth (Last 6 Months)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorProducts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPartners" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorAssets" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="products" stroke="#3b82f6" fillOpacity={1} fill="url(#colorProducts)" name="Products" />
                  <Area type="monotone" dataKey="partners" stroke="#10b981" fillOpacity={1} fill="url(#colorPartners)" name="Partners" />
                  <Area type="monotone" dataKey="assets" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorAssets)" name="Assets" />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Weekly Activity
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="transactions" fill="#3b82f6" name="Transactions" />
                  <Bar dataKey="users" fill="#10b981" name="Active Users" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Approval Pipeline
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={approvalData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="category" type="category" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="approved" stackId="a" fill="#10b981" name="Approved" />
                  <Bar dataKey="pending" stackId="a" fill="#f59e0b" name="Pending" />
                  <Bar dataKey="rejected" stackId="a" fill="#ef4444" name="Rejected" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Product Lifecycle Workflow */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
          Product Lifecycle Workflow
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Standard workflow for product, partner, and asset onboarding
        </Typography>

        <WorkflowDiagram
          orientation="horizontal"
          steps={[
            {
              id: 'creation',
              label: 'Creation',
              description: 'New item created',
              status: 'completed',
              substeps: [
                { id: 'sub1', label: 'Form submitted', status: 'completed' },
                { id: 'sub2', label: 'Validation passed', status: 'completed' },
              ],
            },
            {
              id: 'approval',
              label: 'Approval',
              description: 'Awaiting admin review',
              status: 'active',
              substeps: [
                { id: 'sub3', label: 'Assigned to reviewer', status: 'completed' },
                { id: 'sub4', label: 'Under review', status: 'active' },
              ],
            },
            {
              id: 'configuration',
              label: 'Configuration',
              description: 'Partners & assets mapping',
              status: 'pending',
              substeps: [
                { id: 'sub5', label: 'Partner assignment', status: 'pending' },
                { id: 'sub6', label: 'Asset configuration', status: 'pending' },
              ],
            },
            {
              id: 'activation',
              label: 'Activation',
              description: 'Product goes live',
              status: 'pending',
              substeps: [
                { id: 'sub7', label: 'Final checks', status: 'pending' },
                { id: 'sub8', label: 'Deploy to production', status: 'pending' },
              ],
            },
          ]}
        />
      </Box>

      {/* Marketplace Management */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
          Marketplace Management
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Manage products, partners, and assets in your marketplace
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionCard
              title="Products"
              description="Add and manage marketplace products"
              path="/products"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionCard
              title="Partners"
              description="Onboard and manage partners"
              path="/partners"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionCard
              title="Assets"
              description="Manage investment assets & data"
              path="/assets"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionCard
              title="Partner Integrations"
              description="Monitor all partner integrations"
              path="/integrations"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionCard
              title="Approvals"
              description="Review pending requests"
              path="/approvals"
            />
          </Grid>
        </Grid>
      </Box>

      {/* Hypercare Operations */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
          Hypercare Operations
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Monitor and control live product operations
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionCard
              title="Products & Features"
              description="Control product operational status"
              path="/hypercare"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionCard
              title="Greylist"
              description="Manage whitelist & blacklist"
              path="/hypercare?tab=1"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionCard
              title="Eligibility"
              description="Verify user access rules"
              path="/hypercare?tab=2"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionCard
              title="Data Points"
              description="Monitor system metrics"
              path="/hypercare?tab=3"
            />
          </Grid>
        </Grid>
      </Box>

      {/* Operations Dashboard */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
          Operations & Analytics
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Monitor performance, manage users, and generate reports
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionCard
              title="Operations Dashboard"
              description="Performance overview & metrics"
              path="/operations"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionCard
              title="User Management"
              description="Manage users & onboarding"
              path="/operations/users"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionCard
              title="Performance"
              description="Product & partner analytics"
              path="/operations/performance"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <QuickActionCard
              title="Reports"
              description="Generate comprehensive reports"
              path="/operations/reports"
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}

export default Dashboard

