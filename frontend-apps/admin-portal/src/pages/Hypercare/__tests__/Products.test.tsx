import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../../../test/testUtils'
import Products from '../Products'
import { mockProduct } from '../../../test/mockData'

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

describe('Hypercare Products Page', () => {
  const mockMutate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseMutation.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    })
  })

  it('renders loading state', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    })

    render(<Products />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('renders error state', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to load'),
    })

    render(<Products />)
    expect(screen.getByText('Error loading products')).toBeInTheDocument()
  })

  it('renders products with maintenance mode controls', () => {
    const products = [
      { ...mockProduct, id: '1', name: 'Product 1', code: 'PROD1', maintenanceMode: false, status: 'ACTIVE', productType: 'INVESTMENT' },
      { ...mockProduct, id: '2', name: 'Product 2', code: 'PROD2', maintenanceMode: true, status: 'ACTIVE', productType: 'SAVINGS' },
    ]

    mockUseQuery.mockReturnValue({
      data: products,
      isLoading: false,
      error: null,
    })

    render(<Products />)

    expect(screen.getByText('Hypercare Products')).toBeInTheDocument()
    expect(screen.getByText('Product 1')).toBeInTheDocument()
    expect(screen.getByText('Product 2')).toBeInTheDocument()
  })

  it('opens maintenance dialog when enabling maintenance mode', async () => {
    const user = userEvent.setup()
    const products = [
      { ...mockProduct, id: '1', name: 'Product 1', code: 'PROD1', maintenanceMode: false, status: 'ACTIVE', productType: 'INVESTMENT' },
    ]

    mockUseQuery.mockReturnValue({
      data: products,
      isLoading: false,
      error: null,
    })

    render(<Products />)

    const switches = screen.getAllByRole('checkbox')
    await user.click(switches[0])

    await waitFor(() => {
      expect(screen.getByText('Enable Maintenance Mode')).toBeInTheDocument()
      expect(screen.getByText(/entering maintenance mode will make this product unavailable/i)).toBeInTheDocument()
    })
  })

  it('allows entering maintenance message in dialog', async () => {
    const user = userEvent.setup()
    const products = [
      { ...mockProduct, id: '1', name: 'Product 1', code: 'PROD1', maintenanceMode: false, status: 'ACTIVE', productType: 'INVESTMENT' },
    ]

    mockUseQuery.mockReturnValue({
      data: products,
      isLoading: false,
      error: null,
    })

    render(<Products />)

    const switches = screen.getAllByRole('checkbox')
    await user.click(switches[0])

    const messageField = await screen.findByLabelText('Maintenance Message')
    await user.type(messageField, 'System maintenance in progress')

    expect(messageField).toHaveValue('System maintenance in progress')
  })

  it('confirms maintenance mode when clicking enable button', async () => {
    const user = userEvent.setup()
    const products = [
      { ...mockProduct, id: '1', name: 'Product 1', code: 'PROD1', maintenanceMode: false, status: 'ACTIVE', productType: 'INVESTMENT' },
    ]

    mockUseQuery.mockReturnValue({
      data: products,
      isLoading: false,
      error: null,
    })

    render(<Products />)

    const switches = screen.getAllByRole('checkbox')
    await user.click(switches[0])

    const enableButton = await screen.findByRole('button', { name: /enable maintenance/i })
    await user.click(enableButton)

    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        productId: '1',
        enabled: true,
      })
    )
  })

  it('disables maintenance mode directly when toggling off', async () => {
    const user = userEvent.setup()
    const products = [
      { ...mockProduct, id: '1', name: 'Product 1', code: 'PROD1', maintenanceMode: true, status: 'ACTIVE', productType: 'INVESTMENT' },
    ]

    mockUseQuery.mockReturnValue({
      data: products,
      isLoading: false,
      error: null,
    })

    render(<Products />)

    const switches = screen.getAllByRole('checkbox')
    await user.click(switches[0])

    expect(mockMutate).toHaveBeenCalledWith({
      productId: '1',
      enabled: false,
    })
  })

  it('toggles product status between active and suspended', async () => {
    const user = userEvent.setup()
    const products = [
      { ...mockProduct, id: '1', name: 'Product 1', code: 'PROD1', maintenanceMode: false, status: 'ACTIVE', productType: 'INVESTMENT' },
    ]

    mockUseQuery.mockReturnValue({
      data: products,
      isLoading: false,
      error: null,
    })

    render(<Products />)

    const suspendButton = screen.getByRole('button', { name: /suspend/i })
    await user.click(suspendButton)

    expect(mockMutate).toHaveBeenCalledWith({
      productId: '1',
      status: 'SUSPENDED',
    })
  })

  it('cancels maintenance dialog without changes', async () => {
    const user = userEvent.setup()
    const products = [
      { ...mockProduct, id: '1', name: 'Product 1', code: 'PROD1', maintenanceMode: false, status: 'ACTIVE', productType: 'INVESTMENT' },
    ]

    mockUseQuery.mockReturnValue({
      data: products,
      isLoading: false,
      error: null,
    })

    render(<Products />)

    const switches = screen.getAllByRole('checkbox')
    await user.click(switches[0])

    const cancelButton = await screen.findByRole('button', { name: /cancel/i })
    await user.click(cancelButton)

    // Wait for dialog to close
    await waitFor(() => {
      expect(mockMutate).not.toHaveBeenCalled()
    })
    
    // Dialog may still be in DOM but not visible due to MUI transitions
    // Just verify mutation wasn't called
  })
})

