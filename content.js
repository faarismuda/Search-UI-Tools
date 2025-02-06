chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "sort") {
    sortProducts(request.order);
  } else if (request.action === "inject") {
    injectReason(request.reason);
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
