"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://yllquiyrnhicvnrhihfk.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsbHF1aXlybmhpY3ZucmhpaGZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5MzAxNzAsImV4cCI6MjA5MjUwNjE3MH0.bJI1KBep_S62_cDlST7R7luBU1TirciERIqLBfHLnGk";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function CheckoutPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("mtn");
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/login";
        return;
      }
      setUser(user);
      const savedCart = localStorage.getItem("xbase_cart");
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
      setLoading(false);
    };
    init();
  }, []);

  const updateQuantity = (item, delta) => {
    const newCart = cart.map(i => {
      if (i.item === item) {
        const newQty = i.quantity + delta;
        return newQty > 0 ? { ...i, quantity: newQty } : null;
      }
      return i;
    }).filter(i => i !== null);
    setCart(newCart);
    localStorage.setItem("xbase_cart", JSON.stringify(newCart));
  };

  const removeItem = (item) => {
    const newCart = cart.filter(i => i.item !== item);
    setCart(newCart);
    localStorage.setItem("xbase_cart", JSON.stringify(newCart));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.setItem("xbase_cart", "[]");
  };

      const processPayment = async () => {
    if (cart.length === 0) {
      setMessage("Your cart is empty");
      return;
    }
    if (!customerPhone || customerPhone.length < 9) {
      setMessage("Please enter a valid phone number");
      return;
    }
    
    setProcessing(true);
    setMessage("Initiating payment... Please wait.");
    
    const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    const totalWithDelivery = total + 500;
    
    // Save order first
    const { data: order, error } = await supabase.from("orders").insert({
      user_id: user.id,
      customer_phone: customerPhone,
      items: cart,
      total: totalWithDelivery,
      status: "pending",
      payment_status: "pending"
    }).select();
    
    if (error) {
      setMessage("Error creating order");
      setProcessing(false);
      return;
    }
    
    const orderId = order[0]?.id;
    
    try {
      const response = await fetch("/api/fapshi-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: totalWithDelivery,
          phoneNumber: customerPhone,
          orderId: orderId,
          method: paymentMethod
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setMessage("âœ… " + result.message);
        // Poll for payment status
        let attempts = 0;
        const interval = setInterval(async () => {
          attempts++;
          const { data: updated } = await supabase
            .from("orders")
            .select("payment_status")
            .eq("id", orderId)
            .single();
          
          if (updated?.payment_status === "paid") {
            clearInterval(interval);
            setMessage("âœ… Payment confirmed! Order #" + orderId + " completed.");
            localStorage.setItem("xbase_cart", "[]");
            setCart([]);
            setTimeout(() => window.location.href = "/orders", 2000);
          } else if (attempts > 30) {
            clearInterval(interval);
            setMessage("â³ Payment pending. Check your phone to complete.");
            setProcessing(false);
          }
        }, 2000);
      } else {
        setMessage("âŒ " + (result.message || "Payment failed"));
        setProcessing(false);
      }
    } catch (err) {
      console.error(err);
      setMessage("âŒ Payment error. Please try again.");
      setProcessing(false);
    }
  };

  const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const totalWithDelivery = cartTotal + 500;
  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);

  if (loading) {
    return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0B0F14", color: "white" }}>Loading...</div>;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0B0F14", color: "#E5E7EB" }}>
      {/* Header */}
      <nav style={{ padding: "16px 24px", background: "#0F172A", borderBottom: "1px solid #1F2937", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, background: "linear-gradient(135deg, #00FFA3, #3B82F6)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>Xbase AI</h1>
        <div style={{ display: "flex", gap: 16 }}>
          <a href="/products" style={{ color: "#9CA3AF", textDecoration: "none" }}>Continue Shopping</a>
          <a href="/dashboard" style={{ color: "#9CA3AF", textDecoration: "none" }}>Dashboard</a>
        </div>
      </nav>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>ðŸ›’ Checkout</h1>
        <p style={{ color: "#9CA3AF", marginBottom: 32 }}>Review your order and complete payment</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: 32 }}>
          {/* Order Summary Section */}
          <div style={{ background: "#0F172A", border: "1px solid #1F2937", borderRadius: 20, padding: 24 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>ðŸ“‹ Order Summary</h2>
            {cart.length === 0 ? (
              <div style={{ textAlign: "center", padding: 60, color: "#6B7280" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>ðŸ›’</div>
                <p>Your cart is empty</p>
                <a href="/products" style={{ display: "inline-block", marginTop: 16, color: "#00FFA3" }}>Browse Products â†’</a>
              </div>
            ) : (
              <>
                <div style={{ maxHeight: 400, overflowY: "auto", marginBottom: 20 }}>
                  {cart.map((item, idx) => (
                    <div key={idx} style={{ marginBottom: 16, padding: 12, background: "#0B0F14", borderRadius: 12, border: "1px solid #1F2937" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <span style={{ fontWeight: 600, fontSize: 15 }}>{item.item}</span>
                        <span style={{ color: "#00FFA3", fontWeight: 600 }}>{item.price.toLocaleString()} FCFA</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                          <button onClick={() => updateQuantity(item.item, -1)} style={{ background: "#0B0F14", border: "1px solid #1F2937", width: 30, height: 30, borderRadius: 8, cursor: "pointer", color: "white", fontSize: 16 }}>-</button>
                          <span style={{ minWidth: 30, textAlign: "center" }}>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.item, 1)} style={{ background: "#0B0F14", border: "1px solid #1F2937", width: 30, height: 30, borderRadius: 8, cursor: "pointer", color: "white", fontSize: 16 }}>+</button>
                        </div>
                        <button onClick={() => removeItem(item.item)} style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer", fontSize: 12 }}>Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div style={{ borderTop: "1px solid #1F2937", paddingTop: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ color: "#9CA3AF" }}>Subtotal</span>
                    <span>{cartTotal.toLocaleString()} FCFA</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ color: "#9CA3AF" }}>Delivery Fee</span>
                    <span>500 FCFA</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, paddingTop: 12, borderTop: "1px solid #1F2937", fontSize: 18, fontWeight: 700 }}>
                    <span>Total</span>
                    <span style={{ color: "#00FFA3" }}>{totalWithDelivery.toLocaleString()} FCFA</span>
                  </div>
                </div>
                
                <button onClick={clearCart} style={{ marginTop: 16, width: "100%", background: "transparent", border: "1px solid #1F2937", padding: 10, borderRadius: 8, cursor: "pointer", color: "#9CA3AF", fontSize: 13 }}>
                  Clear Cart
                </button>
              </>
            )}
          </div>

          {/* Payment Section */}
          {cart.length > 0 && (
            <div style={{ background: "#0F172A", border: "1px solid #1F2937", borderRadius: 20, padding: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>ðŸ’³ Payment</h2>
              
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", marginBottom: 8, color: "#9CA3AF", fontSize: 13 }}>Select Payment Method</label>
                <div style={{ display: "flex", gap: 12 }}>
                  <button
                    onClick={() => setPaymentMethod("mtn")}
                    style={{
                      flex: 1,
                      padding: "12px",
                      background: paymentMethod === "mtn" ? "#F5A623" : "#0B0F14",
                      border: "1px solid #1F2937",
                      borderRadius: 10,
                      cursor: "pointer",
                      color: paymentMethod === "mtn" ? "#000" : "white",
                      fontWeight: 600,
                      transition: "all 0.2s"
                    }}
                  >
                    ðŸ“± MTN MoMo
                  </button>
                  <button
                    onClick={() => setPaymentMethod("orange")}
                    style={{
                      flex: 1,
                      padding: "12px",
                      background: paymentMethod === "orange" ? "#FF6600" : "#0B0F14",
                      border: "1px solid #1F2937",
                      borderRadius: 10,
                      cursor: "pointer",
                      color: "white",
                      fontWeight: 600,
                      transition: "all 0.2s"
                    }}
                  >
                    ðŸŠ Orange Money
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", marginBottom: 8, color: "#9CA3AF", fontSize: 13 }}>Phone Number</label>
                <input
                  type="tel"
                  placeholder="MTN: 655555555 | Orange: 655555555"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "#0B0F14",
                    border: "1px solid #1F2937",
                    borderRadius: 10,
                    color: "white",
                    fontSize: 14
                  }}
                />
                <p style={{ fontSize: 11, color: "#6B7280", marginTop: 6 }}>Enter your MTN or Orange Money number</p>
              </div>

              {message && (
                <div style={{
                  marginBottom: 20,
                  padding: "12px",
                  background: message.includes("âœ…") ? "#00FFA320" : "#EF444420",
                  borderRadius: 10,
                  textAlign: "center",
                  color: message.includes("âœ…") ? "#00FFA3" : "#EF4444",
                  fontSize: 13
                }}>
                  {message}
                </div>
              )}

              <button
                onClick={processPayment}
                disabled={processing}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: "linear-gradient(135deg, #00FFA3, #3B82F6)",
                  border: "none",
                  borderRadius: 12,
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: processing ? "not-allowed" : "pointer",
                  color: "#000",
                  transition: "all 0.2s"
                }}
              >
                {processing ? "Processing..." : `Pay ${totalWithDelivery.toLocaleString()} FCFA â†’`}
              </button>

              <p style={{ fontSize: 10, color: "#6B7280", textAlign: "center", marginTop: 16 }}>
                ðŸ”’ Demo mode - No real money will be deducted
              </p>
            </div>
          )}
        </div>

        {/* Payment Guide */}
        <div style={{ marginTop: 40, background: "#0F172A", border: "1px solid #1F2937", borderRadius: 20, padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>ðŸ’¡ How to Pay with Mobile Money</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            <div>
              <div style={{ color: "#F5A623", fontWeight: 700, marginBottom: 8 }}>ðŸ“± MTN MoMo</div>
              <div style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 4 }}>1. Dial <strong style={{ color: "white" }}>*126#</strong></div>
              <div style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 4 }}>2. Select <strong style={{ color: "white" }}>"Pay"</strong></div>
              <div style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 4 }}>3. Enter merchant number</div>
              <div style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 4 }}>4. Enter amount</div>
              <div style={{ fontSize: 13, color: "#9CA3AF" }}>5. Enter PIN to confirm</div>
            </div>
            <div>
              <div style={{ color: "#FF6600", fontWeight: 700, marginBottom: 8 }}>ðŸŠ Orange Money</div>
              <div style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 4 }}>1. Dial <strong style={{ color: "white" }}>*144#</strong></div>
              <div style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 4 }}>2. Select <strong style={{ color: "white" }}>"Pay"</strong></div>
              <div style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 4 }}>3. Enter merchant number</div>
              <div style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 4 }}>4. Enter amount</div>
              <div style={{ fontSize: 13, color: "#9CA3AF" }}>5. Enter PIN to confirm</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}




