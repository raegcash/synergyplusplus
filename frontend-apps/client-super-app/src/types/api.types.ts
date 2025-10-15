/**
 * API Types and Interfaces
 */

// Base API Response
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  metadata?: {
    timestamp: string;
    version: string;
  };
}

// Error Response
export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
    timestamp?: string;
    path?: string;
    requestId?: string;
  };
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
  metadata?: {
    timestamp: string;
  };
}

// Authentication
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    user: User;
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

// User
export interface User {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  kycStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  accountStatus: 'ACTIVE' | 'SUSPENDED' | 'CLOSED';
  subscriptionTier?: string;
  createdAt: string;
  updatedAt: string;
}

// Product
export interface Product {
  id: string;
  code: string;
  name: string;
  productType: string;
  description?: string;
  status: string;
  minInvestment: number;
  maxInvestment: number;
  currency: string;
  maintenanceMode: boolean;
  whitelistMode: boolean;
  featuresCount: number;
  enabledFeaturesCount: number;
  assetsCount: number;
  termsAndConditions?: string;
  createdAt: string;
  updatedAt: string;
}

// Partner
export interface Partner {
  id: string;
  code: string;
  name: string;
  partnerType: string;
  description?: string;
  status: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  createdAt: string;
  updatedAt: string;
}

// Asset
export interface Asset {
  id: string;
  productId: string;
  partnerId: string;
  name: string;
  symbol: string;
  assetCode: string;
  assetType: string;
  description?: string;
  currentPrice: number;
  priceCurrency: string;
  minInvestment: number;
  maxInvestment: number;
  navPerUnit?: number;
  riskLevel?: string;
  historicalReturn?: number;
  yearToDateReturn?: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// Transaction
export interface Transaction {
  id: string;
  transactionId: string;
  userId: string;
  productId: string;
  partnerId: string;
  assetId?: string;
  transactionType: string;
  transactionStatus: string;
  amount: number;
  units?: number;
  pricePerUnit?: number;
  fee: number;
  totalAmount: number;
  currency: string;
  initiatedAt: string;
  processedAt?: string;
  completedAt?: string;
  failedAt?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}

// Portfolio
export interface PortfolioSummary {
  totalPortfolioValue: number;
  totalInvestments: number;
  totalReturns: number;
  returnPercentage: number;
  todayGainLoss: number;
  todayGainLossPercentage: number;
  availableCash: number;
  currency: string;
}

export interface PortfolioHolding {
  id: string;
  userId: string;
  productId: string;
  assetId: string;
  assetName: string;
  assetSymbol: string;
  units: number;
  averageBuyPrice: number;
  currentPrice: number;
  currentValue: number;
  totalInvested: number;
  unrealizedGainLoss: number;
  unrealizedGainLossPercentage: number;
  realizedGainLoss: number;
  lastUpdated: string;
}

// Watchlist
export interface WatchlistItem {
  id: string;
  userId: string;
  assetId: string;
  asset: Asset;
  addedAt: string;
}

// Notification
export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

// User Preferences
export interface UserPreferences {
  id: string;
  userId: string;
  theme: 'light' | 'dark';
  language: string;
  currency: string;
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  twoFactorEnabled: boolean;
  updatedAt: string;
}

