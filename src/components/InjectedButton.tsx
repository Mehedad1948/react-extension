import React from "react";

interface InjectedButtonProps {
  title: string;
}

const InjectedButton: React.FC<InjectedButtonProps> = ({ title }) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // prevent book link from triggering
    e.preventDefault();
    e.stopPropagation();

    // send message to background to both store and open popup
    chrome.runtime.sendMessage({
      action: "OPEN_BOOK_POPUP",
      bookTitle: title,
    });
  };

  const logoUrl = chrome.runtime.getURL("logo192.png");

  return (
    <button
      onClick={handleClick}
      className="w-full bg-orange-50 hover:bg-orange-100 
                 text-sm font-medium py-1.5 rounded-md flex items-center gao-2
                 justify-center gap-2 border text-orange-700 border-orange-400 shadow-sm 
                 transition-all active:scale-[0.98] "
    >
      <img src={logoUrl} className='w-6' />
      <span>بررسی</span>
    </button>
  );
};

export default InjectedButton;
