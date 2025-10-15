// Asset Integration Configuration Service - Manages data source connections

export type IntegrationType = 'API' | 'SFTP' | 'CLOUD_STORAGE' | 'WEBHOOK' | 'DATABASE' | 'MANUAL'

export type IntegrationStatus = 'ACTIVE' | 'INACTIVE' | 'ERROR' | 'TESTING' | 'PENDING_SETUP'

export interface AssetIntegration {
  id: string
  assetId: string
  assetCode: string
  assetName: string
  partnerName: string
  partnerId: string
  type: IntegrationType
  status: IntegrationStatus
  name: string
  description: string
  configuration: {
    // API Configuration
    apiUrl?: string
    apiMethod?: 'GET' | 'POST' | 'PUT'
    apiHeaders?: Record<string, string>
    apiAuth?: {
      type: 'BEARER' | 'BASIC' | 'API_KEY' | 'OAUTH'
      credentials?: string
    }
    
    // SFTP Configuration
    sftpHost?: string
    sftpPort?: number
    sftpUsername?: string
    sftpPath?: string
    sftpFilePattern?: string
    
    // Cloud Storage Configuration
    storageProvider?: 'AWS_S3' | 'AZURE_BLOB' | 'GCP_STORAGE'
    storageBucket?: string
    storagePath?: string
    storageCredentials?: string
    
    // Webhook Configuration
    webhookSecret?: string
    webhookValidation?: boolean
    
    // Common
    schedule?: string // Cron expression for scheduled pulls
    dataFormat?: 'JSON' | 'XML' | 'CSV' | 'EXCEL'
    dataMapping?: Record<string, string> // Map source fields to our schema
  }
  lastSync?: string
  lastSyncStatus?: 'SUCCESS' | 'FAILED' | 'PARTIAL'
  nextScheduledSync?: string
  syncFrequency: string // Human readable
  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface IntegrationLog {
  id: string
  integrationId: string
  integrationName: string
  timestamp: string
  status: 'SUCCESS' | 'FAILED' | 'PARTIAL' | 'RUNNING'
  recordsProcessed: number
  recordsFailed: number
  duration: number // in seconds
  errorMessage?: string
  details?: any
}

export interface CreateIntegrationRequest {
  assetId: string
  partnerId: string
  type: IntegrationType
  name: string
  description: string
  configuration: any
  syncFrequency: string
}

// Mock data store
let mockIntegrations: AssetIntegration[] = [
  {
    id: 'int-1',
    assetId: 'asset-1',
    assetCode: 'PAMI-EF',
    assetName: 'Philippine Equity Fund',
    partnerName: 'BPI Asset Management',
    partnerId: 'partner-1',
    type: 'SFTP',
    status: 'ACTIVE',
    name: 'BPI SFTP Daily NAV Feed',
    description: 'Daily NAV updates via SFTP file transfer',
    configuration: {
      sftpHost: 'sftp.bpiassetmanagement.com',
      sftpPort: 22,
      sftpUsername: 'superapp_user',
      sftpPath: '/nav_feeds',
      sftpFilePattern: 'NAV_*.csv',
      schedule: '0 18 * * 1-5', // 6 PM weekdays
      dataFormat: 'CSV',
      dataMapping: {
        fund_code: 'assetCode',
        nav_value: 'value',
        price_date: 'timestamp',
      }
    },
    lastSync: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    lastSyncStatus: 'SUCCESS',
    nextScheduledSync: new Date(Date.now() + 1000 * 60 * 60 * 16).toISOString(), // In 16 hours
    syncFrequency: 'Daily at 6:00 PM (Weekdays)',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    createdBy: 'admin@company.com',
  },
  {
    id: 'int-2',
    assetId: 'asset-2',
    assetCode: 'PAMI-BF',
    assetName: 'Philippine Bond Fund',
    partnerName: 'Fund House B',
    partnerId: 'partner-2',
    type: 'API',
    status: 'ACTIVE',
    name: 'Fund House B REST API',
    description: 'Real-time NAV via REST API',
    configuration: {
      apiUrl: 'https://api.fundhouseb.com/v1/nav',
      apiMethod: 'GET',
      apiHeaders: {
        'Accept': 'application/json',
      },
      apiAuth: {
        type: 'API_KEY',
        credentials: 'sk_live_*********************',
      },
      schedule: '*/30 * * * *', // Every 30 minutes
      dataFormat: 'JSON',
      dataMapping: {
        'fund_id': 'assetCode',
        'current_nav': 'value',
        'timestamp': 'timestamp',
      }
    },
    lastSync: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 min ago
    lastSyncStatus: 'SUCCESS',
    nextScheduledSync: new Date(Date.now() + 1000 * 60 * 15).toISOString(), // In 15 min
    syncFrequency: 'Every 30 minutes',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    createdBy: 'admin@company.com',
  },
  {
    id: 'int-3',
    assetId: 'asset-3',
    assetCode: 'PAMI-MMF',
    assetName: 'Money Market Fund',
    partnerName: 'Fund House C',
    partnerId: 'partner-3',
    type: 'CLOUD_STORAGE',
    status: 'ACTIVE',
    name: 'AWS S3 Daily Upload',
    description: 'Partner uploads files to S3 bucket daily',
    configuration: {
      storageProvider: 'AWS_S3',
      storageBucket: 'fundhouse-c-nav-data',
      storagePath: '/daily_nav',
      schedule: '0 19 * * *', // 7 PM daily
      dataFormat: 'EXCEL',
      dataMapping: {
        'Fund Code': 'assetCode',
        'NAV': 'value',
        'Date': 'timestamp',
      }
    },
    lastSync: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    lastSyncStatus: 'SUCCESS',
    nextScheduledSync: new Date(Date.now() + 1000 * 60 * 60 * 14).toISOString(),
    syncFrequency: 'Daily at 7:00 PM',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    createdBy: 'admin@company.com',
  },
  {
    id: 'int-4',
    assetId: 'asset-4',
    assetCode: 'PAMI-GF',
    assetName: 'Global Equity Fund',
    partnerName: 'International Fund House',
    partnerId: 'partner-4',
    type: 'WEBHOOK',
    status: 'ACTIVE',
    name: 'Webhook Push Integration',
    description: 'Partner pushes NAV updates via webhook',
    configuration: {
      webhookSecret: 'whsec_*********************',
      webhookValidation: true,
      dataFormat: 'JSON',
      dataMapping: {
        'product_code': 'assetCode',
        'net_asset_value': 'value',
        'update_time': 'timestamp',
      }
    },
    lastSync: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 min ago
    lastSyncStatus: 'SUCCESS',
    syncFrequency: 'Real-time (Push)',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    createdBy: 'admin@company.com',
  },
]

let mockLogs: IntegrationLog[] = [
  {
    id: 'log-1',
    integrationId: 'int-1',
    integrationName: 'BPI SFTP Daily NAV Feed',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    status: 'SUCCESS',
    recordsProcessed: 150,
    recordsFailed: 0,
    duration: 45,
  },
  {
    id: 'log-2',
    integrationId: 'int-2',
    integrationName: 'Fund House B REST API',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    status: 'SUCCESS',
    recordsProcessed: 1,
    recordsFailed: 0,
    duration: 2,
  },
  {
    id: 'log-3',
    integrationId: 'int-1',
    integrationName: 'BPI SFTP Daily NAV Feed',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    status: 'FAILED',
    recordsProcessed: 0,
    recordsFailed: 150,
    duration: 120,
    errorMessage: 'SFTP connection timeout',
  },
]

export const assetIntegrationsAPI = {
  // Get all integrations
  getAll: async (): Promise<AssetIntegration[]> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return Promise.resolve([...mockIntegrations])
  },

