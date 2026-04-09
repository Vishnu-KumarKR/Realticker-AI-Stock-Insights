from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from services.data_service import fetch_top_stocks, fetch_stock_history, get_stock_analysis_data
from services.ai_service import generate_insights

load_dotenv()

app = FastAPI(title="RealTicker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/stocks/top10")
def get_top_10_stocks(sort_by: str = Query("volume", description="Sort by volume or growth")):
    try:
        results = fetch_top_stocks(sort_by)
        return {"data": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/stocks/{ticker}/history")
def get_stock_history(ticker: str):
    valid_ticker = ticker.upper()
    try:
        history = fetch_stock_history(valid_ticker)
        if not history:
            raise HTTPException(status_code=404, detail="Stock not found")
        return {"ticker": valid_ticker, "history": history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/stocks/{ticker}/analyze")
def analyze_stock(ticker: str):
    valid_ticker = ticker.upper()
    try:
        stats = get_stock_analysis_data(valid_ticker)
        insights = generate_insights(valid_ticker, stats)
        return insights
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
