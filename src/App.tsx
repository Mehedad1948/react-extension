import React, { useEffect, useState } from "react";

function App() {
  const [pageTitle, setPageTitle] = useState<string | null>(null);

  useEffect(() => {
    chrome.storage.local.get("currentPageTitle", (result) => {
      if (result.currentPageTitle) {
        setPageTitle(result.currentPageTitle);
      }
    });
  }, []);

  const handleOpenOptions = () => {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      alert("Options page not available in this mode.");
    }
  };

  return (
    <div className="w-80 min-h-60 bg-white text-gray-800 p-4 flex flex-col items-center justify-center text-center">
      <h1 className="text-lg font-semibold mb-2">🔧 React Chrome Extension</h1>

      <p className="text-sm mb-4">
        {pageTitle ? `🌐 Current Page: ${pageTitle}` : "🚀 Ready to go!"}
      </p>

      <button
        onClick={handleOpenOptions}
        className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded transition"
      >
        Open Options
      </button>

      <footer className="mt-6 text-xs text-gray-400">
        v1.0.0 • Built with React + TypeScript
      </footer>
    </div>
  );
}

export default App;
