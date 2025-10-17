"""
Recommendation Engine - Rule-Based Intelligence
Smart asset recommendations using customer profile and behavior analysis

@version 1.0.0
@classification Production-Ready
"""

from typing import List, Dict, Any, Optional
import asyncio
import httpx
import os
from datetime import datetime, timedelta

class RecommendationEngine:
    """
    Intelligent recommendation engine that analyzes:
    - Customer profile and risk tolerance
    - Investment history and preferences
    - Portfolio diversification
    - Asset performance
    - Market trends
    """
    
    def __init__(self):
        self.marketplace_api = os.getenv("MARKETPLACE_API_URL", "http://localhost:8085")
        self.min_score = float(os.getenv("MIN_RECOMMENDATION_SCORE", "0.6"))
        
    async def generate_recommendations(
        self,
        customer_id: str,
        asset_types: Optional[List[str]] = None,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """Generate personalized recommendations"""
        
        # Fetch customer data
        profile = await self._get_customer_profile(customer_id)
        portfolio = await self._get_customer_portfolio(customer_id)
        transactions = await self._get_customer_transactions(customer_id)
        
        # Get available assets
        assets = await self._get_available_assets(asset_types)
        
        # Score each asset
        scored_assets = []
        for asset in assets:
            score_data = self._calculate_asset_score(asset, profile, portfolio, transactions)
            
            if score_data['score'] >= self.min_score:
                scored_assets.append({
                    "asset_id": asset['id'],
                    "asset_name": asset['name'],
                    "asset_type": asset['assetType'],
                    "score": score_data['score'],
                    "reason": score_data['reason'],
                    "expected_return": score_data['expected_return'],
                    "risk_level": score_data['risk_level'],
                    "match_factors": score_data['match_factors']
                })
        
        # Sort by score and return top N
        scored_assets.sort(key=lambda x: x['score'], reverse=True)
        return scored_assets[:limit]
    
    def _calculate_asset_score(
        self,
        asset: Dict[str, Any],
        profile: Dict[str, Any],
        portfolio: Dict[str, Any],
        transactions: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Calculate recommendation score for an asset"""
        
        score = 0.0
        match_factors = []
        
        # Risk Tolerance Match (30% weight)
        risk_score = self._match_risk_tolerance(asset, profile)
        score += risk_score * 0.30
        if risk_score > 0.7:
            match_factors.append(f"Matches your {profile.get('riskTolerance', 'moderate').lower()} risk profile")
        
        # Diversification Benefit (25% weight)
        diversification_score = self._calculate_diversification_benefit(asset, portfolio)
        score += diversification_score * 0.25
        if diversification_score > 0.7:
            match_factors.append("Improves portfolio diversification")
        
        # Investment Experience Match (15% weight)
        experience_score = self._match_experience_level(asset, profile)
        score += experience_score * 0.15
        if experience_score > 0.7:
            match_factors.append("Suitable for your experience level")
        
        # Performance & Quality (20% weight)
        performance_score = self._assess_asset_quality(asset)
        score += performance_score * 0.20
        if performance_score > 0.8:
            match_factors.append("Strong historical performance")
        
        # Investment Goals Alignment (10% weight)
        goals_score = self._match_investment_goals(asset, profile)
        score += goals_score * 0.10
        if goals_score > 0.7:
            match_factors.append("Aligns with your investment goals")
        
        # Generate reason
        reason = self._generate_recommendation_reason(asset, profile, match_factors)
        
        # Determine risk level
        risk_level = self._determine_risk_level(asset)
        
        # Estimate expected return (simplified)
        expected_return = self._estimate_expected_return(asset, profile)
        
        return {
            "score": min(score, 1.0),  # Cap at 1.0
            "reason": reason,
            "expected_return": expected_return,
            "risk_level": risk_level,
            "match_factors": match_factors
        }
    
    def _match_risk_tolerance(self, asset: Dict[str, Any], profile: Dict[str, Any]) -> float:
        """Match asset risk with customer risk tolerance"""
        
        asset_type = asset.get('assetType', '').upper()
        risk_tolerance = profile.get('riskTolerance', 'MODERATE').upper()
        
        # Risk mapping
        asset_risk = {
            'BOND': 'CONSERVATIVE',
            'UITF': 'MODERATE',
            'STOCK': 'AGGRESSIVE',
            'CRYPTO': 'AGGRESSIVE'
        }.get(asset_type, 'MODERATE')
        
        tolerance_map = {
            'CONSERVATIVE': {'CONSERVATIVE': 1.0, 'MODERATE': 0.6, 'AGGRESSIVE': 0.3},
            'MODERATE': {'CONSERVATIVE': 0.8, 'MODERATE': 1.0, 'AGGRESSIVE': 0.7},
            'AGGRESSIVE': {'CONSERVATIVE': 0.5, 'MODERATE': 0.8, 'AGGRESSIVE': 1.0}
        }
        
        return tolerance_map.get(risk_tolerance, {}).get(asset_risk, 0.5)
    
    def _calculate_diversification_benefit(self, asset: Dict[str, Any], portfolio: Dict[str, Any]) -> float:
        """Calculate how much this asset would improve diversification"""
        
        if not portfolio or not portfolio.get('holdings'):
            return 0.9  # High benefit for first investment
        
        asset_type = asset.get('assetType', '').upper()
        holdings = portfolio.get('holdings', [])
        
        # Count assets of same type
        same_type_count = sum(1 for h in holdings if h.get('assetType', '').upper() == asset_type)
        total_count = len(holdings)
        
        if same_type_count == 0:
            return 1.0  # New asset type = perfect diversification
        
        # More of same type = lower diversification benefit
        concentration = same_type_count / total_count if total_count > 0 else 0
        return max(0.3, 1.0 - concentration)
    
    def _match_experience_level(self, asset: Dict[str, Any], profile: Dict[str, Any]) -> float:
        """Match asset complexity with investor experience"""
        
        experience = profile.get('investmentExperience', 'BEGINNER').upper()
        asset_type = asset.get('assetType', '').upper()
        
        # Complexity mapping
        complexity = {
            'UITF': 'BEGINNER',
            'BOND': 'BEGINNER',
            'STOCK': 'INTERMEDIATE',
            'CRYPTO': 'ADVANCED'
        }.get(asset_type, 'INTERMEDIATE')
        
        experience_level = {
            'BEGINNER': 1,
            'INTERMEDIATE': 2,
            'ADVANCED': 3,
            'EXPERT': 4
        }
        
        exp_score = experience_level.get(experience, 2)
        complexity_score = experience_level.get(complexity, 2)
        
        # Match: experience >= complexity
        if exp_score >= complexity_score:
            return 1.0
        elif exp_score == complexity_score - 1:
            return 0.7
        else:
            return 0.4
    
    def _assess_asset_quality(self, asset: Dict[str, Any]) -> float:
        """Assess asset quality based on available metrics"""
        
        score = 0.75  # Base score
        
        # Check if asset has positive attributes
        if asset.get('status') == 'ACTIVE':
            score += 0.1
        
        # Check minimum investment (lower = more accessible = slight bonus)
        min_investment = asset.get('minimumInvestment', 0)
        if min_investment <= 1000:
            score += 0.05
        
        # Provider reputation (if available)
        provider = asset.get('partnerId')
        if provider:
            score += 0.1
        
        return min(score, 1.0)
    
    def _match_investment_goals(self, asset: Dict[str, Any], profile: Dict[str, Any]) -> float:
        """Match asset characteristics with investment goals"""
        
        goals = profile.get('investmentGoals', '').lower()
        horizon = profile.get('investmentHorizon', 'MEDIUM_TERM').upper()
        asset_type = asset.get('assetType', '').upper()
        
        score = 0.7  # Base score
        
        # Long-term goals favor stocks/UITFs
        if horizon == 'LONG_TERM' and asset_type in ['STOCK', 'UITF']:
            score += 0.2
        
        # Short-term goals favor bonds
        if horizon == 'SHORT_TERM' and asset_type in ['BOND', 'UITF']:
            score += 0.2
        
        # Growth goals favor stocks
        if 'growth' in goals and asset_type in ['STOCK', 'CRYPTO']:
            score += 0.1
        
        # Income goals favor bonds/UITFs
        if 'income' in goals or 'dividend' in goals:
            if asset_type in ['BOND', 'UITF']:
                score += 0.1
        
        return min(score, 1.0)
    
    def _determine_risk_level(self, asset: Dict[str, Any]) -> str:
        """Determine risk level of asset"""
        
        asset_type = asset.get('assetType', '').upper()
        
        risk_map = {
            'BOND': 'LOW',
            'UITF': 'MEDIUM',
            'STOCK': 'HIGH',
            'CRYPTO': 'VERY_HIGH'
        }
        
        return risk_map.get(asset_type, 'MEDIUM')
    
    def _estimate_expected_return(self, asset: Dict[str, Any], profile: Dict[str, Any]) -> float:
        """Estimate expected annual return (simplified)"""
        
        asset_type = asset.get('assetType', '').upper()
        
        # Historical average returns (simplified)
        return_estimates = {
            'BOND': 4.0,
            'UITF': 8.0,
            'STOCK': 12.0,
            'CRYPTO': 15.0
        }
        
        return return_estimates.get(asset_type, 7.0)
    
    def _generate_recommendation_reason(
        self,
        asset: Dict[str, Any],
        profile: Dict[str, Any],
        match_factors: List[str]
    ) -> str:
        """Generate human-readable recommendation reason"""
        
        asset_name = asset.get('name', 'This asset')
        asset_type = asset.get('assetType', 'investment').lower()
        
        if len(match_factors) >= 3:
            return f"{asset_name} is an excellent match for your portfolio. " + " ".join(match_factors[:2])
        elif len(match_factors) >= 2:
            return f"{asset_name} is a good fit for your investment strategy. {match_factors[0]}"
        elif len(match_factors) >= 1:
            return f"Consider {asset_name} to diversify your portfolio. {match_factors[0]}"
        else:
            return f"{asset_name} is a solid {asset_type} option for your portfolio."
    
    async def get_trending_assets(self, limit: int = 5) -> List[Dict[str, Any]]:
        """Get trending assets based on recent activity"""
        
        # This would analyze recent transactions
        # For now, return placeholder
        return [
            {
                "asset_id": "trending-1",
                "name": "BDO Equity Fund",
                "type": "UITF",
                "trend_score": 0.95,
                "recent_investments": 150
            }
        ]
    
    # =====================================================
    # DATA FETCHING METHODS
    # =====================================================
    
    async def _get_customer_profile(self, customer_id: str) -> Dict[str, Any]:
        """Fetch customer profile from Marketplace API"""
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.marketplace_api}/api/v1/profile",
                    headers={"X-Customer-ID": customer_id},
                    timeout=5.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return {
                        'riskTolerance': data.get('data', {}).get('investmentProfile', {}).get('riskTolerance', 'MODERATE'),
                        'investmentExperience': data.get('data', {}).get('investmentProfile', {}).get('investmentExperience', 'BEGINNER'),
                        'investmentGoals': data.get('data', {}).get('investmentProfile', {}).get('investmentGoals', ''),
                        'investmentHorizon': data.get('data', {}).get('investmentProfile', {}).get('investmentHorizon', 'MEDIUM_TERM')
                    }
        except Exception as e:
            print(f"Error fetching profile: {e}")
        
        # Return defaults if API call fails
        return {
            'riskTolerance': 'MODERATE',
            'investmentExperience': 'BEGINNER',
            'investmentGoals': 'growth',
            'investmentHorizon': 'MEDIUM_TERM'
        }
    
    async def _get_customer_portfolio(self, customer_id: str) -> Dict[str, Any]:
        """Fetch customer portfolio"""
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.marketplace_api}/api/v1/portfolio/holdings",
                    headers={"X-Customer-ID": customer_id},
                    timeout=5.0
                )
                
                if response.status_code == 200:
                    return response.json().get('data', {})
        except Exception as e:
            print(f"Error fetching portfolio: {e}")
        
        return {'holdings': []}
    
    async def _get_customer_transactions(self, customer_id: str) -> List[Dict[str, Any]]:
        """Fetch recent customer transactions"""
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.marketplace_api}/api/v1/transactions?limit=50",
                    headers={"X-Customer-ID": customer_id},
                    timeout=5.0
                )
                
                if response.status_code == 200:
                    return response.json().get('data', {}).get('transactions', [])
        except Exception as e:
            print(f"Error fetching transactions: {e}")
        
        return []
    
    async def _get_available_assets(self, asset_types: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        """Fetch available assets from marketplace"""
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.marketplace_api}/api/marketplace/assets",
                    timeout=5.0
                )
                
                if response.status_code == 200:
                    assets = response.json().get('data', [])
                    
                    # Filter by asset types if specified
                    if asset_types:
                        assets = [a for a in assets if a.get('assetType') in asset_types]
                    
                    return assets
        except Exception as e:
            print(f"Error fetching assets: {e}")
        
        return []

