"use client";

import { useState, useEffect } from "react";
import { addToCart, getCart, getCartCount, getCartTotal } from "../utils/cart";

export default function TestCartPage() {
  const [cart, setCart] = useState([]);
  const [count, setCount] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    refreshCart();
  }, []);

  const refreshCart = () => {
    setCart(getCart());
    setCount(getCartCount());
    setTotal(getCartTotal());
  };

  const testAdd = () => {
    addToCart("Test Product " + (cart.length + 1), 1000);
    refreshCart();
  };

  const clearCart = () => {
    localStorage.removeItem("xbase_cart");
    refreshCart();
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Cart Test Page</h1>
      <button onClick={testAdd} style={{ padding: 10, marginRight: 10 }}>Add Test Product</button>
      <button onClick={clearCart} style={{ padding: 10 }}>Clear Cart</button>
      <p>Cart Count: {count}</p>
      <p>Cart Total: {total} FCFA</p>
      <pre>{JSON.stringify(cart, null, 2)}</pre>
      <a href="/checkout">Go to Checkout</a>
      <br />
      <a href="/products">Go to Products</a>
    </div>
  );
}
