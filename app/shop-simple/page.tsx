"use client";

import { useState, useEffect } from "react";

// Sample products for testing
const sampleProducts = [
  { id: 1, name: "Chicken with Plantains", price: 2500 },
  { id: 2, name: "Grilled Fish", price: 3000 },
  { id: 3, name: "NdolÃ© with Beef", price: 2000 },
  { id: 4, name: "Bissap (Hibiscus)", price: 500 },
  { id: 5, name: "Soda", price: 500 },
];

export default function SimpleShopPage() {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    updateCartCount();
  }, []);

  const updateCartCount = () => {
    const cart = localStorage.getItem("xbase_cart");
    if (cart) {
      const items = JSON.parse(cart);
      const count = items.reduce((sum, i) => sum + i.quantity, 0);
      setCartCount(count);
    } else {
      setCartCount(0);
    }
  };

  const addToCart = (item, price) => {
    let cart = [];
    const existingCart = localStorage.getItem("xbase_cart");
    if (existingCart) {
      cart = JSON.parse(existingCart);
    }
    
    const existing = cart.find(i => i.item === item);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ item, price, quantity: 1 });
    }
    
    localStorage.setItem("xbase_cart", JSON.stringify(cart));
    updateCartCount();
    alert(`Added ${item} to cart!`);
  };

  const goToCheckout = () => {
    window.location.href = "/checkout";
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0B0F14", color: "#E5E7EB", padding: 24 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800 }}>ðŸ›ï¸ Simple Shop</h1>
          <button onClick={goToCheckout} style={{ background: "#00FFA3", border: "none", padding: "10px 20px", borderRadius: 8, fontWeight: 600, cursor: "pointer", color: "#000" }}>
            ðŸ›’ Cart ({cartCount})
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20 }}>
          {sampleProducts.map((product) => (
            <div key={product.id} style={{ background: "#0F172A", border: "1px solid #1F2937", borderRadius: 16, padding: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{product.name}</h3>
              <p style={{ color: "#00FFA3", fontSize: 24, fontWeight: 700, marginBottom: 16 }}>{product.price.toLocaleString()} FCFA</p>
              <button onClick={() => addToCart(product.name, product.price)} style={{ width: "100%", background: "linear-gradient(135deg, #00FFA3, #3B82F6)", border: "none", padding: 10, borderRadius: 8, fontWeight: 600, cursor: "pointer", color: "#000" }}>
                Add to Cart
              </button>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 24, textAlign: "center" }}>
          <a href="/products" style={{ color: "#9CA3AF" }}>â† Back to Products</a>
        </div>
      </div>
    </div>
  );
}
