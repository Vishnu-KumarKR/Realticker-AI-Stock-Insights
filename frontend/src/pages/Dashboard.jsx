import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, ArrowDownRight, Search, BarChart2, RefreshCw, Filter } from 'lucide-react';

const Dashboard = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('volume');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();

  const fetchTopStocks = useCallback(async (sort) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`http://localhost:8000/api/stocks/top10?sort_by=${sort}`);
      setStocks(res.data.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch top stocks. Make sure the backend is running.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTopStocks(sortBy);
  }, [sortBy, fetchTopStocks]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchTopStocks(sortBy);
  };

  const formatNumber = (num) => {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toString();
  };

  const filteredStocks = stocks.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.ticker.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative">
        <div className="space-y-2 relative z-10 w-full md:w-auto flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white drop-shadow-sm flex items-center gap-3">
              Top <span className="text-emerald-400">Performers</span>
              <button 
                  onClick={handleRefresh}
                  disabled={loading || isRefreshing}
                  className="p-2 bg-slate-800/80 hover:bg-slate-700/80 rounded-full border border-slate-700 transition-colors group disabled:opacity-50"
                  title="Refresh Data"
                >
                  <RefreshCw className={`h-5 w-5 text-emerald-400 ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
              </button>
            </h1>
            <p className="text-slate-400 text-lg mt-2">Curated overview of market leaders and volatile assets.</p>
          </div>
        </div>
        
        <div className="relative group z-10 w-full md:w-auto flex flex-col sm:flex-row gap-4">
          <div className="relative group w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-400 transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-4 py-3 bg-slate-800/80 border border-slate-700/50 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 backdrop-blur-sm transition-all shadow-lg"
              placeholder="Search symbols..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="relative group w-full sm:w-48">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-slate-400" />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none block w-full pl-10 pr-10 py-3 bg-slate-800/80 border border-slate-700/50 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 backdrop-blur-sm transition-all shadow-lg"
            >
              <option value="volume">Sort by Volume</option>
              <option value="growth">Sort by Growth</option>
            </select>
          </div>
        </div>
      </div>

      {loading && !isRefreshing ? (
        <div className="space-y-6">
          <div className="flex items-center justify-center space-x-3 p-6 bg-slate-800/40 border border-slate-700/50 rounded-2xl shadow-inner">
            <div className="h-6 w-6 border-4 border-slate-700 border-t-emerald-400 rounded-full animate-spin"></div>
            <p className="font-semibold text-emerald-400">Loading dynamic Top 10 market data...</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-slate-800/50 h-32 rounded-2xl animate-pulse border border-slate-700/50"></div>
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border-2 border-red-500/20 text-red-400 p-6 rounded-2xl flex items-center justify-between space-x-4 backdrop-blur-sm">
          <div className="flex items-center space-x-4">
            <svg className="w-10 h-10 shrink-0 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex flex-col">
               <h3 className="text-lg font-bold uppercase tracking-wider">Error Loading Data</h3>
               <p className="font-medium text-sm text-red-300/90">{error}</p>
            </div>
          </div>
          <button 
            onClick={() => fetchTopStocks(sortBy)}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 font-bold rounded-lg border border-red-500/30 transition-colors shadow-sm"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="overflow-hidden bg-slate-800/40 rounded-3xl border border-slate-700/50 backdrop-blur-md shadow-2xl relative">
           {isRefreshing && (
             <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm z-20 flex items-center justify-center">
                <RefreshCw className="h-8 w-8 text-emerald-400 animate-spin absolute" />
             </div>
           )}
          <table className="min-w-full divide-y divide-slate-700/50">
            <thead className="bg-slate-800/80">
              <tr>
                <th scope="col" className="px-6 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Asset</th>
                <th scope="col" className="px-6 py-5 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Price (USD)</th>
                <th scope="col" className="px-6 py-5 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">24h Change</th>
                <th scope="col" className="px-6 py-5 text-right text-xs font-bold text-slate-400 uppercase tracking-wider hidden md:table-cell">Volume</th>
                <th scope="col" className="px-6 py-5 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50 relative z-10">
              {filteredStocks.map((stock) => {
                const isPositive = stock.change >= 0;
                return (
                  <tr 
                    key={stock.ticker} 
                    className="hover:bg-slate-700/30 transition-colors group cursor-pointer"
                    onClick={() => navigate(`/stock/${stock.ticker}`)}
                  >
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600/50 text-white font-bold shadow-inner font-mono text-sm group-hover:scale-105 transition-transform">
                          {stock.ticker[0]}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-white flex items-center gap-2">
                            {stock.ticker}
                          </div>
                          <div className="text-xs text-slate-400 truncate w-32 md:w-auto">{stock.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right">
                      <div className="text-sm font-bold text-white">${stock.price.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right">
                      <div className={`inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-semibold shadow-inner ${
                        isPositive 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {isPositive ? <ArrowUpRight className="h-4 w-4 mr-1" /> : <ArrowDownRight className="h-4 w-4 mr-1" />}
                        {Math.abs(stock.change).toFixed(2)}%
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right text-sm text-slate-300 font-medium hidden md:table-cell">
                      {formatNumber(stock.volume)}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={(e) => { e.stopPropagation(); navigate(`/stock/${stock.ticker}`); }}
                        className="p-2 bg-slate-700/50 hover:bg-emerald-500 hover:text-white text-emerald-400 rounded-xl transition-all duration-300 group-hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                      >
                        <BarChart2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredStocks.length === 0 && (
            <div className="p-12 text-center text-slate-400">
              No assets found matching your search.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
