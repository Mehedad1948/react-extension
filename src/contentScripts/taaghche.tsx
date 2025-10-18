import React from "react";
import ReactDOM from "react-dom/client";
import InjectedButton from '../components/InjectedButton';

export const TaaghcheInjector = {
  match: () => window.location.hostname.includes("taaghche.com"),

  inject: () => {
    const cards = document.querySelectorAll<HTMLDivElement>(".bookCard_book__6dU_a");

    cards.forEach((card) => {
      if (card.querySelector(".my-ext-btn-container")) return;

      const titleEl = card.querySelector<HTMLDivElement>(".bookCard_bookTitle__ELp4O");
      if (!titleEl) return;

      const bookTitle = titleEl.textContent?.trim() || "";

      const mount = document.createElement("div");
      mount.className = "my-ext-btn-container w-full mt-2 px-2 z-[99999]";
      titleEl.insertAdjacentElement("afterend", mount);

      const root = ReactDOM.createRoot(mount);
      root.render(<InjectedButton title={bookTitle} />);
    });
  },
};
