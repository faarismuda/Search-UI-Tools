document.getElementById("sort-price-asc").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "sort", order: "asc" });
  });
});

document.getElementById("sort-price-desc").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "sort", order: "desc" });
  });
});

document.getElementById("inject-reason").addEventListener("click", () => {
  const selectedReason = document.getElementById("reason-select").value;
  if (selectedReason) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "inject",
        reason: selectedReason,
      });
    });
  }
});

document.getElementById("toggle-highlight-ads").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "toggleHighlightAds" });
  });
});
