chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    backToTopEnabled: true,
    highlightAdsEnabled: true,
    autoApplyEnabled: false,
  });
});