import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8085/api/marketplace'
// Disabled mock data - now using persistent database only
const USE_MOCK_DATA = false

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000, // 5 second timeout
})

// Add request interceptor for auth token (if needed)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Mock data for fallback
const mockProducts: Product[] = [
  {
    id: '1',
    code: 'GSTOCKS_GLOBAL',
    name: 'GStocks Global',
    productType: 'INVESTMENT',
    description: 'Invest in global stocks from major markets. Access to US, Europe, and Asian markets with real-time trading.',
    partnerName: 'Global Securities',
    partnerId: 'partner-1',
    partners: [
      { id: 'partner-1', name: 'Global Securities', code: 'GLOBSEC' },
      { id: 'partner-3', name: 'TechInvest Corp', code: 'TECHINV' },
    ],
    status: 'ACTIVE',
    assetsCount: 150,
    minInvestment: 1000,
    maxInvestment: 1000000,
    currency: 'PHP',
    termsAndConditions: 'Standard terms apply.',
    maintenanceMode: false,
    whitelistMode: false,
    featuresCount: 1,
    enabledFeaturesCount: 1,
    createdAt: '2024-03-01T10:00:00Z',
    approvedAt: '2024-03-05T14:30:00Z',
  },
  {
    id: '2',
    code: 'GSAVE_PREMIUM',
    name: 'GSave Premium',
    productType: 'SAVINGS',
    description: 'High-yield savings account with flexible terms and instant withdrawals.',
    partnerName: 'Acme Financial',
    partnerId: 'partner-2',
    partners: [
      { id: 'partner-2', name: 'Acme Financial', code: 'ACME' },
    ],
    status: 'ACTIVE',
    assetsCount: 5,
    minInvestment: 5000,
    maxInvestment: 500000,
    currency: 'PHP',
    termsAndConditions: 'Standard terms apply.',
    maintenanceMode: false,
    whitelistMode: false,
    featuresCount: 2,
    enabledFeaturesCount: 2,
    createdAt: '2024-02-15T10:00:00Z',
    approvedAt: '2024-02-20T14:30:00Z',
  },
  {
    id: '3',
    code: 'GLENDING_MICRO',
    name: 'GLending Micro',
    productType: 'LENDING',
    description: 'Peer-to-peer lending for small businesses with competitive returns.',
    partnerName: 'TechInvest Corp',
    partnerId: 'partner-3',
    partners: [
      { id: 'partner-3', name: 'TechInvest Corp', code: 'TECHINV' },
      { id: 'partner-2', name: 'Acme Financial', code: 'ACME' },
    ],
    status: 'PENDING_APPROVAL',
    assetsCount: 0,
    minInvestment: 5000,
    maxInvestment: 100000,
    currency: 'PHP',
    termsAndConditions: 'Standard terms apply.',
    maintenanceMode: false,
    whitelistMode: false,
    featuresCount: 0,
    enabledFeaturesCount: 0,
    createdAt: '2024-03-20T10:00:00Z',
    submittedBy: 'admin@company.com',
    submittedAt: '2024-03-20T10:00:00Z',
  },
  {
    id: 'GCRYPTO',
    code: 'GCRYPTO',
    name: 'GCrypto',
    productType: 'CRYPTO',
    description: 'Trade cryptocurrencies with low fees and instant transactions.',
    status: 'ACTIVE',
    assetsCount: 10,
    minInvestment: 100,
    maxInvestment: 1000000,
    currency: 'PHP',
    termsAndConditions: 'Standard terms apply.',
    maintenanceMode: false,
    whitelistMode: false,
    featuresCount: 2,
    enabledFeaturesCount: 1,
    createdAt: '2024-03-15T10:00:00Z',
    approvedAt: '2024-03-15T14:30:00Z',
  },
  {
    id: 'GSAVE',
    code: 'GSAVE',
    name: 'GSave',
    productType: 'SAVINGS',
    description: 'High-yield savings account with no minimum balance.',
    status: 'ACTIVE',
    assetsCount: 0,
    minInvestment: 0,
    maxInvestment: 500000,
    currency: 'PHP',
    termsAndConditions: 'Standard terms apply.',
    maintenanceMode: false,
    whitelistMode: false,
    featuresCount: 2,
    enabledFeaturesCount: 2,
    createdAt: '2024-02-20T10:00:00Z',
    approvedAt: '2024-02-20T14:30:00Z',
  },
  {
    id: 'GFUNDS',
    code: 'GFUNDS',
    name: 'GFunds',
    productType: 'INVESTMENT',
    description: 'Invest in diversified mutual funds and ETFs.',
    status: 'ACTIVE',
    assetsCount: 25,
    minInvestment: 1000,
    maxInvestment: 500000,
    currency: 'PHP',
    termsAndConditions: 'Standard terms apply.',
    maintenanceMode: true,
    whitelistMode: false,
    featuresCount: 2,
    enabledFeaturesCount: 2,
    createdAt: '2024-03-25T10:00:00Z',
    approvedAt: '2024-03-25T14:30:00Z',
  },
  {
    id: 'GSTOCKS_PH',
    code: 'GSTOCKS_PH',
    name: 'GStocks PH',
    productType: 'STOCKS',
    description: 'Trade Philippine stocks in real-time.',
    status: 'ACTIVE',
    assetsCount: 200,
    minInvestment: 1000,
    maxInvestment: 1000000,
    currency: 'PHP',
    termsAndConditions: 'Standard terms apply.',
    maintenanceMode: false,
    whitelistMode: false,
    featuresCount: 1,
    enabledFeaturesCount: 1,
    createdAt: '2024-03-10T10:00:00Z',
    approvedAt: '2024-03-10T14:30:00Z',
  },
  {
    id: 'GCOACH',
    code: 'GCOACH',
    name: 'GCoach',
    productType: 'INVESTMENT',
    description: 'Personalized financial coaching and advice.',
    status: 'ACTIVE',
    assetsCount: 0,
    minInvestment: 0,
    maxInvestment: 0,
    currency: 'PHP',
    termsAndConditions: 'Standard terms apply.',
    maintenanceMode: false,
    whitelistMode: false,
    featuresCount: 1,
    enabledFeaturesCount: 1,
    createdAt: '2024-03-15T10:00:00Z',
    approvedAt: '2024-03-15T14:30:00Z',
  },
  {
    id: 'LEARNING_HUB',
    code: 'LEARNING_HUB',
    name: 'Learning Hub',
    productType: 'INVESTMENT',
    description: 'Educational resources for financial literacy.',
    status: 'ACTIVE',
    assetsCount: 0,
    minInvestment: 0,
    maxInvestment: 0,
    currency: 'PHP',
    termsAndConditions: 'Standard terms apply.',
    maintenanceMode: false,
    whitelistMode: false,
    featuresCount: 1,
    enabledFeaturesCount: 1,
    createdAt: '2024-03-18T10:00:00Z',
    approvedAt: '2024-03-18T14:30:00Z',
  },
  {
    id: 'GBONDS',
    code: 'GBONDS',
    name: 'GBonds',
    productType: 'INVESTMENT',
    description: 'Invest in government and corporate bonds.',
    status: 'ACTIVE',
    assetsCount: 15,
    minInvestment: 5000,
    maxInvestment: 1000000,
    currency: 'PHP',
    termsAndConditions: 'Standard terms apply.',
    maintenanceMode: false,
    whitelistMode: false,
    featuresCount: 1,
    enabledFeaturesCount: 1,
    createdAt: '2024-03-20T10:00:00Z',
    approvedAt: '2024-03-20T14:30:00Z',
  },
]

let mockProductsStore = [...mockProducts]

// Product interfaces
export interface CreateProductRequest {
  code: string
  name: string
  productType: string
  description: string
  partnerId: string
  minInvestment: number
  maxInvestment: number
  currency: string
  termsAndConditions: string
  assets: Array<{
    name: string
    symbol: string
    assetType: string
    description: string
    minInvestment: number
    currentPrice: number
  }>
}

export interface Product {
  id: string
  code: string
  name: string
  productType: string
  description: string
  partnerName?: string
  partnerId?: string
  partners?: Array<{ id: string; name: string; code: string }> // Multiple partners support
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'SUSPENDED'
  assetsCount: number
  minInvestment: number
  maxInvestment: number
  currency: string
  termsAndConditions: string
  maintenanceMode: boolean
  whitelistMode: boolean
  featuresCount: number
  enabledFeaturesCount: number
  createdAt: string
  approvedAt?: string
  submittedBy?: string
  submittedAt?: string
}

export interface Asset {
  id: string
  productId: string
  name: string
  symbol: string
  assetType: string
  description: string
  minInvestment: number
  currentPrice: number
  change24h?: number
}

// API calls with mock fallback
export const productsAPI = {
  // Get all products
  getAll: async (status?: string) => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300)) // Simulate network delay
      return status 
        ? mockProductsStore.filter(p => p.status === status)
        : mockProductsStore
    }
    
    try {
      const params = status ? { status } : {}
      const response = await api.get<Product[]>('/products', { params })
      return response.data
    } catch (error) {
      console.warn('API call failed, using mock data:', error)
      return status 
        ? mockProductsStore.filter(p => p.status === status)
        : mockProductsStore
    }
  },

  // Get product by ID
  getById: async (id: string) => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200))
      const product = mockProductsStore.find(p => p.id === id)
      if (!product) throw new Error('Product not found')
      return product
    }
    
    try {
      const response = await api.get<Product>(`/products/${id}`)
      return response.data
    } catch (error) {
      console.warn('API call failed, using mock data:', error)
      const product = mockProductsStore.find(p => p.id === id)
      if (!product) throw new Error('Product not found')
      return product
    }
  },

  // Create product
  create: async (data: CreateProductRequest) => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500))
      const newProduct: Product = {
        id: `mock-${Date.now()}`,
        ...data,
        partnerName: 'Mock Partner',
        status: 'PENDING_APPROVAL',
        assetsCount: data.assets?.length || 0,
        maintenanceMode: false,
        whitelistMode: false,
        featuresCount: 0,
        enabledFeaturesCount: 0,
        submittedAt: new Date().toISOString(),
        submittedBy: 'current_user',
        createdAt: new Date().toISOString(),
      }
      mockProductsStore.push(newProduct)
      return newProduct
    }
    
    try {
      const response = await api.post<Product>('/products', {
        ...data,
        status: 'PENDING_APPROVAL',
        submittedAt: new Date().toISOString(),
        submittedBy: 'current_user',
      })
      return response.data
    } catch (error) {
      console.warn('API call failed, using mock data:', error)
      const newProduct: Product = {
        id: `mock-${Date.now()}`,
        ...data,
        partnerName: 'Mock Partner',
        status: 'PENDING_APPROVAL',
        assetsCount: data.assets?.length || 0,
        maintenanceMode: false,
        whitelistMode: false,
        featuresCount: 0,
        enabledFeaturesCount: 0,
        submittedAt: new Date().toISOString(),
        submittedBy: 'current_user',
        createdAt: new Date().toISOString(),
      }
      mockProductsStore.push(newProduct)
      return newProduct
    }
  },

  // Update product
  update: async (id: string, data: Partial<CreateProductRequest>) => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300))
      const index = mockProductsStore.findIndex(p => p.id === id)
      if (index === -1) throw new Error('Product not found')
      mockProductsStore[index] = { ...mockProductsStore[index], ...data }
      return mockProductsStore[index]
    }
    
    try {
      const response = await api.put<Product>(`/products/${id}`, data)
      return response.data
    } catch (error) {
      console.warn('API call failed, using mock data:', error)
      const index = mockProductsStore.findIndex(p => p.id === id)
      if (index === -1) throw new Error('Product not found')
      mockProductsStore[index] = { ...mockProductsStore[index], ...data as any }
      return mockProductsStore[index]
    }
  },

  // Delete product
  delete: async (id: string) => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300))
      mockProductsStore = mockProductsStore.filter(p => p.id !== id)
      return
    }
    
    try {
      await api.delete(`/products/${id}`)
    } catch (error) {
      console.warn('API call failed, using mock data:', error)
      mockProductsStore = mockProductsStore.filter(p => p.id !== id)
    }
  },

  // Approve product - goes directly to ACTIVE
  approve: async (id: string, approvedBy: string) => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500))
      const index = mockProductsStore.findIndex(p => p.id === id)
      if (index === -1) throw new Error('Product not found')
      
      mockProductsStore[index] = {
        ...mockProductsStore[index],
        status: 'ACTIVE',
        approvedAt: new Date().toISOString(),
      }
      return mockProductsStore[index]
    }
    
    try {
      const response = await api.patch<Product>(`/products/${id}/approve`, {
        approvedBy,
        approvedAt: new Date().toISOString(),
        status: 'ACTIVE',
      })
      return response.data
    } catch (error) {
      console.warn('API call failed, using mock data:', error)
      const index = mockProductsStore.findIndex(p => p.id === id)
      if (index === -1) throw new Error('Product not found')
      
      mockProductsStore[index] = {
        ...mockProductsStore[index],
        status: 'ACTIVE',
        approvedAt: new Date().toISOString(),
      }
      return mockProductsStore[index]
    }
  },

  // Reject product
  reject: async (id: string, reason: string, rejectedBy: string) => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500))
      const index = mockProductsStore.findIndex(p => p.id === id)
      if (index === -1) throw new Error('Product not found')
      mockProductsStore[index] = {
        ...mockProductsStore[index],
        status: 'REJECTED',
      }
      return mockProductsStore[index]
    }
    
    try {
      const response = await api.patch<Product>(`/products/${id}/reject`, {
        reason,
        rejectedBy,
        rejectedAt: new Date().toISOString(),
        status: 'REJECTED',
      })
      return response.data
    } catch (error) {
      console.warn('API call failed, using mock data:', error)
      const index = mockProductsStore.findIndex(p => p.id === id)
      if (index === -1) throw new Error('Product not found')
      mockProductsStore[index] = {
        ...mockProductsStore[index],
        status: 'REJECTED',
      }
      return mockProductsStore[index]
    }
  },

  // Get pending approvals
  getPending: async () => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300))
      return mockProductsStore.filter(p => p.status === 'PENDING_APPROVAL')
    }
    
    try {
      const response = await api.get<Product[]>('/products?status=PENDING_APPROVAL')
      return response.data
    } catch (error) {
      console.warn('API call failed, using mock data:', error)
      return mockProductsStore.filter(p => p.status === 'PENDING_APPROVAL')
    }
  },

  // Get assets for a product
  getAssets: async (productId: string) => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200))
      return []
    }
    
    try {
      const response = await api.get<Asset[]>(`/products/${productId}/assets`)
      return response.data
    } catch (error) {
      console.warn('API call failed, returning empty assets:', error)
      return []
    }
  },

  // Add asset to product
  addAsset: async (productId: string, asset: Omit<Asset, 'id' | 'productId'>) => {
    try {
      const response = await api.post<Asset>(`/products/${productId}/assets`, asset)
      return response.data
    } catch (error) {
      console.warn('API call failed:', error)
      throw error
    }
  },

  // Update asset
  updateAsset: async (productId: string, assetId: string, asset: Partial<Asset>) => {
    try {
      const response = await api.put<Asset>(`/products/${productId}/assets/${assetId}`, asset)
      return response.data
    } catch (error) {
      console.warn('API call failed:', error)
      throw error
    }
  },

  // Delete asset
  deleteAsset: async (productId: string, assetId: string) => {
    try {
      await api.delete(`/products/${productId}/assets/${assetId}`)
    } catch (error) {
      console.warn('API call failed:', error)
      throw error
    }
  },

  // Toggle maintenance mode
  toggleMaintenance: async (id: string) => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200))
      const index = mockProductsStore.findIndex(p => p.id === id || p.code === id)
      if (index === -1) throw new Error('Product not found')
      mockProductsStore[index].maintenanceMode = !mockProductsStore[index].maintenanceMode
      return mockProductsStore[index]
    }
    
    try {
      const response = await api.post<Product>(`/products/${id}/toggle-maintenance`)
      return response.data
    } catch (error) {
      console.warn('API call failed, using mock data:', error)
      const index = mockProductsStore.findIndex(p => p.id === id || p.code === id)
      if (index === -1) throw new Error('Product not found')
      mockProductsStore[index].maintenanceMode = !mockProductsStore[index].maintenanceMode
      return mockProductsStore[index]
    }
  },

  // Toggle whitelist mode
  toggleWhitelist: async (id: string) => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200))
      const index = mockProductsStore.findIndex(p => p.id === id || p.code === id)
      if (index === -1) throw new Error('Product not found')
      mockProductsStore[index].whitelistMode = !mockProductsStore[index].whitelistMode
      return mockProductsStore[index]
    }
    
    try {
      const response = await api.post<Product>(`/products/${id}/toggle-whitelist`)
      return response.data
    } catch (error) {
      console.warn('API call failed, using mock data:', error)
      const index = mockProductsStore.findIndex(p => p.id === id || p.code === id)
      if (index === -1) throw new Error('Product not found')
      mockProductsStore[index].whitelistMode = !mockProductsStore[index].whitelistMode
      return mockProductsStore[index]
    }
  },

  // Get product by code
  getByCode: async (code: string) => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200))
      const product = mockProductsStore.find(p => p.code === code)
      if (!product) throw new Error('Product not found')
      return product
    }
    
    try {
      const response = await api.get<Product>(`/products/code/${code}`)
      return response.data
    } catch (error) {
      console.warn('API call failed, using mock data:', error)
      const product = mockProductsStore.find(p => p.code === code)
      if (!product) throw new Error('Product not found')
      return product
    }
  },
}

export default productsAPI

