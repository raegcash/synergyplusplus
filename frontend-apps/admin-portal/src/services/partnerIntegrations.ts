// Partner Integrations Service
// Handles various integrations with all types of partners (funds, stocks, bonds, crypto, etc.)

export type TransactionType = 'KYC_SUBMISSION' | 'SUBSCRIPTION' | 'REDEMPTION' | 'BUY_ORDER' | 'SELL_ORDER' | 'TRANSFER'
export type AssetType = 'UITF' | 'MUTUAL_FUND' | 'FUND' | 'STOCK' | 'BOND' | 'CRYPTO' | 'ETF' | 'COMMODITY' | 'FOREX' | 'OTHER'
export type PartnerType = 'FUND_HOUSE' | 'STOCK_BROKER' | 'CRYPTO_EXCHANGE' | 'BANK' | 'CUSTODIAN' | 'OTHER'
export type IntegrationStatus = 'PENDING' | 'PROCESSING' | 'SENT' | 'ACKNOWLEDGED' | 'FAILED' | 'REJECTED'
export type FileFormat = 'CSV' | 'XML' | 'JSON' | 'FIXED_WIDTH' | 'EXCEL'
export type DeliveryMethod = 'SFTP' | 'API' | 'EMAIL' | 'CLOUD_STORAGE' | 'FTP'

export interface KYCSubmission {
  id: string
  userId: string
  userName: string
  userEmail: string
  partnerId: string
  partnerName: string
  partnerType: PartnerType
  assetId: string
  assetCode: string
  assetName: string
  assetType: AssetType
  
  // KYC Data
  firstName: string
  lastName: string
  dateOfBirth: string
  nationality: string
  identificationType: string
  identificationNumber: string
  address: string
  phoneNumber: string
  employmentStatus: string
  sourceOfFunds: string
  
  // Submission tracking
  status: IntegrationStatus
  submittedAt: string
  processedAt?: string
  acknowledgedAt?: string
  rejectionReason?: string
  
  // File tracking
  fileGenerated: boolean
  fileName?: string
  fileSize?: number
  filePath?: string
  sentAt?: string
}

export interface SubscriptionTransaction {
  id: string
  transactionRef: string
  userId: string
  userName: string
  partnerId: string
  partnerName: string
  partnerType: PartnerType
  assetId: string
  assetCode: string
  assetName: string
  assetType: AssetType
  
  // Transaction details
  amount: number
  currency: string
  navpu: number
  indicativeUnits: number
  transactionDate: string
  settlementDate: string
  paymentMethod: string
  paymentReference: string
  
  // Integration tracking
  status: IntegrationStatus
  submittedAt: string
  processedAt?: string
  acknowledgedAt?: string
  confirmationNumber?: string
  actualUnits?: number
  actualNavpu?: number
  
  // File tracking
  fileGenerated: boolean
  fileName?: string
  fileSize?: number
  filePath?: string
  sentAt?: string
}

export interface RedemptionTransaction {
  id: string
  transactionRef: string
  userId: string
  userName: string
  partnerId: string
  partnerName: string
  partnerType: PartnerType
  assetId: string
  assetCode: string
  assetName: string
  assetType: AssetType
  
  // Redemption details
  unitsToRedeem: number
  estimatedAmount: number
  currency: string
  navpu: number
  transactionDate: string
  settlementDate: string
  bankAccount: string
  bankName: string
  
  // Integration tracking
  status: IntegrationStatus
  submittedAt: string
  processedAt?: string
  acknowledgedAt?: string
  confirmationNumber?: string
  actualAmount?: number
  actualNavpu?: number
  
  // File tracking
  fileGenerated: boolean
  fileName?: string
  fileSize?: number
  filePath?: string
  sentAt?: string
}

export interface IntegrationConfig {
  id: string
  partnerId: string
  partnerName: string
  partnerType: PartnerType
  assetTypes: AssetType[] // Supported asset types for this partner
  supportedTransactions: TransactionType[] // Which transaction types this partner supports
  
