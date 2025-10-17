/* global chrome */
import React, { useState, useEffect } from 'react';

function App() {
  const [symbol, setSymbol] = useState('در حال بارگذاری...');
  const [isLoading, setIsLoading] = useState(true);
  const [symbolData, setSymbolData] = useState(null);
  const [error, setError] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_BOURSE_API
  const API_KEY = process.env.REACT_APP_BOURSE_API_KEY


  const fetchSymbolData = async (currentSymbolName) => {
    try {
      setIsLoading(true);
      setError(null);
      console.log(`${API_BASE_URL}/History.php?key=${API_KEY}&type=0&l18=${currentSymbolName}`);

      const response = await fetch(`${API_BASE_URL}/History.php?key=${API_KEY}&type=0&l18=${currentSymbolName}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add your API key or auth token here if needed
          // 'Authorization': 'Bearer YOUR_TOKEN'
        },
      });
      console.log(`${API_BASE_URL}/History.php?key=${API_KEY}&type=0&l18=${currentSymbolName}`, '➡️➡️➡️', response);

      if (!response.ok) {
        throw new Error(`خطا در دریافت اطلاعات: ${response.status}`);
      }

      const data = await response.json();
      console.log('⭕⭕⭕', data);

      setSymbolData(data);
      setIsLoading(false);

    } catch (err) {
      console.error('API Error:', err);
      setError(err.message);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Check if the 'chrome' and 'storage' APIs are available
    if (window.chrome && chrome.storage && chrome.storage.local) {
      // We are in the extension environment
      chrome.storage.local.get(['currentSymbolName'], (result) => {
        if (chrome.runtime.lastError) {
          console.error("Error getting from storage:", chrome.runtime.lastError.message);
          setSymbol('خطا!');
          setIsLoading(false);
          return;
        }

        if (result.currentSymbolName) {
          console.log('❌❌❌', result.currentSymbolName);

          setSymbol(result.currentSymbolName);
          // Fetch symbol data from API
          fetchSymbolData(result.currentSymbolName);
        } else {
          setSymbol('نمادی انتخاب نشده است');
          setIsLoading(false);
        }
      });

      // Listen for storage changes (when user selects a new symbol)
      chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'local' && changes.currentSymbolName) {
          const newSymbol = changes.currentSymbolName.newValue;
          if (newSymbol) {
            setSymbol(newSymbol);
            fetchSymbolData(newSymbol);
          }
        }
      });

    } else {
      // We are in a normal browser tab (e.g., localhost:3000)
      setIsLoading(false);
      setSymbol('حالت توسعه');
      // Mock data for development
      setSymbolData({
        name: 'شرکت نمونه',
        price: '125,000',
        change: '+2.5%',
        volume: '1,234,567'
      });
      console.log("Running in dev environment. Chrome storage API not found.");
    }
  }, []);

  const handleClearSymbol = () => {
    if (window.chrome && chrome.storage) {
      chrome.storage.local.remove(['currentSymbol'], () => {
        setSymbol('نمادی انتخاب نشده است');
        setSymbolData(null);
        setError(null);
      });
    }
  };

  const handleRefresh = () => {
    if (symbol && symbol !== 'نمادی انتخاب نشده است' && symbol !== 'خطا!') {
      fetchSymbolData(symbol);
    }
  };

  return (
    <div className="w-80 min-h-96 bg-gradient-to-br from-slate-50 to-slate-100" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md">
            <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">مفید یار</h1>
            <p className="text-emerald-100 text-xs">دستیار هوشمند بورس</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Symbol Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-700">
              نماد انتخابی {symbol}
            </h2>
            <div className="flex items-center gap-2">
              {!isLoading && symbol !== 'نمادی انتخاب نشده است' && (
                <button
                  onClick={handleRefresh}
                  className="text-slate-400 hover:text-emerald-600 transition-colors"
                  title="به‌روزرسانی"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              )}
              <div className={`w-2 h-2 rounded-full ${symbol === 'نمادی انتخاب نشده است' || symbol === 'خطا!'
                ? 'bg-amber-400'
                : 'bg-emerald-400'
                } animate-pulse`}></div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mb-3"></div>
              <p className="text-sm text-slate-500">در حال دریافت اطلاعات...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-700">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">{error}</span>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-4 border border-emerald-200 mb-4">
                <p className="text-2xl font-bold text-emerald-700 text-center tracking-wide">
                  {symbol}
                </p>
              </div>

              {/* Symbol Data */}
              {symbolData && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-sm text-slate-600">نام شرکت:</span>
                    <span className="text-sm font-semibold text-slate-800">
                      {symbolData.name || 'نامشخص'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-sm text-slate-600">درصد سهامداران عمده حقوقی:</span>
                    <span className="text-sm font-bold text-slate-800">
                      {symbolData.price || '---'} ریال
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-sm text-slate-600">تغییرات:</span>
                    <span className={`text-sm font-bold ${symbolData.change?.startsWith('+')
                      ? 'text-emerald-600'
                      : 'text-red-600'
                      }`}>
                      {symbolData.change || '---'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-slate-600">حجم معاملات:</span>
                    <span className="text-sm font-semibold text-slate-800">
                      {symbolData.volume || '---'}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Info Card */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="text-sm text-emerald-800">
              <p className="font-semibold mb-1">راهنما:</p>
              <p className="text-emerald-700">
                روی نماد مورد نظر در صفحه بورس کلیک کنید تا اطلاعات آن به‌روزرسانی شود.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={handleClearSymbol}
            disabled={symbol === 'نمادی انتخاب نشده است'}
            className="w-full bg-white hover:bg-slate-50 text-slate-700 font-medium py-2.5 px-4 rounded-lg border border-slate-300 transition-all duration-200 shadow-sm hover:shadow flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            پاک کردن نماد
          </button>

          <button
            onClick={() => {
              if (window.chrome && chrome.tabs) {
                chrome.tabs.create({ url: 'chrome://extensions' });
              }
            }}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            تنظیمات
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 pb-4 text-center border-t border-slate-200 pt-3">
        <p className="text-xs text-slate-500">
          نسخه 1.0.0 • ساخته شده با 💚
        </p>
      </div>
    </div>
  );
}

export default App;
