import React from 'react';



const InjectedButton = ({ symbolId, symbolName }: { symbolId: string, symbolName: string }) => {
  const handleOpenPopup = (e) => {
    e.stopPropagation();
    console.log(
      `[Extension] Button clicked for symbol: ${symbolName} ${symbolId}. Sending 'openPopupWithSymbol' message.`
    );

    chrome.runtime.sendMessage(
      { action: 'openPopupWithSymbol', symbolId: symbolId, symbolName },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error(
            `[Extension] Error sending message: ${chrome.runtime.lastError.message}`
          );
        } else {
          console.log(
            `[Extension] Received response from background:`,
            response
          );
        }
      }
    );
  };

  return (
    <button className='border-8 bg-orange-500'  onClick={handleOpenPopup}>
      Open
    </button>
  );
};

export default InjectedButton;
