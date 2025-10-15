// Operations & Analytics Service
// Centralized operational data, user management, and reporting

export interface TransactionSummary {
  productId: string
  productCode: string
  productName: string
  partnerId: string
  partnerName: string
  partnerType: string
  
  // Transaction counts
  totalTransactions: number
  successfulTransactions: number
  failedTransactions: number
  pendingTransactions: number
  
  // Financial metrics
  totalVolume: number
  currency: string
  averageTransactionSize: number
  
  // Time metrics
  period: string // 'today', 'week', 'month', 'year'
  lastTransactionAt: string
  
  // Performance metrics
  successRate: number
  averageProcessingTime: number // in minutes
  customerSatisfactionScore?: number
}

export interface PartnerPerformance {
  partnerId: string
  partnerName: string
  partnerType: string
  
  // Volume metrics
  totalVolume: number
  transactionCount: number
  activeUsers: number
  
  // Quality metrics
  successRate: number
  averageResponseTime: number // milliseconds
  uptime: number // percentage
  errorRate: number
  
  // Business metrics
  revenue: number
  commission: number
  netRevenue: number
  
  // Ratings
  performanceScore: number // 0-100
  reliabilityScore: number // 0-100
  customerRating: number // 0-5
  
  // Trends
  growthRate: number // percentage
  period: string
}

export interface ProductPerformance {
  productId: string
  productCode: string
  productName: string
  productType: string
  
  // User metrics
  totalUsers: number
  activeUsers: number
  newUsers: number
  churnedUsers: number
  
  // Transaction metrics
  totalTransactions: number
  transactionVolume: number
  averageTransactionValue: number
  
  // Financial metrics
  totalRevenue: number
  totalInvestment: number
  averageReturn: number // percentage
  
  // Engagement metrics
  engagementRate: number // percentage
  retentionRate: number // percentage
  conversionRate: number // percentage
  
  // Performance score
  performanceScore: number // 0-100
  popularityRank: number
  
  // Associated partners
  partnerCount: number
  partners: Array<{ id: string; name: string }>
}

export interface UserAccount {
  id: string
  email: string
  firstName: string
  lastName: string
  phoneNumber: string
  
  // Status
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION'
  kycStatus: 'VERIFIED' | 'PENDING' | 'REJECTED' | 'NOT_STARTED'
  
  // Onboarded products
  onboardedProducts: Array<{
    productId: string
    productCode: string
    productName: string
    onboardedAt: string
    status: 'ACTIVE' | 'INACTIVE'
  }>
  
  // Portfolio summary
  totalInvestment: number
  currentValue: number
  totalReturn: number
  returnPercentage: number
  
  // Activity
  lastLoginAt: string
  lastTransactionAt: string
  transactionCount: number
  
  // Dates
  createdAt: string
  verifiedAt?: string
}

export interface ReportConfig {
  id: string
  name: string
  type: 'TRANSACTION' | 'USER' | 'PERFORMANCE' | 'PORTFOLIO' | 'AUDIT' | 'CUSTOM'
  description: string
  
  // Filters
  dateRange: { start: string; end: string }
  products?: string[]
  partners?: string[]
  users?: string[]
  
  // Format
  format: 'PDF' | 'CSV' | 'EXCEL' | 'JSON'
  schedule?: string // cron expression
  
  // Status
  lastGeneratedAt?: string
  status: 'SCHEDULED' | 'GENERATING' | 'COMPLETED' | 'FAILED'
}

