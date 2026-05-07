"use client";

import { useState, useEffect } from "react";
import { getCartCount } from "../utils/cart";

export default function CartNotification({ theme }) {
  const [count, setCount] = useState(0);
  const [show, setShow] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Initial load
    setCount(getCartCount());
    
    // Listen for cart updates
    const handleCartUpdate = () => {
      const newCount = getCartCount();
      if (newCount > count) {
        // Show animation when item added
        setShow(true);
        setAnimate(true);
        setTimeout(() => setAnimate(false), 500);
        setTimeout(() => setShow(false), 3000);
      }
      setCount(newCount);
    };

    window.addEventListener("cartUpdated", handleCartUpdate);
    window.addEventListener("storage", (e) => {
      if (e.key === "xbase_cart") {
        handleCartUpdate();
      }
    });

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, [count]);

  if (count === 0 && !show) return null;

  return (
    <>
      {/* Floating Cart Button */}
      <div
        onClick={() => window.location.href = "/checkout"}
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          zIndex: 1000,
          cursor: "pointer",
          transition: "all 0.3s ease",
          transform: animate ? "scale(1.2)" : "scale(1)",
        }}
      >
        <div style={{
          background: `linear-gradient(135deg, ${theme.accent}, ${theme.secondary})`,
          width: 56,
          height: 56,
          borderRadius: 28,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
          position: "relative",
        }}>
          <span style={{ fontSize: 24 }}>ðŸ›’</span>
          {count > 0 && (
            <span style={{
              position: "absolute",
              top: -5,
              right: -5,
              background: "#EF4444",
              color: "white",
              fontSize: 11,
              fontWeight: "bold",
              padding: "2px 6px",
              borderRadius: 20,
              minWidth: 20,
              textAlign: "center",
            }}>
              {count > 99 ? "99+" : count}
            </span>
          )}
        </div>
      </div>

      {/* Slide-up Notification */}
      {show && (
        <div
          style={{
            position: "fixed",
            bottom: 90,
            right: 20,
            zIndex: 1000,
            background: theme.bg2,
            border: `1px solid ${theme.border}`,
            borderRadius: 12,
            padding: "12px 20px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
            animation: "slideUp 0.4s ease-out, fadeOut 0.5s ease-out 2.5s forwards",
            pointerEvents: "none",
          }}
        >
          <div style={{
            background: `linear-gradient(135deg, ${theme.accent}, ${theme.secondary})`,
            width: 32,
            height: 32,
            borderRadius: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <span style={{ fontSize: 16 }}>ðŸ›’</span>
          </div>
          <div>
            <div style={{ fontWeight: 600, color: theme.text }}>
              Added to cart!
            </div>
            <div style={{ fontSize: 12, color: theme.textSub }}>
              {count} {count === 1 ? "item" : "items"} in cart
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes fadeOut {
          to {
            opacity: 0;
            visibility: hidden;
          }
        }
      `}</style>
    </>
  );
}
