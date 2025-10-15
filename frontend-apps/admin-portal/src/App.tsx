import { Routes, Route, Navigate } from 'react-router-dom'
import { Box } from '@mui/material'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import HypercareProducts from './pages/Hypercare/Products'
import HypercareFeatures from './pages/Hypercare/Features'
import HypercareGreylist from './pages/Hypercare/Greylist'
import PartnerList from './pages/Partners/List'
import PartnerCreate from './pages/Partners/Create'
import PartnerView from './pages/Partners/View'
import PartnerEdit from './pages/Partners/Edit'
import PartnerApprovals from './pages/Partners/Approvals'
import Hypercare from './pages/Hypercare'
import ProductsList from './pages/Products/List'
import ProductCreate from './pages/Products/Create'
import IntegrationsIndex from './pages/Integrations/Index'
import TransactionIntegrations from './pages/Integrations/Transactions'
import ScheduledTasks from './pages/Integrations/ScheduledTasks'
import OperationsDashboard from './pages/Operations/Index'
import UserManagement from './pages/Operations/Users'
import OperationsReports from './pages/Operations/Reports'
import ReportBuilder from './pages/Operations/ReportBuilder'
import PerformanceMonitoring from './pages/Operations/Performance'
import UserDetail from './pages/Operations/UserDetail'
import ProductView from './pages/Products/View'
import ProductEdit from './pages/Products/Edit'
import AssetsList from './pages/Assets/List'
import AssetCreate from './pages/Assets/Create'
import AssetView from './pages/Assets/View'
import AssetEdit from './pages/Assets/Edit'
import PartnerAssetRequests from './pages/Assets/PartnerRequests'
import AssetDataIntegrations from './pages/Assets/DataIntegrations'
import ApprovalsIndex from './pages/Approvals/Index'
import ApprovalsList from './pages/Approvals/List'

// Auth
import { Login } from './pages/Login'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'

// Admin IAM
import { AdminUsersList } from './pages/Admin/Users/List'
import { AdminUserCreateEdit } from './pages/Admin/Users/CreateEdit'
import { AdminUserView } from './pages/Admin/Users/View'
import { UserGroupsList } from './pages/Admin/Groups/List'
import { UserGroupCreateEdit } from './pages/Admin/Groups/CreateEdit'
import { UserGroupView } from './pages/Admin/Groups/View'

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Box sx={{ display: 'flex' }}>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Products Routes */}
          <Route path="/products" element={<ProductsList />} />
          <Route path="/products/create" element={<ProductCreate />} />
          <Route path="/products/:id" element={<ProductView />} />
          <Route path="/products/:id/edit" element={<ProductEdit />} />
          <Route path="/products/pending" element={<ProductsList />} />
          
          {/* Partners Routes */}
          <Route path="/partners" element={<PartnerList />} />
          <Route path="/partners/create" element={<PartnerCreate />} />
          <Route path="/partners/:id" element={<PartnerView />} />
          <Route path="/partners/:id/edit" element={<PartnerEdit />} />
          <Route path="/partners/approvals" element={<PartnerApprovals />} />
          
          {/* Assets Routes */}
          <Route path="/assets" element={<AssetsList />} />
          <Route path="/assets/create" element={<AssetCreate />} />
          <Route path="/assets/:id" element={<AssetView />} />
          <Route path="/assets/:id/edit" element={<AssetEdit />} />
          <Route path="/assets/:id/data-integrations" element={<AssetDataIntegrations />} />
          <Route path="/assets/partner-requests" element={<PartnerAssetRequests />} />
          
          {/* Integrations */}
          <Route path="/integrations" element={<IntegrationsIndex />} />
          <Route path="/integrations/scheduled-tasks" element={<ScheduledTasks />} />
          <Route path="/integrations/transactions" element={<TransactionIntegrations />} />
          <Route path="/integrations/data-feeds" element={<IntegrationsIndex />} />
          <Route path="/integrations/settlement" element={<IntegrationsIndex />} />
          <Route path="/integrations/reporting" element={<IntegrationsIndex />} />
          
          {/* Approvals Routes - Unified */}
          <Route path="/approvals" element={<ApprovalsIndex />} />
          <Route path="/approvals/products" element={<ApprovalsList />} />
          <Route path="/approvals/partners" element={<PartnerApprovals />} />
          
          {/* Hypercare Routes */}
          <Route path="/hypercare" element={<Hypercare />} />
          <Route path="/hypercare/products" element={<HypercareProducts />} />
          <Route path="/hypercare/features" element={<HypercareFeatures />} />
          <Route path="/hypercare/greylist" element={<HypercareGreylist />} />
          
          {/* Operations Routes */}
          <Route path="/operations" element={<OperationsDashboard />} />
          <Route path="/operations/customers" element={<UserManagement />} />
          <Route path="/operations/customers/:id" element={<UserDetail />} />
          <Route path="/operations/reports" element={<OperationsReports />} />
          <Route path="/operations/report-builder" element={<ReportBuilder />} />
          <Route path="/operations/performance" element={<PerformanceMonitoring />} />
          <Route path="/operations/analytics" element={<PerformanceMonitoring />} />
          
          {/* Admin & IAM Routes */}
          <Route path="/admin/users" element={<AdminUsersList />} />
          <Route path="/admin/users/create" element={<AdminUserCreateEdit />} />
          <Route path="/admin/users/:id" element={<AdminUserView />} />
          <Route path="/admin/users/:id/edit" element={<AdminUserCreateEdit />} />
          
          <Route path="/admin/groups" element={<UserGroupsList />} />
          <Route path="/admin/groups/create" element={<UserGroupCreateEdit />} />
          <Route path="/admin/groups/:id" element={<UserGroupView />} />
          <Route path="/admin/groups/:id/edit" element={<UserGroupCreateEdit />} />
          
          {/* Placeholder routes */}
          <Route path="/data-points" element={<Dashboard />} />
          <Route path="/config" element={<Dashboard />} />
          <Route path="/catalog" element={<Dashboard />} />
          <Route path="/audit" element={<Dashboard />} />
                  </Routes>
                </Layout>
              </Box>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  )
}

export default App

