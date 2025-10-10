/* global chrome */

console.log("Background service worker started. Attaching listener now.");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Background received a message:", request);
  console.log("Message was sent from:", sender.tab ? "a content script: " + sender.tab.url : "the extension itself");

  if (request.action === "openPopupWithSymbol") {
    console.log(`Action "openPopupWithSymbol" received. Symbol: ${request.symbol}`);

    // This is an asynchronous operation.
    chrome.storage.local.set({ currentSymbol: request.symbol }, () => {
      if (chrome.runtime.lastError) {
        console.error("Error setting storage:", chrome.runtime.lastError);
        sendResponse({ status: "Error: Failed to save symbol" });
        return;
      }
      
      console.log('Symbol saved. Now attempting to open popup.');

      if (chrome.action.openPopup) {
        chrome.action.openPopup();
        console.log("chrome.action.openPopup() was called.");
        // This is the response that will be sent back to the content script.
        sendResponse({ status: "Popup opened" }); 
      } else {
        console.error("chrome.action.openPopup is not available.");
        sendResponse({ status: "Error: API not available" });
      }
    });

    // THIS IS THE FIX.
    // Return true to indicate that we will be sending a response asynchronously.
    // This keeps the message channel open until sendResponse() is called.
    return true; 
  } else {
    console.warn("Received a message with an unknown action:", request.action);
    // If you don't handle this action, you don't need to return true.
    // The port can close immediately.
  }
});

console.log("Message listener attached successfully.");
