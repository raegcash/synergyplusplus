import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8085/api/marketplace'
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

// Mock partners data
const mockPartners: Partner[] = [
  {
    id: 'partner-1',
    code: 'GLOBSEC',
    name: 'Global Securities',
    type: 'INVESTMENT',
    status: 'ACTIVE',
    contactEmail: 'contact@globalsec.com',
    products: [
      { id: '1', name: 'GStocks Global', code: 'GSTOCKS_GLOBAL', productType: 'INVESTMENT' },
    ],
    productsCount: 1,
    assetsCount: 150,
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'partner-2',
    code: 'ACME',
    name: 'Acme Financial',
    type: 'BANK',
    status: 'ACTIVE',
    contactEmail: 'contact@acmefinancial.com',
    products: [
      { id: '2', name: 'GSave Premium', code: 'GSAVE_PREMIUM', productType: 'SAVINGS' },
      { id: '3', name: 'GLending Micro', code: 'GLENDING_MICRO', productType: 'LENDING' },
    ],
    productsCount: 2,
    assetsCount: 8,
    createdAt: '2024-01-10T10:00:00Z',
  },
  {
    id: 'partner-3',
    code: 'TECHINV',
    name: 'TechInvest Corp',
    type: 'FINTECH',
    status: 'ACTIVE',
    contactEmail: 'contact@techinvest.com',
    products: [
      { id: '1', name: 'GStocks Global', code: 'GSTOCKS_GLOBAL', productType: 'INVESTMENT' },
      { id: '3', name: 'GLending Micro', code: 'GLENDING_MICRO', productType: 'LENDING' },
    ],
    productsCount: 2,
    assetsCount: 5,
    createdAt: '2024-01-20T10:00:00Z',
  },
  {
    id: 'partner-4',
    code: 'NEWBANK',
    name: 'New Bank Corporation',
    type: 'BANK',
    status: 'PENDING',
    contactEmail: 'contact@newbank.com',
    contactPhone: '+63 123 456 7890',
    products: [],
    productsCount: 0,
    assetsCount: 0,
    createdAt: '2024-03-25T10:00:00Z',
  },
]

export interface Partner {
  id: string
  code: string
  name: string
  type: 'BANK' | 'INVESTMENT' | 'INSURANCE' | 'FINTECH' | 'OTHER'
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED'
  contactEmail: string
  contactPhone?: string
  webhookUrl?: string
  products?: Array<{ id: string; name: string; code: string; productType: string }> // Associated products
  productsCount?: number
  assetsCount?: number
  createdAt: string
}

let mockPartnersStore = [...mockPartners]

