import React from "react";
import ReactDOM from "react-dom/client";

const AppButton: React.FC = () => {
  const handleClick = () => {
    chrome.runtime.sendMessage({
      action: "openPopup",
      pageTitle: document.title,
    });
  };

  const logoUrl = chrome.runtime.getURL("logo192.png");

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-5 right-5 w-[60px] h-[60px] rounded-full
                 bg-black z-[999999] flex items-center justify-center
                 border-2 border-orange-500"
    >
      <img
        src={logoUrl}
        alt="logo"
        className="w-3/4 animate-[spin_10s_linear_infinite]"
      />
    </button>
  );
};

// Inject button into page
const container = document.createElement("div");
container.id = "my-extension-button-root";
document.body.appendChild(container);

const root = ReactDOM.createRoot(container);
root.render(<AppButton />);
