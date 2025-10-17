# 🤖 AI Recommendation Service

**Intelligent investment recommendations powered by AI**

Enterprise-grade microservice that provides personalized investment recommendations, portfolio analysis, and smart insights.

---

## 🎯 Features

### 1. **Personalized Recommendations**
- Smart asset matching based on risk tolerance
- Portfolio diversification optimization
- Investment experience consideration
- Goal-aligned suggestions

### 2. **Profile Analysis**
- Risk profile assessment
- Investment style identification
- Portfolio diversification scoring
- Actionable recommendations

### 3. **Smart Insights**
- Real-time portfolio insights
- Transaction pattern analysis
- Proactive warnings
- Actionable suggestions

### 4. **Market Intelligence**
- Trending assets identification
- Market sentiment analysis
- Performance tracking

---

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- PostgreSQL (for future ML models)
- Access to Marketplace API

### Installation

```bash
cd superapp-ecosystem/ai-services/recommendation-engine

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### Configuration

Edit `.env`:
```bash
PORT=8086
DATABASE_URL=postgresql://postgres:password@localhost:5432/superapp_marketplace_node
MARKETPLACE_API_URL=http://localhost:8085
```

### Run Service

```bash
# Development
uvicorn app.main:app --reload --port 8086

# Production
uvicorn app.main:app --host 0.0.0.0 --port 8086 --workers 4
```

### Access API Documentation

- Swagger UI: http://localhost:8086/api/ai/docs
- ReDoc: http://localhost:8086/api/ai/redoc

---

## 📡 API Endpoints

### Recommendations

**POST** `/api/ai/recommendations`
```json
{
  "customer_id": "uuid",
  "asset_types": ["UITF", "STOCK"],
  "limit": 10
}
```

**Response**:
```json
[
  {
    "asset_id": "uuid",
    "asset_name": "BDO Equity Fund",
    "asset_type": "UITF",
    "score": 0.92,
    "reason": "Excellent match for your portfolio...",
    "expected_return": 8.5,
    "risk_level": "MEDIUM",
    "match_factors": [
      "Matches your moderate risk profile",
      "Improves portfolio diversification"
    ]
  }
]
```

### Insights

**POST** `/api/ai/insights`
```json
{
  "customer_id": "uuid"
}
```

**Response**:
```json
{
  "insights": [
    {
      "type": "PERFORMANCE",
      "title": "Portfolio Growing Strong",
      "description": "Your portfolio has gained ₱30,000 (25%). Keep up the great work!",
      "sentiment": "POSITIVE",
      "icon": "trending_up"
    }
  ],
  "actions": [
    {
      "type": "DIVERSIFY",
      "title": "Diversify Your Portfolio",
      "description": "Explore different asset types to spread your risk",
      "priority": "MEDIUM",
      "actionUrl": "/marketplace?filter=recommended"
    }
  ],
  "warnings": []
}
```

### Profile Analysis

**POST** `/api/ai/profile-analysis`
```json
{
  "customer_id": "uuid"
}
```

---

## 🧠 Recommendation Algorithm

### Scoring Factors

1. **Risk Tolerance Match** (30%)
   - Matches asset risk level with customer preference
   - Conservative/Moderate/Aggressive alignment

2. **Diversification Benefit** (25%)
   - Analyzes current portfolio composition
   - Rewards new asset types
   - Penalizes over-concentration

3. **Experience Level Match** (15%)
   - Matches asset complexity with investor experience
   - Beginner → UITF, Bonds
   - Advanced → Stocks, Crypto

4. **Performance & Quality** (20%)
   - Asset historical performance
   - Provider reputation
   - Liquidity and accessibility

5. **Investment Goals Alignment** (10%)
   - Long-term goals → Stocks, UITFs
   - Short-term goals → Bonds
   - Growth vs. Income matching

### Score Calculation

```python
final_score = (
    risk_match * 0.30 +
    diversification * 0.25 +
    experience_match * 0.15 +
    quality_score * 0.20 +
    goals_match * 0.10
)
```

Minimum threshold: **0.6** (60%)

---

## 🔮 Future Enhancements

### Week 2: Machine Learning
- Train recommendation models on historical data
- Collaborative filtering
- Deep learning for pattern recognition

### Week 3: Predictive Analytics
- Price prediction models
- Risk forecasting
- Portfolio optimization algorithms

### Week 4: Conversational AI
- NLP-powered chatbot
- Natural language queries
- Personalized financial advice

---

## 🧪 Testing

```bash
# Run tests
pytest tests/ -v

# With coverage
pytest tests/ --cov=app --cov-report=html
```

---

## 📊 Monitoring

### Health Check

```bash
curl http://localhost:8086/api/ai/health
```

### Metrics

Service exposes Prometheus metrics at `/metrics` (future)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│       Frontend (React)              │
└────────────┬────────────────────────┘
             │
             ↓
┌─────────────────────────────────────┐
│     Client BFF (Spring Boot)        │
└────────────┬────────────────────────┘
             │
             ↓
┌─────────────────────────────────────┐
│   AI Service (FastAPI/Python)       │
│   ├── Recommendation Engine         │
│   ├── Profile Analyzer              │
│   └── Insight Generator              │
└────────────┬────────────────────────┘
             │
             ↓
┌─────────────────────────────────────┐
│   Marketplace API (Node.js)         │
│   └── Customer & Portfolio Data     │
└─────────────────────────────────────┘
```

---

## 🔧 Development

### Project Structure

```
recommendation-engine/
├── app/
│   ├── main.py                    # FastAPI app
│   ├── recommendation_engine.py   # Core recommendation logic
│   ├── profile_analyzer.py        # Profile analysis
│   └── insight_generator.py       # Insight generation
├── models/                         # ML models (future)
├── tests/                          # Test suite
├── requirements.txt                # Python dependencies
├── .env.example                    # Environment template
└── README.md                       # This file
```

### Adding New Features

1. Create new module in `app/`
2. Add route in `main.py`
3. Write tests in `tests/`
4. Update documentation

---

## 📝 License

Proprietary - Synergy++ Platform

---

## 📞 Support

For issues or questions:
- Check logs: `tail -f logs/ai-service.log`
- Review API docs: http://localhost:8086/api/ai/docs
- Contact: Platform team

---

**Status**: ✅ Production-Ready  
**Version**: 1.0.0  
**Last Updated**: October 17, 2025