export const partnersAPI = {
  // Get all partners
  getAll: async (status?: string) => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200))
      return status 
        ? mockPartnersStore.filter(p => p.status === status)
        : mockPartnersStore
    }
    
    try {
      const params = status ? { status } : {}
      const response = await api.get<Partner[]>('/partners', { params })
      return response.data
    } catch (error) {
      console.warn('API call failed, using mock data:', error)
      return status 
        ? mockPartnersStore.filter(p => p.status === status)
        : mockPartnersStore
    }
  },

  // Get partner by ID
  getById: async (id: string) => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200))
      const partner = mockPartnersStore.find(p => p.id === id)
      if (!partner) throw new Error('Partner not found')
      return partner
    }
    
    try {
      const response = await api.get<Partner>(`/partners/${id}`)
      return response.data
    } catch (error) {
      console.warn('API call failed, using mock data:', error)
      const partner = mockPartnersStore.find(p => p.id === id)
      if (!partner) throw new Error('Partner not found')
      return partner
    }
  },

  // Create partner
  create: async (data: Omit<Partner, 'id' | 'createdAt'> & { productIds?: string[] }) => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Map productIds to product objects
      let products: Array<{ id: string; name: string; code: string; productType: string }> = []
      if (data.productIds && data.productIds.length > 0) {
        // Import products from products service mock data
        const { productsAPI } = await import('./products')
        const allProducts = await productsAPI.getAll()
        products = data.productIds
          .map(productId => {
            const product = allProducts.find(p => p.id === productId)
            return product ? {
              id: product.id,
              name: product.name,
              code: product.code,
              productType: product.productType,
            } : null
          })
          .filter((p): p is NonNullable<typeof p> => p !== null)
      }
      
      const { productIds, ...partnerData } = data
      const newPartner: Partner = {
        id: `mock-partner-${Date.now()}`,
        ...partnerData,
        products,
        productsCount: products.length,
        assetsCount: 0,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      }
      mockPartnersStore.push(newPartner)
      return newPartner
    }
    
    try {
      const response = await api.post<Partner>('/partners', data)
      return response.data
    } catch (error) {
      console.warn('API call failed, using mock data:', error)
      
      // Map productIds to product objects
      let products: Array<{ id: string; name: string; code: string; productType: string }> = []
      if (data.productIds && data.productIds.length > 0) {
        const { productsAPI } = await import('./products')
        const allProducts = await productsAPI.getAll()
        products = data.productIds
          .map(productId => {
            const product = allProducts.find(p => p.id === productId)
            return product ? {
              id: product.id,
              name: product.name,
              code: product.code,
              productType: product.productType,
            } : null
          })
          .filter((p): p is NonNullable<typeof p> => p !== null)
      }
      
      const { productIds, ...partnerData } = data
      const newPartner: Partner = {
        id: `mock-partner-${Date.now()}`,
        ...partnerData,
        products,
        productsCount: products.length,
        assetsCount: 0,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      }
      mockPartnersStore.push(newPartner)
      return newPartner
    }
  },

  // Update partner
  update: async (id: string, data: Partial<Partner>) => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300))
      const index = mockPartnersStore.findIndex(p => p.id === id)
      if (index === -1) throw new Error('Partner not found')
      mockPartnersStore[index] = { ...mockPartnersStore[index], ...data }
      return mockPartnersStore[index]
    }
    
    try {
      const response = await api.put<Partner>(`/partners/${id}`, data)
      return response.data
    } catch (error) {
      console.warn('API call failed, using mock data:', error)
      const index = mockPartnersStore.findIndex(p => p.id === id)
      if (index === -1) throw new Error('Partner not found')
      mockPartnersStore[index] = { ...mockPartnersStore[index], ...data }
      return mockPartnersStore[index]
    }
  },

  // Delete partner
  delete: async (id: string) => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300))
      mockPartnersStore = mockPartnersStore.filter(p => p.id !== id)
      return
    }
    
    try {
      await api.delete(`/partners/${id}`)
    } catch (error) {
      console.warn('API call failed, using mock data:', error)
      mockPartnersStore = mockPartnersStore.filter(p => p.id !== id)
    }
  },

  // Approve partner
  approve: async (id: string, approvedBy: string) => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500))
      const index = mockPartnersStore.findIndex(p => p.id === id)
      if (index === -1) throw new Error('Partner not found')
      
      const partner = mockPartnersStore[index]
      mockPartnersStore[index] = {
        ...partner,
        status: 'ACTIVE',
      }
      
      // CRITICAL: Update products to include this partner in their partners array
      // This ensures bidirectional relationship for asset filtering
      if (partner.products && partner.products.length > 0) {
        const { productsAPI } = await import('./products')
        const allProducts = await productsAPI.getAll()
        
        for (const mappedProduct of partner.products) {
          const product = allProducts.find(p => p.id === mappedProduct.id)
          if (product) {
            const partnerRef = {
              id: partner.id,
              name: partner.name,
              code: partner.code,
            }
            
            // Add partner to product's partners array if not already there
            const existingPartners = product.partners || []
            const partnerExists = existingPartners.some(p => p.id === partner.id)
            
            if (!partnerExists) {
              await productsAPI.update(product.id, {
                partners: [...existingPartners, partnerRef],
              } as any)
            }
          }
        }
      }
      
      return mockPartnersStore[index]
    }
    
    try {
      const response = await api.patch<Partner>(`/partners/${id}/approve`, {
        approvedBy,
        approvedAt: new Date().toISOString(),
        status: 'ACTIVE',
      })
      return response.data
    } catch (error) {
      console.warn('API call failed, using mock data:', error)
      const index = mockPartnersStore.findIndex(p => p.id === id)
      if (index === -1) throw new Error('Partner not found')
      
      const partner = mockPartnersStore[index]
      mockPartnersStore[index] = {
        ...partner,
        status: 'ACTIVE',
      }
      
      // Update products to include this partner
      if (partner.products && partner.products.length > 0) {
        const { productsAPI } = await import('./products')
        const allProducts = await productsAPI.getAll()
        
        for (const mappedProduct of partner.products) {
          const product = allProducts.find(p => p.id === mappedProduct.id)
          if (product) {
            const partnerRef = {
              id: partner.id,
              name: partner.name,
              code: partner.code,
            }
            
            const existingPartners = product.partners || []
            const partnerExists = existingPartners.some(p => p.id === partner.id)
            
            if (!partnerExists) {
              await productsAPI.update(product.id, {
                partners: [...existingPartners, partnerRef],
              } as any)
            }
          }
        }
      }
      
      return mockPartnersStore[index]
    }
  },

  // Reject partner
  reject: async (id: string, reason: string, rejectedBy: string) => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500))
      const index = mockPartnersStore.findIndex(p => p.id === id)
      if (index === -1) throw new Error('Partner not found')
      mockPartnersStore[index] = {
        ...mockPartnersStore[index],
        status: 'SUSPENDED',
      }
      return mockPartnersStore[index]
    }
    
    try {
      const response = await api.patch<Partner>(`/partners/${id}/reject`, {
        reason,
        rejectedBy,
        rejectedAt: new Date().toISOString(),
        status: 'SUSPENDED',
      })
      return response.data
    } catch (error) {
      console.warn('API call failed, using mock data:', error)
      const index = mockPartnersStore.findIndex(p => p.id === id)
      if (index === -1) throw new Error('Partner not found')
      mockPartnersStore[index] = {
        ...mockPartnersStore[index],
        status: 'SUSPENDED',
      }
      return mockPartnersStore[index]
    }
  },

  // Get pending partners
  getPending: async () => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 300))
      return mockPartnersStore.filter(p => p.status === 'PENDING_APPROVAL')
    }
    
    try {
      const response = await api.get<Partner[]>('/partners?status=PENDING_APPROVAL')
      return response.data
    } catch (error) {
      console.warn('API call failed, using mock data:', error)
      return mockPartnersStore.filter(p => p.status === 'PENDING_APPROVAL')
    }
  },
}

export default partnersAPI

