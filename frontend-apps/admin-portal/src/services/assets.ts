import axios from 'axios'
import { API_BASE_URL } from '../config/api'

// Disabled mock data - now using persistent database only
const USE_MOCK_DATA = false

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
})

// Add request interceptor for auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Mock partners reference (simplified for asset submissions)
const mockPartnersStore = [
  { id: 'partner-1', name: 'Global Securities', code: 'GLOBSEC' },
  { id: 'partner-2', name: 'Acme Financial', code: 'ACME' },
  { id: 'partner-3', name: 'TechInvest Corp', code: 'TECHINV' },
]

// Mock assets data
const mockAssets: Asset[] = [
  {
    id: 'asset-1',
    code: 'AAPL',
    name: 'Apple Inc.',
    assetType: 'STOCK',
    category: 'Technology',
    description: 'Apple Inc. common stock',
    productId: '1',
    productName: 'GStocks Global',
    partnerId: 'partner-1',
    partnerName: 'Global Securities',
    status: 'ACTIVE',
    submissionSource: 'ADMIN',
    minInvestment: 1000,
    currentPrice: 175.50,
    currency: 'USD',
    change24h: 2.5,
    marketCap: '2.8T',
    createdAt: '2024-03-01T10:00:00Z',
    approvedAt: '2024-03-02T14:30:00Z',
  },
  {
    id: 'asset-2',
    code: 'GOOGL',
    name: 'Alphabet Inc.',
    assetType: 'STOCK',
    category: 'Technology',
    description: 'Alphabet Inc. Class A common stock',
    productId: '1',
    productName: 'GStocks Global',
    partnerId: 'partner-1',
    partnerName: 'Global Securities',
    status: 'ACTIVE',
    submissionSource: 'ADMIN',
    minInvestment: 1000,
    currentPrice: 142.30,
    currency: 'USD',
    change24h: -1.2,
    marketCap: '1.8T',
    createdAt: '2024-03-01T10:00:00Z',
    approvedAt: '2024-03-02T14:30:00Z',
  },
  {
    id: 'asset-3',
    code: 'BTC',
    name: 'Bitcoin',
    assetType: 'CRYPTO',
    category: 'Cryptocurrency',
    description: 'Bitcoin cryptocurrency',
    productId: '3',
    productName: 'GCrypto Trading',
    partnerId: 'partner-3',
    partnerName: 'TechInvest Corp',
    status: 'PENDING_APPROVAL',
    submissionSource: 'PARTNER_API',
    minInvestment: 500,
    currentPrice: 67500.00,
    currency: 'USD',
    change24h: 5.3,
    marketCap: '1.3T',
    createdAt: '2024-03-25T10:00:00Z',
    submittedBy: 'TechInvest Corp API',
    submittedAt: '2024-03-25T10:00:00Z',
  },
  {
    id: 'asset-4',
    code: 'ETH',
    name: 'Ethereum',
    assetType: 'CRYPTO',
    category: 'Cryptocurrency',
    description: 'Ethereum smart contract platform',
    productId: '3',
    productName: 'GCrypto Trading',
    partnerId: 'partner-3',
    partnerName: 'TechInvest Corp',
    status: 'PENDING_APPROVAL',
    submissionSource: 'PARTNER_API',
    minInvestment: 500,
    currentPrice: 3500.00,
    currency: 'USD',
    change24h: 3.8,
    marketCap: '420B',
    createdAt: '2024-03-26T08:30:00Z',
    submittedBy: 'TechInvest Corp API',
    submittedAt: '2024-03-26T08:30:00Z',
  },
]

let mockAssetsStore = [...mockAssets]

export interface CreateAssetRequest {
  code: string
  name: string
  assetType: 'STOCK' | 'BOND' | 'CRYPTO' | 'FUND' | 'ETF' | 'COMMODITY' | 'FOREX' | 'OTHER'
  category: string
  description: string
  productId: string
  partnerId: string
  minInvestment: number
  currentPrice: number
  currency: string
  marketCap?: string
  metadata?: Record<string, any>
}

export interface Asset {
  id: string
  code: string
  name: string
  assetType: 'STOCK' | 'BOND' | 'CRYPTO' | 'FUND' | 'ETF' | 'COMMODITY' | 'FOREX' | 'UITF' | 'MUTUAL_FUND' | 'OTHER'
  category: string
  description: string
  productId: string
  productName: string
  partnerId: string
  partnerName: string
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'INACTIVE'
  submissionSource: 'ADMIN' | 'PARTNER_API' // NEW: Track who submitted
  minInvestment: number
  currentPrice: number
  currency: string
  change24h?: number
  marketCap?: string
  metadata?: Record<string, any>
  partnerApiKey?: string // NEW: Track which partner submitted via API
  
  // Data Integration Fields
  hasDataIntegration?: boolean // Whether asset has active data feeds
  integrationsCount?: number // Number of active integrations
  lastDataUpdate?: string // Last time data was received
  dataUpdateFrequency?: string // e.g., "Real-time", "Daily", "Every 30 min"
  