  // File settings
  fileFormat: FileFormat
  deliveryMethod: DeliveryMethod
  destinationPath: string
  
  // Schedule (cron format)
  scheduleEnabled: boolean
  cronExpression: string // e.g., "0 18 * * *" for daily at 6 PM
  lastRunAt?: string
  nextRunAt?: string
  
  // Configuration
  batchSize: number
  includeHeader: boolean
  fieldDelimiter?: string
  encryptionEnabled: boolean
  
  // Status
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface IntegrationBatch {
  id: string
  batchNumber: string
  partnerId: string
  partnerName: string
  transactionType: TransactionType
  
  // Batch details
  totalRecords: number
  processedRecords: number
  failedRecords: number
  
  // File info
  fileName: string
  fileSize: number
  fileFormat: FileFormat
  generatedAt: string
  sentAt?: string
  acknowledgedAt?: string
  
  // Status
  status: IntegrationStatus
  deliveryMethod: DeliveryMethod
  errorMessage?: string
  
  // Items in batch
  kycSubmissions?: string[] // IDs
  subscriptions?: string[] // IDs
  redemptions?: string[] // IDs
}

export interface AuditLog {
  id: string
  timestamp: string
  action: string
  transactionType: TransactionType
  transactionId: string
  partnerId: string
  partnerName: string
  userId: string
  userName: string
  
  // Details
  status: IntegrationStatus
  details: string
  errorMessage?: string
  
  // File info
  fileName?: string
  fileSize?: number
  recordCount?: number
  
