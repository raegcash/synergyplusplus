import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8085/api/marketplace'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export interface Feature {
  id: string
  productId: string
  code: string
  name: string
  description: string
  enabled: boolean
  maintenanceMode: boolean
  whitelistMode: boolean
  rolloutPercentage?: number
  lastUpdated?: string
  createdAt: string
  updatedAt?: string
}

export interface CreateFeatureRequest {
  productId: string
  code: string
  name: string
  description: string
  enabled?: boolean
  maintenanceMode?: boolean
  whitelistMode?: boolean
  rolloutPercentage?: number
}

export interface UpdateFeatureRequest {
  name?: string
  description?: string
  enabled?: boolean
  maintenanceMode?: boolean
  whitelistMode?: boolean
  rolloutPercentage?: number
}

export const featuresAPI = {
  // Get all features
  getAll: async (): Promise<Feature[]> => {
    try {
      const response = await api.get('/features')
      return response.data
    } catch (error) {
      console.error('Error fetching features:', error)
      throw error
    }
  },

  // Get features by product ID
  getByProductId: async (productId: string): Promise<Feature[]> => {
    try {
      const response = await api.get(`/features/product/${productId}`)
      return response.data
    } catch (error) {
      console.error('Error fetching features by product:', error)
      throw error
    }
  },

  // Get a feature by ID
  getById: async (id: string): Promise<Feature> => {
    try {
      const response = await api.get(`/features/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching feature:', error)
      throw error
    }
  },

  // Create a new feature
  create: async (feature: CreateFeatureRequest): Promise<Feature> => {
    try {
      const response = await api.post('/features', feature)
      return response.data
    } catch (error) {
      console.error('Error creating feature:', error)
      throw error
    }
  },

  // Update a feature
  update: async (id: string, updates: UpdateFeatureRequest): Promise<Feature> => {
    try {
      const response = await api.put(`/features/${id}`, updates)
      return response.data
    } catch (error) {
      console.error('Error updating feature:', error)
      throw error
    }
  },

  // Toggle feature enabled status
  toggleEnabled: async (id: string, enabled: boolean): Promise<Feature> => {
    try {
      const response = await api.patch(`/features/${id}/toggle`, { enabled })
      return response.data
    } catch (error) {
      console.error('Error toggling feature:', error)
      throw error
    }
  },

  // Toggle maintenance mode
  toggleMaintenance: async (id: string, maintenanceMode: boolean): Promise<Feature> => {
    try {
      const response = await api.patch(`/features/${id}/toggle`, { maintenanceMode })
      return response.data
    } catch (error) {
      console.error('Error toggling maintenance mode:', error)
      throw error
    }
  },

  // Toggle whitelist mode
  toggleWhitelist: async (id: string, whitelistMode: boolean): Promise<Feature> => {
    try {
      const response = await api.patch(`/features/${id}/toggle`, { whitelistMode })
      return response.data
    } catch (error) {
      console.error('Error toggling whitelist mode:', error)
      throw error
    }
  },

  // Delete a feature
  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/features/${id}`)
    } catch (error) {
      console.error('Error deleting feature:', error)
      throw error
    }
  },
}
