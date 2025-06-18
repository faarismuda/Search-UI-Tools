document.addEventListener("DOMContentLoaded", () => {
  const allowedDomain = "searchcenter.gdn-app.com";

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentTab = tabs[0];
    const url = new URL(currentTab.url);
    const domain = url.hostname;

    // For buttons
    const buttonsToDisable = [
      "sort-price-asc",
      "sort-price-desc",
      "inject-reason",
      "inject-relevancy",
      "inspect",
    ];

    // For toggle switches
    const togglesToDisable = ["toggle-auto-apply"];

    if (!domain.includes(allowedDomain)) {
      // Disable buttons
      buttonsToDisable.forEach((buttonId) => {
        const button = document.getElementById(buttonId);
        if (button) {
          button.disabled = true;
          button.style.backgroundColor = "#ccc";
          button.style.cursor = "not-allowed";
        }
      });

      // Disable toggles
      togglesToDisable.forEach((toggleId) => {
        const toggle = document.getElementById(toggleId);
        if (toggle) {
          toggle.disabled = true;
          // Style the toggle switch container to look disabled
          const toggleContainer = toggle.closest(".toggle-container");
          if (toggleContainer) {
            toggleContainer.style.opacity = "0.5";
            toggleContainer.style.pointerEvents = "none"; // Prevent interaction
          }
        }
      });
    }
  });

  document.getElementById("sort-price-asc").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "sort", order: "asc" },
        (response) => {
          if (response && response.status === "sorted") {
            chrome.tabs.sendMessage(tabs[0].id, {
              action: "showToast",
              message: "Products sorted by price: Low to High",
            });
          }
        }
      );
    });
  });

  document.getElementById("sort-price-desc").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "sort", order: "desc" },
        (response) => {
          if (response && response.status === "sorted") {
            chrome.tabs.sendMessage(tabs[0].id, {
              action: "showToast",
              message: "Products sorted by price: High to Low",
            });
          }
        }
      );
    });
  });

  document.getElementById("inject-reason").addEventListener("click", () => {
    const selectedReason = document.getElementById("reason-select").value;
    if (selectedReason) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(
          tabs[0].id,
          {
            action: "injectReason",
            reason: selectedReason,
          },
          (response) => {
            if (response && response.status === "injected") {
              chrome.tabs.sendMessage(tabs[0].id, {
                action: "showToast",
                message: `Reason "${selectedReason}" injected`,
              });
            }
          }
        );
      });
    }
  });

  document.getElementById("inject-relevancy").addEventListener("click", () => {
    const selectedRelevancy = document.getElementById("relevancy-select").value;
    if (selectedRelevancy !== "") {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(
          tabs[0].id,
          {
            action: "injectRelevancy",
            relevancy: selectedRelevancy,
          },
          (response) => {
            if (response && response.status === "injected") {
              const relevancyText =
                selectedRelevancy === "2"
                  ? "Relevant"
                  : selectedRelevancy === "1"
                  ? "Less Relevant"
                  : "Irrelevant";
              chrome.tabs.sendMessage(tabs[0].id, {
                action: "showToast",
                message: `Relevancy "${relevancyText}" injected`,
              });
            }
          }
        );
      });
    }
  });

  document
    .getElementById("inject-ads-relevancy")
    .addEventListener("click", () => {
      const selectedRelevancy = document.getElementById(
        "ads-relevancy-select"
      ).value;
      if (selectedRelevancy !== "") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          chrome.tabs.sendMessage(
            tabs[0].id,
            {
              action: "injectAdsRelevancy",
              relevancy: selectedRelevancy,
            },
            (response) => {
              if (response && response.status === "injected") {
                const relevancyText =
                  selectedRelevancy === "2"
                    ? "Relevant"
                    : selectedRelevancy === "1"
                    ? "Less Relevant"
                    : "Irrelevant";
                chrome.tabs.sendMessage(tabs[0].id, {
                  action: "showToast",
                  message: `Ads Relevancy "${relevancyText}" injected`,
                });
              }
            }
          );
        });
      }
    });

  document.getElementById("inject-ads-reason").addEventListener("click", () => {
    const selectedReason = document.getElementById("ads-reason-select").value;
    if (selectedReason) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(
          tabs[0].id,
          {
            action: "injectAdsReason",
            reason: selectedReason,
          },
          (response) => {
            if (response && response.status === "injected") {
              chrome.tabs.sendMessage(tabs[0].id, {
                action: "showToast",
                message: `Ads Reason "${selectedReason}" injected`,
              });
            }
          }
        );
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

  const toggleAutoApplySwitch = document.getElementById("toggle-auto-apply");

  // Get last state from storage
  chrome.storage.sync.get("autoApplyEnabled", (data) => {
    if (data.autoApplyEnabled === undefined) {
      chrome.storage.sync.set({ autoApplyEnabled: false }, () => {
        toggleAutoApplySwitch.checked = false;
      });
    } else {
      toggleAutoApplySwitch.checked = data.autoApplyEnabled;
    }
  });

  // Toggle changes
  toggleAutoApplySwitch.addEventListener("change", () => {
    const isEnabled = toggleAutoApplySwitch.checked;
    chrome.storage.sync.set({ autoApplyEnabled: isEnabled });

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "toggleAutoApply",
        enabled: isEnabled,
      });
    });
  });

  // Add update checker function
  async function checkForUpdates() {
    const GITHUB_REPO = "faarismuda/Search-UI-Tools";
    const MANIFEST_FILE_PATH = "manifest.json"; // Path to your manifest file in the repo
    const GITHUB_RAW_MANIFEST_URL = `https://raw.githubusercontent.com/${GITHUB_REPO}/main/${MANIFEST_FILE_PATH}`; // Assuming 'main' branch

    try {
      // 1. Get local extension version from its manifest
      const localManifest = chrome.runtime.getManifest();
      const localVersion = localManifest.version;
      console.log("Local Version:", localVersion);

      // 2. Fetch remote manifest.json from GitHub
      const response = await fetch(GITHUB_RAW_MANIFEST_URL);
      if (!response.ok) {
        console.error(
          "Failed to fetch remote manifest:",
          response.status,
          response.statusText
        );
        return;
      }
      const remoteManifest = await response.json();
      const remoteVersion = remoteManifest.version;
      console.log("Remote Version:", remoteVersion);

      // 3. Compare versions
      // This simple comparison works for semantic versioning (e.g., 1.0.0, 1.0.1, 2.0.0)
      if (compareVersions(remoteVersion, localVersion) > 0) {
        // Show update notification with manual update instructions
        const container = document.querySelector(".container");
        if (container) {
          // Ensure container exists before inserting
          const updateNotice = document.createElement("div");
          updateNotice.className = "update-notice";
          updateNotice.innerHTML = `
              <div class="update-notice-header">
                  <span class="update-notice-title">Update available!</span>
                  <a href="https://github.com/${GITHUB_REPO}/archive/refs/heads/main.zip" 
                    target="_blank" 
                    class="update-notice-download">Download v${remoteVersion}</a>
              </div>
              <small class="update-notice-info">You're using v${localVersion}. Please 
                  <a href="https://github.com/faarismuda/Search-UI-Tools/blob/main/README.md#updating-extension" 
                    target="_blank">manually update</a> your extension.
              </small>`;
          container.insertBefore(updateNotice, container.firstChild);
        } else {
          console.warn("Container element not found for update notification.");
        }
      } else {
        console.log("Your extension is up to date or no newer version found.");
      }
    } catch (error) {
      console.error("Failed to check for updates:", error);
    }
  }

  // Helper function to compare semantic versions (e.g., "1.0.0" vs "1.0.1")
  function compareVersions(v1, v2) {
    const parts1 = v1.split(".").map(Number);
    const parts2 = v2.split(".").map(Number);

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const p1 = parts1[i] || 0; // Use 0 for missing parts (e.g., 1.0 vs 1.0.0)
      const p2 = parts2[i] || 0;

      if (p1 > p2) return 1;
      if (p2 > p1) return -1;
    }
    return 0; // Versions are equal
  }

  // Check for updates when popup opens
  checkForUpdates();
});