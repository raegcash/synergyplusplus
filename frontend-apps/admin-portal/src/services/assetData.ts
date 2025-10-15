// Asset Data Points Service - Manages market data, NAV, prices, and historical data

export interface AssetDataPoint {
  id: string
  assetId: string
  assetCode: string
  assetName: string
  dataType: 'NAV' | 'MARKET_PRICE' | 'VOLUME' | 'YIELD' | 'PERFORMANCE' | 'CUSTOM'
  value: number
  currency: string
  timestamp: string
  source: string // Which integration provided this data
  metadata?: {
    openPrice?: number
    closePrice?: number
    highPrice?: number
    lowPrice?: number
    tradingVolume?: number
    [key: string]: any
  }
}

export interface AssetPerformance {
  assetId: string
  assetCode: string
  currentNAV: number
  previousNAV: number
  changePercent: number
  changeAmount: number
  ytdReturn: number
  oneMonthReturn: number
  threeMonthReturn: number
  sixMonthReturn: number
  oneYearReturn: number
  lastUpdated: string
}

export interface CreateDataPointRequest {
  assetId: string
  dataType: 'NAV' | 'MARKET_PRICE' | 'VOLUME' | 'YIELD' | 'PERFORMANCE' | 'CUSTOM'
  value: number
  currency: string
  source: string
  metadata?: any
}

// Mock data store
let mockDataPoints: AssetDataPoint[] = [
  {
    id: 'dp-1',
    assetId: 'asset-1',
    assetCode: 'PAMI-EF',
    assetName: 'Philippine Equity Fund',
    dataType: 'NAV',
    value: 2.4567,
    currency: 'PHP',
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
    source: 'SFTP-FUNDHOUSE-A',
    metadata: {
      openPrice: 2.4500,
      closePrice: 2.4567,
      highPrice: 2.4600,
      lowPrice: 2.4450,
      tradingVolume: 150000,
    }
  },
  {
    id: 'dp-2',
    assetId: 'asset-1',
    assetCode: 'PAMI-EF',
    assetName: 'Philippine Equity Fund',
    dataType: 'NAV',
    value: 2.4512,
    currency: 'PHP',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    source: 'SFTP-FUNDHOUSE-A',
  },
  {
    id: 'dp-3',
    assetId: 'asset-2',
    assetCode: 'PAMI-BF',
    assetName: 'Philippine Bond Fund',
    dataType: 'NAV',
    value: 1.8932,
    currency: 'PHP',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
    source: 'API-FUNDHOUSE-B',
    metadata: {
      yield: 5.25,
      duration: 4.5,
    }
  },
]

export const assetDataAPI = {
  // Get all data points
  getAll: async (): Promise<AssetDataPoint[]> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return Promise.resolve([...mockDataPoints])
  },

  // Get data points for a specific asset
  getByAssetId: async (assetId: string): Promise<AssetDataPoint[]> => {
    await new Promise(resolve => setTimeout(resolve, 200))
    return Promise.resolve(mockDataPoints.filter(dp => dp.assetId === assetId))
  },

  // Get latest data point for an asset by type
  getLatestByAssetAndType: async (assetId: string, dataType: string): Promise<AssetDataPoint | null> => {
    await new Promise(resolve => setTimeout(resolve, 200))
    const points = mockDataPoints
      .filter(dp => dp.assetId === assetId && dp.dataType === dataType)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    return Promise.resolve(points[0] || null)
  },

  // Get historical data (time series)
  getHistorical: async (assetId: string, dataType: string, days: number = 30): Promise<AssetDataPoint[]> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    return Promise.resolve(
      mockDataPoints
        .filter(dp => 
          dp.assetId === assetId && 
          dp.dataType === dataType &&
          new Date(dp.timestamp) >= cutoffDate
        )
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    )
  },

  // Create new data point (from ingestion)
  create: async (data: CreateDataPointRequest): Promise<AssetDataPoint> => {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const newDataPoint: AssetDataPoint = {
      id: `dp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      assetCode: 'TEMP-CODE', // Should be fetched from asset
      assetName: 'Asset Name', // Should be fetched from asset
      timestamp: new Date().toISOString(),
      ...data,
      currency: data.currency || 'PHP',
    }
    
    mockDataPoints.push(newDataPoint)
    return Promise.resolve(newDataPoint)
  },

  // Get performance summary for an asset
  getPerformance: async (assetId: string): Promise<AssetPerformance | null> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Calculate performance from historical data
    const navData = mockDataPoints
      .filter(dp => dp.assetId === assetId && dp.dataType === 'NAV')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    
    if (navData.length < 2) return null
    
    const current = navData[0].value
    const previous = navData[1].value
    const change = current - previous
    const changePercent = (change / previous) * 100
    
    return Promise.resolve({
      assetId,
      assetCode: navData[0].assetCode,
      currentNAV: current,
      previousNAV: previous,
      changeAmount: change,
      changePercent: changePercent,
      ytdReturn: 12.5, // Mock data
      oneMonthReturn: 2.3,
      threeMonthReturn: 5.8,
      sixMonthReturn: 8.2,
      oneYearReturn: 15.4,
      lastUpdated: navData[0].timestamp,
    })
  },

  // Bulk import data points (for file ingestion)
  bulkImport: async (dataPoints: CreateDataPointRequest[]): Promise<{ success: number; failed: number }> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    let success = 0
    let failed = 0
    
    for (const dp of dataPoints) {
      try {
        await assetDataAPI.create(dp)
        success++
      } catch (error) {
        failed++
      }
    }
    
    return Promise.resolve({ success, failed })
  },

  // Delete old data points (cleanup)
  deleteOlderThan: async (days: number): Promise<number> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    const initialCount = mockDataPoints.length
    mockDataPoints = mockDataPoints.filter(dp => new Date(dp.timestamp) >= cutoffDate)
    return Promise.resolve(initialCount - mockDataPoints.length)
  },
}