// Mock data
const mockTransactionSummaries: TransactionSummary[] = [
  {
    productId: 'product-1',
    productCode: 'PAMI-EF',
    productName: 'Philippine Equity Fund',
    partnerId: 'partner-1',
    partnerName: 'BPI Asset Management',
    partnerType: 'FUND_HOUSE',
    totalTransactions: 156,
    successfulTransactions: 152,
    failedTransactions: 2,
    pendingTransactions: 2,
    totalVolume: 15600000,
    currency: 'PHP',
    averageTransactionSize: 100000,
    period: 'month',
    lastTransactionAt: '2025-10-13T20:30:00Z',
    successRate: 97.4,
    averageProcessingTime: 45,
    customerSatisfactionScore: 4.7,
  },
  {
    productId: 'product-2',
    productCode: 'AAPL',
    productName: 'Apple Inc.',
    partnerId: 'partner-2',
    partnerName: 'COL Financial',
    partnerType: 'STOCK_BROKER',
    totalTransactions: 342,
    successfulTransactions: 338,
    failedTransactions: 1,
    pendingTransactions: 3,
    totalVolume: 25400000,
    currency: 'PHP',
    averageTransactionSize: 74269,
    period: 'month',
    lastTransactionAt: '2025-10-13T22:15:00Z',
    successRate: 98.8,
    averageProcessingTime: 12,
    customerSatisfactionScore: 4.9,
  },
]

const mockPartnerPerformance: PartnerPerformance[] = [
  {
    partnerId: 'partner-1',
    partnerName: 'BPI Asset Management',
    partnerType: 'FUND_HOUSE',
    totalVolume: 45600000,
    transactionCount: 456,
    activeUsers: 1234,
    successRate: 98.5,
    averageResponseTime: 2500,
    uptime: 99.9,
    errorRate: 0.1,
    revenue: 456000,
    commission: 45600,
    netRevenue: 410400,
    performanceScore: 95,
    reliabilityScore: 98,
    customerRating: 4.7,
    growthRate: 15.3,
    period: 'month',
  },
  {
    partnerId: 'partner-2',
    partnerName: 'COL Financial',
    partnerType: 'STOCK_BROKER',
    totalVolume: 125400000,
    transactionCount: 1842,
    activeUsers: 3421,
    successRate: 99.2,
    averageResponseTime: 800,
    uptime: 99.95,
    errorRate: 0.05,
    revenue: 1254000,
    commission: 125400,
    netRevenue: 1128600,
    performanceScore: 97,
    reliabilityScore: 99,
    customerRating: 4.9,
    growthRate: 28.5,
    period: 'month',
  },
]

const mockProductPerformance: ProductPerformance[] = [
  {
    productId: 'product-1',
    productCode: 'PAMI-EF',
    productName: 'Philippine Equity Fund',
    productType: 'UITF',
    totalUsers: 1234,
    activeUsers: 987,
    newUsers: 145,
    churnedUsers: 23,
    totalTransactions: 456,
    transactionVolume: 45600000,
    averageTransactionValue: 100000,
    totalRevenue: 456000,
    totalInvestment: 45600000,
    averageReturn: 12.5,
    engagementRate: 79.9,
    retentionRate: 94.3,
    conversionRate: 15.2,
    performanceScore: 92,
    popularityRank: 2,
    partnerCount: 1,
    partners: [{ id: 'partner-1', name: 'BPI Asset Management' }],
  },
  {
    productId: 'product-2',
    productCode: 'GSTOCKS',
    productName: 'GStocks',
    productType: 'STOCK',
    totalUsers: 3421,
    activeUsers: 2876,
    newUsers: 428,
    churnedUsers: 87,
    totalTransactions: 1842,
    transactionVolume: 125400000,
    averageTransactionValue: 68100,
    totalRevenue: 1254000,
    totalInvestment: 125400000,
    averageReturn: 18.3,
    engagementRate: 84.1,
    retentionRate: 96.2,
    conversionRate: 22.5,
    performanceScore: 96,
    popularityRank: 1,
    partnerCount: 2,
    partners: [
      { id: 'partner-2', name: 'COL Financial' },
      { id: 'partner-4', name: 'BPI Trade' },
    ],
  },
]

