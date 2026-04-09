# RealTicker AI Stock Insights

RealTicker is an AI-powered financial dashboard built for modern investors. It synthesizes real-time market data alongside an integrated AI Analyst to provide actionable metrics on trend and volatility.

## 📸 Screenshots

<div align="center">
  <img src="<img width="1913" height="867" alt="Screenshot 2026-04-09 144538" src="https://github.com/user-attachments/assets/bd36d785-fde0-45ff-879b-255caec96791" />
" width="800" alt="Dashboard View">
  <p><em>Real-Time Top Performers Dashboard</em></p>
</div>

<div align="center">
  <img src="<img width="1915" height="879" alt="Screenshot 2026-04-09 144604" src="https://github.com/user-attachments/assets/18713521-953d-49f5-b938-4c1b4aad1044" />
" width="800" alt="Stock Detail View">
  <p><em>6-Month Historical Chart & Analytics</em></p>
</div>

<div align="center">
  <img src="<img width="1918" height="869" alt="Screenshot 2026-04-09 144622" src="https://github.com/user-attachments/assets/8ee82db5-395c-47a9-89c9-b7bf30bf0841" />
" width="800" alt="Generated AI Insights">
  <p><em>HuggingFace Zephyr-7B generated Investment Strategy</em></p>
</div>

## 🏗️ Architecture

```mermaid
graph TD
    User([User / Browser])
    Proxy[Vite Dev Server<br/>Port 5173]
    React[React Frontend<br/>TailwindCSS & Recharts]
    REST[RESTful API via Axios]
    FastAPI[FastAPI Backend<br/>Port 8000]
    DataService[Data Service<br/>yfinance & numpy]
    AIService[AI Service<br/>Prompt Engineering]
    HF[HuggingFace API<br/>Zephyr-7b-beta]
    Market[Yahoo Finance Live]

    User --> Proxy
    Proxy --> React
    React -->|JSON over HTTP| REST
    REST --> FastAPI
    FastAPI --> DataService
    FastAPI --> AIService
    DataService --> Market
    AIService -->|Analyzes Math| HF
```

## 🧠 LLM Used
We dynamically pipeline statistical aggregations directly into **HuggingFaceH4/zephyr-7b-beta** (Zephyr 7B). Our custom integration provides it with localized Annualized Volatility and Linear Regression slopes so it deduces genuine insights instead of hallucinating. Fallback algorithms handle native heuristic processing safely if token caps are reached.

## ⚙️ Setup Steps

### Prerequisites
- Node.js & npm (v18+)
- Python 3.10+
- (Optional) Hugging Face API Token

### 1. Backend Setup
Navigate to the `backend` directory, install requirements, and start the Uvicorn server:
`bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --port 8000 --reload
`
*Note: To inject actual AI processing logic, create a `.env` in the backend folder stating `HUGGINGFACE_API_KEY=your_key`.*

### 2. Frontend Setup
Open a new terminal window, navigate to the `frontend` directory, and start the dev interface:
`bash
cd frontend
npm install
npm run dev
`
The application will safely spin up locally at `http://localhost:5173`!
