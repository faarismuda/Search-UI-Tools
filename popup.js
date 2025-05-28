document.addEventListener("DOMContentLoaded", () => {
  const allowedDomain = "searchcenter.gdn-app.com";

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentTab = tabs[0];
    const url = new URL(currentTab.url);
    const domain = url.hostname;

    const buttonsToDisable = [
      "sort-price-asc",
      "sort-price-desc",
      "inject-reason",
      "inject-relevancy",
      "inspect",
    ];

    if (!domain.includes(allowedDomain)) {
      buttonsToDisable.forEach((buttonId) => {
        const button = document.getElementById(buttonId);
        if (button) {
          button.disabled = true;
          button.style.backgroundColor = "#ccc";
          button.style.cursor = "not-allowed";
        }
      });
    }
  });

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
      chrome.tabs.sendMessage(tabs[0].id, { action: "showInspectPopup" });
    });
  });

  const toggleHighlightAdsSwitch = document.getElementById(
    "toggle-highlight-ads"
  );

  // Ambil state terakhir dari storage
  chrome.storage.sync.get("highlightAdsEnabled", (data) => {
    if (data.highlightAdsEnabled === undefined) {
      chrome.storage.sync.set({ highlightAdsEnabled: true }, () => {
        toggleHighlightAdsSwitch.checked = true;
      });
    } else {
      toggleHighlightAdsSwitch.checked = data.highlightAdsEnabled;
    }
  });

  // Toggle perubahan
  toggleHighlightAdsSwitch.addEventListener("change", () => {
    const isEnabled = toggleHighlightAdsSwitch.checked;

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

  const toggleBackToTopSwitch = document.getElementById("toggle-back-to-top");

  // Ambil state terakhir dari storage
  chrome.storage.sync.get("backToTopEnabled", (data) => {
    if (data.backToTopEnabled === undefined) {
      chrome.storage.sync.set({ backToTopEnabled: true }, () => {
        toggleBackToTopSwitch.checked = true;
      });
    } else {
      toggleBackToTopSwitch.checked = data.backToTopEnabled;
    }
  });

  // Toggle perubahan
  toggleBackToTopSwitch.addEventListener("change", () => {
    const isEnabled = toggleBackToTopSwitch.checked;

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

  // Add update checker function
  async function checkForUpdates() {
    const GITHUB_REPO = "faarismuda/Search-UI-Tools";
    const GITHUB_RAW_URL = `https://raw.githubusercontent.com/${GITHUB_REPO}/main/manifest.json`;

    try {
      // Get current version from local manifest
      const localManifest = chrome.runtime.getManifest();
      const currentVersion = localManifest.version;

      // Get latest version from GitHub
      const response = await fetch(GITHUB_RAW_URL);
      if (!response.ok) {
        console.error("Failed to fetch manifest:", response.status);
        return;
      }

      const remoteManifest = await response.json();
      const latestVersion = remoteManifest.version;

      // Compare versions
      if (currentVersion !== latestVersion) {
        // Show update notification
        const container = document.querySelector(".container");
        const updateNotice = document.createElement("div");
        updateNotice.style.backgroundColor = "#FFA000";
        updateNotice.style.color = "white";
        updateNotice.style.padding = "10px";
        updateNotice.style.borderRadius = "8px";
        updateNotice.style.marginBottom = "10px";
        updateNotice.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span>New version ${latestVersion} available!</span>
          <a href="https://github.com/${GITHUB_REPO}/archive/refs/heads/main.zip" target="_blank"
             style="color: white; text-decoration: underline;">Download</a>
        </div>
        <small>Current version: ${currentVersion}</small>`;
        container.insertBefore(updateNotice, container.firstChild);
      }
    } catch (error) {
      console.error("Failed to check for updates:", error);
    }
  }

  // Check for updates when popup opens
  checkForUpdates();
});
