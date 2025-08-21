document.addEventListener("DOMContentLoaded", () => {
  const popup = document.getElementById("product-popup");
  const popupClose = document.getElementById("popup-close");
  const popupImage = document.getElementById("popup-image");
  const popupTitle = document.getElementById("popup-title");
  const popupPrice = document.getElementById("popup-price");
  const popupDesc = document.getElementById("popup-desc");
  const popupVariants = document.getElementById("popup-variants");
  const popupAdd = document.getElementById("popup-add");

  let currentProduct = null;

  // Open popup when product clicked
  document.querySelectorAll(".grid-item").forEach(item => {
    item.addEventListener("click", () => {
      const handle = item.dataset.handle;
      fetch(`/products/${handle}.js`)
        .then(res => res.json())
        .then(product => {
          currentProduct = product;

          popupImage.src = product.images[0] || "";
          popupTitle.textContent = product.title;
          popupPrice.textContent = `$${(product.price / 100).toFixed(2)}`;
          popupDesc.textContent = product.description;

          // Render variants
          popupVariants.innerHTML = "";
          product.variants.forEach(variant => {
            const label = document.createElement("label");
            label.innerHTML = `
              <input type="radio" name="variant" value="${variant.id}">
              ${variant.title} - $${(variant.price / 100).toFixed(2)}
            `;
            popupVariants.appendChild(label);
          });

          popup.classList.remove("hidden");
        });
    });
  });

  // Close popup
  popupClose.addEventListener("click", () => {
    popup.classList.add("hidden");
  });

  // Add to Cart
  popupAdd.addEventListener("click", () => {
    const selected = document.querySelector("input[name='variant']:checked");
    if (!selected) {
      alert("Please select a variant");
      return;
    }

    const variantId = selected.value;

    // Add main product
    addToCart(variantId);

    // Special rule: If Black + Medium, also add "Soft Winter Jacket"
    const variant = currentProduct.variants.find(v => v.id == variantId);
    if (variant && variant.title.includes("Black") && variant.title.includes("Medium")) {
      // Replace with real product ID of Soft Winter Jacket
      fetch(`/products/soft-winter-jacket.js`)
        .then(res => res.json())
        .then(extraProduct => {
          addToCart(extraProduct.variants[0].id);
        });
    }

    popup.classList.add("hidden");
  });

  function addToCart(variantId, qty = 1) {
    fetch("/cart/add.js", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: variantId, quantity: qty })
    })
    .then(res => res.json())
    .then(data => {
      console.log("Added to cart:", data);
    })
    .catch(err => console.error(err));
  }
});
