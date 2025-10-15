import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8085/api/marketplace'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export interface ScheduledTask {
  id: string
  name: string
  description: string
  taskType: 'KYC_SUBMISSION' | 'TRANSACTION_SYNC' | 'PORTFOLIO_UPDATE' | 'SETTLEMENT' | 'REPORTING' | 'DATA_SYNC' | 'CUSTOM'
  dataType: string
  partnerId?: string
  partnerName?: string
  productId?: string
  productName?: string
  
  // Schedule Configuration
  scheduleType: 'ONCE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CRON'
  cronExpression?: string
  scheduleTime?: string // HH:mm format
  scheduleDays?: number[] // For WEEKLY: 0-6 (Sunday-Saturday)
  scheduleDate?: number // For MONTHLY: 1-31
  timezone: string
  
  // Execution Configuration
  endpoint?: string
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH'
  headers?: Record<string, string>
  payload?: any
  
  // File Generation (for KYC, transactions, etc.)
  generateFile: boolean
  fileFormat?: 'CSV' | 'JSON' | 'XML' | 'EXCEL' | 'FIXED_WIDTH'
  fileTemplate?: string
  deliveryMethod?: 'SFTP' | 'API' | 'EMAIL' | 'CLOUD_STORAGE'
  deliveryConfig?: {
    sftpHost?: string
    sftpPath?: string
    apiEndpoint?: string
    email?: string
    bucket?: string
  }
  
  // Status & Execution
  status: 'ACTIVE' | 'PAUSED' | 'DISABLED'
  isRunning: boolean
  lastRun?: string
  lastRunStatus?: 'SUCCESS' | 'FAILED' | 'PARTIAL'
  lastRunDuration?: number
  nextRun?: string
  totalRuns: number
  successfulRuns: number
  failedRuns: number
  
  // Notification
  notifyOnSuccess: boolean
  notifyOnFailure: boolean
  notificationEmail?: string
  
  // Metadata
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface TaskExecution {
  id: string
  taskId: string
  taskName: string
  startedAt: string
  completedAt?: string
  duration?: number
  status: 'RUNNING' | 'SUCCESS' | 'FAILED' | 'PARTIAL'
  recordsProcessed: number
  recordsSuccess: number
  recordsFailed: number
  errorMessage?: string
  fileGenerated?: boolean
  fileName?: string
  fileSize?: number
  fileSent?: boolean
  logs: string[]
}

export const scheduledTasksAPI = {
  // Get all scheduled tasks
  getAll: async (): Promise<ScheduledTask[]> => {
    try {
      const response = await api.get('/scheduled-tasks')
      return response.data
    } catch (error) {
      console.error('Error fetching scheduled tasks:', error)
      // Return mock data for now
      return getMockTasks()
    }
  },

  // Get task by ID
  getById: async (id: string): Promise<ScheduledTask> => {
    try {
      const response = await api.get(`/scheduled-tasks/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching scheduled task:', error)
      throw error
    }
  },

  // Create new scheduled task
  create: async (task: Omit<ScheduledTask, 'id' | 'totalRuns' | 'successfulRuns' | 'failedRuns' | 'isRunning' | 'createdAt' | 'updatedAt'>): Promise<ScheduledTask> => {
    try {
      const response = await api.post('/scheduled-tasks', task)
      return response.data
    } catch (error) {
      console.error('Error creating scheduled task:', error)
      throw error
    }
  },

  // Update task
  update: async (id: string, updates: Partial<ScheduledTask>): Promise<ScheduledTask> => {
    try {
      const response = await api.put(`/scheduled-tasks/${id}`, updates)
      return response.data
    } catch (error) {
      console.error('Error updating scheduled task:', error)
      throw error
    }
  },

  // Delete task
  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/scheduled-tasks/${id}`)
    } catch (error) {
      console.error('Error deleting scheduled task:', error)
      throw error
    }
  },

  // Pause/Resume task
  toggleStatus: async (id: string, status: 'ACTIVE' | 'PAUSED'): Promise<ScheduledTask> => {
    try {
      const response = await api.patch(`/scheduled-tasks/${id}/status`, { status })
      return response.data
    } catch (error) {
      console.error('Error toggling task status:', error)
      throw error
    }
  },

  // Run task manually
  runNow: async (id: string): Promise<TaskExecution> => {
    try {
      const response = await api.post(`/scheduled-tasks/${id}/run`)
      return response.data
    } catch (error) {
      console.error('Error running task:', error)
      throw error
    }
  },

  // Get task execution history
  getExecutions: async (taskId: string, limit = 50): Promise<TaskExecution[]> => {
    try {
      const response = await api.get(`/scheduled-tasks/${taskId}/executions`, { params: { limit } })
      return response.data
    } catch (error) {
      console.error('Error fetching task executions:', error)
      return []
    }
  },

  // Get recent executions across all tasks
  getRecentExecutions: async (limit = 20): Promise<TaskExecution[]> => {
    try {
      const response = await api.get('/scheduled-tasks/executions/recent', { params: { limit } })
      return response.data
    } catch (error) {
      console.error('Error fetching recent executions:', error)
      return []
    }
  },
}

