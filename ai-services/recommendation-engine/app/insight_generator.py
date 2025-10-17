"""
Insight Generator - AI-Powered Smart Insights
Generates actionable insights and warnings for customers

@version 1.0.0
"""

from typing import Dict, Any, List
import httpx
import os
from datetime import datetime, timedelta

class InsightGenerator:
    """Generates intelligent insights from customer data"""
    
    def __init__(self):
        self.marketplace_api = os.getenv("MARKETPLACE_API_URL", "http://localhost:8085")
    
    async def generate_insights(self, customer_id: str) -> Dict[str, Any]:
        """Generate comprehensive insights"""
        
        # Fetch data
        portfolio = await self._get_portfolio(customer_id)
        transactions = await self._get_transactions(customer_id)
        profile = await self._get_profile(customer_id)
        
        # Generate different types of insights
        insights = []
        actions = []
        warnings = []
        
        # Portfolio insights
        portfolio_insights = self._analyze_portfolio(portfolio)
        insights.extend(portfolio_insights['insights'])
        actions.extend(portfolio_insights['actions'])
        warnings.extend(portfolio_insights['warnings'])
        
        # Transaction insights
        transaction_insights = self._analyze_transactions(transactions)
        insights.extend(transaction_insights['insights'])
        actions.extend(transaction_insights['actions'])
        
        # Profile completeness
        profile_insights = self._analyze_profile_completeness(profile)
        actions.extend(profile_insights)
        
        return {
            "insights": insights,
            "actions": actions,
            "warnings": warnings
        }
    
    def _analyze_portfolio(self, portfolio: Dict[str, Any]) -> Dict[str, List[Dict[str, Any]]]:
        """Analyze portfolio for insights"""
        
        insights = []
        actions = []
        warnings = []
        
        if not portfolio or not portfolio.get('holdings'):
            actions.append({
                "type": "START_INVESTING",
                "title": "Start Your Investment Journey",
                "description": "You haven't made any investments yet. Browse our marketplace to get started!",
                "priority": "HIGH",
                "actionUrl": "/marketplace"
            })
            return {"insights": insights, "actions": actions, "warnings": warnings}
        
        holdings = portfolio.get('holdings', [])
        total_value = sum(h.get('totalValue', 0) for h in holdings)
        
        # Positive performance insight
        total_gain = sum(h.get('gainLoss', 0) for h in holdings)
        if total_gain > 0:
            gain_percent = (total_gain / (total_value - total_gain)) * 100
            insights.append({
                "type": "PERFORMANCE",
                "title": "Portfolio Growing Strong",
                "description": f"Your portfolio has gained ₱{total_gain:,.2f} ({gain_percent:.2f}%). Keep up the great work!",
                "sentiment": "POSITIVE",
                "icon": "trending_up"
            })
        
        # Diversification check
        asset_types = set(h.get('assetType') for h in holdings)
        if len(asset_types) < 2:
            warnings.append({
                "type": "DIVERSIFICATION",
                "title": "Limited Diversification",
                "description": "Your portfolio is concentrated in one asset type. Consider diversifying to reduce risk.",
                "severity": "MEDIUM",
                "icon": "warning"
            })
            actions.append({
                "type": "DIVERSIFY",
                "title": "Diversify Your Portfolio",
                "description": "Explore different asset types to spread your risk",
                "priority": "MEDIUM",
                "actionUrl": "/marketplace?filter=recommended"
            })
        
        # Check for concentrated positions
        for holding in holdings:
            concentration = holding.get('totalValue', 0) / total_value if total_value > 0 else 0
            if concentration > 0.5:
                warnings.append({
                    "type": "CONCENTRATION",
                    "title": "High Concentration Risk",
                    "description": f"{holding.get('assetName')} makes up {concentration*100:.1f}% of your portfolio",
                    "severity": "HIGH",
                    "icon": "warning"
                })
        
        # Rebalancing suggestion
        if len(holdings) > 3:
            insights.append({
                "type": "REBALANCING",
                "title": "Portfolio Rebalancing Due",
                "description": "It's been a while since your last portfolio review. Consider rebalancing.",
                "sentiment": "NEUTRAL",
                "icon": "info"
            })
            actions.append({
                "type": "REBALANCE",
                "title": "Review Portfolio Balance",
                "description": "Check if your asset allocation still matches your goals",
                "priority": "LOW",
                "actionUrl": "/portfolio"
            })
        
        return {"insights": insights, "actions": actions, "warnings": warnings}
    
    def _analyze_transactions(self, transactions: List[Dict[str, Any]]) -> Dict[str, List[Dict[str, Any]]]:
        """Analyze transaction patterns"""
        
        insights = []
        actions = []
        
        if not transactions:
            return {"insights": insights, "actions": actions}
        
        # Recent activity
        recent = [t for t in transactions if t.get('transactionType') == 'INVESTMENT']
        if len(recent) >= 5:
            insights.append({
                "type": "ACTIVITY",
                "title": "Active Investor",
                "description": f"You've made {len(recent)} investments recently. You're building wealth consistently!",
                "sentiment": "POSITIVE",
                "icon": "star"
            })
        
        # Pending transactions
        pending = [t for t in transactions if t.get('status') == 'PENDING']
        if pending:
            insights.append({
                "type": "PENDING",
                "title": "Pending Transactions",
                "description": f"You have {len(pending)} pending transactions. Check their status.",
                "sentiment": "NEUTRAL",
                "icon": "pending"
            })
            actions.append({
                "type": "CHECK_PENDING",
                "title": "Review Pending Transactions",
                "description": "Some transactions are waiting for processing",
                "priority": "MEDIUM",
                "actionUrl": "/transactions?filter=pending"
            })
        
        # Investment streak
        if len(recent) >= 3:
            insights.append({
                "type": "STREAK",
                "title": "Investment Streak Active",
                "description": "You're building a consistent investment habit. Keep it going!",
                "sentiment": "POSITIVE",
                "icon": "local_fire_department"
            })
        
        return {"insights": insights, "actions": actions}
    
    def _analyze_profile_completeness(self, profile: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Check profile completeness"""
        
        actions = []
        
        completion = profile.get('profileCompletion', {}).get('percentage', 0)
        
        if completion < 80:
            actions.append({
                "type": "COMPLETE_PROFILE",
                "title": "Complete Your Profile",
                "description": f"Your profile is {completion}% complete. Complete it for better recommendations!",
                "priority": "HIGH",
                "actionUrl": "/profile"
            })
        
        # KYC status
        kyc_status = profile.get('kycStatus', {}).get('status', 'PENDING')
        if kyc_status == 'PENDING':
            actions.append({
                "type": "COMPLETE_KYC",
                "title": "Complete KYC Verification",
                "description": "Verify your identity to unlock all features",
                "priority": "HIGH",
                "actionUrl": "/profile?tab=4"
            })
        
        return actions
    
    async def get_market_sentiment(self) -> Dict[str, Any]:
        """Get market sentiment analysis"""
        
        return {
            "overall_sentiment": "POSITIVE",
            "confidence": 0.75,
            "trending_sectors": ["Technology", "Healthcare"],
            "market_summary": "Markets showing positive momentum with strong fundamentals",
            "last_updated": datetime.utcnow().isoformat()
        }
    
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
                    return response.json().get('data', {})
        except:
            pass
        return {}

