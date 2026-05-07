// Cart utility functions
export const getCart = () => {
  if (typeof window === "undefined") return [];
  const cart = localStorage.getItem("xbase_cart");
  return cart ? JSON.parse(cart) : [];
};

export const saveCart = (cart) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("xbase_cart", JSON.stringify(cart));
};

export const addToCart = (item, price) => {
  const cart = getCart();
  const existing = cart.find(i => i.item === item);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ item, price, quantity: 1 });
  }
  saveCart(cart);
  return cart;
};

export const removeFromCart = (item) => {
  let cart = getCart();
  cart = cart.filter(i => i.item !== item);
  saveCart(cart);
  return cart;
};

export const updateQuantity = (item, delta) => {
  const cart = getCart();
  const existing = cart.find(i => i.item === item);
  if (existing) {
    existing.quantity += delta;
    if (existing.quantity <= 0) {
      return removeFromCart(item);
    }
  }
  saveCart(cart);
  return cart;
};

export const clearCart = () => {
  saveCart([]);
  return [];
};

export const getCartTotal = () => {
  const cart = getCart();
  return cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
};

export const getCartCount = () => {
  const cart = getCart();
  return cart.reduce((sum, i) => sum + i.quantity, 0);
};
