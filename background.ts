/// <reference types="chrome"/>

/**
 * WikiReader Background Service Worker
 * 
 * This service worker handles:
 * - Automatic redirection of Wikipedia pages to the reader view
 * - User preference management (blacklist)
 * - Communication with content scripts
 * 
 * The worker excludes localhost URLs from redirection to allow local development.
 */

interface SyncPrefs {
  blacklist?: string[];
}

chrome.webNavigation.onCommitted.addListener((details) => {
  // Only handle main frame navigations (not iframes or sub-resources)
  if (details.frameId !== 0) return;

  const url = details.url;
  
  // Don't redirect if already in the reader view (prevents infinite loop)
  if (url.startsWith(chrome.runtime.getURL(''))) return;
  
  // Don't redirect localhost URLs (for development/testing)
  if (url.includes('localhost') || url.includes('127.0.0.1')) return;
  
  // Only redirect Wikipedia pages
  if (!url.includes("wikipedia.org")) return;

  // TODO: check user preferences / blacklist here
  const readerUrl = chrome.runtime.getURL(`reader.html?src=${encodeURIComponent(url)}`);

  chrome.tabs.update(details.tabId, { url: readerUrl });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case "BLACKLIST_HOST":
      chrome.storage.sync.get("sync_prefs", (data) => {
        const prefs: SyncPrefs = data.sync_prefs || {};
        prefs.blacklist = prefs.blacklist || [];
        prefs.blacklist.push(message.payload.host);
        chrome.storage.sync.set({ sync_prefs: prefs }, () => sendResponse({ ok: true }));
      });
      return true; // async
    default:
      sendResponse({ ok: false });
  }
});
