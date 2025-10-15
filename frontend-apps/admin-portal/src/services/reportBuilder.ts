import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8085/api/marketplace'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export interface DataSource {
  id: string
  name: string
  table: string
  description: string
  fields: DataField[]
  joins?: DataJoin[]
}

export interface DataField {
  id: string
  name: string
  column: string
  type: 'string' | 'number' | 'date' | 'boolean' | 'currency'
  aggregatable: boolean
  filterable: boolean
  sortable: boolean
}

export interface DataJoin {
  table: string
  foreignKey: string
  primaryKey: string
  type: 'INNER' | 'LEFT' | 'RIGHT'
}

export interface ReportFilter {
  field: string
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'between' | 'in' | 'not_in' | 'is_null' | 'is_not_null'
  value: any
  valueEnd?: any // For 'between'
}

export interface ReportColumn {
  field: string
  label: string
  aggregate?: 'sum' | 'avg' | 'count' | 'min' | 'max'
  format?: string
}

export interface ReportDefinition {
  id?: string
  name: string
  description: string
  dataSource: string
  columns: ReportColumn[]
  filters: ReportFilter[]
  groupBy: string[]
  orderBy: { field: string; direction: 'asc' | 'desc' }[]
  limit?: number
  createdBy?: string
  createdAt?: string
  updatedAt?: string
}

export interface ReportResult {
  columns: { field: string; label: string; type: string }[]
  data: any[]
  totalRows: number
  executionTime: number
}

export const reportBuilderAPI = {
  // Get available data sources
  getDataSources: async (): Promise<DataSource[]> => {
    try {
      const response = await api.get('/reports/data-sources')
      return response.data
    } catch (error) {
      console.error('Error fetching data sources:', error)
      return getMockDataSources()
    }
  },

  // Get saved report definitions
  getReports: async (): Promise<ReportDefinition[]> => {
    try {
      const response = await api.get('/reports')
      return response.data
    } catch (error) {
      console.error('Error fetching reports:', error)
      return []
    }
  },

  // Save report definition
  saveReport: async (report: ReportDefinition): Promise<ReportDefinition> => {
    try {
      if (report.id) {
        const response = await api.put(`/reports/${report.id}`, report)
        return response.data
      } else {
        const response = await api.post('/reports', report)
        return response.data
      }
    } catch (error) {
      console.error('Error saving report:', error)
      throw error
    }
  },

  // Execute report
  executeReport: async (report: ReportDefinition): Promise<ReportResult> => {
    try {
      const response = await api.post('/reports/execute', report)
      return response.data
    } catch (error) {
      console.error('Error executing report:', error)
      throw error
    }
  },

  // Export report
  exportReport: async (report: ReportDefinition, format: 'CSV' | 'EXCEL' | 'PDF'): Promise<Blob> => {
    try {
      const response = await api.post(`/reports/export/${format.toLowerCase()}`, report, {
        responseType: 'blob'
      })
      return response.data
    } catch (error) {
      console.error('Error exporting report:', error)
      throw error
    }
  },

  // Delete report
  deleteReport: async (id: string): Promise<void> => {
    try {
      await api.delete(`/reports/${id}`)
    } catch (error) {
      console.error('Error deleting report:', error)
      throw error
    }
  },
}

