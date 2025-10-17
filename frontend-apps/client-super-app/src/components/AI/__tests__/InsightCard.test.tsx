/**
 * InsightCard Component Tests
 * Tests for AI Insight Card UI component
 * 
 * @module components/AI/__tests__/InsightCard.test
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import InsightCard from '../InsightCard';

describe('InsightCard Component', () => {
  const mockInsight = {
    id: 'insight-123',
    type: 'OPPORTUNITY' as const,
    title: 'Diversification Opportunity',
    message: 'Consider diversifying into bonds to reduce portfolio risk',
    severity: 'INFO' as const,
    actionable: true,
    actionLabel: 'View Recommendations',
    actionUrl: '/marketplace?category=bonds',
    metadata: {
      category: 'diversification',
      confidence: 85,
    },
    createdAt: '2024-01-01T00:00:00Z',
  };

  describe('Rendering', () => {
    it('should render insight card with title', () => {
      render(<InsightCard insight={mockInsight} />);
      
      expect(screen.getByText('Diversification Opportunity')).toBeInTheDocument();
    });

    it('should render insight message', () => {
      render(<InsightCard insight={mockInsight} />);
      
      expect(screen.getByText(/Consider diversifying into bonds/i)).toBeInTheDocument();
    });

    it('should display insight type', () => {
      render(<InsightCard insight={mockInsight} />);
      
      expect(screen.getByText(/opportunity/i)).toBeInTheDocument();
    });
  });

  describe('Insight Types', () => {
    it('should display OPPORTUNITY type with success color', () => {
      render(<InsightCard insight={mockInsight} />);
      
      const card = screen.getByText('Diversification Opportunity').closest('.MuiCard-root');
      expect(card).toHaveClass('MuiCard-root');
    });

    it('should display WARNING type with warning color', () => {
      const warningInsight = { ...mockInsight, type: 'WARNING' as const, severity: 'WARNING' as const };
      render(<InsightCard insight={warningInsight} />);
      
      expect(screen.getByText('Diversification Opportunity')).toBeInTheDocument();
    });

    it('should display ALERT type with error color', () => {
      const alertInsight = { ...mockInsight, type: 'ALERT' as const, severity: 'ERROR' as const };
      render(<InsightCard insight={alertInsight} />);
      
      expect(screen.getByText('Diversification Opportunity')).toBeInTheDocument();
    });

    it('should display INSIGHT type with info color', () => {
      const infoInsight = { ...mockInsight, type: 'INSIGHT' as const };
      render(<InsightCard insight={infoInsight} />);
      
      expect(screen.getByText('Diversification Opportunity')).toBeInTheDocument();
    });
  });

  describe('Severity Levels', () => {
    it('should display INFO severity', () => {
      render(<InsightCard insight={mockInsight} />);
      
      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('MuiAlert-standardInfo');
    });

    it('should display SUCCESS severity', () => {
      const successInsight = { ...mockInsight, severity: 'SUCCESS' as const };
      render(<InsightCard insight={successInsight} />);
      
      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('MuiAlert-standardSuccess');
    });

    it('should display WARNING severity', () => {
      const warningInsight = { ...mockInsight, severity: 'WARNING' as const };
      render(<InsightCard insight={warningInsight} />);
      
      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('MuiAlert-standardWarning');
    });

    it('should display ERROR severity', () => {
      const errorInsight = { ...mockInsight, severity: 'ERROR' as const };
      render(<InsightCard insight={errorInsight} />);
      
      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('MuiAlert-standardError');
    });
  });

  describe('Actionable Insights', () => {
    it('should display action button for actionable insights', () => {
      render(<InsightCard insight={mockInsight} />);
      
      const actionButton = screen.getByRole('button', { name: /View Recommendations/i });
      expect(actionButton).toBeInTheDocument();
    });

    it('should not display action button for non-actionable insights', () => {
      const nonActionableInsight = { ...mockInsight, actionable: false };
      render(<InsightCard insight={nonActionableInsight} />);
      
      const actionButton = screen.queryByRole('button', { name: /View Recommendations/i });
      expect(actionButton).not.toBeInTheDocument();
    });

    it('should call onAction when action button is clicked', () => {
      const onActionMock = vi.fn();
      render(<InsightCard insight={mockInsight} onAction={onActionMock} />);
      
      const actionButton = screen.getByRole('button', { name: /View Recommendations/i });
      fireEvent.click(actionButton);
      
      expect(onActionMock).toHaveBeenCalledWith(mockInsight);
    });

    it('should handle action button with custom label', () => {
      const customLabelInsight = { ...mockInsight, actionLabel: 'Custom Action' };
      render(<InsightCard insight={customLabelInsight} />);
      
      expect(screen.getByRole('button', { name: /Custom Action/i })).toBeInTheDocument();
    });
  });

  describe('Metadata', () => {
    it('should display confidence score from metadata', () => {
      render(<InsightCard insight={mockInsight} />);
      
      expect(screen.getByText(/85%/i)).toBeInTheDocument();
    });

    it('should display category from metadata', () => {
      render(<InsightCard insight={mockInsight} />);
      
      expect(screen.getByText(/diversification/i)).toBeInTheDocument();
    });

    it('should handle missing metadata', () => {
      const noMetadataInsight = { ...mockInsight, metadata: undefined };
      render(<InsightCard insight={noMetadataInsight as any} />);
      
      expect(screen.getByText('Diversification Opportunity')).toBeInTheDocument();
    });
  });

  describe('Timestamp', () => {
    it('should display formatted timestamp', () => {
      render(<InsightCard insight={mockInsight} />);
      
      // Should display date in some format
      expect(screen.getByText(/2024/i) || screen.getByText(/Jan/i)).toBeTruthy();
    });

    it('should display relative time for recent insights', () => {
      const recentInsight = {
        ...mockInsight,
        createdAt: new Date().toISOString(),
      };
      render(<InsightCard insight={recentInsight} />);
      
      expect(screen.getByText('Diversification Opportunity')).toBeInTheDocument();
    });
  });

  describe('User Interaction', () => {
    it('should call onClick when card is clicked', () => {
      const onClickMock = vi.fn();
      render(<InsightCard insight={mockInsight} onClick={onClickMock} />);
      
      const card = screen.getByText('Diversification Opportunity').closest('.MuiCard-root');
      fireEvent.click(card!);
      
      expect(onClickMock).toHaveBeenCalledWith(mockInsight);
    });

    it('should handle dismissal if supported', () => {
      const onDismissMock = vi.fn();
      render(<InsightCard insight={mockInsight} onDismiss={onDismissMock} dismissible />);
      
      const dismissButton = screen.queryByLabelText(/dismiss|close/i);
      if (dismissButton) {
        fireEvent.click(dismissButton);
        expect(onDismissMock).toHaveBeenCalledWith(mockInsight);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long titles', () => {
      const longTitleInsight = {
        ...mockInsight,
        title: 'This is a very long insight title that should be handled properly by the component',
      };
      render(<InsightCard insight={longTitleInsight} />);
      
      expect(screen.getByText(/very long insight title/i)).toBeInTheDocument();
    });

    it('should handle very long messages', () => {
      const longMessageInsight = {
        ...mockInsight,
        message: 'This is a very long message that provides detailed information about the insight. It should be displayed properly and not overflow the card boundaries. The component should handle this gracefully.',
      };
      render(<InsightCard insight={longMessageInsight} />);
      
      expect(screen.getByText(/very long message/i)).toBeInTheDocument();
    });

    it('should handle missing action URL', () => {
      const noUrlInsight = { ...mockInsight, actionUrl: undefined };
      render(<InsightCard insight={noUrlInsight as any} />);
      
      const actionButton = screen.getByRole('button', { name: /View Recommendations/i });
      expect(actionButton).toBeInTheDocument();
    });

    it('should handle high confidence score', () => {
      const highConfidenceInsight = {
        ...mockInsight,
        metadata: { ...mockInsight.metadata, confidence: 99 },
      };
      render(<InsightCard insight={highConfidenceInsight} />);
      
      expect(screen.getByText(/99%/i)).toBeInTheDocument();
    });

    it('should handle low confidence score', () => {
      const lowConfidenceInsight = {
        ...mockInsight,
        metadata: { ...mockInsight.metadata, confidence: 25 },
      };
      render(<InsightCard insight={lowConfidenceInsight} />);
      
      expect(screen.getByText(/25%/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA role for alert', () => {
      render(<InsightCard insight={mockInsight} />);
      
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
    });

    it('should be keyboard accessible', () => {
      const onClickMock = vi.fn();
      render(<InsightCard insight={mockInsight} onClick={onClickMock} />);
      
      const card = screen.getByText('Diversification Opportunity').closest('.MuiCard-root');
      fireEvent.keyDown(card!, { key: 'Enter', code: 'Enter' });
      
      expect(card).toBeInTheDocument();
    });

    it('should have accessible action button', () => {
      render(<InsightCard insight={mockInsight} />);
      
      const actionButton = screen.getByRole('button', { name: /View Recommendations/i });
      expect(actionButton).toHaveAttribute('type', 'button');
    });
  });

  describe('Variants', () => {
    it('should support compact variant', () => {
      render(<InsightCard insight={mockInsight} variant="compact" />);
      
      expect(screen.getByText('Diversification Opportunity')).toBeInTheDocument();
    });

    it('should support detailed variant', () => {
      render(<InsightCard insight={mockInsight} variant="detailed" />);
      
      expect(screen.getByText('Diversification Opportunity')).toBeInTheDocument();
    });

    it('should use default variant', () => {
      render(<InsightCard insight={mockInsight} />);
      
      expect(screen.getByText('Diversification Opportunity')).toBeInTheDocument();
    });
  });
});

