# Super App - Admin Portal

Partner Management & Hypercare Control Center

## Features

### Hypercare Management
- **Products** - Manage products and maintenance mode
- **Feature Flags** - Enable/disable features with rollout control
- **Greylist** - Access control (whitelist/blacklist)
- **Real-time Controls** - Instant updates to production

### Partner Management
- Partner onboarding
- Configuration management
- API key management
- Status control

### Dashboard
- Real-time metrics
- Activity monitoring
- Quick actions

## Tech Stack

- React 18 + TypeScript
- Vite (build tool)
- Material-UI (components)
- React Query (data fetching)
- React Router (routing)
- Axios (HTTP client)

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
# Opens at http://localhost:3000

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Create `.env` file:

```env
VITE_API_URL=http://localhost:9001/api/v1
```

## API Integration

Connects to Admin BFF at `http://localhost:9001`

Backend services:
- Partner Management Service (port 8091)
- Identity Service (port 8081)
- Product Catalog Service (port 8090)

## Key Pages

- `/dashboard` - Overview and metrics
- `/hypercare/products` - Product management
- `/hypercare/features` - Feature flags
- `/hypercare/greylist` - Access control
- `/partners` - Partner list
- `/partners/new` - Add partner

## Build & Deploy

```bash
# Production build
npm run build

# Output: dist/ directory
# Deploy to: Vercel, Netlify, AWS S3, etc.
```

## Docker

```bash
docker build -t admin-portal:latest .
docker run -p 3000:80 admin-portal:latest
```




