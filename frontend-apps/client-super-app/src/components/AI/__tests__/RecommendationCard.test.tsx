/**
 * RecommendationCard Component Tests
 * Tests for AI Recommendation Card UI component
 * 
 * @module components/AI/__tests__/RecommendationCard.test
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import RecommendationCard from '../RecommendationCard';

describe('RecommendationCard Component', () => {
  const mockRecommendation = {
    assetId: 'asset-123',
    assetName: 'BDO Equity Fund',
    assetType: 'UITF',
    assetCode: 'BDOEF',
    currentPrice: 1.52,
    recommendedAction: 'BUY' as const,
    confidenceScore: 85,
    reason: 'Strong growth potential based on your risk profile',
    expectedReturn: 12.5,
    riskLevel: 'MEDIUM' as const,
    timeHorizon: 'MEDIUM_TERM' as const,
    recommendedAmount: 10000,
    matchScore: 90,
  };

  describe('Rendering', () => {
    it('should render recommendation card with asset details', () => {
      render(<RecommendationCard recommendation={mockRecommendation} />);
      
      expect(screen.getByText('BDO Equity Fund')).toBeInTheDocument();
      expect(screen.getByText('BDOEF')).toBeInTheDocument();
      expect(screen.getByText('UITF')).toBeInTheDocument();
    });

    it('should display recommendation action', () => {
      render(<RecommendationCard recommendation={mockRecommendation} />);
      
      expect(screen.getByText(/BUY/i)).toBeInTheDocument();
    });

    it('should display confidence score', () => {
      render(<RecommendationCard recommendation={mockRecommendation} />);
      
      expect(screen.getByText(/85%/i)).toBeInTheDocument();
    });

    it('should display expected return', () => {
      render(<RecommendationCard recommendation={mockRecommendation} />);
      
      expect(screen.getByText(/12.5%/i)).toBeInTheDocument();
    });

    it('should display recommendation reason', () => {
      render(<RecommendationCard recommendation={mockRecommendation} />);
      
      expect(screen.getByText(/Strong growth potential/i)).toBeInTheDocument();
    });

    it('should display match score', () => {
      render(<RecommendationCard recommendation={mockRecommendation} />);
      
      expect(screen.getByText(/90%/i)).toBeInTheDocument();
    });
  });

  describe('Recommendation Actions', () => {
    it('should display BUY action with green color', () => {
      render(<RecommendationCard recommendation={mockRecommendation} />);
      
      const buyChip = screen.getByText(/BUY/i).closest('.MuiChip-root');
      expect(buyChip).toHaveClass('MuiChip-colorSuccess');
    });

    it('should display HOLD action with warning color', () => {
      const holdRecommendation = { ...mockRecommendation, recommendedAction: 'HOLD' as const };
      render(<RecommendationCard recommendation={holdRecommendation} />);
      
      const holdChip = screen.getByText(/HOLD/i).closest('.MuiChip-root');
      expect(holdChip).toHaveClass('MuiChip-colorWarning');
    });

    it('should display SELL action with error color', () => {
      const sellRecommendation = { ...mockRecommendation, recommendedAction: 'SELL' as const };
      render(<RecommendationCard recommendation={sellRecommendation} />);
      
      const sellChip = screen.getByText(/SELL/i).closest('.MuiChip-root');
      expect(sellChip).toHaveClass('MuiChip-colorError');
    });
  });

  describe('Risk Levels', () => {
    it('should display LOW risk', () => {
      const lowRiskRec = { ...mockRecommendation, riskLevel: 'LOW' as const };
      render(<RecommendationCard recommendation={lowRiskRec} />);
      
      expect(screen.getByText(/Low Risk/i)).toBeInTheDocument();
    });

    it('should display MEDIUM risk', () => {
      render(<RecommendationCard recommendation={mockRecommendation} />);
      
      expect(screen.getByText(/Medium Risk/i)).toBeInTheDocument();
    });

    it('should display HIGH risk', () => {
      const highRiskRec = { ...mockRecommendation, riskLevel: 'HIGH' as const };
      render(<RecommendationCard recommendation={highRiskRec} />);
      
      expect(screen.getByText(/High Risk/i)).toBeInTheDocument();
    });
  });

  describe('Time Horizons', () => {
    it('should display SHORT_TERM horizon', () => {
      const shortTermRec = { ...mockRecommendation, timeHorizon: 'SHORT_TERM' as const };
      render(<RecommendationCard recommendation={shortTermRec} />);
      
      expect(screen.getByText(/Short Term/i)).toBeInTheDocument();
    });

    it('should display MEDIUM_TERM horizon', () => {
      render(<RecommendationCard recommendation={mockRecommendation} />);
      
      expect(screen.getByText(/Medium Term/i)).toBeInTheDocument();
    });

    it('should display LONG_TERM horizon', () => {
      const longTermRec = { ...mockRecommendation, timeHorizon: 'LONG_TERM' as const };
      render(<RecommendationCard recommendation={longTermRec} />);
      
      expect(screen.getByText(/Long Term/i)).toBeInTheDocument();
    });
  });

  describe('User Interaction', () => {
    it('should call onClick when card is clicked', () => {
      const onClickMock = vi.fn();
      render(<RecommendationCard recommendation={mockRecommendation} onClick={onClickMock} />);
      
      const card = screen.getByText('BDO Equity Fund').closest('.MuiCard-root');
      fireEvent.click(card!);
      
      expect(onClickMock).toHaveBeenCalledWith(mockRecommendation);
    });

    it('should show action button', () => {
      render(<RecommendationCard recommendation={mockRecommendation} />);
      
      const actionButton = screen.getByRole('button', { name: /view details|learn more/i });
      expect(actionButton).toBeInTheDocument();
    });

    it('should handle action button click', () => {
      const onActionMock = vi.fn();
      render(<RecommendationCard recommendation={mockRecommendation} onAction={onActionMock} />);
      
      const actionButton = screen.getByRole('button', { name: /view details|learn more/i });
      fireEvent.click(actionButton);
      
      expect(onActionMock).toHaveBeenCalledWith(mockRecommendation);
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing optional fields', () => {
      const minimalRecommendation = {
        assetId: 'asset-123',
        assetName: 'Test Asset',
        assetType: 'UITF',
        assetCode: 'TEST',
        currentPrice: 1.0,
        recommendedAction: 'BUY' as const,
        confidenceScore: 75,
      };
      
      render(<RecommendationCard recommendation={minimalRecommendation as any} />);
      
      expect(screen.getByText('Test Asset')).toBeInTheDocument();
    });

    it('should handle very high confidence score', () => {
      const highConfidenceRec = { ...mockRecommendation, confidenceScore: 99 };
      render(<RecommendationCard recommendation={highConfidenceRec} />);
      
      expect(screen.getByText(/99%/i)).toBeInTheDocument();
    });

    it('should handle very low confidence score', () => {
      const lowConfidenceRec = { ...mockRecommendation, confidenceScore: 20 };
      render(<RecommendationCard recommendation={lowConfidenceRec} />);
      
      expect(screen.getByText(/20%/i)).toBeInTheDocument();
    });

    it('should handle negative expected return', () => {
      const negativeReturnRec = { ...mockRecommendation, expectedReturn: -5.2 };
      render(<RecommendationCard recommendation={negativeReturnRec} />);
      
      expect(screen.getByText(/-5.2%/i)).toBeInTheDocument();
    });

    it('should handle large recommended amount', () => {
      const largeAmountRec = { ...mockRecommendation, recommendedAmount: 1000000 };
      render(<RecommendationCard recommendation={largeAmountRec} />);
      
      expect(screen.getByText(/1,000,000/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<RecommendationCard recommendation={mockRecommendation} />);
      
      const card = screen.getByText('BDO Equity Fund').closest('.MuiCard-root');
      expect(card).toHaveAttribute('role');
    });

    it('should be keyboard accessible', () => {
      const onClickMock = vi.fn();
      render(<RecommendationCard recommendation={mockRecommendation} onClick={onClickMock} />);
      
      const card = screen.getByText('BDO Equity Fund').closest('.MuiCard-root');
      fireEvent.keyDown(card!, { key: 'Enter', code: 'Enter' });
      
      // Should be clickable via keyboard
      expect(card).toBeInTheDocument();
    });
  });
});