  // Get integrations for a specific asset
  getByAssetId: async (assetId: string): Promise<AssetIntegration[]> => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return Promise.resolve(mockIntegrations.filter(i => i.assetId === assetId))
  },

  // Get integration by ID
  getById: async (id: string): Promise<AssetIntegration> => {
    await new Promise(resolve => setTimeout(resolve, 200))
    const integration = mockIntegrations.find(i => i.id === id)
    if (!integration) throw new Error('Integration not found')
    return Promise.resolve(integration)
  },

  // Create new integration
  create: async (data: CreateIntegrationRequest): Promise<AssetIntegration> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const newIntegration: AssetIntegration = {
      id: `int-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      assetCode: 'TEMP', // Should fetch from asset
      assetName: 'Asset Name',
      partnerName: 'Partner Name', // Should fetch from partner
      status: 'PENDING_SETUP',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'admin@company.com',
      ...data,
    }
    
    mockIntegrations.push(newIntegration)
    return Promise.resolve(newIntegration)
  },

  // Update integration
  update: async (id: string, data: Partial<AssetIntegration>): Promise<AssetIntegration> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const index = mockIntegrations.findIndex(i => i.id === id)
    if (index === -1) throw new Error('Integration not found')
    
    mockIntegrations[index] = {
      ...mockIntegrations[index],
      ...data,
      updatedAt: new Date().toISOString(),
    }
    
    return Promise.resolve(mockIntegrations[index])
  },

  // Delete integration
  delete: async (id: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 200))
    mockIntegrations = mockIntegrations.filter(i => i.id !== id)
    return Promise.resolve()
  },

  // Test integration connection
  testConnection: async (id: string): Promise<{ success: boolean; message: string }> => {
    await new Promise(resolve => setTimeout(resolve, 2000))
    // Simulate connection test
    return Promise.resolve({
      success: true,
      message: 'Connection successful! Able to reach endpoint and authenticate.',
    })
  },

  // Manually trigger sync
  triggerSync: async (id: string): Promise<{ success: boolean; jobId: string }> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    return Promise.resolve({
      success: true,
      jobId: `job-${Date.now()}`,
    })
  },

  // Get integration logs
  getLogs: async (integrationId?: string): Promise<IntegrationLog[]> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    if (integrationId) {
      return Promise.resolve(mockLogs.filter(log => log.integrationId === integrationId))
    }
    return Promise.resolve([...mockLogs])
  },

  // Get recent logs (last 24 hours)
  getRecentLogs: async (): Promise<IntegrationLog[]> => {
    await new Promise(resolve => setTimeout(resolve, 200))
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000)
    return Promise.resolve(
      mockLogs.filter(log => new Date(log.timestamp) >= cutoff)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    )
  },

  // Get integration statistics
  getStatistics: async (): Promise<{
    totalIntegrations: number
    activeIntegrations: number
    failedToday: number
    totalRecordsToday: number
  }> => {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const todayLogs = mockLogs.filter(log => new Date(log.timestamp) >= today)
    const failedToday = todayLogs.filter(log => log.status === 'FAILED').length
    const totalRecordsToday = todayLogs.reduce((sum, log) => sum + log.recordsProcessed, 0)
    
    return Promise.resolve({
      totalIntegrations: mockIntegrations.length,
      activeIntegrations: mockIntegrations.filter(i => i.status === 'ACTIVE').length,
      failedToday,
      totalRecordsToday,
    })
  },
}



