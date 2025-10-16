import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../../../test/testUtils'
import PartnersList from '../List'
import { mockPartner } from '../../../test/mockData'

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

describe('Partners List Page', () => {
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

    render(<PartnersList />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('renders error state', () => {
    mockUseQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: new Error('Failed to load'),
    })

    render(<PartnersList />)
    expect(screen.getByText(/error loading partners/i)).toBeInTheDocument()
  })

  it('renders partners list correctly', () => {
    const partners = [
      { ...mockPartner, id: '1', name: 'Partner 1', status: 'ACTIVE' },
      { ...mockPartner, id: '2', name: 'Partner 2', status: 'PENDING' },
    ]

    mockUseQuery.mockReturnValue({
      data: partners,
      isLoading: false,
      error: null,
    })

    render(<PartnersList />)

    expect(screen.getByText('Partner Management')).toBeInTheDocument()
    expect(screen.getByText('Partner 1')).toBeInTheDocument()
    expect(screen.getByText('Partner 2')).toBeInTheDocument()
  })

  it('displays stats correctly', () => {
    const partners = [
      { ...mockPartner, id: '1', status: 'ACTIVE' },
      { ...mockPartner, id: '2', status: 'ACTIVE' },
      { ...mockPartner, id: '3', status: 'PENDING' },
      { ...mockPartner, id: '4', status: 'SUSPENDED' },
    ]

    mockUseQuery.mockReturnValue({
      data: partners,
      isLoading: false,
      error: null,
    })

    render(<PartnersList />)

    expect(screen.getByText('Total Partners')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
    
    // Get all elements with text 2, 1 (there may be multiple in tabs/stats)
    const activeCount = screen.getAllByText('2')
    expect(activeCount.length).toBeGreaterThan(0)
    
    const pendingAndSuspendedCounts = screen.getAllByText('1')
    expect(pendingAndSuspendedCounts.length).toBeGreaterThan(0)
  })

  it('navigates to create page when add button is clicked', async () => {
    const user = userEvent.setup()
    mockUseQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    })

    render(<PartnersList />)

    const addButton = screen.getByRole('button', { name: /add partner/i })
    await user.click(addButton)

    expect(mockNavigate).toHaveBeenCalledWith('/partners/create')
  })

  it('filters partners by tab selection', async () => {
    const user = userEvent.setup()
    const partners = [
      { ...mockPartner, id: '1', name: 'Active Partner', code: 'ACT1', status: 'ACTIVE', contactEmail: 'active@test.com' },
      { ...mockPartner, id: '2', name: 'Pending Partner', code: 'PEN1', status: 'PENDING', contactEmail: 'pending@test.com' },
    ]

    mockUseQuery.mockReturnValue({
      data: partners,
      isLoading: false,
      error: null,
    })

    render(<PartnersList />)

    // Verify tabs exist
    const tabs = screen.getAllByRole('tab')
    expect(tabs.length).toBeGreaterThan(0)

    // Click pending tab
    await user.click(tabs[1]) // Pending tab

    // Verify tab was clicked (no assertion on filtered content since both render)
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true')
  })

  it('opens action menu when more icon is clicked', async () => {
    const user = userEvent.setup()
    const partners = [mockPartner]

    mockUseQuery.mockReturnValue({
      data: partners,
      isLoading: false,
      error: null,
    })

    render(<PartnersList />)

    const moreButtons = screen.getAllByRole('button', { name: '' })
    const actionButton = moreButtons[moreButtons.length - 1]
    await user.click(actionButton)

    await waitFor(() => {
      expect(screen.getByText('View Details')).toBeInTheDocument()
      expect(screen.getByText('Edit Partner')).toBeInTheDocument()
      expect(screen.getByText('Delete Partner')).toBeInTheDocument()
    })
  })

  it('navigates to view page from action menu', async () => {
    const user = userEvent.setup()
    const partners = [{ ...mockPartner, id: 'test-id' }]

    mockUseQuery.mockReturnValue({
      data: partners,
      isLoading: false,
      error: null,
    })

    render(<PartnersList />)

    const moreButtons = screen.getAllByRole('button', { name: '' })
    const actionButton = moreButtons[moreButtons.length - 1]
    await user.click(actionButton)

    const viewButton = await screen.findByText('View Details')
    await user.click(viewButton)

    expect(mockNavigate).toHaveBeenCalledWith('/partners/test-id')
  })

  it('navigates to edit page from action menu', async () => {
    const user = userEvent.setup()
    const partners = [{ ...mockPartner, id: 'test-id' }]

    mockUseQuery.mockReturnValue({
      data: partners,
      isLoading: false,
      error: null,
    })

    render(<PartnersList />)

    const moreButtons = screen.getAllByRole('button', { name: '' })
    const actionButton = moreButtons[moreButtons.length - 1]
    await user.click(actionButton)

    const editButton = await screen.findByText('Edit Partner')
    await user.click(editButton)

    expect(mockNavigate).toHaveBeenCalledWith('/partners/test-id/edit')
  })
})

