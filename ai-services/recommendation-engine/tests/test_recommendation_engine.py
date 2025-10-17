"""
Test suite for Recommendation Engine
Comprehensive tests for AI recommendation logic
"""

import pytest
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.recommendation_engine import RecommendationEngine

class TestRecommendationEngine:
    """Test cases for Recommendation Engine"""
    
    @pytest.fixture
    def engine(self):
        """Create recommendation engine instance"""
        return RecommendationEngine()
    
    @pytest.fixture
    def sample_profile(self):
        """Sample customer profile"""
        return {
            'riskTolerance': 'MODERATE',
            'investmentExperience': 'INTERMEDIATE',
            'investmentGoals': 'long-term growth',
            'investmentHorizon': 'LONG_TERM'
        }
    
    @pytest.fixture
    def sample_portfolio(self):
        """Sample portfolio"""
        return {
            'holdings': [
                {'assetType': 'UITF', 'totalValue': 50000},
                {'assetType': 'STOCK', 'totalValue': 30000}
            ]
        }
    
    @pytest.fixture
    def sample_asset(self):
        """Sample asset"""
        return {
            'id': '123',
            'name': 'BDO Equity Fund',
            'assetType': 'UITF',
            'minimumInvestment': 1000,
            'status': 'ACTIVE'
        }
    
    # =====================================================
    # RISK TOLERANCE TESTS
    # =====================================================
    
    def test_match_risk_tolerance_perfect_match(self, engine, sample_asset, sample_profile):
        """Test perfect risk tolerance match"""
        score = engine._match_risk_tolerance(sample_asset, sample_profile)
        assert score == 1.0, "UITF should perfectly match MODERATE risk"
    
    def test_match_risk_tolerance_conservative(self, engine):
        """Test conservative investor with low-risk asset"""
        asset = {'assetType': 'BOND'}
        profile = {'riskTolerance': 'CONSERVATIVE'}
        score = engine._match_risk_tolerance(asset, profile)
        assert score == 1.0, "Bond should perfectly match CONSERVATIVE risk"
    
    def test_match_risk_tolerance_mismatch(self, engine):
        """Test risk tolerance mismatch"""
        asset = {'assetType': 'CRYPTO'}
        profile = {'riskTolerance': 'CONSERVATIVE'}
        score = engine._match_risk_tolerance(asset, profile)
        assert score < 0.5, "Crypto should not match CONSERVATIVE risk"
    
    # =====================================================
    # DIVERSIFICATION TESTS
    # =====================================================
    
    def test_diversification_first_investment(self, engine, sample_asset):
        """Test diversification benefit for first investment"""
        portfolio = {'holdings': []}
        score = engine._calculate_diversification_benefit(sample_asset, portfolio)
        assert score == 0.9, "First investment should have high diversification benefit"
    
    def test_diversification_new_type(self, engine):
        """Test adding new asset type"""
        asset = {'assetType': 'CRYPTO'}
        portfolio = {
            'holdings': [
                {'assetType': 'UITF'},
                {'assetType': 'STOCK'}
            ]
        }
        score = engine._calculate_diversification_benefit(asset, portfolio)
        assert score == 1.0, "New asset type should have perfect diversification score"
    
    def test_diversification_same_type(self, engine):
        """Test adding same asset type"""
        asset = {'assetType': 'UITF'}
        portfolio = {
            'holdings': [
                {'assetType': 'UITF'},
                {'assetType': 'UITF'}
            ]
        }
        score = engine._calculate_diversification_benefit(asset, portfolio)
        assert score < 0.5, "Same asset type should have lower diversification benefit"
    
    # =====================================================
    # EXPERIENCE LEVEL TESTS
    # =====================================================
    
    def test_experience_match_beginner(self, engine):
        """Test beginner with simple assets"""
        asset = {'assetType': 'UITF'}
        profile = {'investmentExperience': 'BEGINNER'}
        score = engine._match_experience_level(asset, profile)
        assert score == 1.0, "UITF should match BEGINNER experience"
    
    def test_experience_mismatch_beginner_crypto(self, engine):
        """Test beginner with complex assets"""
        asset = {'assetType': 'CRYPTO'}
        profile = {'investmentExperience': 'BEGINNER'}
        score = engine._match_experience_level(asset, profile)
        assert score < 0.7, "Crypto should not fully match BEGINNER experience"
    
    def test_experience_match_expert(self, engine):
        """Test expert with any asset"""
        asset = {'assetType': 'CRYPTO'}
        profile = {'investmentExperience': 'EXPERT'}
        score = engine._match_experience_level(asset, profile)
        assert score == 1.0, "Expert should match any asset"
    
    # =====================================================
    # ASSET QUALITY TESTS
    # =====================================================
    
    def test_asset_quality_active(self, engine):
        """Test quality of active asset"""
        asset = {
            'status': 'ACTIVE',
            'minimumInvestment': 500,
            'partnerId': 'partner-1'
        }
        score = engine._assess_asset_quality(asset)
        assert score > 0.8, "Active asset with good attributes should score high"
    
    def test_asset_quality_inactive(self, engine):
        """Test quality of inactive asset"""
        asset = {
            'status': 'INACTIVE',
            'minimumInvestment': 10000
        }
        score = engine._assess_asset_quality(asset)
        assert score < 0.9, "Inactive asset should score lower"
    
    # =====================================================
    # INVESTMENT GOALS TESTS
    # =====================================================
    
    def test_goals_long_term_stocks(self, engine):
        """Test long-term goals with stocks"""
        asset = {'assetType': 'STOCK'}
        profile = {
            'investmentGoals': 'long-term growth',
            'investmentHorizon': 'LONG_TERM'
        }
        score = engine._match_investment_goals(asset, profile)
        assert score > 0.8, "Stocks should match long-term growth goals"
    
    def test_goals_short_term_bonds(self, engine):
        """Test short-term goals with bonds"""
        asset = {'assetType': 'BOND'}
        profile = {
            'investmentGoals': 'income',
            'investmentHorizon': 'SHORT_TERM'
        }
        score = engine._match_investment_goals(asset, profile)
        assert score > 0.8, "Bonds should match short-term income goals"
    
    # =====================================================
    # RISK LEVEL TESTS
    # =====================================================
    
    def test_risk_level_bond(self, engine):
        """Test risk level determination for bonds"""
        asset = {'assetType': 'BOND'}
        risk = engine._determine_risk_level(asset)
        assert risk == 'LOW', "Bonds should be LOW risk"
    
    def test_risk_level_crypto(self, engine):
        """Test risk level determination for crypto"""
        asset = {'assetType': 'CRYPTO'}
        risk = engine._determine_risk_level(asset)
        assert risk == 'VERY_HIGH', "Crypto should be VERY_HIGH risk"
    
    # =====================================================
    # EXPECTED RETURN TESTS
    # =====================================================
    
    def test_expected_return_uitf(self, engine, sample_profile):
        """Test expected return for UITF"""
        asset = {'assetType': 'UITF'}
        ret = engine._estimate_expected_return(asset, sample_profile)
        assert ret == 8.0, "UITF should have 8% expected return"
    
    def test_expected_return_crypto(self, engine, sample_profile):
        """Test expected return for crypto"""
        asset = {'assetType': 'CRYPTO'}
        ret = engine._estimate_expected_return(asset, sample_profile)
        assert ret == 15.0, "Crypto should have 15% expected return"
    
    # =====================================================
    # SCORING ALGORITHM TESTS
    # =====================================================
    
    def test_calculate_asset_score_high_match(self, engine, sample_asset, sample_profile, sample_portfolio):
        """Test high matching score"""
        result = engine._calculate_asset_score(
            sample_asset,
            sample_profile,
            sample_portfolio,
            []
        )
        assert result['score'] > 0.6, "Good match should score above threshold"
        assert isinstance(result['match_factors'], list), "Should return match factors"
        assert isinstance(result['reason'], str), "Should return reason"
    
    def test_calculate_asset_score_includes_all_fields(self, engine, sample_asset, sample_profile, sample_portfolio):
        """Test that score includes all required fields"""
        result = engine._calculate_asset_score(
            sample_asset,
            sample_profile,
            sample_portfolio,
            []
        )
        required_fields = ['score', 'reason', 'expected_return', 'risk_level', 'match_factors']
        for field in required_fields:
            assert field in result, f"Result should include {field}"
    
    def test_calculate_asset_score_capped(self, engine):
        """Test that score is capped at 1.0"""
        # Create perfect scenario
        asset = {'assetType': 'UITF', 'status': 'ACTIVE', 'minimumInvestment': 100}
        profile = {
            'riskTolerance': 'MODERATE',
            'investmentExperience': 'EXPERT',
            'investmentGoals': 'long-term growth',
            'investmentHorizon': 'LONG_TERM'
        }
        portfolio = {'holdings': []}
        
        result = engine._calculate_asset_score(asset, profile, portfolio, [])
        assert result['score'] <= 1.0, "Score should be capped at 1.0"

if __name__ == '__main__':
    pytest.main([__file__, '-v'])

