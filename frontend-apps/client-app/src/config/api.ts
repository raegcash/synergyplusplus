export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8085/api/marketplace'

export const API_ENDPOINTS = {
  // Products/Marketplace endpoints
  products: '/products',
  partners: '/partners',
  assets: '/assets',
  
  // Investment endpoints (will be implemented)
  investment: {
    portfolios: '/portfolios',
    positions: '/positions',
    trades: '/trades',
    execute: '/trades/execute',
  },
  // Lending endpoints (will be implemented)
  lending: {
    apply: '/loans/apply',
    myLoans: '/loans/my',
    payments: '/loans/payments',
  },
  // Savings endpoints (will be implemented)
  savings: {
    accounts: '/savings/accounts',
    transactions: '/savings/transactions',
  },
  // Marketplace endpoints
  marketplace: {
    products: '/products',
    featured: '/products?status=ACTIVE',
  },
}


