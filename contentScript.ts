/// <reference types="chrome"/>

/**
 * WikiReader Content Script
 * 
 * Injects a banner on Wikipedia pages that allows users to manually
 * open the current page in WikiReader view. This provides an alternative
 * to automatic redirection.
 */

const bannerId = "wikireader-banner";

function injectBanner() {
  if (document.getElementById(bannerId)) return;

  const banner = document.createElement("div");
  banner.id = bannerId;
  banner.style.position = "fixed";
  banner.style.bottom = "10px";
  banner.style.right = "10px";
  banner.style.zIndex = "9999";
  banner.style.backgroundColor = "#0077cc";
  banner.style.color = "#fff";
  banner.style.padding = "8px 12px";
  banner.style.borderRadius = "6px";
  banner.style.cursor = "pointer";
  banner.innerText = "Open in WikiReader";

  banner.onclick = () => {
    chrome.runtime.sendMessage({ type: "OPEN_READER", payload: { src: window.location.href } });
  };

  document.body.appendChild(banner);
}

injectBanner();
