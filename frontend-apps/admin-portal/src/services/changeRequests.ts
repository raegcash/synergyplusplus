import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8085/api/marketplace'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Change Request Service for Product Configuration Changes
export interface ChangeRequest {
  id: string
  type?: 'PRODUCT_CONFIG'
  action?: 'OPERATIONAL_TOGGLE' | 'WHITELIST_TOGGLE' | 'MAINTENANCE_TOGGLE'
  productId: string
  productCode?: string
  productName?: string
  changeType: string
  fieldName: string
  oldValue: string
  newValue: string
  currentValue?: boolean | string
  proposedValue?: boolean | string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  requestedBy: string
  requestedAt: string
  reviewedBy?: string
  reviewedAt?: string
  reason?: string
  rejectionReason?: string
}

export const changeRequestsAPI = {
  // Get all change requests
  getAll: async (): Promise<ChangeRequest[]> => {
    try {
      const response = await api.get('/change-requests')
      return response.data
    } catch (error) {
      console.error('Error fetching change requests:', error)
      throw error
    }
  },

  // Get pending change requests
  getPending: async (): Promise<ChangeRequest[]> => {
    try {
      const response = await api.get('/change-requests/pending')
      return response.data
    } catch (error) {
      console.error('Error fetching pending change requests:', error)
      throw error
    }
  },

  // Get change requests for a specific product
  getByProduct: async (productId: string): Promise<ChangeRequest[]> => {
    try {
      const response = await api.get(`/change-requests/product/${productId}`)
      return response.data
    } catch (error) {
      console.error('Error fetching change requests for product:', error)
      throw error
    }
  },

  // Create a new change request
  create: async (request: Omit<ChangeRequest, 'id' | 'status' | 'requestedAt'>): Promise<ChangeRequest> => {
    try {
      const response = await api.post('/change-requests', request)
      return response.data
    } catch (error) {
      console.error('Error creating change request:', error)
      throw error
    }
  },

  // Approve a change request
  approve: async (id: string): Promise<ChangeRequest> => {
    try {
      const response = await api.patch(`/change-requests/${id}/approve`)
      return response.data
    } catch (error) {
      console.error('Error approving change request:', error)
      throw error
    }
  },

  // Reject a change request
  reject: async (id: string, reason?: string): Promise<ChangeRequest> => {
    try {
      const response = await api.patch(`/change-requests/${id}/reject`, { reason })
      return response.data
    } catch (error) {
      console.error('Error rejecting change request:', error)
      throw error
    }
  },
}
