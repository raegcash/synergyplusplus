"""
Profile Analyzer - AI-Powered Customer Analysis
Analyzes customer profiles and provides intelligent insights

@version 1.0.0
"""

from typing import Dict, Any, List
import httpx
import os

class ProfileAnalyzer:
    """Analyzes customer investment profiles and behavior"""
    
    def __init__(self):
        self.marketplace_api = os.getenv("MARKETPLACE_API_URL", "http://localhost:8085")
    
    async def analyze_profile(self, customer_id: str) -> Dict[str, Any]:
        """Comprehensive profile analysis"""
        
        # Fetch customer data
        profile = await self._get_profile(customer_id)
        portfolio = await self._get_portfolio(customer_id)
        transactions = await self._get_transactions(customer_id)
        
        # Analyze
        risk_profile = self._analyze_risk_profile(profile, portfolio)
        investment_style = self._determine_investment_style(transactions)
        diversification_score = self._calculate_diversification(portfolio)
        recommendations = self._generate_profile_recommendations(profile, portfolio, diversification_score)
        
        return {
            "customer_id": customer_id,
            "risk_profile": risk_profile,
            "investment_style": investment_style,
            "diversification_score": diversification_score,
            "recommendations": recommendations
        }
    
    def _analyze_risk_profile(self, profile: Dict[str, Any], portfolio: Dict[str, Any]) -> str:
        """Determine actual risk profile based on behavior"""
        
        stated_tolerance = profile.get('riskTolerance', 'MODERATE')
        
        if not portfolio or not portfolio.get('holdings'):
            return stated_tolerance
        
        # Analyze portfolio composition
        holdings = portfolio.get('holdings', [])
        high_risk_count = sum(1 for h in holdings if h.get('assetType') in ['STOCK', 'CRYPTO'])
        total_count = len(holdings)
        
        high_risk_ratio = high_risk_count / total_count if total_count > 0 else 0
        
        if high_risk_ratio > 0.6:
            return "AGGRESSIVE"
        elif high_risk_ratio > 0.3:
            return "MODERATE"
        else:
            return "CONSERVATIVE"
    
    def _determine_investment_style(self, transactions: List[Dict[str, Any]]) -> str:
        """Determine investment style from transaction patterns"""
        
        if not transactions or len(transactions) < 3:
            return "NEW_INVESTOR"
        
        # Analyze frequency
        if len(transactions) > 20:
            return "ACTIVE_TRADER"
        elif len(transactions) > 10:
            return "REGULAR_INVESTOR"
        else:
            return "LONG_TERM_HOLDER"
    
    def _calculate_diversification(self, portfolio: Dict[str, Any]) -> float:
        """Calculate portfolio diversification score (0-1)"""
        
        if not portfolio or not portfolio.get('holdings'):
            return 0.0
        
        holdings = portfolio.get('holdings', [])
        
        # Count unique asset types
        asset_types = set(h.get('assetType') for h in holdings)
        unique_types = len(asset_types)
        
        # Calculate concentration
        total_value = sum(h.get('totalValue', 0) for h in holdings)
        if total_value == 0:
            return 0.0
        
        # Herfindahl index (concentration)
        concentrations = [(h.get('totalValue', 0) / total_value) ** 2 for h in holdings]
        herfindahl = sum(concentrations)
        
        # Diversification score (lower Herfindahl = better diversification)
        diversification = (1 - herfindahl) * (unique_types / 4.0)  # Normalize by 4 asset types
        
        return min(diversification, 1.0)
    
    def _generate_profile_recommendations(
        self,
        profile: Dict[str, Any],
        portfolio: Dict[str, Any],
        diversification_score: float
    ) -> List[str]:
        """Generate actionable recommendations"""
        
        recommendations = []
        
        # Diversification recommendations
        if diversification_score < 0.5:
            recommendations.append("Consider diversifying into different asset types to reduce risk")
        
        # Risk alignment
        stated_risk = profile.get('riskTolerance', 'MODERATE')
        if stated_risk == 'CONSERVATIVE' and portfolio:
            high_risk = sum(1 for h in portfolio.get('holdings', []) if h.get('assetType') in ['STOCK', 'CRYPTO'])
            if high_risk > 0:
                recommendations.append("Your portfolio has high-risk assets that may not match your conservative profile")
        
        # Experience level
        experience = profile.get('investmentExperience', 'BEGINNER')
        if experience == 'BEGINNER':
            recommendations.append("Start with UITFs or bonds to build confidence before moving to stocks")
        
        # Investment goals
        goals = profile.get('investmentGoals', '').lower()
        if 'retirement' in goals:
            recommendations.append("Consider long-term assets like equity funds for retirement planning")
        
        return recommendations
    
    async def _get_profile(self, customer_id: str) -> Dict[str, Any]:
        """Fetch profile"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.marketplace_api}/api/v1/profile",
                    headers={"X-Customer-ID": customer_id},
                    timeout=5.0
                )
                if response.status_code == 200:
                    return response.json().get('data', {}).get('investmentProfile', {})
        except:
            pass
        return {}
    
    async def _get_portfolio(self, customer_id: str) -> Dict[str, Any]:
        """Fetch portfolio"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.marketplace_api}/api/v1/portfolio/holdings",
                    headers={"X-Customer-ID": customer_id},
                    timeout=5.0
                )
                if response.status_code == 200:
                    return response.json().get('data', {})
        except:
            pass
        return {}
    
    async def _get_transactions(self, customer_id: str) -> List[Dict[str, Any]]:
        """Fetch transactions"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.marketplace_api}/api/v1/transactions?limit=50",
                    headers={"X-Customer-ID": customer_id},
                    timeout=5.0
                )
                if response.status_code == 200:
                    return response.json().get('data', {}).get('transactions', [])
        except:
            pass
        return []

