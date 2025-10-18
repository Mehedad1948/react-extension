import React from "react";
import ReactDOM from "react-dom/client";
import InjectedButton from "../components/InjectedButton";

export const AmazonInjector = {
  match: () => window.location.hostname.includes("amazon."),

  inject: () => {
    // Find Amazon Book cards (Books Design System)
    const cards = document.querySelectorAll<HTMLDivElement>('div[data-testid^="book"]');

    cards.forEach((card) => {
      // Skip if already injected
      if (card.querySelector(".my-ext-btn-container")) return;

      console.log('✅✅', card);

      const shadow = (card as HTMLElement & { shadowRoot?: ShadowRoot }).shadowRoot;
      if (!shadow) return;

      console.log('✨✨', shadow);

      const linkEl = shadow.querySelector("a[aria-label]");
      console.log('➡️➡️', linkEl);
      if (!linkEl) return;

      const bookTitle = linkEl.getAttribute("aria-label")?.trim() || "";
      if (!bookTitle) return;

      // Prepare mount point for button
      const mount = document.createElement("div");
      mount.className =
        "my-ext-btn-container absolute top-1 left-1 z-[99999]";

      // Style parent card to ensure relative positioning
      const style = window.getComputedStyle(card);
      if (style.position === "static") {
        (card as HTMLElement).style.position = "relative";
      }

      // Mount React component
      (card as HTMLElement).appendChild(mount);

      const root = ReactDOM.createRoot(mount);
      root.render(<InjectedButton title={bookTitle} />);
    });
  },
};
