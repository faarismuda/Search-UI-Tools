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
  }
});

// Ambil state dari storage saat halaman dimuat ulang
chrome.storage.sync.get("highlightAdsEnabled", (data) => {
  if (data.highlightAdsEnabled) {
    highlightAds(true);
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
      ".product__body__price__display"
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
      card.style.backgroundColor = enabled ? "#ffcccc" : ""; // Nyala jika true, mati jika false
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