const mockUsers: UserAccount[] = [
  {
    id: 'user-1',
    email: 'juan.delacruz@email.com',
    firstName: 'Juan',
    lastName: 'Dela Cruz',
    phoneNumber: '+63 917 123 4567',
    status: 'ACTIVE',
    kycStatus: 'VERIFIED',
    onboardedProducts: [
      {
        productId: 'product-1',
        productCode: 'PAMI-EF',
        productName: 'Philippine Equity Fund',
        onboardedAt: '2025-08-15T00:00:00Z',
        status: 'ACTIVE',
      },
      {
        productId: 'product-2',
        productCode: 'GSTOCKS',
        productName: 'GStocks',
        onboardedAt: '2025-09-01T00:00:00Z',
        status: 'ACTIVE',
      },
    ],
    totalInvestment: 125000,
    currentValue: 142500,
    totalReturn: 17500,
    returnPercentage: 14.0,
    lastLoginAt: '2025-10-13T22:30:00Z',
    lastTransactionAt: '2025-10-13T18:15:00Z',
    transactionCount: 24,
    createdAt: '2025-08-15T00:00:00Z',
    verifiedAt: '2025-08-16T10:30:00Z',
  },
]

// API methods
export const operationsAPI = {
  // Transaction Summaries
  getTransactionSummaries: async (_period = 'month'): Promise<TransactionSummary[]> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockTransactionSummaries
  },

  getTransactionSummaryByProduct: async (productId: string): Promise<TransactionSummary[]> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockTransactionSummaries.filter(s => s.productId === productId)
  },

  getTransactionSummaryByPartner: async (partnerId: string): Promise<TransactionSummary[]> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockTransactionSummaries.filter(s => s.partnerId === partnerId)
  },

  // Partner Performance
  getAllPartnerPerformance: async (): Promise<PartnerPerformance[]> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockPartnerPerformance
  },

  getPartnerPerformance: async (partnerId: string): Promise<PartnerPerformance | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockPartnerPerformance.find(p => p.partnerId === partnerId)
  },

  // Product Performance
  getAllProductPerformance: async (): Promise<ProductPerformance[]> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockProductPerformance
  },

  getProductPerformance: async (productId: string): Promise<ProductPerformance | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockProductPerformance.find(p => p.productId === productId)
  },

  // User Management
  getAllUsers: async (): Promise<UserAccount[]> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockUsers
  },

  getUserById: async (userId: string): Promise<UserAccount | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockUsers.find(u => u.id === userId)
  },

  createUser: async (data: Partial<UserAccount>): Promise<UserAccount> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    const newUser: UserAccount = {
      id: `user-${Date.now()}`,
      email: data.email!,
      firstName: data.firstName!,
      lastName: data.lastName!,
      phoneNumber: data.phoneNumber!,
      status: 'PENDING_VERIFICATION',
      kycStatus: 'NOT_STARTED',
      onboardedProducts: [],
      totalInvestment: 0,
      currentValue: 0,
      totalReturn: 0,
      returnPercentage: 0,
      lastLoginAt: '',
      lastTransactionAt: '',
      transactionCount: 0,
      createdAt: new Date().toISOString(),
    }
    mockUsers.push(newUser)
    return newUser
  },

  updateUser: async (userId: string, data: Partial<UserAccount>): Promise<UserAccount> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    const index = mockUsers.findIndex(u => u.id === userId)
    if (index === -1) throw new Error('User not found')
    mockUsers[index] = { ...mockUsers[index], ...data }
    return mockUsers[index]
  },

  // Report Generation
  generateReport: async (config: Partial<ReportConfig>): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 2000))
    return `report-${Date.now()}.${config.format?.toLowerCase()}`
  },

  // Dashboard Statistics
  getOperationalStats: async () => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return {
      totalUsers: 5432,
      activeUsers: 4521,
      totalTransactions: 2298,
      transactionVolume: 171000000,
      totalRevenue: 1710000,
      successRate: 98.9,
      activePartners: 12,
      activeProducts: 8,
      topProduct: 'GStocks',
      topPartner: 'COL Financial',
    }
  },
}



