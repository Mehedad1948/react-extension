chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "openPopup" && request.pageTitle) {
    
    chrome.storage.local.set({ currentPageTitle: request.pageTitle }, () => {
      
      if (chrome.action.openPopup) {
        chrome.action.openPopup();
        sendResponse({ status: "Popup opened" });
      } else {
        sendResponse({ status: "Popup could not be opened" });
      }
    });
    return true; 
  }
});
