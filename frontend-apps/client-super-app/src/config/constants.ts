/**
 * Application Constants
 */

export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Synergy++ Super App';
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0';

// Use relative path for API calls - Vite proxy will handle the routing
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
export const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 30000;

// Local Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'synergy_access_token',
  REFRESH_TOKEN: 'synergy_refresh_token',
  USER_DATA: 'synergy_user_data',
  THEME_MODE: 'synergy_theme_mode',
  LANGUAGE: 'synergy_language',
} as const;

// Product Types
export const PRODUCT_TYPES = {
  UITF: 'UITF',
  STOCKS: 'STOCKS',
  CRYPTO: 'CRYPTO',
  SAVINGS: 'SAVINGS',
  LENDING: 'LENDING',
  INSURANCE: 'INSURANCE',
} as const;

// Asset Types
export const ASSET_TYPES = {
  STOCK: 'STOCK',
  CRYPTO: 'CRYPTO',
  FUND: 'FUND',
  UITF: 'UITF',
  BOND: 'BOND',
} as const;

// Transaction Types
export const TRANSACTION_TYPES = {
  SUBSCRIPTION: 'SUBSCRIPTION',
  REDEMPTION: 'REDEMPTION',
  BUY: 'BUY',
  SELL: 'SELL',
  DEPOSIT: 'DEPOSIT',
  WITHDRAWAL: 'WITHDRAWAL',
} as const;

// Transaction Status
export const TRANSACTION_STATUS = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
} as const;

// Currency
export const CURRENCY = {
  PHP: 'PHP',
  USD: 'USD',
} as const;

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_WITH_TIME: 'MMM dd, yyyy HH:mm',
  API: "yyyy-MM-dd'T'HH:mm:ss'Z'",
  SHORT: 'MM/dd/yyyy',
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// Chart Colors
export const CHART_COLORS = {
  PRIMARY: '#1976d2',
  SUCCESS: '#2e7d32',
  WARNING: '#ed6c02',
  ERROR: '#d32f2f',
  INFO: '#0288d1',
  GREY: '#757575',
} as const;

// Risk Levels
export const RISK_LEVELS = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  VERY_HIGH: 'VERY_HIGH',
} as const;

// KYC Status
export const KYC_STATUS = {
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED',
} as const;


