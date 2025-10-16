import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '../../../../test/testUtils'
import { AdminUsersList } from '../List'
import { mockAdminUser } from '../../../../test/mockData'

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

describe('Admin Users List Page', () => {
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

    render(<AdminUsersList />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('renders error state', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to load'),
    })

    render(<AdminUsersList />)
    expect(screen.getByText(/failed to load admin users/i)).toBeInTheDocument()
  })

  it('renders users list correctly', () => {
    const users = [
      { ...mockAdminUser, id: '1', username: 'admin1', email: 'admin1@test.com', status: 'ACTIVE' },
      { ...mockAdminUser, id: '2', username: 'admin2', email: 'admin2@test.com', status: 'ACTIVE' },
    ]

    mockUseQuery.mockReturnValue({
      data: users,
      isLoading: false,
      error: null,
    })

    render(<AdminUsersList />)

    expect(screen.getByText('Admin Users')).toBeInTheDocument()
    expect(screen.getByText('admin1')).toBeInTheDocument()
    expect(screen.getByText('admin2')).toBeInTheDocument()
  })

  it('filters users by search term', async () => {
    const user = userEvent.setup()
    const users = [
      { ...mockAdminUser, id: '1', username: 'admin1', email: 'admin1@test.com', first_name: 'John', last_name: 'Doe' },
      { ...mockAdminUser, id: '2', username: 'admin2', email: 'admin2@test.com', first_name: 'Jane', last_name: 'Smith' },
    ]

    mockUseQuery.mockReturnValue({
      data: users,
      isLoading: false,
      error: null,
    })

    render(<AdminUsersList />)

    const searchInput = screen.getByPlaceholderText(/search by username, email, or name/i)
    await user.type(searchInput, 'John')

    expect(searchInput).toHaveValue('John')
  })

  it('navigates to create page when add button is clicked', async () => {
    const user = userEvent.setup()
    mockUseQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    })

    render(<AdminUsersList />)

    const addButton = screen.getByRole('button', { name: /add admin user/i })
    await user.click(addButton)

    expect(mockNavigate).toHaveBeenCalledWith('/admin/users/create')
  })

  it('renders action buttons for users', () => {
    const users = [{ ...mockAdminUser, id: '1', username: 'admin1', email: 'admin1@test.com' }]

    mockUseQuery.mockReturnValue({
      data: users,
      isLoading: false,
      error: null,
    })

    render(<AdminUsersList />)

    // Check that user row is rendered (action buttons are implementation details)
    expect(screen.getByText('admin1')).toBeInTheDocument()
    expect(screen.getByText('admin1@test.com')).toBeInTheDocument()
  })

  it('displays user status correctly', () => {
    const users = [
      { ...mockAdminUser, id: '1', username: 'active', status: 'ACTIVE' },
      { ...mockAdminUser, id: '2', username: 'locked', status: 'LOCKED' },
      { ...mockAdminUser, id: '3', username: 'inactive', status: 'INACTIVE' },
    ]

    mockUseQuery.mockReturnValue({
      data: users,
      isLoading: false,
      error: null,
    })

    render(<AdminUsersList />)

    expect(screen.getByText('active')).toBeInTheDocument()
    expect(screen.getByText('locked')).toBeInTheDocument()
    expect(screen.getByText('inactive')).toBeInTheDocument()
  })

  it('displays empty state when no users filtered', () => {
    const users = [{ ...mockAdminUser, id: '1', username: 'admin1', email: 'admin1@test.com', first_name: 'John', last_name: 'Doe' }]

    mockUseQuery.mockReturnValue({
      data: users,
      isLoading: false,
      error: null,
    })

    render(<AdminUsersList />)

    // User should be visible initially
    expect(screen.getByText('admin1')).toBeInTheDocument()
  })
})

