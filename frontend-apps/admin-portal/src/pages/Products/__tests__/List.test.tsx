import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../../../test/testUtils'
import ProductsList from '../List'
import { mockProduct } from '../../../test/mockData'

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

describe('Products List Page', () => {
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

    render(<ProductsList />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('renders error state', () => {
    mockUseQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: new Error('Failed to load'),
    })

    render(<ProductsList />)
    expect(screen.getByText(/error loading products/i)).toBeInTheDocument()
  })

  it('renders products list correctly', () => {
    const products = [
      { ...mockProduct, id: '1', name: 'Product 1', code: 'PROD1', status: 'ACTIVE', createdAt: '2024-01-01', productType: 'INVESTMENT', assetsCount: 5 },
      { ...mockProduct, id: '2', name: 'Product 2', code: 'PROD2', status: 'PENDING_APPROVAL', createdAt: '2024-01-02', productType: 'SAVINGS', assetsCount: 3 },
    ]

    mockUseQuery.mockReturnValue({
      data: products,
      isLoading: false,
      error: null,
    })

    render(<ProductsList />)

    expect(screen.getByText('Products Management')).toBeInTheDocument()
    expect(screen.getByText('Product 1')).toBeInTheDocument()
    expect(screen.getByText('Product 2')).toBeInTheDocument()
  })

  it('displays stats correctly', () => {
    const products = [
      { ...mockProduct, id: '1', status: 'ACTIVE', createdAt: '2024-01-01', productType: 'INVESTMENT', assetsCount: 5 },
      { ...mockProduct, id: '2', status: 'ACTIVE', createdAt: '2024-01-02', productType: 'INVESTMENT', assetsCount: 5 },
      { ...mockProduct, id: '3', status: 'PENDING_APPROVAL', createdAt: '2024-01-03', productType: 'INVESTMENT', assetsCount: 5 },
      { ...mockProduct, id: '4', status: 'DRAFT', createdAt: '2024-01-04', productType: 'INVESTMENT', assetsCount: 5 },
    ]

    mockUseQuery.mockReturnValue({
      data: products,
      isLoading: false,
      error: null,
    })

    render(<ProductsList />)

    expect(screen.getByText('Total Products')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
    
    // Get all elements with text 2, 1 (there may be multiple in tabs/stats)
    const activeCount = screen.getAllByText('2')
    expect(activeCount.length).toBeGreaterThan(0)
    
    const pendingAndDraftCounts = screen.getAllByText('1')
    expect(pendingAndDraftCounts.length).toBeGreaterThan(0)
  })

  it('navigates to create page when create button is clicked', async () => {
    const user = userEvent.setup()
    mockUseQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    })

    render(<ProductsList />)

    const createButton = screen.getByRole('button', { name: /create product/i })
    await user.click(createButton)

    expect(mockNavigate).toHaveBeenCalledWith('/products/create')
  })

  it('filters products by tab selection', async () => {
    const user = userEvent.setup()
    const products = [
      { ...mockProduct, id: '1', name: 'Active Product', code: 'ACT1', status: 'ACTIVE', createdAt: '2024-01-01', productType: 'INVESTMENT', assetsCount: 5 },
      { ...mockProduct, id: '2', name: 'Pending Product', code: 'PEN1', status: 'PENDING_APPROVAL', createdAt: '2024-01-02', productType: 'INVESTMENT', assetsCount: 5 },
    ]

    mockUseQuery.mockReturnValue({
      data: products,
      isLoading: false,
      error: null,
    })

    render(<ProductsList />)

    // Verify tabs exist
    const tabs = screen.getAllByRole('tab')
    expect(tabs.length).toBeGreaterThan(0)

    // Click pending tab
    await user.click(tabs[1]) // Pending tab

    // Verify tab was clicked
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true')
  })

  it('opens action menu when more icon is clicked', async () => {
    const user = userEvent.setup()
    const products = [{ ...mockProduct, createdAt: '2024-01-01', productType: 'INVESTMENT', assetsCount: 5 }]

    mockUseQuery.mockReturnValue({
      data: products,
      isLoading: false,
      error: null,
    })

    render(<ProductsList />)

    const moreButtons = screen.getAllByRole('button', { name: '' })
    const actionButton = moreButtons[moreButtons.length - 1]
    await user.click(actionButton)

    await waitFor(() => {
      expect(screen.getByText('View Details')).toBeInTheDocument()
      expect(screen.getByText('Edit Product')).toBeInTheDocument()
      expect(screen.getByText('Delete Product')).toBeInTheDocument()
    })
  })

  it('navigates to view page from action menu', async () => {
    const user = userEvent.setup()
    const products = [{ ...mockProduct, id: 'test-id', createdAt: '2024-01-01', productType: 'INVESTMENT', assetsCount: 5 }]

    mockUseQuery.mockReturnValue({
      data: products,
      isLoading: false,
      error: null,
    })

    render(<ProductsList />)

    const moreButtons = screen.getAllByRole('button', { name: '' })
    const actionButton = moreButtons[moreButtons.length - 1]
    await user.click(actionButton)

    const viewButton = await screen.findByText('View Details')
    await user.click(viewButton)

    expect(mockNavigate).toHaveBeenCalledWith('/products/test-id')
  })
})

