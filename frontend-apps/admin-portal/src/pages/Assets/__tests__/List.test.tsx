import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../../../test/testUtils'
import AssetsList from '../List'
import { mockAsset } from '../../../test/mockData'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const mockUseQuery = vi.fn()
const mockUseMutation = vi.fn()
const mockInvalidateQueries = vi.fn()

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query')
  return {
    ...actual,
    useQuery: (...args: any[]) => mockUseQuery(...args),
    useMutation: (...args: any[]) => mockUseMutation(...args),
    useQueryClient: () => ({
      invalidateQueries: mockInvalidateQueries,
    }),
  }
})

describe('Assets List Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseMutation.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    })
  })

  it('renders loading state', () => {
    mockUseQuery.mockReturnValue({
      data: [],
      isLoading: true,
      error: null,
    })

    render(<AssetsList />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('renders error state', () => {
    mockUseQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: new Error('Failed to load'),
    })

    render(<AssetsList />)
    expect(screen.getByText(/error loading assets/i)).toBeInTheDocument()
  })

  it('renders assets list correctly', () => {
    const assets = [
      { ...mockAsset, id: '1', name: 'Asset 1', symbol: 'AST1', type: 'STOCK', status: 'ACTIVE' },
      { ...mockAsset, id: '2', name: 'Asset 2', symbol: 'AST2', type: 'CRYPTO', status: 'ACTIVE' },
    ]

    // Mock both queries
    let callCount = 0
    mockUseQuery.mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        return { data: assets, isLoading: false, error: null }
      }
      return { data: [], isLoading: false, error: null }
    })

    render(<AssetsList />)

    expect(screen.getByText('Asset 1')).toBeInTheDocument()
    expect(screen.getByText('Asset 2')).toBeInTheDocument()
  })

  it('displays stats correctly', () => {
    const assets = [
      { ...mockAsset, id: '1', status: 'ACTIVE', type: 'STOCK' },
      { ...mockAsset, id: '2', status: 'ACTIVE', type: 'CRYPTO' },
      { ...mockAsset, id: '3', status: 'PENDING_APPROVAL', type: 'STOCK' },
      { ...mockAsset, id: '4', status: 'REJECTED', type: 'BOND' },
    ]

    let callCount = 0
    mockUseQuery.mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        return { data: assets, isLoading: false, error: null }
      }
      return { data: [], isLoading: false, error: null }
    })

    render(<AssetsList />)

    expect(screen.getByText('Total Assets')).toBeInTheDocument()
  })

  it('navigates to create page when add button is clicked', async () => {
    const user = userEvent.setup()
    
    let callCount = 0
    mockUseQuery.mockImplementation(() => {
      callCount++
      return { data: [], isLoading: false, error: null }
    })

    render(<AssetsList />)

    const addButton = screen.getByRole('button', { name: /add asset/i })
    await user.click(addButton)

    expect(mockNavigate).toHaveBeenCalledWith('/assets/create')
  })

  it('renders asset details', () => {
    const assets = [
      { ...mockAsset, id: '1', name: 'Bitcoin', symbol: 'BTC', type: 'CRYPTO', status: 'ACTIVE' },
      { ...mockAsset, id: '2', name: 'Ethereum', symbol: 'ETH', type: 'CRYPTO', status: 'ACTIVE' },
    ]

    let callCount = 0
    mockUseQuery.mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        return { data: assets, isLoading: false, error: null }
      }
      return { data: [], isLoading: false, error: null }
    })

    render(<AssetsList />)

    expect(screen.getByText('Bitcoin')).toBeInTheDocument()
    expect(screen.getByText('Ethereum')).toBeInTheDocument()
  })

  it('renders asset table with correct columns', () => {
    const assets = [{ ...mockAsset, name: 'Test Asset', symbol: 'TEST' }]

    let callCount = 0
    mockUseQuery.mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        return { data: assets, isLoading: false, error: null }
      }
      return { data: [], isLoading: false, error: null }
    })

    render(<AssetsList />)

    expect(screen.getByText('Test Asset')).toBeInTheDocument()
    expect(screen.getByText('TEST')).toBeInTheDocument()
  })

  it('displays asset information correctly', () => {
    const assets = [{ ...mockAsset, id: 'test-id', name: 'Test Asset', symbol: 'TEST', status: 'ACTIVE' }]

    let callCount = 0
    mockUseQuery.mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        return { data: assets, isLoading: false, error: null }
      }
      return { data: [], isLoading: false, error: null }
    })

    render(<AssetsList />)

    expect(screen.getByText('Test Asset')).toBeInTheDocument()
    expect(screen.getByText('TEST')).toBeInTheDocument()
  })
})

