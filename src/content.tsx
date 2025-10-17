import React from 'react';
import ReactDOM from 'react-dom/client';
import InjectedButton from './InjectedButton';

// Track which cells we've already processed
const processedCells = new WeakSet();

function injectButtons() {
  const targetCells = document.querySelectorAll<HTMLElement>(
    'div[role="gridcell"][col-id="symbolName"]'
  );

  targetCells.forEach((cell) => {
    // Skip if already processed
    if (processedCells.has(cell)) {
      return;
    }

    const targetDiv = cell.querySelector(
      '.ag-cell-wrapper .ag-cell-value > portfolio-symbol-renderer > div.d-flex.flex-column'
    );

    if (!targetDiv) {
      return;
    }

    const idElement = cell.querySelector(
      'div[data-cy^="symbol-name-renderer-"]'
    );

    if (!idElement) {
      return;
    }

    const dataCyValue = idElement.getAttribute('data-cy');
    const uniqueId = dataCyValue.split('-').pop();

    // Get the symbol name
    const symbolNameElement = cell.querySelector(
      'div[data-cy="renderer-symbol-name"]'
    );
    const symbolName = symbolNameElement
      ? symbolNameElement.textContent.trim()
      : '';

    console.log('Symbol Name:', symbolName);

    // Double-check to avoid injecting multiple times
    if (cell.querySelector('.my-extension-container')) {
      processedCells.add(cell);
      return;
    }

    const appContainer = document.createElement('div');
    appContainer.className = 'my-extension-container';

    // Apply styles to place the button nicely
    cell.style.setProperty('display', 'flex', 'important');
    cell.style.setProperty('flex-direction', 'row', 'important');
    cell.style.setProperty('align-items', 'center', 'important');
    cell.style.setProperty('justify-content', 'space-between', 'important');

    cell.appendChild(appContainer);

    const root = ReactDOM.createRoot(appContainer);

    root.render(
      <React.StrictMode>
        <InjectedButton symbolId={uniqueId} symbolName={symbolName} />
      </React.StrictMode>
    );

    // Mark this cell as processed
    processedCells.add(cell);
  });
}

// Run initial injection
injectButtons();

// Debounce timer outside the callback
let debounceTimer;

const observer = new MutationObserver((mutations) => {
  // Clear previous timer
  clearTimeout(debounceTimer);

  // Set new timer
  debounceTimer = setTimeout(() => {
    const hasGrid = document.querySelector('div.ag-root-wrapper');
    if (hasGrid) {
      injectButtons();
    }
  }, 500);
});

// Observe with more specific configuration to reduce unnecessary triggers
observer.observe(document.body, {
  childList: true,
  subtree: true,
  // Don't observe attributes or characterData to reduce noise
  attributes: false,
  characterData: false,
});
