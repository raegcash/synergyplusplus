// Hypercare Services
// Greylist, Eligibility, and Data Points management

import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8085/api/marketplace'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ============= GREYLIST =============

export interface GreylistEntry {
  id: string
  msisdn?: string
  userId: string
  userEmail: string
  userName: string
  productId: string
  productCode: string
  productName: string
  listType: 'WHITELIST' | 'BLACKLIST'
  reason: string
  addedBy: string
  addedAt: string
  expiresAt?: string
  status: 'ACTIVE' | 'EXPIRED' | 'REMOVED' | 'INACTIVE'
}

// ============= ELIGIBILITY =============

export interface EligibilityCriteria {
  id: string
  name: string
  description: string
  productId: string
  productCode: string
  productName: string
  rules: EligibilityRule[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface EligibilityRule {
  id: string
  dataPointId: string
  dataPointKey: string
  operator: 'EQUALS' | 'NOT_EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'GREATER_THAN_OR_EQUAL' | 'LESS_THAN_OR_EQUAL' | 'CONTAINS' | 'IN' | 'NOT_IN'
  value: string | number | boolean
  logicalOperator?: 'AND' | 'OR'
}

// ============= DATA POINTS =============

export interface DataPoint {
  id: string
  database: 'postgresql' | 'mongodb' | 'redis' | 'api' | 'internal'
  databaseType: string // For display purposes ('postgresql', 'mongodb', etc.)
  databaseName: string
  source: string // table/collection name
  key: string // field/column name
  dataType: 'string' | 'number' | 'boolean' | 'date'
  description: string
  status: 'ACTIVE' | 'INACTIVE'
  connectionId: string
  createdAt: string
  updatedAt: string
}

export interface DatabaseConnection {
  id: string
  name: string
  type: 'postgresql' | 'mongodb' | 'redis' | 'api' | 'internal'
  host: string
  port: number
  database: string
  username?: string
  status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR'
  lastChecked: string
}

// ============= MOCK DATA =============

let mockGreylistEntries: GreylistEntry[] = [
  {
    id: 'grey-1',
    msisdn: '+639171234567',
    userId: 'USER001',
    userEmail: 'blocked.user@email.com',
    userName: 'Test User 1',
    productId: 'product-1',
    productCode: 'GSTOCKS',
    productName: 'GCrypto',
    listType: 'WHITELIST',
    reason: 'Early access for beta testing',
    addedBy: 'admin@company.com',
    addedAt: '2025-10-01T00:00:00Z',
    status: 'ACTIVE',
  },
  {
    id: 'grey-2',
    msisdn: '+639187654321',
    userId: 'USER002',
    userEmail: 'vip.user@email.com',
    userName: 'VIP User',
    productId: 'product-2',
    productCode: 'GSAVE',
    productName: 'GSave',
    listType: 'WHITELIST',
    reason: 'Early access beta tester',
    addedBy: 'admin@company.com',
    addedAt: '2025-09-15T00:00:00Z',
    expiresAt: '2026-01-31T23:59:59Z',
    status: 'ACTIVE',
  },
  {
    id: 'grey-3',
    msisdn: '+639191112222',
    userId: '',
    userEmail: 'premium.user@email.com',
    userName: 'Premium User',
    productId: 'product-3',
    productCode: 'GFUNDS',
    productName: 'GFunds',
    listType: 'WHITELIST',
    reason: 'Premium tier access',
    addedBy: 'admin@company.com',
    addedAt: '2025-10-10T00:00:00Z',
    status: 'ACTIVE',
  },
  {
    id: 'grey-4',
    msisdn: '+639193334444',
    userId: '',
    userEmail: 'beta.tester@email.com',
    userName: 'Beta Tester',
    productId: 'product-1',
    productCode: 'GSTOCKS',
    productName: 'GCrypto',
    listType: 'WHITELIST',
    reason: 'Beta testing program',
    addedBy: 'admin@company.com',
    addedAt: '2025-02-10T00:00:00Z',
    status: 'ACTIVE',
  },
  {
    id: 'grey-5',
    msisdn: '+639195556666',
    userId: '',
    userEmail: 'suspicious.user@email.com',
    userName: 'Suspicious Account',
    productId: 'product-1',
    productCode: 'GSTOCKS',
    productName: 'GCrypto',
    listType: 'BLACKLIST',
    reason: 'Multiple failed verification attempts',
    addedBy: 'admin@company.com',
    addedAt: '2025-09-20T00:00:00Z',
    status: 'ACTIVE',
  },
  {
    id: 'grey-6',
    msisdn: '+639197778888',
    userId: '',
    userEmail: 'fraud.user@email.com',
    userName: 'Fraud Account',
    productId: 'product-2',
    productCode: 'GSAVE',
    productName: 'GSave',
    listType: 'BLACKLIST',
    reason: 'Fraudulent activity detected',
    addedBy: 'admin@company.com',
    addedAt: '2025-08-15T00:00:00Z',
    expiresAt: '2026-08-15T23:59:59Z',
    status: 'ACTIVE',
  },
]

let mockEligibilityCriteria: EligibilityCriteria[] = [
  {
    id: 'elig-1',
    name: 'Age Requirement',
    description: 'User must be 18 years or older',
    productId: 'product-1',
    productCode: 'GSTOCKS',
    productName: 'GStocks',
    rules: [
      {
        id: 'rule-1',
        dataPointId: 'dp-1',
        dataPointKey: 'age',
        operator: 'GREATER_THAN_OR_EQUAL',
        value: 18,
      },
    ],
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'elig-2',
    name: 'Active Account & Philippines Only',
    description: 'Account must be active and user must be from Philippines',
    productId: 'product-2',
    productCode: 'GCRYPTO',
    productName: 'GCrypto',
    rules: [
      {
        id: 'rule-2',
        dataPointId: 'dp-2',
        dataPointKey: 'status',
        operator: 'EQUALS',
        value: 'active',
        logicalOperator: 'AND',
      },
      {
        id: 'rule-3',
        dataPointId: 'dp-4',
        dataPointKey: 'country',
        operator: 'EQUALS',
        value: 'PH',
      },
    ],
    isActive: true,
    createdAt: '2025-01-15T00:00:00Z',
    updatedAt: '2025-01-15T00:00:00Z',
  },
]

let mockDataPoints: DataPoint[] = [
  {
    id: 'dp-1',
    database: 'postgresql',
    databaseType: 'postgresql',
    databaseName: 'primary_db',
    source: 'user_profile',
    key: 'age',
    dataType: 'number',
    description: "User's age in years",
    status: 'ACTIVE',
    connectionId: 'conn-1',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'dp-2',
    database: 'postgresql',
    databaseType: 'postgresql',
    databaseName: 'primary_db',
    source: 'account',
    key: 'status',
    dataType: 'string',
    description: 'Account status (active, suspended, closed)',
    status: 'ACTIVE',
    connectionId: 'conn-1',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'dp-3',
    database: 'mongodb',
    databaseType: 'mongodb',
    databaseName: 'subscriptions_db',
    source: 'subscription',
    key: 'tier',
    dataType: 'string',
    description: 'Subscription tier level',
    status: 'ACTIVE',
    connectionId: 'conn-2',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'dp-4',
    database: 'redis',
    databaseType: 'redis',
    databaseName: 'cache_db',
    source: 'user_profile',
    key: 'country',
    dataType: 'string',
    description: "User's country code",
    status: 'ACTIVE',
    connectionId: 'conn-3',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'dp-5',
    database: 'api',
    databaseType: 'external-api',
    databaseName: 'external_api',
    source: 'account',
    key: 'created_date',
    dataType: 'date',
    description: 'Account creation date',
    status: 'ACTIVE',
    connectionId: 'conn-4',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'dp-6',
    database: 'internal',
    databaseType: 'internal-service',
    databaseName: 'app_db',
    source: 'user_profile',
    key: 'is_verified',
    dataType: 'boolean',
    description: 'Whether user has verified their identity',
    status: 'ACTIVE',
    connectionId: 'conn-5',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
]

let mockConnections: DatabaseConnection[] = [
  {
    id: 'conn-1',
    name: 'primary_db',
    type: 'postgresql',
    host: 'postgres.internal',
    port: 5432,
    database: 'primary_db',
    username: 'app_user',
    status: 'CONNECTED',
    lastChecked: '2025-10-13T23:00:00Z',
  },
  {
    id: 'conn-2',
    name: 'subscriptions_db',
    type: 'mongodb',
    host: 'mongo.internal',
    port: 27017,
    database: 'subscriptions_db',
    username: 'mongo_user',
    status: 'CONNECTED',
    lastChecked: '2025-10-13T23:00:00Z',
  },
  {
    id: 'conn-3',
    name: 'cache_db',
    type: 'redis',
    host: 'redis.internal',
    port: 6379,
    database: 'cache_db',
    status: 'CONNECTED',
    lastChecked: '2025-10-13T23:00:00Z',
  },
  {
    id: 'conn-4',
    name: 'external_api',
    type: 'api',
    host: 'api.external.com',
    port: 443,
    database: 'external_api',
    status: 'CONNECTED',
    lastChecked: '2025-10-13T23:00:00Z',
  },
  {
    id: 'conn-5',
    name: 'app_db',
    type: 'internal',
    host: 'internal.service',
    port: 8080,
    database: 'app_db',
    status: 'CONNECTED',
    lastChecked: '2025-10-13T23:00:00Z',
  },
]

// ============= API METHODS =============

export const hypercareAPI = {
  // ============= GREYLIST =============
  
  getAllGreylistEntries: async (): Promise<GreylistEntry[]> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockGreylistEntries
  },

  getGreylistByProduct: async (productId: string): Promise<GreylistEntry[]> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockGreylistEntries.filter(e => e.productId === productId)
  },

  addGreylistEntry: async (data: Omit<GreylistEntry, 'id' | 'addedAt' | 'status'>): Promise<GreylistEntry> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    const newEntry: GreylistEntry = {
      ...data,
      id: `grey-${Date.now()}`,
      addedAt: new Date().toISOString(),
      status: 'ACTIVE',
    }
    mockGreylistEntries.push(newEntry)
    return newEntry
  },

