# Admin Portal - Testing Guide

## 🧪 Testing Framework

This project uses **Vitest** and **React Testing Library** for comprehensive unit and integration testing.

## 📦 Quick Start

```bash
# Install dependencies (if not already installed)
npm install

# Run tests in watch mode
npm test

# Run tests once (CI mode)
npm test -- --run

# Run tests with UI
npm test:ui

# Generate coverage report
npm test:coverage
```

## 🎯 What's Tested

### ✅ Core Features (89 Tests)
- **Authentication**: Login, logout, session management
- **Dashboard**: All sections and navigation
- **Partners**: List, filtering, actions
- **Products**: List, filtering, actions  
- **Hypercare**: Maintenance mode, status controls
- **Services**: Auth API, token management
- **Contexts**: Auth state management
- **Components**: Protected routes, layouts

## 📊 Test Coverage

```
Test Files: 8 passed
Tests: 89 passed
Duration: ~10s
```

## 🛠️ Test Structure

```
src/
├── test/
│   ├── setup.ts          # Global test setup
│   ├── testUtils.tsx     # Custom render with providers
│   └── mockData.ts       # Reusable mock data
├── pages/__tests__/       # Page component tests
├── services/__tests__/    # Service layer tests
├── contexts/__tests__/    # Context tests
└── components/__tests__/  # Component tests
```

## ✍️ Writing Tests

### Basic Test Example

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '../../test/testUtils'
import MyComponent from '../MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('handles user interaction', async () => {
    const user = userEvent.setup()
    render(<MyComponent />)
    
    await user.click(screen.getByRole('button'))
    expect(screen.getByText('Clicked')).toBeInTheDocument()
  })
})
```

### Testing Async Operations

```typescript
it('loads data', async () => {
  render(<MyComponent />)
  
  // Wait for loading to complete
  await waitFor(() => {
    expect(screen.getByText('Data loaded')).toBeInTheDocument()
  })
})
```

### Mocking API Calls

```typescript
import { vi } from 'vitest'

vi.mock('../services/api', () => ({
  fetchData: vi.fn(() => Promise.resolve({ data: [] }))
}))
```

## 🎨 Testing Best Practices

### ✅ Do's
- Test user behavior, not implementation
- Use accessible queries (`getByRole`, `getByLabelText`)
- Mock external dependencies
- Keep tests independent
- Use descriptive test names

### ❌ Don'ts
- Don't test implementation details
- Don't use fragile selectors (CSS classes)
- Don't create interdependent tests
- Don't skip error cases

## 🔍 Debugging Tests

### Run Single Test File
```bash
npm test -- Login.test.tsx
```

### Run Single Test
```bash
npm test -- -t "logs in successfully"
```

### Debug in VS Code
Add to `.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Tests",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["test"],
  "console": "integratedTerminal"
}
```

## 📈 Coverage Reports

Generate coverage report:
```bash
npm test:coverage
```

View HTML report:
```bash
open coverage/index.html
```

## 🚀 CI/CD Integration

### GitHub Actions Example
```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test -- --run
      - run: npm run build
```

## 🆘 Troubleshooting

### Tests Fail After Dependency Update
```bash
npm ci
rm -rf node_modules
npm install
```

### Memory Issues
```bash
NODE_OPTIONS=--max_old_space_size=4096 npm test
```

### Port Already in Use
Tests don't use actual ports, but if you have issues:
```bash
killall node
npm test
```

## 📚 Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## ✅ Production Ready

All tests are passing and the application is production-ready with:
- ✅ Comprehensive test coverage
- ✅ All critical paths tested
- ✅ Error handling verified
- ✅ User interactions validated
- ✅ Loading states tested

