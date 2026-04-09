import yfinance as yf
import pandas as pd
import numpy as np

def get_company_name(ticker: str) -> str:
    names = {
        "AAPL": "Apple Inc.", "MSFT": "Microsoft Corp.", "GOOGL": "Alphabet Inc.",
        "AMZN": "Amazon.com Inc.", "NVDA": "NVIDIA Corp.", "META": "Meta Platforms",
        "TSLA": "Tesla Inc.", "BRK-B": "Berkshire Hathaway", "TSM": "TSMC", "UNH": "UnitedHealth Group",
        "JNJ": "Johnson & Johnson", "JPM": "JPMorgan Chase", "V": "Visa Inc.", "PG": "Procter & Gamble",
        "MA": "Mastercard", "HD": "Home Depot", "CVX": "Chevron", "ABBV": "AbbVie",
        "LLY": "Eli Lilly", "PEP": "PepsiCo", "KO": "Coca-Cola", "BAC": "Bank of America"
    }
    return names.get(ticker, ticker)

def fetch_top_stocks(sort_by: str = "volume"):
    pool = ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA", "BRK-B", "TSM", "UNH",
            "JNJ", "JPM", "V", "PG", "MA", "HD", "CVX", "ABBV", "LLY", "PEP", "KO", "BAC"]
    
    data = yf.download(pool, period="5d", group_by="ticker", auto_adjust=True, progress=False)
    results = []
    
    for ticker in pool:
        try:
            if isinstance(data.columns, pd.MultiIndex):
                ticker_data = data[ticker].dropna()
            else:
                continue
                
            if len(ticker_data) < 2: 
                continue
            
            current_price = float(ticker_data['Close'].iloc[-1])
            prev_price = float(ticker_data['Close'].iloc[-2])
            volume = int(ticker_data['Volume'].iloc[-1])
            daily_change = ((current_price - prev_price) / prev_price) * 100
            
            results.append({
                "ticker": ticker,
                "name": get_company_name(ticker),
                "price": round(current_price, 2),
                "change": round(daily_change, 2),
                "volume": volume
            })
        except Exception:
            continue
            
    if sort_by == "growth":
        results.sort(key=lambda x: x['change'], reverse=True)
    else:
        results.sort(key=lambda x: x['volume'], reverse=True)
        
    return results[:10]

def fetch_stock_history(ticker: str):
    data = yf.download(ticker, period="6mo", progress=False)
    data = data.dropna()
    if data.empty:
        return []
    
    history = []
    close_col = 'Close'
    if isinstance(data.columns, pd.MultiIndex):
        try:
            data.columns = data.columns.droplevel(1)
        except:
            pass
            
    for date, row in data.iterrows():
        history.append({
            "date": date.strftime('%Y-%m-%d'),
            "price": round(float(row[close_col]), 2)
        })
    return history

def get_stock_analysis_data(ticker: str):
    data = yf.download(ticker, period="6mo", progress=False)
    data = data.dropna()
    if data.empty:
        raise ValueError("No data found")
        
    close_col = 'Close'
    if isinstance(data.columns, pd.MultiIndex):
        try:
            data.columns = data.columns.droplevel(1)
        except:
            pass
            
    closes = data[close_col].dropna().tolist()
    if len(closes) < 30:
        raise ValueError("Not enough data for analysis")
        
    start_price = float(closes[0])
    end_price = float(closes[-1])
    max_price = float(max(closes))
    min_price = float(min(closes))
    
    prices_array = np.array(closes)
    daily_returns = (prices_array[1:] - prices_array[:-1]) / prices_array[:-1]
    volatility = float(np.std(daily_returns)) * np.sqrt(252) # Annualized
    
    # Calculate linear regression slope for trend detection
    x = np.arange(len(closes))
    slope, _ = np.polyfit(x, prices_array, 1)
    
    return {
        "closes": closes,
        "start_price": start_price,
        "end_price": end_price,
        "max_price": max_price,
        "min_price": min_price,
        "volatility": volatility,
        "slope": float(slope)
    }