  removeGreylistEntry: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    const index = mockGreylistEntries.findIndex(e => e.id === id)
    if (index !== -1) {
      mockGreylistEntries[index].status = 'REMOVED'
    }
  },

  updateGreylistEntry: async (id: string, data: Partial<GreylistEntry>): Promise<GreylistEntry> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    const index = mockGreylistEntries.findIndex(e => e.id === id)
    if (index !== -1) {
      mockGreylistEntries[index] = { ...mockGreylistEntries[index], ...data }
      return mockGreylistEntries[index]
    }
    throw new Error('Entry not found')
  },

  // ============= ELIGIBILITY =============

  getAllEligibilityCriteria: async (): Promise<EligibilityCriteria[]> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockEligibilityCriteria
  },

  getEligibilityByProduct: async (productId: string): Promise<EligibilityCriteria[]> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockEligibilityCriteria.filter(c => c.productId === productId)
  },

  createEligibilityCriteria: async (data: Omit<EligibilityCriteria, 'id' | 'createdAt' | 'updatedAt'>): Promise<EligibilityCriteria> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    const newCriteria: EligibilityCriteria = {
      ...data,
      id: `elig-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    mockEligibilityCriteria.push(newCriteria)
    return newCriteria
  },

  updateEligibilityCriteria: async (id: string, data: Partial<EligibilityCriteria>): Promise<EligibilityCriteria> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    const index = mockEligibilityCriteria.findIndex(c => c.id === id)
    if (index === -1) throw new Error('Criteria not found')
    mockEligibilityCriteria[index] = {
      ...mockEligibilityCriteria[index],
      ...data,
      updatedAt: new Date().toISOString(),
    }
    return mockEligibilityCriteria[index]
  },

  deleteEligibilityCriteria: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    mockEligibilityCriteria = mockEligibilityCriteria.filter(c => c.id !== id)
  },

  // ============= DATA POINTS =============

  getAllDataPoints: async (): Promise<DataPoint[]> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockDataPoints
  },

  getDataPointById: async (id: string): Promise<DataPoint | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockDataPoints.find(dp => dp.id === id)
  },

  createDataPoint: async (data: Omit<DataPoint, 'id' | 'createdAt' | 'updatedAt'>): Promise<DataPoint> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    const newDataPoint: DataPoint = {
      ...data,
      id: `dp-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    mockDataPoints.push(newDataPoint)
    return newDataPoint
  },

  updateDataPoint: async (id: string, data: Partial<DataPoint>): Promise<DataPoint> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    const index = mockDataPoints.findIndex(dp => dp.id === id)
    if (index === -1) throw new Error('Data point not found')
    mockDataPoints[index] = {
      ...mockDataPoints[index],
      ...data,
      updatedAt: new Date().toISOString(),
    }
    return mockDataPoints[index]
  },

  deleteDataPoint: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    mockDataPoints = mockDataPoints.filter(dp => dp.id !== id)
  },

  // ============= DATABASE CONNECTIONS =============

  getAllConnections: async (): Promise<DatabaseConnection[]> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockConnections
  },

  testConnection: async (id: string): Promise<{ success: boolean; message: string }> => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    return { success: true, message: 'Connection successful' }
  },

  // ============= STATISTICS =============

  getHypercareStats: async () => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return {
      greylist: {
        total: mockGreylistEntries.length,
        whitelist: mockGreylistEntries.filter(e => e.listType === 'WHITELIST' && e.status === 'ACTIVE').length,
        blacklist: mockGreylistEntries.filter(e => e.listType === 'BLACKLIST' && e.status === 'ACTIVE').length,
      },
      eligibility: {
        total: mockEligibilityCriteria.length,
        active: mockEligibilityCriteria.filter(c => c.isActive).length,
      },
      dataPoints: {
        total: mockDataPoints.length,
        active: mockDataPoints.filter(dp => dp.status === 'ACTIVE').length,
        connections: mockConnections.length,
        inactive: mockDataPoints.filter(dp => dp.status === 'INACTIVE').length,
      },
    }
  },
}
