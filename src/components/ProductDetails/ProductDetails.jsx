import React, { useEffect, useState, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom"; // أضف useNavigate
import styles from "./ProductDetails.module.css";
import defaultProductImage from "../../assets/image.png";
import { TokenContext } from "../../Context/TokenContext";
import { useCart } from "../../Context/CartContext";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate(); // أضف هذا السطر
  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useContext(TokenContext);
  const { addToCart, clearCart } = useCart(); // أضف clearCart
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // Fetch product details
        const productResponse = await fetch(`https://ourheritage.runasp.net/api/HandiCrafts/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!productResponse.ok) {
          throw new Error("فشل تحميل البيانات");
        }

        const productData = await productResponse.json();
        setProduct(productData);

        // Fetch similar products using the recommendation API
        const similarResponse = await fetch(
          `https://ourheritage.runasp.net/api/Recommendation/similar-handicrafts/${id}?count=4`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "text/plain",
            },
          }
        );

        if (!similarResponse.ok) {
          throw new Error("فشل تحميل المنتجات المشابهة");
        }

        const similarData = await similarResponse.json();
        // Sort similar products by recommendationScore in descending order
        const sortedSimilarProducts = similarData.sort(
          (a, b) => b.recommendationScore - a.recommendationScore
        );
        setSimilarProducts(sortedSimilarProducts);
      } catch (error) {
        console.error("Error fetching data:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, token]);

  if (loading) return <p className={styles.loading}>جاري التحميل...</p>;
  if (!product) return <p className={styles.error}>لم يتم العثور على المنتج.</p>;

  const handleAddToCart = () => {
    const cartItem = {
      id: product.id,
      name: product.title,
      price: Number(product.price),
      image: product.imageOrVideo?.[0] || defaultProductImage,
      quantity: Number(quantity) > 0 ? Number(quantity) : 1,
    };
    addToCart(cartItem);
    alert("تمت إضافة المنتج إلى السلة");
  };

  // دالة جديدة للشراء المباشر
  const handleBuyNow = () => {
    // تفريغ السلة أولاً
    clearCart();
    
    // إضافة المنتج الحالي فقط
    const cartItem = {
      id: product.id,
      name: product.title,
      price: Number(product.price),
      image: product.imageOrVideo?.[0] || defaultProductImage,
      quantity: Number(quantity) > 0 ? Number(quantity) : 1,
    };
    addToCart(cartItem);
    
    // الانتقال مباشرة إلى صفحة الدفع
    navigate('/checkout');
  };

  return (
    <div className={styles.productDetailsContainer}>
      <div className={styles.productDetails}>
        <div className={styles.productImageSection}>
          <img
            src={product.imageOrVideo?.[0] || defaultProductImage}
            alt={product.title}
            className={styles.productImage}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = defaultProductImage;
            }}
          />
        </div>

        <div className={styles.productInfoSection}>
          <h2 className={styles.productTitle}>{product.title}</h2>
          <div className={styles.rating}>⭐⭐⭐⭐⭐</div>
          <div className={styles.price}>{product.price}.00$</div>

          <div className={styles.quantitySection}>
            <button className={styles.addToCart} onClick={handleAddToCart}>
              أضف إلى السلة
            </button>
            <input
              type="number"
              value={quantity}
              min="1"
              className={styles.quantityInput}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          {/* تعديل زر اشتري الآن لاستخدام الدالة الجديدة */}
          <button className={styles.buyNow} onClick={handleBuyNow}>
            اشتري الآن
          </button>

          <div className={styles.extraInfo}>
            <p><strong>بلد المنشأ:</strong> مصر</p>
            <p><strong>الفئة:</strong> {product.categoryName}</p>
            <p><strong>اسم الصانع:</strong> {product.nameOfUser}</p>
          </div>
        </div>
      </div>

      {similarProducts.length > 0 && (
        <div className={styles.similarProductsSection}>
          <h2 className={styles.similarProductsTitle}>منتجات مشابهة</h2>
          <div className={styles.similarProductsGrid}>
            {similarProducts.map((similarProduct) => (
              <Link
                to={`/products/${similarProduct.itemId}`}
                key={similarProduct.itemId}
                className={styles.similarProductCard}
              >
                <img
                  src={similarProduct.images?.[0] || defaultProductImage}
                  alt={similarProduct.title}
                  className={styles.similarProductImage}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = defaultProductImage;
                  }}
                />
                <h3 className={styles.similarProductTitle}>{similarProduct.title}</h3>
                <p className={styles.similarProductPrice}>{similarProduct.price}.00$</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}