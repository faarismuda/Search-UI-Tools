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

function calculateAveragePricePerSwimlane() {
  const swimlanes = document.querySelectorAll('.swimlane__heading');
  const results = [];

  swimlanes.forEach(swimlane => {
    const swimlaneName = swimlane.textContent.trim();
    const productCards = swimlane.parentElement.querySelectorAll('.product__card__link');
    let totalPrice = 0;
    let productCount = 0;

    productCards.forEach(card => {
      const priceElement = card.querySelector('.product__body__price-final');
      if (priceElement) {
        const priceText = priceElement.textContent.trim();
        const priceNumber = parseFloat(priceText.replace(/[^\d,]/g, '').replace(',', '.'));
        if (!isNaN(priceNumber)) {
          totalPrice += priceNumber;
          productCount++;
        }
      }
    });

    const averagePrice = productCount > 0 ? (totalPrice / productCount) : 0;
    results.push({ swimlaneName, averagePrice });
  });

  return results;
}

function countPromoProductsPerSwimlane() {
  const swimlanes = document.querySelectorAll('.swimlane__heading');
  const results = [];

  swimlanes.forEach(swimlane => {
    const swimlaneName = swimlane.textContent.trim();
    const productCards = swimlane.parentElement.querySelectorAll('.product__card__link');
    let promoCount = 0;

    productCards.forEach(card => {
      const promoElement = card.querySelector('.promo-label__text');
      if (promoElement) {
        promoCount++;
      }
    });

    results.push({ swimlaneName, promoCount });
  });

  return results;
}

function countSoldProductsPerSwimlane() {
  const swimlanes = document.querySelectorAll('.swimlane__heading');
  const results = [];

  swimlanes.forEach(swimlane => {
    const swimlaneName = swimlane.textContent.trim();
    const productCards = swimlane.parentElement.querySelectorAll('.product__card__link');
    let soldCount = 0;

    productCards.forEach(card => {
      const soldElement = card.querySelector('.product__body__usp__container__sold__count');
      if (soldElement) {
        soldCount++;
      }
    });

    results.push({ swimlaneName, soldCount });
  });

  return results;
}

function countRatedProductsPerSwimlane() {
  const swimlanes = document.querySelectorAll('.swimlane__heading');
  const results = [];

  swimlanes.forEach(swimlane => {
    const swimlaneName = swimlane.textContent.trim();
    const productCards = swimlane.parentElement.querySelectorAll('.product__card__link');
    let ratingCount = 0;

    productCards.forEach(card => {
      const ratingElement = card.querySelector('.product__body__usp__container__rating__count');
      if (ratingElement) {
        ratingCount++;
      }
    });

    results.push({ swimlaneName, ratingCount });
  });

  return results;
}

function calculateAverageRatingPerSwimlane() {
  const swimlanes = document.querySelectorAll('.swimlane__heading');
  const results = [];

  swimlanes.forEach(swimlane => {
    const swimlaneName = swimlane.textContent.trim();
    const productCards = swimlane.parentElement.querySelectorAll('.product__card__link');
    let totalRating = 0;
    let ratingCount = 0;

    productCards.forEach(card => {
      const ratingElement = card.querySelector('.product__body__usp__container__rating__count');
      if (ratingElement) {
        const ratingText = ratingElement.textContent.trim().replace(',', '.');
        const ratingNumber = parseFloat(ratingText.replace(/[^\d.]/g, ''));
        if (!isNaN(ratingNumber)) {
          totalRating += ratingNumber;
          ratingCount++;
        }
      }
    });

    const averageRating = ratingCount > 0 ? (totalRating / ratingCount) : 0;
    results.push({ swimlaneName, averageRating });
  });

  return results;
}

function countBlibliProvidedProductsPerSwimlane() {
  const swimlanes = document.querySelectorAll('.swimlane__heading');
  const results = [];

  swimlanes.forEach(swimlane => {
    const swimlaneName = swimlane.textContent.trim();
    const productCards = swimlane.parentElement.querySelectorAll('.product__card__link');
    let blibliProvidedCount = 0;

    productCards.forEach(card => {
      const blibliProvidedElement = card.querySelector('.product__body__seller-location-name');
      if (blibliProvidedElement && blibliProvidedElement.textContent.trim() === "Disediakan Blibli") {
        blibliProvidedCount++;
      }
    });

    results.push({ swimlaneName, blibliProvidedCount });
  });

  return results;
}

