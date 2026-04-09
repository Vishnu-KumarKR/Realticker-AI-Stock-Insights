import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { TrendingUp, Activity } from 'lucide-react';

const Layout = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      <nav className="bg-slate-800/80 backdrop-blur-md border-b border-slate-700/50 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="p-2 bg-emerald-500/10 rounded-xl group-hover:bg-emerald-500/20 transition-colors">
                <TrendingUp className="h-7 w-7 text-emerald-400" />
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  RealTicker
                </span>
              </div>
            </Link>
            <div className="flex items-center space-x-2 px-4 py-2 bg-slate-800 rounded-full border border-slate-700 shadow-inner">
              <Activity className="h-4 w-4 text-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Live System</span>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[calc(100vh-160px)]">
        <Outlet />
      </main>
      <footer className="bg-slate-900 border-t border-slate-800/50 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm">&copy; {new Date().getFullYear()} RealTicker. Not financial advice.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
