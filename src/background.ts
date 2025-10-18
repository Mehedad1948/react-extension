chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'OPEN_BOOK_POPUP' && msg.bookTitle) {
    const bookTitle = msg.bookTitle.trim();
    chrome.storage.local.set({ lastSelectedBook: bookTitle });

    console.log('[EXT] open custom popup window for:', bookTitle);

    chrome.windows.create({
      url: chrome.runtime.getURL('popup.html'),
      type: 'popup',
      width: 640,
      height: 560,
      focused: true,
    });

    sendResponse({ ok: true });
  }

  return true;
});
