"""
AI Recommendation Service - Main Application
FastAPI-based microservice for intelligent investment recommendations

@version 1.0.0
@classification Production-Ready
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn
import os
from datetime import datetime

from .recommendation_engine import RecommendationEngine
from .profile_analyzer import ProfileAnalyzer
from .insight_generator import InsightGenerator

# Initialize FastAPI app
app = FastAPI(
    title="AI Recommendation Service",
    description="Intelligent investment recommendations powered by AI",
    version="1.0.0",
    docs_url="/api/ai/docs",
    redoc_url="/api/ai/redoc"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:4000", "http://localhost:9002"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AI components
recommendation_engine = RecommendationEngine()
profile_analyzer = ProfileAnalyzer()
insight_generator = InsightGenerator()

# =====================================================
# MODELS
# =====================================================

class RecommendationRequest(BaseModel):
    customer_id: str
    asset_types: Optional[List[str]] = None
    limit: Optional[int] = 10

class RecommendationResponse(BaseModel):
    asset_id: str
    asset_name: str
    asset_type: str
    score: float
    reason: str
    expected_return: Optional[float] = None
    risk_level: str
    match_factors: List[str]

class InsightRequest(BaseModel):
    customer_id: str

class InsightResponse(BaseModel):
    insights: List[Dict[str, Any]]
    actions: List[Dict[str, Any]]
    warnings: List[Dict[str, Any]]

class ProfileAnalysisResponse(BaseModel):
    customer_id: str
    risk_profile: str
    investment_style: str
    diversification_score: float
    recommendations: List[str]

# =====================================================
# ROUTES
# =====================================================

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "AI Recommendation Service",
        "status": "healthy",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/api/ai/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "services": {
            "recommendation_engine": "operational",
            "profile_analyzer": "operational",
            "insight_generator": "operational"
        },
        "ml_models_enabled": os.getenv("ENABLE_ML_MODELS", "false").lower() == "true",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.post("/api/ai/recommendations", response_model=List[RecommendationResponse])
async def get_recommendations(request: RecommendationRequest):
    """
    Get personalized investment recommendations
    
    - **customer_id**: Customer UUID
    - **asset_types**: Optional filter by asset types
    - **limit**: Maximum number of recommendations
    """
    try:
        recommendations = await recommendation_engine.generate_recommendations(
            customer_id=request.customer_id,
            asset_types=request.asset_types,
            limit=request.limit
        )
        
        return recommendations
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate recommendations: {str(e)}")

@app.post("/api/ai/insights", response_model=InsightResponse)
async def get_insights(request: InsightRequest):
    """
    Get AI-powered insights and actionable suggestions
    
    - **customer_id**: Customer UUID
    """
    try:
        insights = await insight_generator.generate_insights(request.customer_id)
        return insights
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate insights: {str(e)}")

@app.post("/api/ai/profile-analysis", response_model=ProfileAnalysisResponse)
async def analyze_profile(request: InsightRequest):
    """
    Analyze customer profile and investment behavior
    
    - **customer_id**: Customer UUID
    """
    try:
        analysis = await profile_analyzer.analyze_profile(request.customer_id)
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze profile: {str(e)}")

@app.get("/api/ai/trending-assets")
async def get_trending_assets(limit: int = 5):
    """Get trending assets based on recent activity"""
    try:
        trending = await recommendation_engine.get_trending_assets(limit)
        return {"trending": trending}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get trending assets: {str(e)}")

@app.get("/api/ai/market-sentiment")
async def get_market_sentiment():
    """Get overall market sentiment analysis"""
    try:
        sentiment = await insight_generator.get_market_sentiment()
        return sentiment
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get market sentiment: {str(e)}")

# =====================================================
# ERROR HANDLERS
# =====================================================

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.status_code,
                "message": exc.detail
            }
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "An unexpected error occurred",
                "details": str(exc)
            }
        }
    )

# =====================================================
# STARTUP
# =====================================================

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8086))
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )

