/* global chrome */
import React, { useState, useEffect } from 'react';

function App() {
  const [symbol, setSymbol] = useState('Loading...');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if the 'chrome' and 'storage' APIs are available
    if (window.chrome && chrome.storage && chrome.storage.local) {
      // We are in the extension environment
      chrome.storage.local.get(['currentSymbol'], (result) => {
        setIsLoading(false);
        
        if (chrome.runtime.lastError) {
          console.error("Error getting from storage:", chrome.runtime.lastError.message);
          setSymbol('Error!');
          return;
        }

        if (result.currentSymbol) {
          setSymbol(result.currentSymbol);
        } else {
          setSymbol('No symbol selected');
        }
      });
    } else {
      // We are in a normal browser tab (e.g., localhost:3000)
      setIsLoading(false);
      setSymbol('DEV_MODE_SYMBOL');
      console.log("Running in dev environment. Chrome storage API not found.");
    }
  }, []);

  return (
    <div className="w-80 min-h-96 bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Symbol Tracker</h1>
            <p className="text-blue-100 text-xs">Extension Dashboard</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Status Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
              Current Symbol
            </h2>
            <div className={`w-2 h-2 rounded-full ${symbol === 'No symbol selected' || symbol === 'Error!' ? 'bg-amber-400' : 'bg-emerald-400'} animate-pulse`}></div>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
              <p className="text-2xl font-mono font-bold text-blue-700 text-center tracking-wide break-all">
                {symbol}
              </p>
            </div>
          )}
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">How it works:</p>
              <p className="text-blue-700">Navigate to any page and select a symbol to track it here.</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button 
            onClick={() => {
              if (window.chrome && chrome.storage) {
                chrome.storage.local.remove(['currentSymbol'], () => {
                  setSymbol('No symbol selected');
                });
              }
            }}
            className="w-full bg-white hover:bg-slate-50 text-slate-700 font-medium py-2.5 px-4 rounded-lg border border-slate-300 transition-all duration-200 shadow-sm hover:shadow flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Clear Symbol
          </button>
          
          <button 
            onClick={() => {
              if (window.chrome && chrome.tabs) {
                chrome.tabs.create({ url: 'chrome://extensions' });
              }
            }}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 pb-4 text-center">
        <p className="text-xs text-slate-500">
          v1.0.0 • Made with 💙
        </p>
      </div>
    </div>
  );
}

export default App;
