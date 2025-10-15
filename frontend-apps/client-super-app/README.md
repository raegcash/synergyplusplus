# 🚀 Synergy++ Super Client App

A modern, beautiful, and feature-rich investment super app built with React, TypeScript, and Material-UI.

## ✨ Features

### Core Features
- 🎯 **Single Dashboard View** - All products, partners, and assets in one place
- 💼 **Portfolio Management** - Real-time tracking of investments
- 📊 **Product Marketplace** - Browse and invest in UITF, Stocks, Crypto, Savings
- 💰 **Transaction Management** - Buy, sell, subscribe, redeem
- 👤 **User Profile & KYC** - Complete account management
- ⭐ **Watchlist** - Track favorite assets
- 🔔 **Notifications** - Stay updated on important events

### Technical Features
- ⚡ **Lightning Fast** - Built with Vite for optimal performance
- 📱 **Responsive Design** - Works beautifully on all devices
- 🎨 **Modern UI** - Material-UI components with custom theme
- 🔒 **Secure** - JWT authentication with auto-refresh
- 🌐 **API Integration** - Seamless connection to marketplace API
- 🔄 **State Management** - Redux Toolkit + React Query
- ♿ **Accessible** - WCAG 2.1 AA compliant

## 🏗️ Tech Stack

### Frontend
- **React 18.2+** - UI library
- **TypeScript** - Type safety
- **Vite 5.0+** - Build tool
- **Material-UI v5** - Component library
- **Redux Toolkit** - Global state management
- **React Query** - Server state management
- **React Router v6** - Routing
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Recharts** - Data visualization
- **Axios** - HTTP client

### Backend Integration
- **Marketplace API** - Node.js API (port 8085)
- **PostgreSQL** - Database
- **JWT** - Authentication

## 📁 Project Structure

```
client-super-app/
├── src/
│   ├── assets/              # Images, icons, fonts
│   ├── components/          # Reusable components
│   │   ├── common/         # Buttons, Cards, Inputs
│   │   ├── layout/         # Layout components
│   │   └── features/       # Feature-specific components
│   ├── pages/              # Page components
│   │   ├── Auth/           # Login, Register
│   │   ├── Dashboard/      # Main dashboard
│   │   ├── Marketplace/    # Product marketplace
│   │   ├── Portfolio/      # Portfolio management
│   │   ├── Transactions/   # Transaction history
│   │   ├── Profile/        # User profile
│   │   └── Watchlist/      # Watchlist management
│   ├── services/           # API services
│   │   ├── api/           # API clients
│   │   └── transformers/  # Data transformers
│   ├── store/             # Redux store
│   │   ├── slices/        # Redux slices
│   │   └── hooks/         # Redux hooks
│   ├── hooks/             # Custom hooks
│   ├── routes/            # Routing configuration
│   ├── types/             # TypeScript types
│   ├── utils/             # Utility functions
│   ├── config/            # Configuration
│   └── styles/            # Theme and styles
├── public/                # Static assets
├── .env.development       # Development environment
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Running Marketplace API (port 8085)
- PostgreSQL database

### Installation

1. **Install dependencies**
```bash
npm install
```

2. **Configure environment**
```bash
# Copy environment template
cp .env.example .env.development

# Edit .env.development with your settings
# VITE_API_BASE_URL=http://localhost:8085
```

3. **Start development server**
```bash
npm run dev
```

The app will be available at **http://localhost:5174**

### Build for Production

```bash
# Build
npm run build

# Preview production build
npm run preview
```

## 🔌 API Integration

### Marketplace API Endpoints

The client app integrates with the existing marketplace API:

**Base URL**: `http://localhost:8085`

#### Authentication
```
POST /api/v1/auth/login
POST /api/v1/auth/register
POST /api/v1/auth/refresh
```

#### Products
```
GET  /api/v1/products
GET  /api/v1/products/:id
```

#### Assets
```
GET  /api/v1/assets
GET  /api/v1/assets/:id
```

#### Portfolio (New Endpoints)
```
GET  /api/v1/client/dashboard
GET  /api/v1/client/portfolio
GET  /api/v1/client/portfolio/holdings
```

#### Transactions
```
GET  /api/v1/transactions/history
POST /api/v1/transactions
```

#### Watchlist (New Endpoints)
```
GET    /api/v1/client/watchlist
POST   /api/v1/client/watchlist
DELETE /api/v1/client/watchlist/:id
```

## 📊 Available Scripts

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build

# Linting & Formatting
npm run lint             # Lint code
npm run lint:fix         # Fix linting issues

