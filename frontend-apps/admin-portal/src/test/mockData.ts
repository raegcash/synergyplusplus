// Mock data for testing

export const mockUser = {
  id: '1',
  username: 'admin@test.com',
  email: 'admin@test.com',
  firstName: 'Admin',
  lastName: 'User',
  role: 'ADMIN',
}

export const mockPartner = {
  id: '1',
  name: 'Test Partner',
  type: 'ASSET_MANAGER',
  status: 'ACTIVE',
  contactEmail: 'partner@test.com',
  apiKey: 'test-api-key',
  createdAt: '2024-01-01T00:00:00Z',
}

export const mockProduct = {
  id: '1',
  name: 'Test Product',
  category: 'INVESTMENT',
  type: 'MUTUAL_FUND',
  status: 'ACTIVE',
  partnerId: '1',
  minInvestment: 1000,
  expectedReturn: 8.5,
  riskLevel: 'MEDIUM',
  description: 'Test product description',
}

export const mockAsset = {
  id: '1',
  name: 'Test Asset',
  symbol: 'TEST',
  type: 'STOCK',
  exchange: 'NYSE',
  status: 'ACTIVE',
  currentPrice: 100.50,
  partnerId: '1',
}

export const mockFeature = {
  id: '1',
  key: 'test-feature',
  name: 'Test Feature',
  description: 'Test feature description',
  enabled: true,
  rolloutPercentage: 100,
}

export const mockGreylistEntry = {
  id: '1',
  userId: 'user-123',
  type: 'WHITELIST',
  reason: 'Early access',
  createdAt: '2024-01-01T00:00:00Z',
}

export const mockAdminUser = {
  id: '1',
  username: 'admin',
  email: 'admin@superapp.com',
  firstName: 'Admin',
  lastName: 'User',
  role: 'SUPER_ADMIN',
  status: 'ACTIVE',
  groups: ['admins', 'operators'],
  createdAt: '2024-01-01T00:00:00Z',
}

export const mockUserGroup = {
  id: '1',
  name: 'Administrators',
  description: 'System administrators',
  permissions: ['READ', 'WRITE', 'DELETE', 'ADMIN'],
  members: ['1', '2'],
  createdAt: '2024-01-01T00:00:00Z',
}

export const mockApproval = {
  id: '1',
  type: 'PARTNER',
  entityId: '1',
  status: 'PENDING',
  requestedBy: 'user-123',
  requestedAt: '2024-01-01T00:00:00Z',
  data: {
    name: 'New Partner',
    type: 'ASSET_MANAGER',
  },
}

export const mockTransaction = {
  id: '1',
  userId: 'user-123',
  type: 'BUY',
  assetId: '1',
  amount: 1000,
  status: 'COMPLETED',
  createdAt: '2024-01-01T00:00:00Z',
}

export const mockScheduledTask = {
  id: '1',
  name: 'Daily Asset Sync',
  description: 'Sync asset prices daily',
  cronExpression: '0 0 * * *',
  enabled: true,
  lastRun: '2024-01-01T00:00:00Z',
  nextRun: '2024-01-02T00:00:00Z',
  status: 'ACTIVE',
}

