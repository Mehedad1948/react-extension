/* global chrome */
import React from 'react';

const buttonStyle = {
  color: 'white',
  border: 'none',
  padding: '2px 2px',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '12px',
  fontWeight: 'bold',
  position: 'absolute',
  left: 0,
  top: 0,
};

const InjectedButton = ({ symbolId }) => {
  const handleOpenPopup = (e) => {
    e.stopPropagation();
    console.log(
      `[Extension] Button clicked for symbol: ${symbolId}. Sending 'openPopupWithSymbol' message.`
    );

    chrome.runtime.sendMessage(
      { action: 'openPopupWithSymbol', symbol: symbolId },
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
    <button className='border-8 bg-orange-500' style={buttonStyle} onClick={handleOpenPopup}>
      Open
    </button>
  );
};

export default InjectedButton;