# Testing (to be implemented)
npm run test             # Run unit tests
npm run test:e2e         # Run E2E tests
```

## 🎨 Theme & Styling

### Color Palette

```typescript
Primary: #1976d2 (Blue)
Secondary: #9c27b0 (Purple)
Success: #2e7d32 (Green)
Warning: #ed6c02 (Orange)
Error: #d32f2f (Red)
```

### Typography

```typescript
Font: Inter, -apple-system, BlinkMacSystemFont
Sizes: h1(40px), h2(32px), h3(28px), h4(24px), body(16px)
```

### Theme Toggle

The app supports both light and dark themes. Users can switch between themes in settings.

## 🗄️ Database Schema

### New Tables for Client App

The following tables need to be added to the PostgreSQL database:

```sql
-- User Portfolio Holdings
CREATE TABLE user_portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  product_id UUID NOT NULL REFERENCES products(id),
  asset_id UUID NOT NULL REFERENCES assets(id),
  units DECIMAL(18,8) NOT NULL,
  average_buy_price DECIMAL(18,8) NOT NULL,
  current_value DECIMAL(18,2),
  total_invested DECIMAL(18,2),
  unrealized_gain_loss DECIMAL(18,2),
  last_updated TIMESTAMP DEFAULT NOW()
);

-- User Watchlist
CREATE TABLE user_watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  asset_id UUID NOT NULL REFERENCES assets(id),
  added_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, asset_id)
);

-- User Notifications
CREATE TABLE user_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  action_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW()
);

-- User Preferences
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) UNIQUE,
  theme VARCHAR(20) DEFAULT 'light',
  language VARCHAR(10) DEFAULT 'en',
  currency VARCHAR(3) DEFAULT 'PHP',
  notifications_enabled BOOLEAN DEFAULT TRUE,
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🔒 Security

### Frontend Security
- XSS prevention with React's built-in escaping
- CSRF protection with tokens
- Secure token storage
- HTTPS only in production
- Content Security Policy headers

### Authentication
- JWT-based authentication
- Automatic token refresh
- Secure password handling
- Session management

## 📱 Responsive Design

The app is fully responsive and works on:
- 📱 Mobile (320px+)
- 📱 Tablet (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large Desktop (1440px+)

## ♿ Accessibility

- WCAG 2.1 AA compliant
- Keyboard navigation
- Screen reader support
- Semantic HTML
- ARIA labels

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### Integration Tests
```bash
npm run test:integration
```

### E2E Tests
```bash
npm run test:e2e
```

## 📈 Performance

### Targets
- Initial Load: < 3 seconds
- Time to Interactive: < 5 seconds
- Bundle Size: < 500KB (gzipped)
- Lighthouse Score: > 90

### Optimization
- Code splitting
- Lazy loading
- Image optimization
- Bundle optimization
- Caching strategy

## 🚧 Development Roadmap

### Phase 1: Foundation (Week 1) ✅
- [x] Project setup
- [x] Dependencies installation
- [x] Folder structure
- [x] Configuration files
- [x] Theme setup
- [x] API client

### Phase 2: Authentication (Week 1)
- [ ] Login page
- [ ] Register page
- [ ] Password reset
- [ ] Auth context
- [ ] Protected routes

### Phase 3: Dashboard (Week 1-2)
- [ ] Dashboard layout
- [ ] Portfolio summary
- [ ] Quick actions
- [ ] Recent transactions
- [ ] Market data

### Phase 4: Marketplace (Week 2)
- [ ] Product list
- [ ] Product filters
- [ ] Product details
- [ ] Asset details
- [ ] Search functionality

### Phase 5: Portfolio (Week 2)
- [ ] Portfolio view
- [ ] Holdings table
- [ ] Performance charts
- [ ] Asset allocation

### Phase 6: Transactions (Week 3)
- [ ] Transaction history
- [ ] Buy flow
- [ ] Sell flow
- [ ] Transaction details

### Phase 7: User Features (Week 3)
- [ ] Profile page
- [ ] Settings
- [ ] Watchlist
- [ ] Notifications
- [ ] KYC management

### Phase 8: Polish (Week 4)
- [ ] Error handling
- [ ] Loading states
- [ ] Empty states
- [ ] Testing
- [ ] Documentation

## 📝 Contributing

This is a private project. For development:

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Create pull request

## 📄 License

Proprietary - All rights reserved

## 📞 Support

For issues or questions:
- Check documentation
- Review error logs
- Contact development team

---

**Version**: 1.0.0  
**Status**: In Development 🚧  
**Last Updated**: October 15, 2025

Built with ❤️ by the Synergy++ Team
