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
    const GITHUB_API_LATEST_COMMIT = `https://api.github.com/repos/${GITHUB_REPO}/commits`;

    try {
      const response = await fetch(GITHUB_API_LATEST_COMMIT);
      if (!response.ok) {
        console.error("Failed to fetch latest commit:", response.status);
        return;
      }
      const commits = await response.json();
      if (!commits || commits.length === 0) {
        console.warn("No commits found in the repository.");
        return;
      }
      const latestCommitSHA = commits[0].sha;

      // Get the last known commit SHA from storage
      chrome.storage.sync.get("lastKnownCommitSHA", (data) => {
        const lastKnownCommitSHA = data.lastKnownCommitSHA;

        if (lastKnownCommitSHA && lastKnownCommitSHA !== latestCommitSHA) {
          // Show update notification with manual update instructions
          const container = document.querySelector(".container");
          const updateNotice = document.createElement("div");
          updateNotice.style.backgroundColor = "#FFA000"; // A distinct color for manual update
          updateNotice.style.color = "white";
          updateNotice.style.padding = "10px";
          updateNotice.style.borderRadius = "8px";
          updateNotice.style.marginBottom = "10px";
          updateNotice.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span>Update Available!</span>
              <a href="https://github.com/${GITHUB_REPO}/archive/refs/heads/main.zip" target="_blank"
                 style="color: white; text-decoration: underline;">Download</a>
            </div>
            <small>Manually download and install the new version.</small>`;
          container.insertBefore(updateNotice, container.firstChild);

          // Update the last known commit SHA in storage
          chrome.storage.sync.set({ lastKnownCommitSHA: latestCommitSHA });
        } else if (!lastKnownCommitSHA) {
          // On first run or after clearing storage, store the initial SHA
          chrome.storage.sync.set({ lastKnownCommitSHA: latestCommitSHA });
        }
      });
    } catch (error) {
      console.error("Failed to check for updates:", error);
    }
  }

  // Check for updates when popup opens
  checkForUpdates();
});
