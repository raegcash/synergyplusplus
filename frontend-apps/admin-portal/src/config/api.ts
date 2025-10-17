/**
 * API Configuration for Admin Portal
 * 
 * TEMPORARY CONFIG: Calling Marketplace API directly while Admin BFF is being fixed
 * 
 * Current Architecture:
 * Admin Portal → Marketplace API (port 8085) [TEMPORARY]
 * 
 * TODO: Switch back to Admin BFF once Maven/Docker environment is set up:
 * Admin Portal → Admin BFF (port 9001) → Backend Services
 */

// TEMPORARY: Direct to Marketplace API (verified working with database)
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8085/api/marketplace'

// Admin Identity Service for authentication (port 8082) - Separate from Customer Identity!
export const AUTH_BASE_URL = import.meta.env.VITE_AUTH_URL || 'http://localhost:8082/api/v1'

/**
 * ⚠️ TEMPORARY CONFIGURATION
 * 
 * Current: http://localhost:8085/api/marketplace (Direct to Marketplace API)
 * Future: http://localhost:9001/api/v1 (Via Admin BFF)
 * 
 * Why temporary:
 * - Maven not available to build Admin BFF
 * - Docker environment needs configuration
 * - Marketplace API IS working and returning database data correctly
 * 
 * This configuration allows immediate data persistence while we set up proper BFF
 */

export default {
  API_BASE_URL,
  AUTH_BASE_URL,
}
