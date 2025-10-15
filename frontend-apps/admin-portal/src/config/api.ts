export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8085/api/marketplace'

export const API_ENDPOINTS = {
  // Hypercare endpoints
  hypercare: {
    products: '/hypercare/products',
    features: '/hypercare/features',
    greylist: '/hypercare/greylist',
    check: '/hypercare/check',
  },
  // Partner endpoints
  partners: {
    list: '/partners',
    create: '/partners',
    getById: (id: string) => `/partners/${id}`,
    config: (id: string) => `/partners/${id}/config`,
  },
  // User endpoints
  users: {
    list: '/users',
    getById: (id: string) => `/users/${id}`,
  },
}


