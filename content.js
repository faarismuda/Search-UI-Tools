// Daftar domain yang diizinkan
const allowedDomains = ["blibli.com", "searchcenter.gdn-app.com"];

function isDomainAllowed() {
  return allowedDomains.some((domain) =>
    window.location.hostname.includes(domain)
  );
}

let autoApplyEnabled = false;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "sort") {
    const result = sortProducts(request.order);
    sendResponse(result);
  } else if (request.action === "showToast") {
    showToast(request.message);
  } else if (request.action === "injectReason") {
    const result = injectReason(request.reason);
    sendResponse(result);
  } else if (request.action === "injectRelevancy") {
    const result = injectRelevancy(request.relevancy);
    sendResponse(result);
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
  } else if (request.action === "toggleAutoApply") {
    autoApplyEnabled = request.enabled;
    if (autoApplyEnabled) {
      setupAutoApply();
    }
    sendResponse({ status: "updated" });
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

// Initialize state on page load
chrome.storage.sync.get("autoApplyEnabled", (data) => {
  autoApplyEnabled = !!data.autoApplyEnabled;
  if (autoApplyEnabled) {
    setupAutoApply();
  }
});

// Fungsi showToast()
function showToast(message, isError = false) {
  // Get existing toasts
  const existingToasts = document.querySelectorAll(".blibli-toast");
  const toastHeight = 50; // Perkiraan tinggi toast (termasuk margin)
  const marginBottom = 20;

  // Create new toast
  const toast = document.createElement("div");
  toast.className = `blibli-toast ${isError ? "blibli-toast-error" : ""}`;
  toast.textContent = message;

  // Calculate position for new toast
  let bottomPosition = marginBottom;
  existingToasts.forEach((existingToast) => {
    bottomPosition += existingToast.offsetHeight + 10; // 10px spacing between toasts
  });

  // Set initial position
  toast.style.bottom = `${bottomPosition}px`;
  document.body.appendChild(toast);

  // Show animation
  setTimeout(() => {
    toast.classList.add("show");
  }, 10);

  // Hide and remove after delay
  setTimeout(() => {
    toast.classList.remove("show");
    toast.classList.add("hiding");

    setTimeout(() => {
      if (toast && toast.parentNode) {
        document.body.removeChild(toast);

        // Reposition remaining toasts
        const remainingToasts = document.querySelectorAll(".blibli-toast");
        let newBottom = marginBottom;
        remainingToasts.forEach((t) => {
          if (t !== toast) {
            t.style.bottom = `${newBottom}px`;
            newBottom += t.offsetHeight + 10;
          }
        });
      }
    }, 300);
  }, 3000);
}

function setupAutoApply() {
  // Listen for relevancy changes
  document.addEventListener("change", function (e) {
    if (!autoApplyEnabled) return;

    // Handle relevancy selection
    if (e.target.matches('.product__body__relevancy input[type="radio"]')) {
      const selectedValue = e.target.value;
      const productCard = e.target.closest(".product__card__link");
      if (!productCard) return;

      // Get product title
      const productTitle = productCard
        .querySelector(".product__title")
        .textContent.trim();

      // Find identical products in other swimlanes
      const allProducts = document.querySelectorAll(".product__card__link");
      allProducts.forEach((product) => {
        if (product !== productCard) {
          const title = product
            .querySelector(".product__title")
            .textContent.trim();
          if (title === productTitle) {
            // Set same relevancy
            const radio = product.querySelector(
              `.product__body__relevancy input[value="${selectedValue}"]`
            );
            if (radio && !radio.checked) {
              radio.checked = true;
              radio.dispatchEvent(new Event("change", { bubbles: true }));
            }
          }
        }
      });
    }

    // Handle reason selection
    if (e.target.matches(".single-select-reason")) {
      const selectedReason = e.target.value;
      const productCard = e.target.closest(".product__card__link");
      if (!productCard) return;

      const productTitle = productCard
        .querySelector(".product__title")
        .textContent.trim();

      // Find identical products
      const allProducts = document.querySelectorAll(".product__card__link");
      allProducts.forEach((product) => {
        if (product !== productCard) {
          const title = product
            .querySelector(".product__title")
            .textContent.trim();
          if (title === productTitle) {
            // Set same reason
            const reasonSelect = product.querySelector(".single-select-reason");
            if (reasonSelect && reasonSelect.value !== selectedReason) {
              reasonSelect.value = selectedReason;
              reasonSelect.dispatchEvent(
                new Event("change", { bubbles: true })
              );
            }
          }
        }
      });
    }
  });
}

// Fungsi untuk menginisialisasi fitur Copy Categories
function initializeCopyCategories() {
  // Add button to page when loaded
  function init() {
    if (document.querySelector(".nested-category-filter")) {
      if (!document.getElementById("blibli-copy-categories")) {
        const copyButton = document.createElement("button");
        copyButton.id = "blibli-copy-categories";
        copyButton.className = "blibli-btn";
        copyButton.textContent = "Copy Categories";
        copyButton.addEventListener("click", copySelectedCategories);

        const categoryFilter = document.querySelector(
          ".nested-category-filter"
        );
        if (categoryFilter && categoryFilter.parentNode) {
          categoryFilter.parentNode.insertBefore(
            copyButton,
            categoryFilter.nextSibling
          );
        }
      }
    }
  }

  function copySelectedCategories() {
    const categoryPaths = [];
    const checkedBoxes = document.querySelectorAll(
      '.blu-checkbox input[type="checkbox"][value="true"]'
    );

    // Check if any categories are selected
    if (checkedBoxes.length === 0) {
      showToast("No categories selected", true);
      return;
    }

    checkedBoxes.forEach((checkbox) => {
      const path = getCategoryPath(checkbox);
      if (path) {
        categoryPaths.push(path);
      }
    });

    const result = categoryPaths.join(";\n");
    navigator.clipboard
      .writeText(result)
      .then(() => {
        showToast("Categories copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
        showToast("Failed to copy categories", true);
      });
  }

  function getCategoryPath(checkbox) {
    const categories = [];
    let currentLabel = checkbox
      .closest(".blu-checkbox")
      .querySelector(".blu-checkbox__content");
    if (!currentLabel) return null;
    categories.unshift(currentLabel.textContent.trim());
    let currentElement = checkbox.closest(".nested-category-filter__row");
    let parentFilter = currentElement.closest(".nested-category-filter");
    while (parentFilter) {
      const parentElement = parentFilter.parentElement;
      if (parentElement) {
        const parentRow = parentElement.querySelector(
          ":scope > .nested-category-filter__row"
        );
        if (parentRow) {
          const parentLabel = parentRow.querySelector(".blu-checkbox__content");
          if (parentLabel) {
            categories.unshift(parentLabel.textContent.trim());
          }
        }
        parentFilter = parentElement.closest(".nested-category-filter");
      } else {
        break;
      }
    }
    return categories.join(" > ");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  const observer = new MutationObserver(function (mutations) {
    if (
      document.querySelector(".filter-group__sections") &&
      !document.getElementById("blibli-copy-categories")
    ) {
      init();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

async function downloadProductsToExcel() {
  const productContentDiv = document.getElementById("productContentDiv");
  if (!productContentDiv) {
    showToast("Product content not found", true);
    return;
  }

  // Fungsi untuk scroll ke bawah
  async function scrollToBottom() {
    return new Promise((resolve) => {
      let lastHeight = document.documentElement.scrollHeight;
      let scrollAttempts = 0;
      const maxAttempts = 1; // Batasi jumlah scroll untuk mencegah infinite loop

      function scroll() {
        window.scrollTo(0, document.documentElement.scrollHeight);
        setTimeout(() => {
          const newHeight = document.documentElement.scrollHeight;
          if (newHeight === lastHeight || scrollAttempts >= maxAttempts) {
            window.scrollTo(0, 0); // Scroll kembali ke atas
            resolve();
          } else {
            lastHeight = newHeight;
            scrollAttempts++;
            scroll();
          }
        }, 500); // Tunggu 0.5 detik setiap scroll
      }

      scroll();
    });
  }

  // Tampilkan toast loading
  showToast("Loading all products...");

  // Scroll sampai semua produk terload
  await scrollToBottom();

  // Ambil semua container produk
  const productContainers = productContentDiv.querySelectorAll(
    ".elf-product-card__container"
  );
  const products = [];

  productContainers.forEach((container) => {
    const linkEl = container.querySelector(".elf-product-card");
    if (!linkEl) return;
    const href = linkEl.getAttribute("href");

    // Buat full URL dengan menambahkan base URL jika href adalah relative path
    const baseUrl = href.startsWith("http")
      ? href
      : `https://www.blibli.com${href}`;
    const productUrl = baseUrl.split("?")[0]; // Ambil URL hanya sampai tanda "?"

    // Ekstrak product id dari href
    let productId = "";
    if (href.includes("ps--")) {
      let start = href.indexOf("ps--") + 4;
      let end = href.indexOf("?", start);
      if (end === -1) {
        end = href.indexOf("&", start);
      }
      if (end === -1) {
        productId = href.substring(start);
      } else {
        productId = href.substring(start, end);
      }
    } else if (href.includes("is--")) {
      // Case 1: URL mengandung is--
      let start = href.indexOf("is--") + 4;
      let end = href.indexOf("?", start);
      if (end === -1) {
        end = href.indexOf("&", start);
      }
      if (end === -1) {
        productId = href.substring(start);
      } else {
        productId = href.substring(start, end);
      }

      // Remove -00001 if exists
      if (productId.endsWith("-00001")) {
        productId = productId.slice(0, -6); // Remove last 6 characters (-00001)
      }
    } else {
      // Case 2: Jika tidak ada ps-- atau is--, cari parameter pid
      const queryStr = href.split("?")[1];
      if (queryStr) {
        const urlParams = new URLSearchParams(queryStr);
        // Coba cari pid terlebih dahulu, jika tidak ada baru cari pid1
        productId = urlParams.get("pid") || urlParams.get("pid1") || "";
      }
    }

    // Ambil judul produk
    const titleEl = container.querySelector(".els-product__title");
    const title = titleEl ? titleEl.textContent.trim() : "";

    // Ambil harga produk
    const priceEl = container.querySelector(".els-product__fixed-price");
    let price = "";
    if (priceEl) {
      price =
        priceEl.getAttribute("title") ||
        priceEl.textContent.replace("Rp", "").trim();
    }

    // Ambil tipe seller
    let sellerType = "";
    const sellerEl = container.querySelector(".els-product__seller-left");
    if (sellerEl) {
      const imgs = sellerEl.querySelectorAll("img");
      imgs.forEach((img) => {
        const altText = img.getAttribute("alt");
        if (altText) {
          const altLower = altText.toLowerCase();
          if (altLower.includes("official store")) {
            sellerType = "Official Store";
          } else if (altLower.includes("fullfilled by blibli")) {
            sellerType = "Disediakan Blibli";
          }
        }
      });
    }

    // Tambahkan productUrl ke object products
    products.push({ productId, title, price, sellerType, productUrl });
  });

  // Menggunakan SheetJS untuk membuat worksheet dan workbook
  const worksheet = XLSX.utils.json_to_sheet(products);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Products");

  // Tulis workbook ke dalam array buffer untuk file XLSX
  const workbookBinary = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });
  const blob = new Blob([workbookBinary], { type: "application/octet-stream" });

  // Buat link download dan trigger download
  const downloadLink = document.createElement("a");
  downloadLink.href = URL.createObjectURL(blob);

  // Dapatkan nama file dari URL
  const currentUrl = window.location.href;
  let fileName = "products";

  // Cek jika URL mengandung '/cari/'
  if (currentUrl.includes("/cari/")) {
    // Ambil keyword pencarian dari URL
    const searchTerm = decodeURIComponent(
      currentUrl.split("/cari/")[1].split("?")[0]
    );
    // Bersihkan keyword dan ganti spasi dengan dash
    fileName = `products_${searchTerm.replace(/\s+/g, "-").toLowerCase()}`;
  }

  downloadLink.download = `${fileName}.xlsx`;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);

  showToast("Products downloaded to Excel");
}

function addDownloadExcelButton() {
  if (document.getElementById("downloadExcelButton")) return;

  // Cari container filter pertama
  const filterContainer = document.querySelector(
    ".filter-container.large-3__full-width"
  );
  if (filterContainer) {
    const btn = document.createElement("button");
    btn.id = "downloadExcelButton";
    btn.className = "blibli-btn";
    btn.style.marginTop = "0";
    btn.innerText = "Download Products";
    btn.addEventListener("click", downloadProductsToExcel);

    // Cari filter group pertama
    const firstFilterGroup = filterContainer.querySelector(
      ".filter-group.filter-container__groups"
    );
    if (firstFilterGroup) {
      // Sisipkan tombol sebelum filter group pertama
      filterContainer.insertBefore(btn, firstFilterGroup);
    }
  }
}

// Inisialisasi awal
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", addDownloadExcelButton);
} else {
  addDownloadExcelButton();
}

// Observer untuk memastikan tombol tetap ada setelah DOM berubah
const downloadButtonObserver = new MutationObserver(function (mutations) {
  const filterContainer = document.querySelector(
    ".filter-container.large-3__full-width"
  );
  if (filterContainer && !document.getElementById("downloadExcelButton")) {
    addDownloadExcelButton();
  }
});

downloadButtonObserver.observe(document.body, {
  childList: true,
  subtree: true,
});

function sortProducts(order) {
  const swimlanes = document.querySelectorAll(".swimlane__heading");

  swimlanes.forEach((swimlane) => {
    const productGrid = swimlane.parentElement.querySelector(".product-grid");

    if (productGrid) {
      const productCards = Array.from(
        productGrid.querySelectorAll(".product__card__link")
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
      while (productGrid.firstChild) {
        productGrid.removeChild(productGrid.firstChild);
      }

      // Append sorted order
      productCards.forEach((card) => {
        productGrid.appendChild(card);
      });
    }
  });

  return { status: "sorted" }; // Add this return value
}

function getPrice(productCard) {
  try {
    const priceElement = productCard.querySelector(
      ".product__body__price-final"
    );
    const priceText = priceElement.textContent.trim();
    const priceNumber = parseFloat(
      priceText
        .replace(/[^\d,]/g, "")
        .replace(/\./g, "")
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

  return { status: "injected" }; // Add return value
}

function injectRelevancy(relevancy) {
  const relevancyGroups = document.querySelectorAll(
    ".product__body__relevancy"
  );

  relevancyGroups.forEach((group) => {
    const radioButtons = group.querySelectorAll('input[type="radio"]');
    const isAlreadySelected = Array.from(radioButtons).some(
      (radio) => radio.checked
    );

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

  return { status: "injected" }; // Add return value
}

// Fungsi untuk menyalakan/mematikan highlight
function highlightAds(enabled) {
  const cards = document.querySelectorAll(".product__card, .els-product");

  cards.forEach((card) => {
    const adTag = card.querySelector(".product__card__tag__ad, .b-ads");
    if (adTag) {
      card.style.backgroundColor = enabled ? "#d2e7ff" : ""; // Nyala jika true, mati jika false
    }
  });
}

// Fungsi untuk menandai swimlane yang telah disubmit
function markSubmittedSwimlanes() {
  const swimlanes = document.querySelectorAll(".swimlane__heading");

  swimlanes.forEach((swimlane) => {
    const parentElement = swimlane.parentElement;
    const submittedHeading = parentElement.querySelector(
      ".submit__audit__data__heading"
    );

    const submittedMark = swimlane.querySelector(".submitted-mark");

    if (
      submittedHeading &&
      submittedHeading.textContent.includes("Data submitted successfully")
    ) {
      if (!submittedMark) {
        const newSubmittedMark = document.createElement("span");
        newSubmittedMark.textContent = " SUBMITTED ✔";
        newSubmittedMark.className = "submitted-mark";

        swimlane.appendChild(newSubmittedMark);
      }
    } else {
      if (submittedMark) {
        swimlane.removeChild(submittedMark);
      }
    }
  });
}

// Debounce function to limit the rate of function execution
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Panggil fungsi untuk menginisialisasi fitur Copy Categories
initializeCopyCategories();

// Auto-detect perubahan dalam daftar produk dengan debouncing
const observer = new MutationObserver(
  debounce(() => {
    chrome.storage.sync.get("highlightAdsEnabled", (data) => {
      if (data.highlightAdsEnabled) {
        highlightAds(true);
      }
    });
    markSubmittedSwimlanes(); // Panggil fungsi untuk menandai swimlane yang telah disubmit
  }, 300)
); // Adjust the debounce delay

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
  const swimlanes = document.querySelectorAll(".swimlane__heading");
  const results = [];

  swimlanes.forEach((swimlane) => {
    const swimlaneName = swimlane.textContent.trim();
    const productCards = swimlane.parentElement.querySelectorAll(
      ".product__card__link"
    );
    let totalPrice = 0;
    let productCount = 0;

    productCards.forEach((card) => {
      const priceElement = card.querySelector(".product__body__price-final");
      if (priceElement) {
        const priceText = priceElement.textContent.trim();
        const priceNumber = parseFloat(
          priceText.replace(/[^\d,]/g, "").replace(",", ".")
        );
        if (!isNaN(priceNumber)) {
          totalPrice += priceNumber;
          productCount++;
        }
      }
    });

    const averagePrice = productCount > 0 ? totalPrice / productCount : 0;
    results.push({ swimlaneName, averagePrice });
  });

  return results;
}

function countPromoProductsPerSwimlane() {
  const swimlanes = document.querySelectorAll(".swimlane__heading");
  const results = [];

  swimlanes.forEach((swimlane) => {
    const swimlaneName = swimlane.textContent.trim();
    const productCards = swimlane.parentElement.querySelectorAll(
      ".product__card__link"
    );
    let promoCount = 0;

    productCards.forEach((card) => {
      const promoElement = card.querySelector(".promo-label__text");
      if (promoElement) {
        promoCount++;
      }
    });

    results.push({ swimlaneName, promoCount });
  });

  return results;
}

function countSoldProductsPerSwimlane() {
  const swimlanes = document.querySelectorAll(".swimlane__heading");
  const results = [];

  swimlanes.forEach((swimlane) => {
    const swimlaneName = swimlane.textContent.trim();
    const productCards = swimlane.parentElement.querySelectorAll(
      ".product__card__link"
    );
    let soldCount = 0;

    productCards.forEach((card) => {
      const soldElement = card.querySelector(
        ".product__body__usp__container__sold__count"
      );
      if (soldElement) {
        soldCount++;
      }
    });

    results.push({ swimlaneName, soldCount });
  });

  return results;
}

function countRatedProductsPerSwimlane() {
  const swimlanes = document.querySelectorAll(".swimlane__heading");
  const results = [];

  swimlanes.forEach((swimlane) => {
    const swimlaneName = swimlane.textContent.trim();
    const productCards = swimlane.parentElement.querySelectorAll(
      ".product__card__link"
    );
    let ratingCount = 0;

    productCards.forEach((card) => {
      const ratingElement = card.querySelector(
        ".product__body__usp__container__rating__count"
      );
      if (ratingElement) {
        ratingCount++;
      }
    });

    results.push({ swimlaneName, ratingCount });
  });

  return results;
}

function calculateAverageRatingPerSwimlane() {
  const swimlanes = document.querySelectorAll(".swimlane__heading");
  const results = [];

  swimlanes.forEach((swimlane) => {
    const swimlaneName = swimlane.textContent.trim();
    const productCards = swimlane.parentElement.querySelectorAll(
      ".product__card__link"
    );
    let totalRating = 0;
    let ratingCount = 0;

    productCards.forEach((card) => {
      const ratingElement = card.querySelector(
        ".product__body__usp__container__rating__count"
      );
      if (ratingElement) {
        const ratingText = ratingElement.textContent.trim().replace(",", ".");
        const ratingNumber = parseFloat(ratingText.replace(/[^\d.]/g, ""));
        if (!isNaN(ratingNumber)) {
          totalRating += ratingNumber;
          ratingCount++;
        }
      }
    });

    const averageRating = ratingCount > 0 ? totalRating / ratingCount : 0;
    results.push({ swimlaneName, averageRating });
  });

  return results;
}

function countBlibliProvidedProductsPerSwimlane() {
  const swimlanes = document.querySelectorAll(".swimlane__heading");
  const results = [];

  swimlanes.forEach((swimlane) => {
    const swimlaneName = swimlane.textContent.trim();
    const productCards = swimlane.parentElement.querySelectorAll(
      ".product__card__link"
    );
    let blibliProvidedCount = 0;

    productCards.forEach((card) => {
      const blibliProvidedElement = card.querySelector(
        ".product__body__seller-location-name"
      );
      if (
        blibliProvidedElement &&
        blibliProvidedElement.textContent.trim() === "Disediakan Blibli"
      ) {
        blibliProvidedCount++;
      }
    });

    results.push({ swimlaneName, blibliProvidedCount });
  });

  return results;
}

function countOfficialStoreProductsPerSwimlane() {
  const swimlanes = document.querySelectorAll(".swimlane__heading");
  const results = [];

  swimlanes.forEach((swimlane) => {
    const swimlaneName = swimlane.textContent.trim();
    const productCards = swimlane.parentElement.querySelectorAll(
      ".product__card__link"
    );
    let officialStoreCount = 0;

    productCards.forEach((card) => {
      const officialStoreElement = card.querySelector(
        '.dev-product-card__icon-usp[src="/static/img/officialStore.2a59b8ca.svg"]'
      );
      if (officialStoreElement) {
        officialStoreCount++;
      }
    });

    results.push({ swimlaneName, officialStoreCount });
  });

  return results;
}

function countRelevancyProductsPerSwimlane() {
  const swimlanes = document.querySelectorAll(".swimlane__heading");
  const results = [];

  swimlanes.forEach((swimlane) => {
    const swimlaneName = swimlane.textContent.trim();
    const productCards = swimlane.parentElement.querySelectorAll(
      ".product__card__link"
    );
    let relevantCount = 0;
    let lessRelevantCount = 0;
    let irrelevantCount = 0;

    productCards.forEach((card) => {
      const relevancyItems = card.querySelectorAll(
        '.product__body__relevancy__item input[type="radio"]'
      );
      relevancyItems.forEach((item) => {
        if (item.checked) {
          if (item.value === "2") {
            relevantCount++;
          } else if (item.value === "1") {
            lessRelevantCount++;
          } else if (item.value === "0") {
            irrelevantCount++;
          }
        }
      });
    });

    results.push({
      swimlaneName,
      relevantCount,
      lessRelevantCount,
      irrelevantCount,
    });
  });

  return results;
}

function findTopReasonPerSwimlane() {
  const swimlanes = document.querySelectorAll(".swimlane__heading");
  const results = [];

  swimlanes.forEach((swimlane) => {
    const swimlaneName = swimlane.textContent.trim();
    const productCards = swimlane.parentElement.querySelectorAll(
      ".product__card__link"
    );
    const reasonCounts = {};

    productCards.forEach((card) => {
      const relevancyItems = card.querySelectorAll(
        '.product__body__relevancy__item input[type="radio"]'
      );
      let selectedRelevancy = null;

      relevancyItems.forEach((item) => {
        if (item.checked && (item.value === "0" || item.value === "1")) {
          selectedRelevancy = item.value;
        }
      });

      if (selectedRelevancy !== null) {
        const reasonSelect = card.querySelector(".single-select-reason");
        if (reasonSelect) {
          const selectedReason = reasonSelect.value;
          if (selectedReason) {
            if (!reasonCounts[selectedReason]) {
              reasonCounts[selectedReason] = 0;
            }
            reasonCounts[selectedReason]++;
          }
        }
      }
    });

    const topReasons = Object.keys(reasonCounts).filter(
      (reason) =>
        reasonCounts[reason] === Math.max(...Object.values(reasonCounts))
    );
    const topReason =
      topReasons.length > 1
        ? "Multiple reasons equally chosen"
        : topReasons[0] || "Reason not selected";
    results.push({ swimlaneName, topReason });
  });

  return results;
}

function countTopLocationsPerSwimlane() {
  const swimlanes = document.querySelectorAll(".swimlane__heading");
  const results = [];

  swimlanes.forEach((swimlane) => {
    const swimlaneName = swimlane.textContent.trim();
    const productCards = swimlane.parentElement.querySelectorAll(
      ".product__card__link"
    );
    const locationCounts = {};

    productCards.forEach((card) => {
      const locationElements = card.querySelectorAll(
        ".product__body__seller-location-name"
      );
      locationElements.forEach((locationElement) => {
        let locationText = locationElement.textContent.trim();
        if (locationText.includes("Kota") || locationText.includes("Kab.")) {
          // Remove "& kota lainnya" from the location text
          if (locationText.includes("& kota lainnya")) {
            locationText = locationText.split("& kota lainnya")[0].trim();
          }
          if (!locationCounts[locationText]) {
            locationCounts[locationText] = 0;
          }
          locationCounts[locationText]++;
        }
      });
    });

    const sortedLocations = Object.entries(locationCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([location, count]) => `${location} (${count})`);

    results.push({ swimlaneName, topLocations: sortedLocations.join(", ") });
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

  // Count relevancy products per swimlane
  const relevancyCounts = countRelevancyProductsPerSwimlane();

  // Find top reason per swimlane
  const topReasons = findTopReasonPerSwimlane();

  // Count top locations per swimlane
  const topLocations = countTopLocationsPerSwimlane();

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
    max-height: 90vh; /* Adjusted height */
    max-width: 95vw; /* Adjusted width */
    opacity: 1;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    transition: all 0.3s ease;
    width: 85vw; /* Adjusted width */
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
    max-height: 70vh; /* Adjust as needed */
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
    ${averagePrices
      .map((item) => {
        const swimlaneName = item.swimlaneName.split("-").slice(-2).join("-");
        return `<th style="border: 1px solid #ddd; padding: 8px; width: 1%;">${swimlaneName}</th>`;
      })
      .join("")}
  `;
  table.appendChild(headerRow);

  // Create the rows for each metric
  const metrics = [
    {
      name: "Average Price",
      values: averagePrices.map(
        (item) => `Rp${item.averagePrice.toLocaleString("id-ID")}`
      ),
    },
    {
      name: "Promo Products",
      values: promoCounts.map((item) => item.promoCount),
    },
    {
      name: "Products with Sold Badge",
      values: soldCounts.map((item) => item.soldCount),
    },
    {
      name: `<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDE2IDE2Ij4KICAgIDxnIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+CiAgICAgICAgPHBhdGggZD0iTTAgMEgxNlYxNkgweiIvPgogICAgICAgIDxwYXRoIGZpbGw9IiNGREI4MTMiIGZpbGwtcnVsZT0ibm9uemVybyIgZD0iTTguOTM1IDEuNjQ5bDEuMjYxIDIuNjU5Yy4yMS40Mi42My43IDEuMDUxLjg0bDIuODAzLjQyYy45MS4wNyAxLjI2IDEuMjYuNjMgMS44ODlsLTIuMDMyIDIuMWMtLjM1LjM1LS40Mi44NC0uNDIgMS4yNmwuNDIgMi44NjhjLjIxLjkxLS43NyAxLjYxLTEuNjExIDEuMTlsLTIuNTIzLTEuMzNjLS40Mi0uMjEtLjkxLS4yMS0xLjMzIDBsLTIuNTIzIDEuMzNjLS43Ny40Mi0xLjc1Mi0uMjgtMS42MTItMS4xOWwuNDktMi44NjljLjA3LS40Mi0uMDctLjkxLS40Mi0xLjI2TDEuMzY4IDcuMzg3Yy0uNzAxLS42My0uMzUtMS43NS42My0xLjg5bDIuODAzLS40MmMuMzUtLjE0Ljg0LS40Mi45OC0uOTFMNy4wNDQgMS41MWMuMzUtLjcgMS41NDItLjcgMS44OTIuMTR6Ii8+CiAgICA8L2c+Cjwvc3ZnPgo=" alt="Rated Products (Average Rating)" /> Rated Products (Average Rating)`,
      values: ratedCounts.map(
        (item, index) =>
          `${item.ratingCount} (${averageRatings[index].averageRating.toFixed(
            2
          )})`
      ),
    },
    {
      name: `<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAU1JREFUOE+lkzEsQ1EUhr/ztAmJgb2SDh0MBtpFB+trBwYxSWyMSPsiUQlRqVSnarCKpYnBaEAXg4hOYrCLGBi7GSQO76Xee021feIu9557zvnOuf+9V/jnkKD5ek8BZRNISoL6T14ggKZScxSvSkAMoSRxNgIB1DTVDazVROtEpO92CcPYJpF0inftQE1zDxhDNYJh7EpxJwf6hsgj8Umni84AS93qHXUqi7QCvKQcYJ+5+2gD5DVEg0Eq0qAJO12A+arHuVmGqaOm7QCyGgPO2JcJsnoNDDluYdyeCmnYuvQALbYDWNEIYQ4pyyyWnrgAmAZC54swc+wB7lYheeDvwF5n1K4adcMq8oCl79869Nt7r3moP0N6FAbWfbK4GviCHfcHI4R56aUhbSL6M/58jRmNYvDUs6o/4JPh3x9SVtMIFz1hylqgz9QN9AXjO1tzC3F/xwAAAABJRU5ErkJggg==" alt="Blibli Provided Products" /> Blibli Provided Products`,
      values: blibliProvidedCounts.map((item) => item.blibliProvidedCount),
    },
    {
      name: `<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAKcSURBVHgBdZNNSFRRFMf/Z94wvhkZfUGDhUrTQumDQgMliGjsYxEEWroL0qFVi7CB2hSRQRZkkEJCO3WR0CIVXLgJRmkRRJltlCBqZlLJb9N58/XevNO9b4ZJSy8c7r2cc373fNxD2GUl36kBBzlaSV6IJlyn9P6d7Og/x7Dqh0J9BApsMySMWKYVcjekIjsCOKxpaUf6AQPtzKAka4hkjts6nzMqJJazA3enLe7ZkwfZgLUx1V+kUlhcDsQtje59e4mhuUtY3swZlHiAoP8VQgcfw6dEJSVCzAH3uVTUBuhv3cOC3Lhs+an54yg+LVTab23NUJ5OlP3EWN1peBzrLKKc8J5PNTik0jTRlDVBndO3MTlfBmIDsEwhBkiIX8ti6LqCrKMcnTN3cqos1UhfG2BlGbpZyoOxFjCb0FyCZuWEBaDvqgtNx5yoKbfQ/70Zm4YmIVoBkBUPTq0cIT2ZRlu9E6tdGlrrFaHIoONiEQJVTvSEkxh4n8BGyo0fG+WCbckc4bRTyDBUc5kFlsa/JhBdcaPvmhetJ4VztQtTswZCr1dFVciuxeJvN6qcRFsiIOx3zKLUsYrIUgoNz34hsmLaznK/3LuQC1Okw5k4DqvTMI1ccfMAa60YCVzwjtqGkUUB6ZrDyKRu7/IunaWuxfcGHtZFdswFQCZDX4wM6G7lU1TwjOighCRw5UUMUbEj35UKTOPmvl77dTONiQLA0ClopBDxWKJQ1TfQ5BkU1LjtxLJn6TjOqqMYPtqGMmWJpW06ScFtX/nzE9XvVPiWOLaLXmIu5cN8cq8d5qGSGHkVPf+huNtwFT+sDa2vbwMUQB1ymKzn4tgoZ+LvMPE4skqwtmOXYfp3fbivtokczsgcma2Bukfm+E52fwDeSEWNax2kwAAAAABJRU5ErkJggg==" alt="Official Store Products" /> Official Store Products`,
      values: officialStoreCounts.map((item) => item.officialStoreCount),
    },
    {
      name: "Relevant Products",
      values: relevancyCounts.map((item) => item.relevantCount),
    },
    {
      name: "Less Relevant Products",
      values: relevancyCounts.map((item) => item.lessRelevantCount),
    },
    {
      name: "Irrelevant Products",
      values: relevancyCounts.map((item) => item.irrelevantCount),
    },
    {
      name: "Top Products Reason",
      values: topReasons.map((item) => item.topReason),
    },
    {
      name: "Top Locations",
      values: topLocations.map((item) => item.topLocations),
    },
  ];

  metrics.forEach((metric, index) => {
    const row = document.createElement("tr");
    row.className = index % 2 === 0 ? "even-row" : "odd-row";
    row.innerHTML = `
      <td style="border: 1px solid #ddd; padding: 8px; text-align: left;">${
        metric.name
      }</td>
      ${metric.values
        .map(
          (value) =>
            `<td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${value}</td>`
        )
        .join("")}
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
  document
    .getElementById("close-inspect-popup")
    .addEventListener("click", () => {
      document.body.removeChild(modal);
      document.body.removeChild(overlay);
    });

  overlay.addEventListener("click", () => {
    document.body.removeChild(modal);
    document.body.removeChild(overlay);
  });

  // Add CSS for alternating row colors
  const style = document.createElement("style");
  style.innerHTML = `
    .even-row {
      background-color: #f9f9f9;
    }
    .odd-row {
      background-color: #ffffff;
    }
  `;
  document.head.appendChild(style);
}