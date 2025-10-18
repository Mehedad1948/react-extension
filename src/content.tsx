import { TaaghcheInjector } from "./contentScripts/taaghche";
import { AmazonInjector } from "./contentScripts/amazon";

const injectors = [TaaghcheInjector, AmazonInjector];

for (const injector of injectors) {
  if (injector.match()) {
    // Run once immediately
    injector.inject();

    // Watch for dynamic DOM changes
    const observer = new MutationObserver(() => injector.inject());
    observer.observe(document.body, { childList: true, subtree: true });
    break;
  }
}
