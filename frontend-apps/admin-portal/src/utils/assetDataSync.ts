// Utility to sync asset data with latest integration data points
import { Asset } from '../services/assets'
import { AssetDataPoint, assetDataAPI } from '../services/assetData'

/**
 * Enriches an asset with the latest data from integrations
 * This ensures that displayed prices match the latest NAV/market data
 */
export const enrichAssetWithLatestData = async (asset: Asset): Promise<Asset> => {
  try {
    // Get latest NAV data point for this asset
    const latestNav = await assetDataAPI.getLatestByAssetAndType(asset.id, 'NAV')
    
    if (latestNav) {
      // Override the current price with latest NAV
      return {
        ...asset,
        currentPrice: latestNav.value,
        navPerUnit: latestNav.value,
        lastDataUpdate: latestNav.timestamp,
        hasDataIntegration: true,
      }
    }
    
    // If no NAV, try market price
    const latestPrice = await assetDataAPI.getLatestByAssetAndType(asset.id, 'MARKET_PRICE')
    if (latestPrice) {
      return {
        ...asset,
        currentPrice: latestPrice.value,
        lastDataUpdate: latestPrice.timestamp,
        hasDataIntegration: true,
      }
    }
    
    // No integration data available
    return asset
  } catch (error) {
    console.error('Error enriching asset with latest data:', error)
    return asset
  }
}

/**
 * Enriches multiple assets with latest data
 */
export const enrichAssetsWithLatestData = async (assets: Asset[]): Promise<Asset[]> => {
  // Process in parallel for better performance
  const enrichedAssets = await Promise.all(
    assets.map(asset => enrichAssetWithLatestData(asset))
  )
  return enrichedAssets
}

/**
 * Calculates 24h change from historical data
 */
export const calculate24hChange = async (assetId: string): Promise<{
  changeAmount: number
  changePercent: number
} | null> => {
  try {
    const historical = await assetDataAPI.getHistorical(assetId, 'NAV', 2)
    
    if (historical.length >= 2) {
      const latest = historical[historical.length - 1]
      const previous = historical[historical.length - 2]
      
      const changeAmount = latest.value - previous.value
      const changePercent = (changeAmount / previous.value) * 100
      
      return { changeAmount, changePercent }
    }
    
    return null
  } catch (error) {
    console.error('Error calculating 24h change:', error)
    return null
  }
}

/**
 * Gets the display price for an asset (prioritizes integration data)
 */
export const getAssetDisplayPrice = (
  asset: Asset,
  latestDataPoint?: AssetDataPoint | null
): number => {
  // Priority 1: Latest data point
  if (latestDataPoint) {
    return latestDataPoint.value
  }
  
  // Priority 2: NAV per unit (for funds)
  if (asset.navPerUnit && asset.navPerUnit > 0) {
    return asset.navPerUnit
  }
  
  // Priority 3: Current price
  return asset.currentPrice
}

/**
 * Formats price with currency
 */
export const formatPrice = (price: number, currency: string = 'PHP'): string => {
  return `${currency} ${price.toFixed(4)}`
}

/**
 * Gets last update timestamp
 */
export const getLastUpdateTime = (
  asset: Asset,
  latestDataPoint?: AssetDataPoint | null
): string => {
  if (latestDataPoint) {
    return latestDataPoint.timestamp
  }
  
  if (asset.lastDataUpdate) {
    return asset.lastDataUpdate
  }
  
  return asset.createdAt
}



