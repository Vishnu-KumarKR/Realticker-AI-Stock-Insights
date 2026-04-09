import os
import json
from huggingface_hub import InferenceClient

MODEL_ID = "HuggingFaceH4/zephyr-7b-beta" 

def generate_insights(ticker: str, stats: dict):
    hf_api_key = os.getenv("HUGGINGFACE_API_KEY")
    
    volatility = stats['volatility']
    slope = stats['slope']
    start_price = stats['start_price']
    end_price = stats['end_price']
    max_price = stats['max_price']
    min_price = stats['min_price']
    closes = stats['closes']
    
    summary_text = (
        f"Ticker: {ticker}\n"
        f"6-Month Start Price: {start_price:.2f}\n"
        f"6-Month End Price: {end_price:.2f}\n"
        f"6-Month High: {max_price:.2f}\n"
        f"6-Month Low: {min_price:.2f}\n"
        f"Annualized Volatility: {volatility:.2f}\n"
        f"Trend Regression Slope: {slope:.4f}\n"
        f"Latest Prices (last 5 days): {[round(x, 2) for x in closes[-5:]]}"
    )
    
    prompt = (
        "Analyze the following 6 months stock price data summary along with its volatility and linear regression slope. "
        "Identify the trend (using slope), evaluate accurate risk level based on the volatility (standard deviation of returns), and provide investment guidance for a beginner. "
        "Output the result as strict JSON with keys: 'trend' (Upward, Downward, Sideways), "
        "'riskLevel' (Low, Medium, High), 'action' (Invest, Watch, Avoid), and 'reasoning' (a short paragraph explaining why, max 3 sentences).\n"
        f"Data:\n{summary_text}\n\nJSON Output:"
    )

    if not hf_api_key or hf_api_key == "your_huggingface_api_key_here":
        # Fallback Logic using slope and volatility as requested
        perf = (end_price - start_price) / start_price
        
        calculated_risk = "Medium"
        if volatility > 0.40:
            calculated_risk = "High"
        elif volatility < 0.20:
            calculated_risk = "Low"
            
        # Refined Trend Detection using Regression Slope
        trend_label = "Sideways"
        if slope > 0.5:
            trend_label = "Upward"
        elif slope < -0.5:
            trend_label = "Downward"
            
        if perf > 0.1 and trend_label == "Upward":
             return {
                "trend": trend_label, "riskLevel": calculated_risk, "action": "Invest",
                "reasoning": f"The asset shows steady linear growth (slope: {slope:.2f}) and an annualized volatility of {volatility:.2f}. Positive momentum makes it a reasonable consideration."
             }
        elif perf < -0.1 or trend_label == "Downward":
             return {
                "trend": trend_label, "riskLevel": calculated_risk if calculated_risk == "High" else "Medium", "action": "Avoid",
                "reasoning": f"The stock has a negative regression slope ({slope:.2f}) with a volatility index of {volatility:.2f}. Wait until it shows a clear reversal pattern."
             }
        else:
             return {
                "trend": trend_label, "riskLevel": calculated_risk, "action": "Watch",
                "reasoning": f"The stock has been trading with low momentum (slope: {slope:.2f}). Monitor its volatility ({volatility:.2f}) for a breakout before investing."
            }
            
    # AI Logic
    client = InferenceClient(model=MODEL_ID, token=hf_api_key)
    response = client.text_generation(prompt, max_new_tokens=150, temperature=0.3)
    insights = {
        "trend": "Unknown", "riskLevel": "Unknown", "action": "Watch",
        "reasoning": "Could not parse AI output."
    }
    try:
        response = response.strip()
        if "```json" in response:
            json_str = response.split("```json")[-1].split("```")[0]
        elif "```" in response:
             json_str = response.split("```")[-1].split("```")[0]
        else:
            start_idx = response.find('{')
            end_idx = response.rfind('}') + 1
            json_str = response[start_idx:end_idx]
            
        parsed = json.loads(json_str)
        insights["trend"] = parsed.get("trend", "Sideways")
        insights["riskLevel"] = parsed.get("riskLevel", "Medium")
        insights["action"] = parsed.get("action", "Watch")
        insights["reasoning"] = parsed.get("reasoning", "Analysis based on historical data patterns.")
    except Exception as e:
        print(f"Failed to parse LLM JSON: {e}, Response: {response}")
        insights["reasoning"] = f"Raw LLM output: {response}"
        
    return insights
