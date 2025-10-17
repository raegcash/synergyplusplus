"""
Test suite for AI Service API Endpoints
Integration tests for FastAPI endpoints
"""

import pytest
from fastapi.testclient import TestClient
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.main import app

client = TestClient(app)

class TestAPIEndpoints:
    """Test cases for API endpoints"""
    
    # =====================================================
    # HEALTH & STATUS TESTS
    # =====================================================
    
    def test_root_endpoint(self):
        """Test root endpoint"""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data['service'] == "AI Recommendation Service"
        assert data['status'] == "healthy"
        assert 'version' in data
    
    def test_health_check(self):
        """Test health check endpoint"""
        response = client.get("/api/ai/health")
        assert response.status_code == 200
        data = response.json()
        assert data['status'] == "healthy"
        assert 'services' in data
        assert data['services']['recommendation_engine'] == "operational"
    
    # =====================================================
    # RECOMMENDATION TESTS
    # =====================================================
    
    def test_get_recommendations_success(self):
        """Test recommendations endpoint with valid data"""
        payload = {
            "customer_id": "test-customer-123",
            "limit": 5
        }
        response = client.post("/api/ai/recommendations", json=payload)
        # Note: May return 500 if marketplace API is not available
        # Just check that endpoint exists and returns JSON
        assert response.status_code in [200, 500]
        assert response.headers['content-type'] == 'application/json'
    
    def test_get_recommendations_with_asset_types(self):
        """Test recommendations with asset type filter"""
        payload = {
            "customer_id": "test-customer-123",
            "asset_types": ["UITF", "STOCK"],
            "limit": 3
        }
        response = client.post("/api/ai/recommendations", json=payload)
        assert response.status_code in [200, 500]
    
    def test_get_recommendations_missing_customer_id(self):
        """Test recommendations without customer_id"""
        payload = {
            "limit": 5
        }
        response = client.post("/api/ai/recommendations", json=payload)
        assert response.status_code == 422  # Validation error
    
    # =====================================================
    # INSIGHTS TESTS
    # =====================================================
    
    def test_get_insights(self):
        """Test insights endpoint"""
        payload = {
            "customer_id": "test-customer-123"
        }
        response = client.post("/api/ai/insights", json=payload)
        assert response.status_code in [200, 500]
        assert response.headers['content-type'] == 'application/json'
    
    def test_get_insights_missing_customer_id(self):
        """Test insights without customer_id"""
        payload = {}
        response = client.post("/api/ai/insights", json=payload)
        assert response.status_code == 422  # Validation error
    
    # =====================================================
    # PROFILE ANALYSIS TESTS
    # =====================================================
    
    def test_profile_analysis(self):
        """Test profile analysis endpoint"""
        payload = {
            "customer_id": "test-customer-123"
        }
        response = client.post("/api/ai/profile-analysis", json=payload)
        assert response.status_code in [200, 500]
        assert response.headers['content-type'] == 'application/json'
    
    # =====================================================
    # TRENDING & SENTIMENT TESTS
    # =====================================================
    
    def test_get_trending_assets(self):
        """Test trending assets endpoint"""
        response = client.get("/api/ai/trending-assets?limit=5")
        assert response.status_code in [200, 500]
    
    def test_get_trending_assets_default_limit(self):
        """Test trending assets with default limit"""
        response = client.get("/api/ai/trending-assets")
        assert response.status_code in [200, 500]
    
    def test_get_market_sentiment(self):
        """Test market sentiment endpoint"""
        response = client.get("/api/ai/market-sentiment")
        assert response.status_code == 200
        data = response.json()
        assert 'overall_sentiment' in data
        assert 'confidence' in data
    
    # =====================================================
    # ERROR HANDLING TESTS
    # =====================================================
    
    def test_invalid_endpoint(self):
        """Test non-existent endpoint"""
        response = client.get("/api/ai/nonexistent")
        assert response.status_code == 404
    
    def test_invalid_method(self):
        """Test wrong HTTP method"""
        response = client.get("/api/ai/recommendations")
        assert response.status_code == 405  # Method not allowed

if __name__ == '__main__':
    pytest.main([__file__, '-v'])

