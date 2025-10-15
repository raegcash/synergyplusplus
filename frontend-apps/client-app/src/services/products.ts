import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8085/api/marketplace'
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true' || false

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

// Add request interceptor for auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Mock approved products
const mockApprovedProducts: Product[] = [
  {
    id: '1',
    code: 'GSTOCKS_GLOBAL',
    name: 'GStocks Global',
    productType: 'INVESTMENT',
    description: 'Invest in global stocks from major markets. Access to US, Europe, and Asian markets with real-time trading.',
    partnerName: 'Global Securities',
    assetsCount: 150,
    minInvestment: 1000,
    maxInvestment: 1000000,
    currency: 'PHP',
    status: 'APPROVED',
  },
  {
    id: '2',
    code: 'GSAVE_PREMIUM',
    name: 'GSave Premium',
    productType: 'SAVINGS',
    description: 'High-yield savings account with flexible terms and instant withdrawals.',
    partnerName: 'Acme Financial',
    assetsCount: 5,
    minInvestment: 5000,
    maxInvestment: 500000,
    currency: 'PHP',
    status: 'APPROVED',
  },
  {
    id: '3',
    code: 'GCRYPTO_TRADE',
    name: 'GCrypto Trading',
    productType: 'CRYPTO',
    description: 'Trade major cryptocurrencies including Bitcoin, Ethereum, and more.',
    partnerName: 'TechInvest Corp',
    assetsCount: 25,
    minInvestment: 500,
    maxInvestment: 10000000,
    currency: 'PHP',
    status: 'APPROVED',
  },
]

export interface Product {
  id: string
  code: string
  name: string
  productType: string
  description: string
  partnerName: string
  assetsCount: number
  minInvestment: number
  maxInvestment: number
  currency: string
  status: string
}

export interface Asset {
  id: string
  name: string
  symbol: string
  assetType: string
  description: string
  currentPrice: number
  change24h?: number
}

export const productsAPI = {
  // Get approved products (for marketplace)
  getApproved: async () => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300))
      return mockApprovedProducts
    }
    
    try {
      const response = await api.get<Product[]>('/products')
      // Filter for approved/active products only
      const approvedProducts = response.data.filter((p: Product) => 
        p.status === 'APPROVED' || p.status === 'ACTIVE'
      )
      return approvedProducts
    } catch (error) {
      console.warn('API call failed, using mock data:', error)
      return mockApprovedProducts
    }
  },

  // Get product by ID
  getById: async (id: string) => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200))
      const product = mockApprovedProducts.find(p => p.id === id)
      if (!product) throw new Error('Product not found')
      return product
    }
    
    try {
      const response = await api.get<Product>(`/products/${id}`)
      return response.data
    } catch (error) {
      console.warn('API call failed, using mock data:', error)
      const product = mockApprovedProducts.find(p => p.id === id)
      if (!product) throw new Error('Product not found')
      return product
    }
  },

  // Get assets for a product
  getAssets: async (productId: string) => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200))
      return []
    }
    
    try {
      // Get all assets and filter by product
      const response = await api.get<Asset[]>('/assets')
      const productAssets = response.data.filter((a: any) => a.productId === productId)
      return productAssets
    } catch (error) {
      console.warn('API call failed, returning empty assets:', error)
      return []
    }
  },
}

export default productsAPI