  // User tracking
  performedBy: string
  ipAddress?: string
}

// Mock data
let mockKYCSubmissions: KYCSubmission[] = [
  {
    id: 'kyc-1',
    userId: 'user-1',
    userName: 'Juan Dela Cruz',
    userEmail: 'juan.delacruz@email.com',
    partnerId: 'partner-1',
    partnerName: 'BPI Asset Management',
    partnerType: 'FUND_HOUSE',
    assetId: 'asset-1',
    assetCode: 'PAMI-EF',
    assetName: 'Philippine Equity Fund',
    assetType: 'UITF',
    firstName: 'Juan',
    lastName: 'Dela Cruz',
    dateOfBirth: '1990-05-15',
    nationality: 'Filipino',
    identificationType: 'Passport',
    identificationNumber: 'P1234567',
    address: '123 Makati Ave, Makati City, Metro Manila',
    phoneNumber: '+63 917 123 4567',
    employmentStatus: 'Employed',
    sourceOfFunds: 'Salary',
    status: 'SENT',
    submittedAt: '2025-10-13T08:00:00Z',
    processedAt: '2025-10-13T09:00:00Z',
    fileGenerated: true,
    fileName: 'KYC_BPI_20251013_001.csv',
    fileSize: 2048,
    filePath: '/exports/kyc/2025/10/',
    sentAt: '2025-10-13T18:00:00Z',
  },
  {
    id: 'kyc-2',
    userId: 'user-2',
    userName: 'Maria Santos',
    userEmail: 'maria.santos@email.com',
    partnerId: 'partner-2',
    partnerName: 'COL Financial',
    partnerType: 'STOCK_BROKER',
    assetId: 'asset-2',
    assetCode: 'AAPL',
    assetName: 'Apple Inc.',
    assetType: 'STOCK',
    firstName: 'Maria',
    lastName: 'Santos',
    dateOfBirth: '1985-03-20',
    nationality: 'Filipino',
    identificationType: 'Driver License',
    identificationNumber: 'N01-12-345678',
    address: '456 BGC, Taguig City, Metro Manila',
    phoneNumber: '+63 917 987 6543',
    employmentStatus: 'Self-Employed',
    sourceOfFunds: 'Business Income',
    status: 'PROCESSING',
    submittedAt: '2025-10-13T10:00:00Z',
    processedAt: '2025-10-13T11:00:00Z',
    fileGenerated: true,
    fileName: 'KYC_COL_20251013_002.csv',
    fileSize: 2150,
    filePath: '/exports/kyc/2025/10/',
  },
  {
    id: 'kyc-3',
    userId: 'user-3',
    userName: 'Pedro Reyes',
    userEmail: 'pedro.reyes@email.com',
    partnerId: 'partner-3',
    partnerName: 'Binance',
    partnerType: 'CRYPTO_EXCHANGE',
    assetId: 'asset-3',
    assetCode: 'BTC',
    assetName: 'Bitcoin',
    assetType: 'CRYPTO',
    firstName: 'Pedro',
    lastName: 'Reyes',
    dateOfBirth: '1992-08-10',
    nationality: 'Filipino',
    identificationType: 'Passport',
    identificationNumber: 'P9876543',
    address: '789 Ortigas Ave, Pasig City, Metro Manila',
    phoneNumber: '+63 917 555 1234',
    employmentStatus: 'Employed',
    sourceOfFunds: 'Salary',
    status: 'PENDING',
    submittedAt: '2025-10-13T12:00:00Z',
    fileGenerated: false,
  },
]

let mockSubscriptions: SubscriptionTransaction[] = [
  {
    id: 'sub-1',
    transactionRef: 'SUB-2025-001',
    userId: 'user-1',
    userName: 'Juan Dela Cruz',
    partnerId: 'partner-1',
    partnerName: 'BPI Asset Management',
    partnerType: 'FUND_HOUSE',
    assetId: 'asset-1',
    assetCode: 'PAMI-EF',
    assetName: 'Philippine Equity Fund',
    assetType: 'UITF',
    amount: 10000,
    currency: 'PHP',
    navpu: 2.4567,
    indicativeUnits: 4070.1234,
    transactionDate: '2025-10-13',
    settlementDate: '2025-10-15',
    paymentMethod: 'Bank Transfer',
    paymentReference: 'PAY-123456',
    status: 'ACKNOWLEDGED',
    submittedAt: '2025-10-13T08:30:00Z',
    processedAt: '2025-10-13T09:30:00Z',
    acknowledgedAt: '2025-10-13T19:00:00Z',
    confirmationNumber: 'CONF-BPI-001',
    actualUnits: 4070.1234,
    actualNavpu: 2.4567,
    fileGenerated: true,
    fileName: 'SUB_BPI_20251013_001.csv',
    fileSize: 3072,
    filePath: '/exports/subscriptions/2025/10/',
    sentAt: '2025-10-13T18:00:00Z',
  },
]

let mockRedemptions: RedemptionTransaction[] = [
  {
    id: 'red-1',
    transactionRef: 'RED-2025-001',
    userId: 'user-3',
    userName: 'Pedro Reyes',
    partnerId: 'partner-1',
    partnerName: 'BPI Asset Management',
    partnerType: 'FUND_HOUSE',
    assetId: 'asset-1',
    assetCode: 'PAMI-EF',
    assetName: 'Philippine Equity Fund',
    assetType: 'UITF',
    unitsToRedeem: 2000,
    estimatedAmount: 4913.40,
    currency: 'PHP',
    navpu: 2.4567,
    transactionDate: '2025-10-13',
    settlementDate: '2025-10-16',
    bankAccount: '1234567890',
    bankName: 'BPI',
    status: 'SENT',
    submittedAt: '2025-10-13T09:00:00Z',
    processedAt: '2025-10-13T10:00:00Z',
    fileGenerated: true,
    fileName: 'RED_BPI_20251013_001.csv',
    fileSize: 2560,
    filePath: '/exports/redemptions/2025/10/',
    sentAt: '2025-10-13T18:00:00Z',
  },
]

let mockIntegrationConfigs: IntegrationConfig[] = [
  {
    id: 'config-1',
    partnerId: 'partner-1',
    partnerName: 'BPI Asset Management',
    partnerType: 'FUND_HOUSE',
    assetTypes: ['UITF', 'MUTUAL_FUND', 'FUND'],
    supportedTransactions: ['KYC_SUBMISSION', 'SUBSCRIPTION', 'REDEMPTION'],
    fileFormat: 'CSV',
    deliveryMethod: 'SFTP',
    destinationPath: '/incoming/superapp/',
    scheduleEnabled: true,
    cronExpression: '0 18 * * *', // Daily at 6 PM
    lastRunAt: '2025-10-13T18:00:00Z',
    nextRunAt: '2025-10-14T18:00:00Z',
    batchSize: 100,
    includeHeader: true,
    fieldDelimiter: ',',
    encryptionEnabled: true,
    isActive: true,
    createdAt: '2025-10-01T00:00:00Z',
    updatedAt: '2025-10-13T18:00:00Z',
  },
  {
    id: 'config-2',
    partnerId: 'partner-2',
    partnerName: 'COL Financial',
    partnerType: 'STOCK_BROKER',
    assetTypes: ['STOCK', 'ETF'],
    supportedTransactions: ['KYC_SUBMISSION', 'BUY_ORDER', 'SELL_ORDER'],
    fileFormat: 'CSV',
    deliveryMethod: 'SFTP',
    destinationPath: '/incoming/orders/',
    scheduleEnabled: true,
    cronExpression: '0 9,12,15,18 * * 1-5', // Multiple times on weekdays
    lastRunAt: '2025-10-13T15:00:00Z',
    nextRunAt: '2025-10-13T18:00:00Z',
    batchSize: 50,
    includeHeader: true,
    fieldDelimiter: ',',
    encryptionEnabled: true,
    isActive: true,
    createdAt: '2025-10-01T00:00:00Z',
    updatedAt: '2025-10-13T15:00:00Z',
  },
  {
    id: 'config-3',
    partnerId: 'partner-3',
    partnerName: 'Binance',
    partnerType: 'CRYPTO_EXCHANGE',
    assetTypes: ['CRYPTO'],
    supportedTransactions: ['KYC_SUBMISSION', 'BUY_ORDER', 'SELL_ORDER', 'TRANSFER'],
    fileFormat: 'JSON',
    deliveryMethod: 'API',
    destinationPath: 'https://api.binance.com/api/v3/orders',
    scheduleEnabled: true,
    cronExpression: '*/15 * * * *', // Every 15 minutes
    lastRunAt: '2025-10-13T22:45:00Z',
    nextRunAt: '2025-10-13T23:00:00Z',
    batchSize: 200,
    includeHeader: false,
    encryptionEnabled: true,
    isActive: true,
    createdAt: '2025-10-01T00:00:00Z',
    updatedAt: '2025-10-13T22:45:00Z',
  },
]

let mockBatches: IntegrationBatch[] = [
  {
    id: 'batch-1',
    batchNumber: 'BATCH-20251013-001',
    partnerId: 'partner-1',
    partnerName: 'BPI Asset Management',
    transactionType: 'SUBSCRIPTION',
    totalRecords: 5,
    processedRecords: 5,
    failedRecords: 0,
    fileName: 'SUB_BPI_20251013_BATCH001.csv',
    fileSize: 15360,
    fileFormat: 'CSV',
    generatedAt: '2025-10-13T17:45:00Z',
    sentAt: '2025-10-13T18:00:00Z',
    acknowledgedAt: '2025-10-13T19:30:00Z',
    status: 'ACKNOWLEDGED',
    deliveryMethod: 'SFTP',
    subscriptions: ['sub-1', 'sub-2', 'sub-3', 'sub-4', 'sub-5'],
  },
  {
    id: 'batch-2',
    batchNumber: 'BATCH-20251013-002',
    partnerId: 'partner-1',
    partnerName: 'BPI Asset Management',
    transactionType: 'KYC_SUBMISSION',
    totalRecords: 3,
    processedRecords: 3,
    failedRecords: 0,
    fileName: 'KYC_BPI_20251013_BATCH002.csv',
    fileSize: 8192,
    fileFormat: 'CSV',
    generatedAt: '2025-10-13T17:50:00Z',
    sentAt: '2025-10-13T18:00:00Z',
    status: 'SENT',
    deliveryMethod: 'SFTP',
    kycSubmissions: ['kyc-1', 'kyc-2', 'kyc-3'],
  },
]

let mockAuditLogs: AuditLog[] = [
  {
    id: 'audit-1',
    timestamp: '2025-10-13T18:00:00Z',
    action: 'BATCH_SENT',
    transactionType: 'SUBSCRIPTION',
    transactionId: 'batch-1',
    partnerId: 'partner-1',
    partnerName: 'BPI Asset Management',
    userId: 'system',
    userName: 'System Cron Job',
    status: 'SENT',
    details: 'Batch file successfully sent to partner via SFTP',
    fileName: 'SUB_BPI_20251013_BATCH001.csv',
    fileSize: 15360,
    recordCount: 5,
    performedBy: 'system',
  },
  {
    id: 'audit-2',
    timestamp: '2025-10-13T19:30:00Z',
    action: 'BATCH_ACKNOWLEDGED',
    transactionType: 'SUBSCRIPTION',
    transactionId: 'batch-1',
    partnerId: 'partner-1',
    partnerName: 'BPI Asset Management',
    userId: 'system',
    userName: 'System Cron Job',
    status: 'ACKNOWLEDGED',
    details: 'Partner acknowledged receipt of batch file',
    fileName: 'SUB_BPI_20251013_BATCH001.csv',
    recordCount: 5,
    performedBy: 'system',
  },
]

// API methods
export const partnerIntegrationsAPI = {
  // KYC Submissions
  getAllKYC: async (): Promise<KYCSubmission[]> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockKYCSubmissions
  },