function countOfficialStoreProductsPerSwimlane() {
  const swimlanes = document.querySelectorAll('.swimlane__heading');
  const results = [];

  swimlanes.forEach(swimlane => {
    const swimlaneName = swimlane.textContent.trim();
    const productCards = swimlane.parentElement.querySelectorAll('.product__card__link');
    let officialStoreCount = 0;

    productCards.forEach(card => {
      const officialStoreElement = card.querySelector('.dev-product-card__icon-usp[src="/static/img/officialStore.2a59b8ca.svg"]');
      if (officialStoreElement) {
        officialStoreCount++;
      }
    });

    results.push({ swimlaneName, officialStoreCount });
  });

  return results;
}

function showInspectPopup() {
  // Check if the modal already exists
  if (document.querySelector(".blu-modal")) {
    return;
  }

  // Calculate average price per swimlane
  const averagePrices = calculateAveragePricePerSwimlane();

  // Count promo products per swimlane
  const promoCounts = countPromoProductsPerSwimlane();

  // Count sold products per swimlane
  const soldCounts = countSoldProductsPerSwimlane();

  // Count rated products per swimlane
  const ratedCounts = countRatedProductsPerSwimlane();

  // Calculate average rating per swimlane
  const averageRatings = calculateAverageRatingPerSwimlane();

  // Count Blibli provided products per swimlane
  const blibliProvidedCounts = countBlibliProvidedProductsPerSwimlane();

  // Count Official Store products per swimlane
  const officialStoreCounts = countOfficialStoreProductsPerSwimlane();

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
    height: auto;
    line-height: 33.6px;
    max-height: 80vh;
    max-width: 90vw;
    opacity: 1;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    transition: all 0.3s ease;
    width: 80vw;
    z-index: 101;
    overflow: hidden; /* Prevent scroll bar on modal */
  `;

  // Create the modal header
  const header = document.createElement("div");
  header.className = "blu-modal__header";
  header.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
  `;
  header.innerHTML = `
    <section class="blu-modal__header-main">
      <section class="blu-modal__header-main--title">
        <h3>PLP Inspector</h3>
      </section>
    </section>
    <button type="button" class="blu-modal__close-button" id="close-inspect-popup" style="
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
    ">&times;</button>
  `;

  // Create the modal body
  const body = document.createElement("div");
  body.className = "blu-modal__body b-overflow-y dev-body b-stop";
  body.style.cssText = `
    padding: 0 20px 20px 20px;
    overflow: hidden; /* Prevent scroll bar on body */
  `;

  // Create the grid table container
  const tableContainer = document.createElement("div");
  tableContainer.style.cssText = `
    overflow: auto; /* Allow scroll bar on table */
    max-height: 60vh; /* Adjust as needed */
  `;

  // Create the grid table
  const table = document.createElement("table");
  table.style.width = "100%";
  table.style.borderCollapse = "collapse";
  table.style.tableLayout = "fixed"; // Ensure equal column width

  // Create the header row
  const headerRow = document.createElement("tr");
  headerRow.innerHTML = `
    <th style="border: 1px solid #ddd; padding: 8px; width: 1%;">Metric</th>
    ${averagePrices.map(item => {
      const swimlaneName = item.swimlaneName.split('-').slice(1).join('-');
      return `<th style="border: 1px solid #ddd; padding: 8px; width: 1%;">${swimlaneName}</th>`;
    }).join('')}
  `;
  table.appendChild(headerRow);

  // Create the rows for each metric
  const metrics = [
    { name: "Average Price", values: averagePrices.map(item => `Rp${item.averagePrice.toLocaleString('id-ID')}`) },
    { name: "Promo Products", values: promoCounts.map(item => item.promoCount) },
    { name: "Products with Sold Badge", values: soldCounts.map(item => item.soldCount) },
    { name: "Rated Products", values: ratedCounts.map(item => item.ratingCount) },
    { name: "Average Rating", values: averageRatings.map(item => item.averageRating.toFixed(2)) },
    { name: "Blibli Provided Products", values: blibliProvidedCounts.map(item => item.blibliProvidedCount) },
    { name: "Official Store Products", values: officialStoreCounts.map(item => item.officialStoreCount) }
  ];

  metrics.forEach(metric => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td style="border: 1px solid #ddd; padding: 8px; text-align: left;">${metric.name}</td>
      ${metric.values.map(value => `<td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${value}</td>`).join('')}
    `;
    table.appendChild(row);
  });

  tableContainer.appendChild(table);
  body.appendChild(tableContainer);

  // Append header and body to the modal
  modal.appendChild(header);
  modal.appendChild(body);

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