// Mock data sources
function getMockDataSources(): DataSource[] {
  return [
    {
      id: 'products',
      name: 'Products',
      table: 'products',
      description: 'All products in the marketplace',
      fields: [
        { id: 'id', name: 'Product ID', column: 'id', type: 'string', aggregatable: false, filterable: true, sortable: true },
        { id: 'code', name: 'Product Code', column: 'code', type: 'string', aggregatable: false, filterable: true, sortable: true },
        { id: 'name', name: 'Product Name', column: 'name', type: 'string', aggregatable: false, filterable: true, sortable: true },
        { id: 'product_type', name: 'Product Type', column: 'product_type', type: 'string', aggregatable: false, filterable: true, sortable: true },
        { id: 'status', name: 'Status', column: 'status', type: 'string', aggregatable: false, filterable: true, sortable: true },
        { id: 'min_investment', name: 'Min Investment', column: 'min_investment', type: 'currency', aggregatable: true, filterable: true, sortable: true },
        { id: 'max_investment', name: 'Max Investment', column: 'max_investment', type: 'currency', aggregatable: true, filterable: true, sortable: true },
        { id: 'assets_count', name: 'Assets Count', column: 'assets_count', type: 'number', aggregatable: true, filterable: true, sortable: true },
        { id: 'created_at', name: 'Created Date', column: 'created_at', type: 'date', aggregatable: false, filterable: true, sortable: true },
      ],
    },
    {
      id: 'partners',
      name: 'Partners',
      table: 'partners',
      description: 'Partner organizations',
      fields: [
        { id: 'id', name: 'Partner ID', column: 'id', type: 'string', aggregatable: false, filterable: true, sortable: true },
        { id: 'code', name: 'Partner Code', column: 'code', type: 'string', aggregatable: false, filterable: true, sortable: true },
        { id: 'name', name: 'Partner Name', column: 'name', type: 'string', aggregatable: false, filterable: true, sortable: true },
        { id: 'partner_type', name: 'Partner Type', column: 'partner_type', type: 'string', aggregatable: false, filterable: true, sortable: true },
        { id: 'status', name: 'Status', column: 'status', type: 'string', aggregatable: false, filterable: true, sortable: true },
        { id: 'contact_email', name: 'Contact Email', column: 'contact_email', type: 'string', aggregatable: false, filterable: true, sortable: true },
        { id: 'created_at', name: 'Created Date', column: 'created_at', type: 'date', aggregatable: false, filterable: true, sortable: true },
      ],
    },
    {
      id: 'assets',
      name: 'Assets',
      table: 'assets',
      description: 'Investment assets',
      fields: [
        { id: 'id', name: 'Asset ID', column: 'id', type: 'string', aggregatable: false, filterable: true, sortable: true },
        { id: 'asset_code', name: 'Asset Code', column: 'asset_code', type: 'string', aggregatable: false, filterable: true, sortable: true },
        { id: 'name', name: 'Asset Name', column: 'name', type: 'string', aggregatable: false, filterable: true, sortable: true },
        { id: 'symbol', name: 'Symbol', column: 'symbol', type: 'string', aggregatable: false, filterable: true, sortable: true },
        { id: 'asset_type', name: 'Asset Type', column: 'asset_type', type: 'string', aggregatable: false, filterable: true, sortable: true },
        { id: 'current_price', name: 'Current Price', column: 'current_price', type: 'currency', aggregatable: true, filterable: true, sortable: true },
        { id: 'min_investment', name: 'Min Investment', column: 'min_investment', type: 'currency', aggregatable: true, filterable: true, sortable: true },
        { id: 'max_investment', name: 'Max Investment', column: 'max_investment', type: 'currency', aggregatable: true, filterable: true, sortable: true },
        { id: 'risk_level', name: 'Risk Level', column: 'risk_level', type: 'string', aggregatable: false, filterable: true, sortable: true },
        { id: 'status', name: 'Status', column: 'status', type: 'string', aggregatable: false, filterable: true, sortable: true },
        { id: 'product_id', name: 'Product ID', column: 'product_id', type: 'string', aggregatable: false, filterable: true, sortable: false },
        { id: 'partner_id', name: 'Partner ID', column: 'partner_id', type: 'string', aggregatable: false, filterable: true, sortable: false },
        { id: 'created_at', name: 'Created Date', column: 'created_at', type: 'date', aggregatable: false, filterable: true, sortable: true },
      ],
      joins: [
        { table: 'products', foreignKey: 'product_id', primaryKey: 'id', type: 'LEFT' },
        { table: 'partners', foreignKey: 'partner_id', primaryKey: 'id', type: 'LEFT' },
      ],
    },
    {
      id: 'transactions',
      name: 'Transactions',
      table: 'transactions',
      description: 'User transactions',
      fields: [
        { id: 'id', name: 'Transaction ID', column: 'id', type: 'string', aggregatable: false, filterable: true, sortable: true },
        { id: 'transaction_id', name: 'Transaction Number', column: 'transaction_id', type: 'string', aggregatable: false, filterable: true, sortable: true },
        { id: 'user_id', name: 'User ID', column: 'user_id', type: 'string', aggregatable: false, filterable: true, sortable: false },
        { id: 'product_id', name: 'Product ID', column: 'product_id', type: 'string', aggregatable: false, filterable: true, sortable: false },
        { id: 'transaction_type', name: 'Transaction Type', column: 'transaction_type', type: 'string', aggregatable: false, filterable: true, sortable: true },
        { id: 'transaction_status', name: 'Transaction Status', column: 'transaction_status', type: 'string', aggregatable: false, filterable: true, sortable: true },
        { id: 'amount', name: 'Amount', column: 'amount', type: 'currency', aggregatable: true, filterable: true, sortable: true },
        { id: 'units', name: 'Units', column: 'units', type: 'number', aggregatable: true, filterable: true, sortable: true },
        { id: 'fee', name: 'Fee', column: 'fee', type: 'currency', aggregatable: true, filterable: true, sortable: true },
        { id: 'total_amount', name: 'Total Amount', column: 'total_amount', type: 'currency', aggregatable: true, filterable: true, sortable: true },
        { id: 'created_at', name: 'Transaction Date', column: 'created_at', type: 'date', aggregatable: false, filterable: true, sortable: true },
      ],
      joins: [
        { table: 'users', foreignKey: 'user_id', primaryKey: 'id', type: 'LEFT' },
        { table: 'products', foreignKey: 'product_id', primaryKey: 'id', type: 'LEFT' },
        { table: 'partners', foreignKey: 'partner_id', primaryKey: 'id', type: 'LEFT' },
        { table: 'assets', foreignKey: 'asset_id', primaryKey: 'id', type: 'LEFT' },
      ],
    },
    {
      id: 'users',
      name: 'Users',
      table: 'users',
      description: 'User accounts',
      fields: [
        { id: 'id', name: 'User ID', column: 'id', type: 'string', aggregatable: false, filterable: true, sortable: true },
        { id: 'user_id', name: 'User Number', column: 'user_id', type: 'string', aggregatable: false, filterable: true, sortable: true },
        { id: 'email', name: 'Email', column: 'email', type: 'string', aggregatable: false, filterable: true, sortable: true },
        { id: 'first_name', name: 'First Name', column: 'first_name', type: 'string', aggregatable: false, filterable: true, sortable: true },
        { id: 'last_name', name: 'Last Name', column: 'last_name', type: 'string', aggregatable: false, filterable: true, sortable: true },
        { id: 'kyc_status', name: 'KYC Status', column: 'kyc_status', type: 'string', aggregatable: false, filterable: true, sortable: true },
        { id: 'account_status', name: 'Account Status', column: 'account_status', type: 'string', aggregatable: false, filterable: true, sortable: true },
        { id: 'created_at', name: 'Registration Date', column: 'created_at', type: 'date', aggregatable: false, filterable: true, sortable: true },
      ],
    },
    {
      id: 'approvals',
      name: 'Approvals',
      table: 'approvals',
      description: 'Approval workflows',
      fields: [
        { id: 'id', name: 'Approval ID', column: 'id', type: 'string', aggregatable: false, filterable: true, sortable: true },
        { id: 'item_type', name: 'Item Type', column: 'item_type', type: 'string', aggregatable: false, filterable: true, sortable: true },
        { id: 'status', name: 'Status', column: 'status', type: 'string', aggregatable: false, filterable: true, sortable: true },
        { id: 'submitted_by', name: 'Submitted By', column: 'submitted_by', type: 'string', aggregatable: false, filterable: true, sortable: true },
        { id: 'approved_by', name: 'Approved By', column: 'approved_by', type: 'string', aggregatable: false, filterable: true, sortable: true },
        { id: 'submitted_at', name: 'Submitted Date', column: 'submitted_at', type: 'date', aggregatable: false, filterable: true, sortable: true },
        { id: 'approved_at', name: 'Approved Date', column: 'approved_at', type: 'date', aggregatable: false, filterable: true, sortable: true },
      ],
    },
  ]
}



