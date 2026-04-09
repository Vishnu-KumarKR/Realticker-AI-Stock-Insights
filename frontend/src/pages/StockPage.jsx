import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowLeft, Brain, TrendingUp, TrendingDown, Target, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';

const StockPage = () => {
  const { ticker } = useParams();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [insights, setInsights] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`http://localhost:8000/api/stocks/${ticker}/history`);
      setHistory(res.data.history);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch historical data.');
    } finally {
      setLoading(false);
    }
  }, [ticker]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setAnalysisError(null);
    try {
      const res = await axios.post(`http://localhost:8000/api/stocks/${ticker}/analyze`);
      setInsights(res.data);
    } catch (err) {
      console.error(err);
      setAnalysisError('Failed to generate insights. Check backend API or data availability.');
    } finally {
      setAnalyzing(false);
    }
  };

  const currentPrice = history.length > 0 ? history[history.length - 1].price : 0;
  const oldPrice = history.length > 0 ? history[0].price : 0;
  const returnPct = oldPrice > 0 ? ((currentPrice - oldPrice) / oldPrice) * 100 : 0;
  const isPositive = returnPct >= 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <button 
        onClick={() => navigate('/')}
        className="flex items-center text-slate-400 hover:text-emerald-400 transition-colors group text-sm font-medium bg-slate-800/50 py-2 px-4 rounded-xl w-fit border border-slate-700/50"
      >
        <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
      </button>

      {error ? (
        <div className="bg-red-500/10 border-2 border-red-500/20 text-red-400 p-8 rounded-2xl flex items-center justify-between space-x-4 backdrop-blur-sm">
          <div className="flex items-center space-x-4">
            <AlertTriangle className="w-10 h-10 shrink-0 opacity-80" />
            <div className="flex flex-col">
               <h3 className="text-lg font-bold uppercase tracking-wider">Error Loading Data</h3>
               <p className="font-medium text-sm text-red-300/90">{error}</p>
            </div>
          </div>
          <button 
            onClick={fetchHistory}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 font-bold rounded-lg border border-red-500/30 transition-colors shadow-sm"
          >
            Retry
          </button>
        </div>
      ) : loading ? (
        <div className="space-y-6">
          <div className="flex items-center justify-center space-x-3 p-6 bg-slate-800/40 border border-slate-700/50 rounded-2xl shadow-inner">
            <div className="h-6 w-6 border-4 border-slate-700 border-t-emerald-400 rounded-full animate-spin"></div>
            <p className="font-semibold text-emerald-400">Loading historical chart data...</p>
          </div>
          <div className="h-96 bg-slate-800/50 rounded-3xl animate-pulse border border-slate-700/50"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Chart Section */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 md:p-8 backdrop-blur-md shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
               
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div>
                  <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-sm">{ticker.toUpperCase()}</h1>
                  <p className="text-slate-400 font-medium mt-1">6-Month Price History</p>
                </div>
                <div className="text-left md:text-right flex items-center space-x-4 md:block">
                  <div className="text-3xl md:text-4xl font-bold text-white tracking-tight">${currentPrice.toFixed(2)}</div>
                  <div className={`text-lg font-semibold flex items-center justify-start md:justify-end shadow-sm ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isPositive ? <TrendingUp className="h-5 w-5 mr-1" /> : <TrendingDown className="h-5 w-5 mr-1" />}
                    {isPositive ? '+' : ''}{returnPct.toFixed(2)}%
                  </div>
                </div>
              </div>
              
              <div className="h-[400px] w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      stroke="#94a3b8" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 12 }}
                      tickFormatter={(val) => {
                        const d = new Date(val);
                        return `${d.toLocaleString('default', { month: 'short' })} ${d.getDate()}`;
                      }}
                      minTickGap={30}
                    />
                    <YAxis 
                      stroke="#94a3b8" 
                      domain={['auto', 'auto']} 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 12 }}
                      tickFormatter={(val) => `$${val}`}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(51, 65, 85, 0.5)', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)' }}
                      itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                      labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke={isPositive ? '#10b981' : '#f43f5e'} 
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 6, fill: isPositive ? '#10b981' : '#f43f5e', stroke: '#0f172a', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          {/* AI Analysis Sidebar */}
          <div className="space-y-6">
            <div className="bg-gradient-to-b from-slate-800 to-slate-800/40 border border-slate-700/50 rounded-3xl p-6 backdrop-blur-md shadow-2xl h-full flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
              
              <div className="flex items-center space-x-3 mb-6 relative z-10">
                <div className="p-2.5 bg-cyan-500/20 text-cyan-400 rounded-xl">
                  <Brain className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold text-white">AI Analyst</h2>
              </div>
              
              {!insights && !analyzing && (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 relative z-10 py-10">
                  <div className="p-4 bg-slate-700/30 rounded-full">
                    <Target className="h-10 w-10 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Ready to Analyze</h3>
                    <p className="text-sm text-slate-400 px-4">Generate intelligent insights based on 6-month historical price patterns.</p>
                  </div>
                  <button 
                    onClick={handleAnalyze}
                    className="mt-4 w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-bold text-sm transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-emerald-500/25 flex items-center justify-center group"
                  >
                    <Brain className="w-5 h-5 mr-2 group-hover:animate-pulse" /> Generate Insights
                  </button>
                </div>
              )}

              {analyzing && (
                <div className="flex-1 flex flex-col items-center justify-center space-y-6 relative z-10 py-10">
                  <div className="relative">
                    <div className="h-16 w-16 text-cyan-400 border-4 border-slate-700 border-t-cyan-400 rounded-full animate-spin"></div>
                    <Brain className="absolute inset-0 m-auto h-6 w-6 text-slate-400 animate-pulse" />
                  </div>
                  <p className="text-sm font-medium text-cyan-400 animate-pulse">Running advanced models...</p>
                </div>
              )}

              {analysisError && (
                 <div className="flex-1 flex flex-col items-center justify-center relative z-10 space-y-4">
                  <div className="w-full text-rose-400 text-sm bg-rose-500/10 p-4 rounded-xl border border-rose-500/20 text-center">
                    <AlertTriangle className="h-6 w-6 mx-auto mb-2" />
                    {analysisError}
                  </div>
                  <button 
                    onClick={handleAnalyze}
                    className="flex items-center text-sm px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg transition-colors border border-slate-600/50"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" /> Try Again
                  </button>
                </div>
              )}

              {insights && !analyzing && (
                <div className="flex-1 flex flex-col space-y-5 relative z-10 min-h-0 overflow-y-auto pr-2 custom-scrollbar">
                   <div className="grid grid-cols-2 gap-4">
                     <div className="bg-slate-700/30 p-4 rounded-2xl border border-slate-600/30">
                        <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Trend</div>
                        <div className="text-lg font-bold text-white flex items-center capitalize">
                           {insights.trend}
                        </div>
                     </div>
                     <div className="bg-slate-700/30 p-4 rounded-2xl border border-slate-600/30">
                        <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Risk</div>
                        <div className="text-lg font-bold text-white flex items-center capitalize">
                           {insights.riskLevel}
                        </div>
                     </div>
                   </div>
                   
                   <div className={`p-4 rounded-2xl border flex items-start space-x-3 ${
                      insights.action === 'Invest' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                      insights.action === 'Avoid' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                      'bg-amber-500/10 border-amber-500/20 text-amber-400'
                   }`}>
                      <ShieldCheck className="h-6 w-6 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-wider opacity-80 mb-1">Suggested Info</div>
                        <div className="text-xl font-bold uppercase">{insights.action}</div>
                      </div>
                   </div>

                   <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-700/50">
                      <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">Reasoning</div>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        {insights.reasoning}
                      </p>
                   </div>
                   
                   <button 
                      onClick={handleAnalyze}
                      className="mt-2 w-full py-3 rounded-xl bg-slate-700/50 hover:bg-slate-700 text-white font-medium text-sm transition-colors"
                    >
                      Refresh Analysis
                    </button>
                </div>
              )}
              
              <div className="mt-6 p-4 bg-amber-500/10 border-2 border-amber-500/20 rounded-xl flex items-start space-x-3 relative z-10 shadow-lg">
                <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
                <p className="text-xs text-amber-500 font-semibold leading-relaxed">
                  <strong className="text-amber-400">DISCLAIMER:</strong> This is AI-generated analysis and absolutely NOT financial advice. Always consult a qualified professional before investing.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockPage;