// Mock data for development
function getMockTasks(): ScheduledTask[] {
  return [
    {
      id: '1',
      name: 'Daily KYC Submission to Fund House',
      description: 'Submit new KYC documents and updates to fund house partners daily at 2 AM',
      taskType: 'KYC_SUBMISSION',
      dataType: 'KYC Documents',
      partnerId: 'partner-1',
      partnerName: 'Global Securities Fund House',
      scheduleType: 'DAILY',
      scheduleTime: '02:00',
      timezone: 'Asia/Manila',
      generateFile: true,
      fileFormat: 'CSV',
      deliveryMethod: 'SFTP',
      deliveryConfig: {
        sftpHost: 'sftp.fundhouse.com',
        sftpPath: '/inbound/kyc'
      },
      status: 'ACTIVE',
      isRunning: false,
      lastRun: '2025-10-13T02:00:00Z',
      lastRunStatus: 'SUCCESS',
      lastRunDuration: 45000,
      nextRun: '2025-10-14T02:00:00Z',
      totalRuns: 365,
      successfulRuns: 362,
      failedRuns: 3,
      notifyOnSuccess: false,
      notifyOnFailure: true,
      notificationEmail: 'ops@superapp.com',
      createdBy: 'admin@superapp.com',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2025-10-13T02:00:00Z',
    },
    {
      id: '2',
      name: 'Hourly Transaction Sync',
      description: 'Sync subscription and redemption transactions to partner systems every hour',
      taskType: 'TRANSACTION_SYNC',
      dataType: 'Transactions (Subscriptions, Redemptions)',
      productId: 'product-1',
      productName: 'UITF Investment',
      scheduleType: 'CRON',
      cronExpression: '0 * * * *',
      timezone: 'Asia/Manila',
      generateFile: true,
      fileFormat: 'XML',
      deliveryMethod: 'API',
      deliveryConfig: {
        apiEndpoint: 'https://api.partner.com/v1/transactions'
      },
      status: 'ACTIVE',
      isRunning: false,
      lastRun: '2025-10-13T17:00:00Z',
      lastRunStatus: 'SUCCESS',
      lastRunDuration: 12000,
      nextRun: '2025-10-13T18:00:00Z',
      totalRuns: 8760,
      successfulRuns: 8745,
      failedRuns: 15,
      notifyOnSuccess: false,
      notifyOnFailure: true,
      notificationEmail: 'tech@superapp.com',
      createdBy: 'admin@superapp.com',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2025-10-13T17:00:00Z',
    },
    {
      id: '3',
      name: 'Weekly Portfolio Valuation Update',
      description: 'Update portfolio valuations and send reports every Monday at 6 AM',
      taskType: 'PORTFOLIO_UPDATE',
      dataType: 'Portfolio Valuations',
      scheduleType: 'WEEKLY',
      scheduleDays: [1], // Monday
      scheduleTime: '06:00',
      timezone: 'Asia/Manila',
      generateFile: true,
      fileFormat: 'EXCEL',
      deliveryMethod: 'EMAIL',
      deliveryConfig: {
        email: 'reports@superapp.com'
      },
      status: 'ACTIVE',
      isRunning: false,
      lastRun: '2025-10-07T06:00:00Z',
      lastRunStatus: 'SUCCESS',
      lastRunDuration: 120000,
      nextRun: '2025-10-14T06:00:00Z',
      totalRuns: 52,
      successfulRuns: 52,
      failedRuns: 0,
      notifyOnSuccess: true,
      notifyOnFailure: true,
      notificationEmail: 'ops@superapp.com',
      createdBy: 'admin@superapp.com',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2025-10-07T06:00:00Z',
    },
  ]
}



