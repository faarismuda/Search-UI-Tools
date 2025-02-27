// Daftar domain yang diizinkan
const allowedDomains = ["blibli.com", "searchcenter.gdn-app.com"];

function isDomainAllowed() {
  return allowedDomains.some(domain => window.location.hostname.includes(domain));
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "sort") {
    sortProducts(request.order);
  } else if (request.action === "injectReason") {
    injectReason(request.reason);
  } else if (request.action === "injectRelevancy") {
    injectRelevancy(request.relevancy);
  } else if (request.action === "toggleHighlightAds") {
    highlightAds(request.enabled);
    sendResponse({ status: "updated" });
  } else if (request.action === "toggleBackToTop") {
    if (isDomainAllowed()) {
      if (request.enabled) {
        addBackToTopButton();
      } else {
        removeBackToTopButton();
      }
    } else {
      removeBackToTopButton();
    }
    sendResponse({ status: "updated" });
  } else if (request.action === "inspectProducts") {
    inspectProducts();
  } else if (request.action === "showInspectPopup") {
    showInspectPopup();
  }
});

chrome.storage.sync.get("highlightAdsEnabled", (data) => {
  if (data.highlightAdsEnabled === undefined) {
    chrome.storage.sync.set({ highlightAdsEnabled: true }, () => {
      highlightAds(true);
    });
  } else if (data.highlightAdsEnabled) {
    highlightAds(true);
  }
});

chrome.storage.sync.get("backToTopEnabled", (data) => {
  if (data.backToTopEnabled === undefined) {
    // Jika tidak ada data, anggap default true
    chrome.storage.sync.set({ backToTopEnabled: true }, () => {
      if (isDomainAllowed()) {
        addBackToTopButton();
      }
    });
  } else if (data.backToTopEnabled) {
    if (isDomainAllowed()) {
      addBackToTopButton();
    }
  }
});

function sortProducts(order) {
  const productLists = document.querySelectorAll(".product-list"); // Select all product lists

  productLists.forEach((productList) => {
    const productGrids = productList.querySelectorAll(".product-grid");

    productGrids.forEach((grid) => {
      const productCards = Array.from(
        grid.querySelectorAll(".product__card__link")
      );

      productCards.sort((a, b) => {
        const priceA = getPrice(a);
        const priceB = getPrice(b);

        if (order === "asc") {
          return priceA - priceB;
        } else {
          return priceB - priceA;
        }
      });

      // Clear existing order
      while (grid.firstChild) {
        grid.removeChild(grid.firstChild);
      }

      // Append sorted order
      productCards.forEach((card) => {
        const parent = card.parentNode;
        if (parent) {
          grid.appendChild(parent);
        }
      });
    });
  });
}

function getPrice(productCard) {
  try {
    const priceElement = productCard.querySelector(
      ".product__body__price-final"
    );
    const priceText = priceElement.textContent.trim();
    const priceNumber = parseFloat(
      priceText
        .replace(/[^\d.,]/g, "")
        .replace(".", "")
        .replace(",", ".")
    );
    return priceNumber;
  } catch (error) {
    console.error("Error getting price:", error, productCard);
    return Infinity;
  }
}

function injectReason(reason) {
  const selectElements = document.querySelectorAll(
    ".single-select-reason:not(.single-select-reason__list)"
  );

  selectElements.forEach((select) => {
    if (
      select.value === "" ||
      select.options[select.selectedIndex].value === "Select a reason"
    ) {
      select.value = reason;
      const event = new Event("change", { bubbles: true });
      select.dispatchEvent(event);
    }
  });
}

function injectRelevancy(relevancy) {
  const relevancyGroups = document.querySelectorAll(
    ".product__body__relevancy"
  );

  relevancyGroups.forEach((group) => {
    const radioButtons = group.querySelectorAll('input[type="radio"]');

    // Cek apakah ada radio button yang sudah dipilih
    const isAlreadySelected = Array.from(radioButtons).some(
      (radio) => radio.checked
    );

    // Jika tidak ada yang terpilih, maka inject relevancy
    if (!isAlreadySelected) {
      radioButtons.forEach((radio) => {
        if (radio.value === relevancy) {
          radio.checked = true;
          const event = new Event("change", { bubbles: true });
          radio.dispatchEvent(event);
        }
      });
    }
  });
}

// Fungsi untuk menyalakan/mematikan highlight
function highlightAds(enabled) {
  const cards = document.querySelectorAll(".product__card, .blu-product-card");

  cards.forEach((card) => {
    const adTag = card.querySelector(
      ".product__card__tag__ad, .blu-product-card__label-right-top-image"
    );
    if (adTag) {
      card.style.backgroundColor = enabled ? "#d2e7ff" : ""; // Nyala jika true, mati jika false
    }
  });
}

// Auto-detect perubahan dalam daftar produk
const observer = new MutationObserver(() => {
  chrome.storage.sync.get("highlightAdsEnabled", (data) => {
    if (data.highlightAdsEnabled) {
      highlightAds(true);
    }
  });
});

