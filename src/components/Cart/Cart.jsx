import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../Context/CartContext";

import styles from "./Cart.module.css";
import product1 from "./../../assets/Screenshot 2025-02-13 210809.png";

export default function Cart() {
  const { cartItems, increaseQuantity, decreaseQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 50;
  const total = subtotal + shipping;

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert("لا توجد منتجات مضافة في السلة");
      return;
    }
    navigate("/checkout");
  };

  return (
    <div className={styles.cartContainer}>
      <h1 className={styles.cartTitle}>عربة التسوق 🛒</h1>
      
      <div className={styles.cartContent}>
        <div className={styles.itemsSection}>
          {cartItems.length === 0 ? (
            <p>السلة فارغة.</p>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className={styles.cartItem}>
                <img src={item.image || product1} alt={item.name} className={styles.itemImage} />
                
                <div className={styles.itemDetails}>
                  <h3>{item.name}</h3>
                  <p>السعر: {item.price} جنيه</p>
                  
                  <div className={styles.quantityControl}>
                    <button 
                      className={styles.quantityBtn} 
                      style={{ color: '#A67C52' }}
                      onClick={() => decreaseQuantity(item.id)}
                    >
                      -
                    </button>
                    <span className={styles.quantityNumber}>{item.quantity}</span>
                    <button 
                      className={styles.quantityBtn} 
                      style={{ color: '#A67C52' }}
                      onClick={() => increaseQuantity(item.id)}
                    >
                      +
                    </button>
                  </div>

                  <button 
                    className={styles.removeBtn}
                    onClick={() => removeFromCart(item.id)}
                  >
                    حذف
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className={styles.summarySection}>
          <div className={styles.summaryCard}>
            <h2>ملخص الطلب</h2>
            
            <div className={styles.summaryRow}>
              <span>المجموع الفرعي:</span>
              <span>{subtotal} جنيه</span>
            </div>
            
            <div className={styles.summaryRow}>
              <span>الشحن:</span>
              <span>{shipping} جنيه</span>
            </div>
            
            <hr className={styles.divider} />
            
            <div className={`${styles.summaryRow} ${styles.totalRow}`}>
              <span>الإجمالي:</span>
              <span>{total} جنيه</span>
            </div>
            
            <button 
              className={styles.checkoutBtn}
              onClick={handleCheckout}
            >
              إتمام الشراء
            </button>
            
            <p className={styles.continueShopping}>أو <Link to="/shop">مواصلة التسوق</Link></p>

          </div>
        </div>
      </div>
    </div>
  );
}