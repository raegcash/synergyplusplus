import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../../test/testUtils'
import Dashboard from '../Dashboard'

// Mock recharts to avoid rendering issues in tests
vi.mock('recharts', () => ({
  LineChart: () => <div>LineChart</div>,
  Line: () => <div>Line</div>,
  AreaChart: () => <div>AreaChart</div>,
  Area: () => <div>Area</div>,
  BarChart: () => <div>BarChart</div>,
  Bar: () => <div>Bar</div>,
  XAxis: () => <div>XAxis</div>,
  YAxis: () => <div>YAxis</div>,
  CartesianGrid: () => <div>CartesianGrid</div>,
  Tooltip: () => <div>Tooltip</div>,
  Legend: () => <div>Legend</div>,
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
}))

// Mock WorkflowDiagram component
vi.mock('../../components/WorkflowDiagram', () => ({
  default: () => <div data-testid="workflow-diagram">Workflow Diagram</div>,
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('Dashboard Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders dashboard title and subtitle', () => {
    render(<Dashboard />)

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Welcome to your management portal')).toBeInTheDocument()
  })

  it('displays stat cards with correct data', () => {
    render(<Dashboard />)

    expect(screen.getByText('Active Products')).toBeInTheDocument()
    expect(screen.getByText('24')).toBeInTheDocument()
    expect(screen.getByText('+2 from last week')).toBeInTheDocument()

    expect(screen.getByText('Whitelisted Users')).toBeInTheDocument()
    expect(screen.getByText('1,429')).toBeInTheDocument()
    expect(screen.getByText('+12% this month')).toBeInTheDocument()

    expect(screen.getByText('Maintenance Mode')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('2 scheduled')).toBeInTheDocument()

    expect(screen.getByText('Active Rules')).toBeInTheDocument()
    expect(screen.getByText('156')).toBeInTheDocument()
    expect(screen.getByText('All operational')).toBeInTheDocument()
  })

  it('displays growth trends section', () => {
    render(<Dashboard />)

    expect(screen.getByText('Growth Trends')).toBeInTheDocument()
    expect(screen.getByText('Track marketplace growth across products, partners, and assets')).toBeInTheDocument()
    expect(screen.getByText('Marketplace Growth (Last 6 Months)')).toBeInTheDocument()
    expect(screen.getByText('Weekly Activity')).toBeInTheDocument()
    expect(screen.getByText('Approval Pipeline')).toBeInTheDocument()
  })

  it('displays product lifecycle workflow', () => {
    render(<Dashboard />)

    expect(screen.getByText('Product Lifecycle Workflow')).toBeInTheDocument()
    expect(screen.getByText('Standard workflow for product, partner, and asset onboarding')).toBeInTheDocument()
    expect(screen.getByTestId('workflow-diagram')).toBeInTheDocument()
  })

  it('displays marketplace management section', () => {
    render(<Dashboard />)

    expect(screen.getByText('Marketplace Management')).toBeInTheDocument()
    expect(screen.getByText('Manage products, partners, and assets in your marketplace')).toBeInTheDocument()

    // Check for quick action cards
    expect(screen.getByText('Products')).toBeInTheDocument()
    expect(screen.getByText('Add and manage marketplace products')).toBeInTheDocument()
    
    expect(screen.getByText('Partners')).toBeInTheDocument()
    expect(screen.getByText('Onboard and manage partners')).toBeInTheDocument()
    
    expect(screen.getByText('Assets')).toBeInTheDocument()
    expect(screen.getByText('Manage investment assets & data')).toBeInTheDocument()
  })

  it('displays hypercare operations section', () => {
    render(<Dashboard />)

    expect(screen.getByText('Hypercare Operations')).toBeInTheDocument()
    expect(screen.getByText('Monitor and control live product operations')).toBeInTheDocument()

    expect(screen.getByText('Products & Features')).toBeInTheDocument()
    expect(screen.getByText('Control product operational status')).toBeInTheDocument()
    
    expect(screen.getByText('Greylist')).toBeInTheDocument()
    expect(screen.getByText('Manage whitelist & blacklist')).toBeInTheDocument()
  })

  it('displays operations and analytics section', () => {
    render(<Dashboard />)

    expect(screen.getByText('Operations & Analytics')).toBeInTheDocument()
    expect(screen.getByText('Monitor performance, manage users, and generate reports')).toBeInTheDocument()

    expect(screen.getByText('Operations Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Performance overview & metrics')).toBeInTheDocument()
    
    expect(screen.getByText('User Management')).toBeInTheDocument()
    expect(screen.getByText('Manage users & onboarding')).toBeInTheDocument()
    
    expect(screen.getByText('Performance')).toBeInTheDocument()
    expect(screen.getByText('Product & partner analytics')).toBeInTheDocument()
    
    expect(screen.getByText('Reports')).toBeInTheDocument()
    expect(screen.getByText('Generate comprehensive reports')).toBeInTheDocument()
  })

  it('navigates to products page when clicking products card', async () => {
    const user = userEvent.setup()
    render(<Dashboard />)

    const productsCard = screen.getByText('Products').closest('div')?.parentElement
    const openButton = productsCard?.querySelector('button')

    if (openButton) {
      await user.click(openButton)
      expect(mockNavigate).toHaveBeenCalledWith('/products')
    }
  })

  it('navigates to partners page when clicking partners card', async () => {
    const user = userEvent.setup()
    render(<Dashboard />)

    const partnersCard = screen.getByText('Partners').closest('div')?.parentElement
    const openButton = partnersCard?.querySelector('button')

    if (openButton) {
      await user.click(openButton)
      expect(mockNavigate).toHaveBeenCalledWith('/partners')
    }
  })

  it('navigates to assets page when clicking assets card', async () => {
    const user = userEvent.setup()
    render(<Dashboard />)

    const assetsCard = screen.getByText('Assets').closest('div')?.parentElement
    const openButton = assetsCard?.querySelector('button')

    if (openButton) {
      await user.click(openButton)
      expect(mockNavigate).toHaveBeenCalledWith('/assets')
    }
  })

  it('navigates to hypercare page when clicking products & features card', async () => {
    const user = userEvent.setup()
    render(<Dashboard />)

    const hypercareCard = screen.getByText('Products & Features').closest('div')?.parentElement
    const openButton = hypercareCard?.querySelector('button')

    if (openButton) {
      await user.click(openButton)
      expect(mockNavigate).toHaveBeenCalledWith('/hypercare')
    }
  })

  it('navigates to operations page when clicking operations dashboard card', async () => {
    const user = userEvent.setup()
    render(<Dashboard />)

    const operationsCard = screen.getByText('Operations Dashboard').closest('div')?.parentElement
    const openButton = operationsCard?.querySelector('button')

    if (openButton) {
      await user.click(openButton)
      expect(mockNavigate).toHaveBeenCalledWith('/operations')
    }
  })
})

