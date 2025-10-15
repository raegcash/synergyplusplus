# Super App - Client Application

Your Financial Hub - Mobile-first marketplace for financial services

## Features

### Home Dashboard
- Quick access to all services
- Balance overview
- Recent activity

### Marketplace
- Browse financial products
- Compare offerings
- Filter by category

### Investment
- Portfolio management
- Trade execution (stocks, crypto, forex)
- Performance tracking
- Real-time charts

### Lending
- Loan applications
- Payment management
- Balance tracking
- Payment history

### Savings & Wallet
- Multiple accounts
- Transaction history
- Transfer funds
- Balance overview

### Profile
- Personal information
- Security settings
- Notification preferences

## Tech Stack

- React 18 + TypeScript
- Vite (build tool)
- Material-UI (components)
- React Query (data fetching)
- React Router (routing)
- Recharts (charts)
- Axios (HTTP client)

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
# Opens at http://localhost:3001

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Create `.env` file:

```env
VITE_API_URL=http://localhost:9002/api/v1
```

## API Integration

Connects to Client BFF at `http://localhost:9002`

Backend services:
- Investment Service (port 8084)
- Lending Service (port 8085)
- Savings Service (port 8086)
- Product Catalog Service (port 8090)

## Key Pages

- `/` - Home dashboard
- `/marketplace` - Product marketplace
- `/investment` - Investment portfolio
- `/lending` - Loan management
- `/savings` - Savings & wallet
- `/profile` - User profile

## Mobile-First Design

- Responsive layout
- Bottom navigation
- Touch-optimized UI
- Fast performance

## Build & Deploy

```bash
# Production build
npm run build

# Output: dist/ directory
# Deploy to: Vercel, Netlify, AWS S3, etc.
```

## Docker

```bash
docker build -t client-app:latest .
docker run -p 3001:80 client-app:latest
```




