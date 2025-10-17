import React from "react";
import ReactDOM from "react-dom/client";
import PopupApp from "./App"; // your popup React component

const AppButton: React.FC = () => {
  const handleClick = () => {
    // check if popup is already open
    const existing = document.getElementById("my-extension-popup");
    if (existing) {
      existing.remove();
      return;
    }

    const popupContainer = document.createElement("div");
    popupContainer.id = "my-extension-popup";
    popupContainer.style.position = "fixed";
    popupContainer.style.top = "20px";
    popupContainer.style.right = "20px";
    popupContainer.style.width = "400px";
    popupContainer.style.height = "600px";
    popupContainer.style.zIndex = "999999";
    popupContainer.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
    popupContainer.style.borderRadius = "10px";
    popupContainer.style.background = "white";

    document.body.appendChild(popupContainer);

    const root = ReactDOM.createRoot(popupContainer);
    root.render(<PopupApp />);
  };

  const logoUrl = chrome.runtime.getURL("logo192.png");

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-5 right-5 w-[60px] h-[60px] rounded-full bg-black 
              z-[999999] flex items-center justify-center"
    >
      <img src={logoUrl} alt="logo" className="w-3/4 animate-[spin_10s_linear_infinite]" />
    </button>
  );
};

// inject button
const container = document.createElement("div");
container.id = "my-extension-button-root";
document.body.appendChild(container);

const root = ReactDOM.createRoot(container);
root.render(<AppButton />);
