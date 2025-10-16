import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../../test/testUtils';
import Watchlist from '../Watchlist';

describe('Watchlist', () => {
  it('renders watchlist page', () => {
    renderWithProviders(<Watchlist />);

    expect(screen.getByText('My Watchlist')).toBeInTheDocument();
    expect(screen.getByText(/Track your favorite assets/i)).toBeInTheDocument();
  });

  it('shows empty state when no items', () => {
    renderWithProviders(<Watchlist />);

    expect(screen.getByText('No Items in Watchlist')).toBeInTheDocument();
    expect(screen.getByText(/Add assets to your watchlist/i)).toBeInTheDocument();
  });
});