// Mulai memantau perubahan pada daftar produk
const targetNode = document.body; // Bisa diganti dengan elemen spesifik yang menampung daftar produk
const config = { childList: true, subtree: true };

observer.observe(targetNode, config);

// Back to Top
let backToTopButton = null;

// Fungsi untuk menambahkan tombol Back to Top
function addBackToTopButton() {
  if (backToTopButton) return; // Hindari duplikasi

  backToTopButton = document.createElement("button");
  backToTopButton.id = "backToTopButton";
  backToTopButton.innerText = "▲ Top";
  backToTopButton.style.position = "fixed";
  backToTopButton.style.bottom = "20px";
  backToTopButton.style.right = "20px";
  backToTopButton.style.padding = "10px 15px";
  backToTopButton.style.fontSize = "14px";
  backToTopButton.style.backgroundColor = "#007bff";
  backToTopButton.style.color = "white";
  backToTopButton.style.border = "none";
  backToTopButton.style.borderRadius = "5px";
  backToTopButton.style.cursor = "pointer";
  backToTopButton.style.display = "none";
  backToTopButton.style.zIndex = "9999";
  backToTopButton.style.boxShadow = "2px 2px 10px rgba(0, 0, 0, 0.3)";

  document.body.appendChild(backToTopButton);

  backToTopButton.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
      backToTopButton.style.display = "block";
    } else {
      backToTopButton.style.display = "none";
    }
  });
}

// Fungsi untuk menghapus tombol Back to Top
function removeBackToTopButton() {
  if (backToTopButton) {
    backToTopButton.remove();
    backToTopButton = null;
  }
}

function showInspectPopup() {
  // Check if the modal already exists
  if (document.querySelector(".blu-modal")) {
    return;
  }

  // Create the modal container
  const modal = document.createElement("div");
  modal.className = "blu-modal b-success b-medium b-active";
  modal.style.cssText = `
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    background-color: rgb(255, 255, 255);
    border-bottom-color: rgb(34, 163, 52);
    border-bottom-left-radius: 16px;
    border-bottom-right-radius: 16px;
    border-bottom-style: solid;
    border-bottom-width: 4px;
    border-top-left-radius: 16px;
    border-top-right-radius: 16px;
    box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 6px 0px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    font-size: 16px;
    height: 261.781px;
    line-height: 33.6px;
    max-height: 576px;
    max-width: none;
    opacity: 1;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    transition: all 0.3s ease;
    width: 600px;
    z-index: 101;
  `;

  // Create the modal header
  const header = document.createElement("div");
  header.className = "blu-modal__header";
  header.style.cssText = `
    display: flex;
    align-items: center;
    padding: 20px;
  `;
  header.innerHTML = `
    <svg width="24" height="24" class="blu-icon blu-modal__header-status-icon" aria-hidden="true" type="image/svg+xml" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" tabindex="0" style="margin-right: 10px;">
      <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM17.05 9.11L12.06 16.12C11.88 16.37 11.6 16.52 11.29 16.54H11.24C10.95 16.54 10.67 16.42 10.48 16.19L6.99 12.13C6.82 11.93 6.73 11.67 6.75 11.41C6.77 11.14 6.89 10.9 7.09 10.73C7.51 10.37 8.14 10.42 8.5 10.84L11.16 13.93L15.41 7.96C15.73 7.51 16.35 7.41 16.8 7.73C17.02 7.88 17.16 8.11 17.21 8.38C17.25 8.64 17.19 8.91 17.04 9.12L17.05 9.11Z"></path>
    </svg>
    <section class="blu-modal__header-main">
      <section class="blu-modal__header-main--title">
        <h3>PLP Inspector</h3>
      </section>
    </section>
  `;

  // Create the modal body
  const body = document.createElement("div");
  body.className = "blu-modal__body b-overflow-y dev-body b-stop";
  body.style.cssText = `
    padding: 20px;
  `;
  body.innerHTML = `
    <div class="blu-modal__body-content">
      <div>Placeholder content for the inspect popup.</div>
    </div>
  `;

  // Create the modal footer with the close button
  const footer = document.createElement("div");
  footer.className = "blu-modal__footer";
  footer.style.cssText = `
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 10px;
    margin-top: auto;
  `;
  footer.innerHTML = `
    <button type="button" class="blu-button b-common b-primary" id="close-inspect-popup" style="
      background-color: rgb(0, 114, 255);
      border-radius: 64px;
      padding: 10px 20px;
      color: white;
      border: none;
      cursor: pointer;
    ">OK</button>
  `;

  // Append header, body, and footer to the modal
  modal.appendChild(header);
  modal.appendChild(body);
  modal.appendChild(footer);

  // Create the overlay
  const overlay = document.createElement("div");
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 100;
  `;

  // Append modal and overlay to the body
  document.body.appendChild(overlay);
  document.body.appendChild(modal);

  // Close modal on button click or outside click
  document.getElementById("close-inspect-popup").addEventListener("click", () => {
    document.body.removeChild(modal);
    document.body.removeChild(overlay);
  });

  overlay.addEventListener("click", () => {
    document.body.removeChild(modal);
    document.body.removeChild(overlay);
  });
}