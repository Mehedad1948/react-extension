/* global chrome */
import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';

const styles = `
  .symbol-display {
    background-color: #282c34;
    border: 1px solid #61dafb;
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 1.2rem;
    font-family: monospace;
    color: #61dafb;
    margin-top: 10px;
  }
`;

function App() {
  const [symbol, setSymbol] = useState('Loading...');

  // This useEffect runs once when the component mounts
  useEffect(() => {
    // Inject styles
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);

    // --- DEFENSIVE CHECK ---
    // Check if the 'chrome' and 'storage' APIs are available.
    // 'window.chrome' is another way to safely check for the object.
    if (window.chrome && chrome.storage && chrome.storage.local) {
      // We are in the extension environment.
      chrome.storage.local.get(['currentSymbol'], (result) => {
        if (chrome.runtime.lastError) {
          console.error("Error getting from storage:", chrome.runtime.lastError.message);
          setSymbol('Error!');
          return;
        }
        
        if (result.currentSymbol) {
          setSymbol(result.currentSymbol);
        } else {
          setSymbol('No symbol selected.');
        }
      });
    } else {
      // We are in a normal browser tab (e.g., localhost:3000).
      // Provide mock data for development.
      setSymbol('DEV_MODE_SYMBOL');
      console.log("Running in a dev environment. Chrome storage API not found.");
    }

    // Cleanup function to remove the stylesheet when the component unmounts
    return () => {
      document.head.removeChild(styleSheet);
    };

  }, []); // Empty dependency array ensures this runs only once.

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h2>Extension Popup</h2>
        <p>Selected Symbol ID:</p>
        <p className="symbol-display">{symbol}</p>
      </header>
    </div>
  );
}

export default App;
