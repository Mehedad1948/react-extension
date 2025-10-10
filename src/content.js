import React from 'react';
import ReactDOM from 'react-dom/client';
import InjectedButton from './InjectedButton';


function injectButtons() {

    const targetCells = document.querySelectorAll('div[role="gridcell"][col-id="symbolName"]');

    targetCells.forEach((cell) => {

        const targetDiv = cell.querySelector('.ag-cell-wrapper .ag-cell-value > portfolio-symbol-renderer > div.d-flex.flex-column');

        if (!targetDiv) {
            return;
        }


        const idElement = cell.querySelector('div[data-cy^="symbol-name-renderer-"]');


        if (!idElement) {
            return;
        }
        // Get the full attribute value (e.g., "symbol-name-renderer-IRTKROBA0001")
        const dataCyValue = idElement.getAttribute('data-cy');
        // Split it by the hyphen and get the last part
        const uniqueId = dataCyValue.split('-').pop();

        // Avoid injecting multiple times
        if (targetDiv.querySelector('.my-extension-container')) {
            // Optional: You could check if the ID has changed and update, but for now we'll just skip.
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
                <InjectedButton symbolId={uniqueId} />
            </React.StrictMode>
        );
    });
}


injectButtons();


const observer = new MutationObserver((mutations) => {
    let debounceTimer;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        const hasGrid = document.querySelector('div.ag-root-wrapper');
        if (hasGrid) {
            injectButtons();
        }
    }, 500);
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});