  getKYCByStatus: async (status: IntegrationStatus): Promise<KYCSubmission[]> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockKYCSubmissions.filter(k => k.status === status)
  },

  createKYC: async (data: Partial<KYCSubmission>): Promise<KYCSubmission> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    const newKYC: KYCSubmission = {
      id: `kyc-${Date.now()}`,
      userId: data.userId!,
      userName: data.userName!,
      userEmail: data.userEmail!,
      partnerId: data.partnerId!,
      partnerName: data.partnerName!,
      assetId: data.assetId!,
      assetCode: data.assetCode!,
      assetName: data.assetName!,
      firstName: data.firstName!,
      lastName: data.lastName!,
      dateOfBirth: data.dateOfBirth!,
      nationality: data.nationality!,
      identificationType: data.identificationType!,
      identificationNumber: data.identificationNumber!,
      address: data.address!,
      phoneNumber: data.phoneNumber!,
      employmentStatus: data.employmentStatus!,
      sourceOfFunds: data.sourceOfFunds!,
      status: 'PENDING',
      submittedAt: new Date().toISOString(),
      fileGenerated: false,
    }
    mockKYCSubmissions.push(newKYC)
    return newKYC
  },

  // Subscriptions
  getAllSubscriptions: async (): Promise<SubscriptionTransaction[]> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockSubscriptions
  },

  createSubscription: async (data: Partial<SubscriptionTransaction>): Promise<SubscriptionTransaction> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    const newSub: SubscriptionTransaction = {
      id: `sub-${Date.now()}`,
      transactionRef: `SUB-2025-${String(mockSubscriptions.length + 1).padStart(3, '0')}`,
      ...data as any,
      status: 'PENDING',
      submittedAt: new Date().toISOString(),
      fileGenerated: false,
    }
    mockSubscriptions.push(newSub)
    return newSub
  },

  // Redemptions
  getAllRedemptions: async (): Promise<RedemptionTransaction[]> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockRedemptions
  },

  createRedemption: async (data: Partial<RedemptionTransaction>): Promise<RedemptionTransaction> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    const newRed: RedemptionTransaction = {
      id: `red-${Date.now()}`,
      transactionRef: `RED-2025-${String(mockRedemptions.length + 1).padStart(3, '0')}`,
      ...data as any,
      status: 'PENDING',
      submittedAt: new Date().toISOString(),
      fileGenerated: false,
    }
    mockRedemptions.push(newRed)
    return newRed
  },

  // Integration Configs
  getAllConfigs: async (): Promise<IntegrationConfig[]> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockIntegrationConfigs
  },

  getConfigByPartner: async (partnerId: string): Promise<IntegrationConfig | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockIntegrationConfigs.find(c => c.partnerId === partnerId)
  },

  createConfig: async (data: Partial<IntegrationConfig>): Promise<IntegrationConfig> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    const newConfig: IntegrationConfig = {
      id: `config-${Date.now()}`,
      ...data as any,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    mockIntegrationConfigs.push(newConfig)
    return newConfig
  },

  updateConfig: async (id: string, data: Partial<IntegrationConfig>): Promise<IntegrationConfig> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    const index = mockIntegrationConfigs.findIndex(c => c.id === id)
    if (index === -1) throw new Error('Config not found')
    mockIntegrationConfigs[index] = {
      ...mockIntegrationConfigs[index],
      ...data,
      updatedAt: new Date().toISOString(),
    }
    return mockIntegrationConfigs[index]
  },

  // Batches
  getAllBatches: async (): Promise<IntegrationBatch[]> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockBatches.sort((a, b) => 
      new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
    )
  },

  getBatchById: async (id: string): Promise<IntegrationBatch | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockBatches.find(b => b.id === id)
  },

  triggerManualRun: async (partnerId: string, transactionType: TransactionType): Promise<IntegrationBatch> => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    const config = mockIntegrationConfigs.find(c => c.partnerId === partnerId)
    if (!config) throw new Error('Config not found')

    const newBatch: IntegrationBatch = {
      id: `batch-${Date.now()}`,
      batchNumber: `BATCH-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${String(mockBatches.length + 1).padStart(3, '0')}`,
      partnerId: config.partnerId,
      partnerName: config.partnerName,
      transactionType,
      totalRecords: 0,
      processedRecords: 0,
      failedRecords: 0,
      fileName: `${transactionType.split('_')[0]}_${config.partnerName.split(' ')[0]}_${new Date().toISOString().split('T')[0].replace(/-/g, '')}_MANUAL.${config.fileFormat.toLowerCase()}`,
      fileSize: 0,
      fileFormat: config.fileFormat,
      generatedAt: new Date().toISOString(),
      status: 'PROCESSING',
      deliveryMethod: config.deliveryMethod,
    }
    mockBatches.unshift(newBatch)
    
    // Simulate processing
    setTimeout(() => {
      newBatch.status = 'SENT'
      newBatch.sentAt = new Date().toISOString()
      newBatch.processedRecords = newBatch.totalRecords
    }, 2000)

    return newBatch
  },

  // Audit Logs
  getAllAuditLogs: async (): Promise<AuditLog[]> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockAuditLogs.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  },

  getAuditLogsByTransaction: async (transactionId: string): Promise<AuditLog[]> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockAuditLogs.filter(l => l.transactionId === transactionId)
  },

  // Statistics
  getStatistics: async () => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return {
      totalKYC: mockKYCSubmissions.length,
      pendingKYC: mockKYCSubmissions.filter(k => k.status === 'PENDING').length,
      totalSubscriptions: mockSubscriptions.length,
      pendingSubscriptions: mockSubscriptions.filter(s => s.status === 'PENDING').length,
      totalRedemptions: mockRedemptions.length,
      pendingRedemptions: mockRedemptions.filter(r => r.status === 'PENDING').length,
      totalBatches: mockBatches.length,
      totalFilesGenerated: mockBatches.filter(b => b.status === 'SENT' || b.status === 'ACKNOWLEDGED').length,
      totalRecordsProcessed: mockBatches.reduce((sum, b) => sum + b.processedRecords, 0),
    }
  },
}

