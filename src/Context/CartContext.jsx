// CartContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const storedCart = localStorage.getItem("cartItems");
      return storedCart ? JSON.parse(storedCart) : [];
    } catch (error) {
      console.error("Error parsing cart items:", error);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      const quantityToAdd = product.quantity ? Number(product.quantity) : 1;

      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantityToAdd }
            : item
        );
      } else {
        return [...prev, { 
          ...product, 
          quantity: quantityToAdd,
          // إضافة قيم افتراضية لمنع الأخطاء
          price: product.price || 0,
          name: product.name || "Unknown Product"
        }];
      }
    });
  };

  const increaseQuantity = (id) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decreaseQuantity = (id) => {
    setCartItems(prev =>
      prev
        .map(item =>
          item.id === id
            ? { ...item, quantity: Math.max(1, item.quantity - 1) }
            : item
        )
    );
  };

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  // إضافة دالة لتفريغ السلة
  const clearCart = () => {
    setCartItems([]);
  };

  // حساب المجموع الكلي
  const cartTotal = cartItems.reduce(
    (total, item) => total + (item.price * item.quantity), 
    0
  );

  return (
    <CartContext.Provider value={{
      cartItems,
      cartTotal, // إضافة المجموع الكلي
      addToCart,
      increaseQuantity,
      decreaseQuantity,
      removeFromCart,
      clearCart // تصدير الدالة الجديدة
    }}>
      {children}
    </CartContext.Provider>
  );
};