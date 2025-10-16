import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { render } from '../../../test/testUtils'
import OperationsDashboard from '../Index'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const mockUseQuery = vi.fn()

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query')
  return {
    ...actual,
    useQuery: (...args: any[]) => mockUseQuery(...args),
  }
})

// Mock recharts
vi.mock('recharts', () => ({
  LineChart: () => <div>LineChart</div>,
  Line: () => <div>Line</div>,
  AreaChart: () => <div>AreaChart</div>,
  Area: () => <div>Area</div>,
  BarChart: () => <div>BarChart</div>,
  Bar: () => <div>Bar</div>,
  PieChart: () => <div>PieChart</div>,
  Pie: () => <div>Pie</div>,
  Cell: () => <div>Cell</div>,
  XAxis: () => <div>XAxis</div>,
  YAxis: () => <div>YAxis</div>,
  CartesianGrid: () => <div>CartesianGrid</div>,
  Tooltip: () => <div>Tooltip</div>,
  Legend: () => <div>Legend</div>,
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
}))

// Mock WorkflowDiagram
vi.mock('../../../components/WorkflowDiagram', () => ({
  default: () => <div data-testid="workflow-diagram">Workflow Diagram</div>,
}))

describe('Operations Dashboard Page', () => {
  const mockStats = {
    totalUsers: 14500,
    activeUsers: 11800,
    totalTransactions: 28700,
    totalRevenue: 28700,
    totalProducts: 24,
    totalPartners: 21,
  }

  const mockProductPerformance = [
    { productName: 'GCrypto', transactions: 4250, performanceScore: 85 },
    { productName: 'GStocks', transactions: 3800, performanceScore: 92 },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup default mock return values for all useQuery calls
    mockUseQuery.mockReturnValue({
      data: mockStats,
      isLoading: false,
      error: null,
    })
  })

  it('renders dashboard title', () => {
    render(<OperationsDashboard />)

    expect(screen.getByText('Operations Dashboard')).toBeInTheDocument()
  })

  it('displays operational stats', () => {
    render(<OperationsDashboard />)

    expect(screen.getByText('Key Metrics')).toBeInTheDocument()
  })

  it('displays transaction trends section', () => {
    render(<OperationsDashboard />)

    expect(screen.getByText('Transaction Trends')).toBeInTheDocument()
  })

  it('displays user growth section', () => {
    render(<OperationsDashboard />)

    expect(screen.getByText('User Growth')).toBeInTheDocument()
  })

  it('displays product distribution section', () => {
    render(<OperationsDashboard />)

    expect(screen.getByText('Product Distribution')).toBeInTheDocument()
  })

  it('displays daily activity section', () => {
    render(<OperationsDashboard />)

    expect(screen.getByText('Daily Activity')).toBeInTheDocument()
  })

  it('displays operational workflow', () => {
    render(<OperationsDashboard />)

    expect(screen.getByText('Operational Workflow')).toBeInTheDocument()
    expect(screen.getByTestId('workflow-diagram')).toBeInTheDocument()
  })

  it('displays partner type distribution', () => {
    render(<OperationsDashboard />)

    expect(screen.getByText('Partner Distribution')).toBeInTheDocument()
  })

  it('renders all chart sections', () => {
    render(<OperationsDashboard />)

    // Check for chart presence through section titles
    expect(screen.getByText('Transaction Trends')).toBeInTheDocument()
    expect(screen.getByText('User Growth')).toBeInTheDocument()
    expect(screen.getByText('Product Distribution')).toBeInTheDocument()
    expect(screen.getByText('Daily Activity')).toBeInTheDocument()
  })
})

