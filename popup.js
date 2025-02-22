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

document.getElementById("inspect").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "inspectProducts" });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const toggleSwitch = document.getElementById("toggle-highlight-ads");

  // Ambil state terakhir dari storage
  chrome.storage.sync.get("highlightAdsEnabled", (data) => {
    if (data.highlightAdsEnabled === undefined) {
      chrome.storage.sync.set({ highlightAdsEnabled: true }, () => {
        toggleSwitch.checked = true;
      });
    } else {
      toggleSwitch.checked = data.highlightAdsEnabled;
    }
  });

  // Toggle perubahan
  toggleSwitch.addEventListener("change", () => {
    const isEnabled = toggleSwitch.checked;

    // Simpan state ke storage
    chrome.storage.sync.set({ highlightAdsEnabled: isEnabled });

    // Kirim pesan ke content.js untuk update tampilan
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        chrome.tabs.sendMessage(tab.id, {
          action: "toggleHighlightAds",
          enabled: isEnabled,
        });
      });
    });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const toggleSwitch = document.getElementById("toggle-back-to-top");

  // Ambil state terakhir dari storage
  chrome.storage.sync.get("backToTopEnabled", (data) => {
    if (data.backToTopEnabled === undefined) {
      chrome.storage.sync.set({ backToTopEnabled: true }, () => {
        toggleSwitch.checked = true;
      });
    } else {
      toggleSwitch.checked = data.backToTopEnabled;
    }
  });

  // Toggle perubahan
  toggleSwitch.addEventListener("change", () => {
    const isEnabled = toggleSwitch.checked;

    // Simpan state ke storage
    chrome.storage.sync.set({ backToTopEnabled: isEnabled });

    // Kirim pesan ke semua tab untuk update tampilan
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        chrome.tabs.sendMessage(tab.id, {
          action: "toggleBackToTop",
          enabled: isEnabled,
        });
      });
    });
  });
});