  // UITF / Fund-specific fields
  fundManager?: string
  fundHouse?: string
  navPerUnit?: number // Net Asset Value per unit (NAVPU)
  fundSize?: string
  inceptionDate?: string
  riskRating?: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY_HIGH'
  
  // Investment calculation fields
  investmentAmount?: number // Amount invested
  indicativeUnits?: number // Number of units
  indicativeNavpu?: number // Indicative NAVPU at time of calculation
  navAsOfDate?: string // Date when NAV was calculated
  
  createdAt: string
  submittedBy?: string
  submittedAt?: string
  approvedBy?: string
  approvedAt?: string
  rejectedBy?: string
  rejectedAt?: string
  rejectionReason?: string
}

export const assetsAPI = {
  // Get all assets
  getAll: async (status?: string) => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300))
      return status
        ? mockAssetsStore.filter(a => a.status === status)
        : mockAssetsStore
    }

    try {
      const params = status ? { status } : {}
      const response = await api.get<Asset[]>('/assets', { params })
      return response.data
    } catch (error) {
      console.warn('API call failed, using mock data:', error)
      return status
        ? mockAssetsStore.filter(a => a.status === status)
        : mockAssetsStore
    }
  },

  // Get asset by ID
  getById: async (id: string) => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200))
      const asset = mockAssetsStore.find(a => a.id === id)
      if (!asset) throw new Error('Asset not found')
      return asset
    }

    try {
      const response = await api.get<Asset>(`/assets/${id}`)
      return response.data
    } catch (error) {
      console.warn('API call failed, using mock data:', error)
      const asset = mockAssetsStore.find(a => a.id === id)
      if (!asset) throw new Error('Asset not found')
      return asset
    }
  },

  // Get assets by product
  getByProduct: async (productId: string) => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200))
      return mockAssetsStore.filter(a => a.productId === productId)
    }

    try {
      const response = await api.get<Asset[]>(`/assets?productId=${productId}`)
      return response.data
    } catch (error) {
      console.warn('API call failed, using mock data:', error)
      return mockAssetsStore.filter(a => a.productId === productId)
    }
  },

  // Get assets by partner
  getByPartner: async (partnerId: string) => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200))
      return mockAssetsStore.filter(a => a.partnerId === partnerId)
    }

    try {
      const response = await api.get<Asset[]>(`/assets?partnerId=${partnerId}`)
      return response.data
    } catch (error) {
      console.warn('API call failed, using mock data:', error)
      return mockAssetsStore.filter(a => a.partnerId === partnerId)
    }
  },

  // Create asset
  create: async (data: CreateAssetRequest) => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Fetch actual product and partner names
      const { productsAPI } = await import('./products')
      const { partnersAPI } = await import('./partners')
      
      const allProducts = await productsAPI.getAll()
      const allPartners = await partnersAPI.getAll()
      
      const product = allProducts.find(p => p.id === data.productId)
      const partner = allPartners.find(p => p.id === data.partnerId)
      
      const newAsset: Asset = {
        id: `mock-asset-${Date.now()}`,
        ...data,
        productName: product?.name || 'Unknown Product',
        partnerName: partner?.name || 'Unknown Partner',
        status: 'PENDING_APPROVAL',
        submissionSource: 'ADMIN',
        submittedAt: new Date().toISOString(),
        submittedBy: 'current_user',
        createdAt: new Date().toISOString(),
      }
      mockAssetsStore.push(newAsset)
      return newAsset
    }

    try {
      const response = await api.post<Asset>('/assets', {
        ...data,
        status: 'PENDING_APPROVAL',
        submittedAt: new Date().toISOString(),
        submittedBy: 'current_user',
      })
      return response.data
    } catch (error) {
      console.warn('API call failed, using mock data:', error)
      
      // Fetch actual product and partner names
      const { productsAPI } = await import('./products')
      const { partnersAPI } = await import('./partners')
      
      const allProducts = await productsAPI.getAll()
      const allPartners = await partnersAPI.getAll()
      
      const product = allProducts.find(p => p.id === data.productId)
      const partner = allPartners.find(p => p.id === data.partnerId)
      
      const newAsset: Asset = {
        id: `mock-asset-${Date.now()}`,
        ...data,
        productName: product?.name || 'Unknown Product',
        partnerName: partner?.name || 'Unknown Partner',
        status: 'PENDING_APPROVAL',
        submissionSource: 'ADMIN',
        submittedAt: new Date().toISOString(),
        submittedBy: 'current_user',
        createdAt: new Date().toISOString(),
      }
      mockAssetsStore.push(newAsset)
      return newAsset
    }
  },

  // NEW: Partner API endpoint to submit assets
  submitFromPartner: async (partnerApiKey: string, data: Omit<CreateAssetRequest, 'partnerId'>) => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Find partner by API key (in real implementation)
      const partner = mockPartnersStore.find(p => p.id === 'partner-3') // Mock: use TechInvest
      
      if (!partner) {
        throw new Error('Invalid partner API key')
      }

      const newAsset: Asset = {
        id: `mock-asset-${Date.now()}`,
        ...data,
        partnerId: partner.id,
        productName: 'Mock Product',
        partnerName: partner.name,
        status: 'PENDING_APPROVAL',
        submissionSource: 'PARTNER_API',
        partnerApiKey,
        submittedAt: new Date().toISOString(),
        submittedBy: `${partner.name} API`,
        createdAt: new Date().toISOString(),
      }
      mockAssetsStore.push(newAsset)
      return newAsset
    }

    try {
      const response = await api.post<Asset>('/partner/assets', {
        ...data,
        status: 'PENDING_APPROVAL',
        submissionSource: 'PARTNER_API',
        submittedAt: new Date().toISOString(),
      }, {
        headers: {
          'X-Partner-API-Key': partnerApiKey,
        },
      })
      return response.data
    } catch (error) {
      console.warn('API call failed, using mock data:', error)
      
      // Mock fallback
      const partner = mockPartnersStore.find(p => p.id === 'partner-3')
      if (!partner) {
        throw new Error('Invalid partner API key')
      }

      const newAsset: Asset = {
        id: `mock-asset-${Date.now()}`,
        ...data,
        partnerId: partner.id,
        productName: 'Mock Product',
        partnerName: partner.name,
        status: 'PENDING_APPROVAL',
        submissionSource: 'PARTNER_API',
        partnerApiKey,
        submittedAt: new Date().toISOString(),
        submittedBy: `${partner.name} API`,
        createdAt: new Date().toISOString(),
      }
      mockAssetsStore.push(newAsset)
      return newAsset
    }
  },

  // Get partner-submitted assets
  getPartnerSubmitted: async () => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300))
      return mockAssetsStore.filter(a => a.submissionSource === 'PARTNER_API')
    }

    try {
      const response = await api.get<Asset[]>('/assets?submissionSource=PARTNER_API')
      return response.data
    } catch (error) {
      console.warn('API call failed, using mock data:', error)
      return mockAssetsStore.filter(a => a.submissionSource === 'PARTNER_API')
    }
  },

  // Update asset
  update: async (id: string, data: Partial<CreateAssetRequest>) => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300))
      const index = mockAssetsStore.findIndex(a => a.id === id)
      if (index === -1) throw new Error('Asset not found')
      mockAssetsStore[index] = { ...mockAssetsStore[index], ...data }
      return mockAssetsStore[index]
    }

    try {
      const response = await api.put<Asset>(`/assets/${id}`, data)
      return response.data
    } catch (error) {
      console.warn('API call failed, using mock data:', error)
      const index = mockAssetsStore.findIndex(a => a.id === id)
      if (index === -1) throw new Error('Asset not found')
      mockAssetsStore[index] = { ...mockAssetsStore[index], ...data as any }
      return mockAssetsStore[index]
    }
  },

  // Delete asset
  delete: async (id: string) => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300))
      mockAssetsStore = mockAssetsStore.filter(a => a.id !== id)
      return
    }

    try {
      await api.delete(`/assets/${id}`)
    } catch (error) {
      console.warn('API call failed, using mock data:', error)
      mockAssetsStore = mockAssetsStore.filter(a => a.id !== id)
    }
  },

  // Approve asset
  approve: async (id: string, approvedBy: string) => {
    const response = await api.patch<Asset>(`/assets/${id}/approve`, {
      approvedBy,
    })
    return response.data
  },

  // Reject asset
  reject: async (id: string, reason: string, rejectedBy: string) => {
    const response = await api.patch<Asset>(`/assets/${id}/reject`, {
      reason,
      rejectedBy,
    })
    return response.data
  },

  // Get pending assets
  getPending: async () => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300))
      return mockAssetsStore.filter(a => a.status === 'PENDING_APPROVAL')
    }

    try {
      const response = await api.get<Asset[]>('/assets?status=PENDING_APPROVAL')
      return response.data
    } catch (error) {
      console.warn('API call failed, using mock data:', error)
      return mockAssetsStore.filter(a => a.status === 'PENDING_APPROVAL')
    }
  },
}

export default assetsAPI

// Named exports for easier testing and consumption
export const getAssets = (status?: string) => assetsAPI.getAll(status)
export const getAssetById = (id: string) => assetsAPI.get(id)
export const createAsset = (data: Partial<Asset>) => assetsAPI.create(data)
export const updateAsset = (id: string, data: Partial<Asset>) => assetsAPI.update(id, data)
export const deleteAsset = (id: string) => assetsAPI.delete(id)
export const approveAsset = (id: string, approvedBy: string) => assetsAPI.approve(id, approvedBy)
export const rejectAsset = (id: string, reason: string, rejectedBy: string) => assetsAPI.reject(id, reason, rejectedBy)

