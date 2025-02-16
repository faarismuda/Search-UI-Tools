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
        action: "injectReason",
        reason: selectedReason,
      });
    });
  }
});

document.getElementById("inject-relevancy").addEventListener("click", () => {
  const selectedRelevancy = document.getElementById("relevancy-select").value;
  if (selectedRelevancy !== "") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "injectRelevancy",
        relevancy: selectedRelevancy,
      });
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const toggleSwitch = document.getElementById("toggle-highlight-ads");

  // Ambil state terakhir dari storage
  chrome.storage.sync.get("highlightAdsEnabled", (data) => {
    toggleSwitch.checked = data.highlightAdsEnabled ?? true; // Default nyala
  });

  // Toggle perubahan
  toggleSwitch.addEventListener("change", () => {
    const isEnabled = toggleSwitch.checked;

    // Simpan state ke storage
    chrome.storage.sync.set({ highlightAdsEnabled: isEnabled });

    // Kirim pesan ke content.js untuk update tampilan
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "toggleHighlightAds",
        enabled: isEnabled,
      });
    });
  });
});
