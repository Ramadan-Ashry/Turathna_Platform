import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../Context/CartContext";
import axios from "axios";
import { ColorRing } from 'react-loader-spinner';
import styles from "./Shop.module.css";
import { useNavigate } from "react-router-dom";
import { TokenContext } from "../../Context/TokenContext";
import prof1 from "/src/assets/prof.jpg";
import defaultProductImage from "/src/assets/product1.jpg";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ar";
import timezone from 'dayjs/plugin/timezone';
import { FaHeart } from "react-icons/fa";
import profileimg from "../../assets/profile-icon-9.png";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);
dayjs.locale("ar");

const PRODUCTS_PER_PAGE = 9;

const Shop = () => {
  const { token } = useContext(TokenContext);
  const [allProducts, setAllProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState(405);
  const [appliedFilters, setAppliedFilters] = useState({
    categories: [],
    price: 405,
  });
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userMap, setUserMap] = useState({});
  const [localFavorites, setLocalFavorites] = useState({});
  const [categories, setCategories] = useState([]);

  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: null,
  });
  
  const { addToCart } = useCart();
  const navigate = useNavigate();
  
  const handleAddToCart = (product) => {
    addToCart(product);
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(
        "https://ourheritage.runasp.net/api/Categories?PageIndex=1&PageSize=50",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCategories(res.data.items || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setCategories([]);
    }
  };

  // دالة لتحميل مفضلات المستخدم من الخادم
  
  const fetchProducts = () => {
    setLoading(true);
    axios
      .get(
        "https://ourheritage.runasp.net/api/HandiCrafts?page=1&pageSize=1000",
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        if (Array.isArray(res.data.items)) {
          const uniqueMap = new Map();
          res.data.items.forEach((item) => {
            const key = `${item.title}-${item.description}`;
            if (!uniqueMap.has(key)) {
              uniqueMap.set(key, { 
                ...item,
                likes: item.likes || 0 
              });
            }
          });
          const uniqueProducts = Array.from(uniqueMap.values()).map(p => ({
            ...p,
            likes: p.likes || 0
          })).sort((a, b) => b.id - a.id);
          setAllProducts(uniqueProducts);
          
          // بعد تعيين المنتجات، حمل المفضلات
          fetchUserFavorites();
        } else {
          setAllProducts([]);
        }
      })
      .catch((err) => console.error("API Error:", err))
      .finally(() => setLoading(false));
  };
  
  const fetchUserData = async (userId) => {
    if (userMap[userId]) return;

    try {
      const res = await axios.get(
        `https://ourheritage.runasp.net/api/Users/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUserMap((prev) => ({
        ...prev,
        [userId]: res.data,
      }));
    } catch (err) {
      console.error("فشل في تحميل بيانات المستخدم:", err);
    }
  };

  // New function to clean invalid favorites
  const cleanInvalidFavorites = async () => {
    try {
      const favorites = Object.keys(localStorage)
        .filter(key => key.startsWith('favorite-'));
      
      for (const key of favorites) {
        const productId = key.split('-')[1];
        const value = localStorage.getItem(key);
        
        // Remove invalid entries
        if (value === 'undefined' || value === undefined) {
          localStorage.removeItem(key);
        } 
        // Verify existing favorites
        else if (value === 'true') {
          const exists = await verifyProductExists(productId);
          if (!exists) {
            localStorage.removeItem(key);
            setLocalFavorites(prev => ({ ...prev, [productId]: false }));
          }
        }
      }
    } catch (err) {
      console.error("Error cleaning favorites:", err);
    }
  };

  // Verify if product exists in database
  const verifyProductExists = async (productId) => {
    try {
      const res = await axios.get(
        `https://ourheritage.runasp.net/api/HandiCrafts/${productId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.status === 200;
    } catch (err) {
      return false;
    }
  };

  // Updated fetchUserFavorites with validation
  const fetchUserFavorites = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId || !token) return;

    try {
      const res = await axios.get(
        `https://ourheritage.runasp.net/api/Favorites/user/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (Array.isArray(res.data)) {
        const validFavorites = {};
        const updatedProducts = [...allProducts];
        
        for (const fav of res.data) {
          const exists = await verifyProductExists(fav.handiCraftId);
          
          if (exists) {
            validFavorites[fav.handiCraftId] = true;
            
            const productIndex = updatedProducts.findIndex(p => p.id === fav.handiCraftId);
            if (productIndex !== -1) {
              updatedProducts[productIndex] = { 
                ...updatedProducts[productIndex], 
                favoriteId: fav.id 
              };
            }
          } else {
            // Remove invalid favorite from server
            await axios.delete(
              `https://ourheritage.runasp.net/api/Favorites/${fav.id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
          }
        }
        
        setAllProducts(updatedProducts);
        setLocalFavorites(validFavorites);
      }
    } catch (err) {
      console.error("Error fetching user favorites:", err);
    }
  };
  const timeAgoCustom = (utcDateString) => {
    if (!utcDateString) return "تاريخ غير متاح";
    
    try {
      let dateStr = utcDateString;
      if (dateStr.length === 10) {
        dateStr += "T" + new Date().toISOString().substring(11, 19) + "Z";
      }

      const date = dayjs.utc(dateStr);
      if (!date.isValid()) return "تاريخ غير صالح";
      
      const now = dayjs.utc();
      const diffInMilliseconds = now.diff(date);
      
      const diffInSeconds = Math.floor(diffInMilliseconds / 1000);
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      const diffInHours = Math.floor(diffInMinutes / 60);
      const diffInDays = Math.floor(diffInHours / 24);
      const diffInWeeks = Math.floor(diffInDays / 7);
      const diffInMonths = Math.floor(diffInDays / 30);
      const diffInYears = Math.floor(diffInMonths / 12);
    
      if (diffInSeconds < 5) {
        return 'الآن';
      } else if (diffInSeconds < 60) {
        return `منذ ${diffInSeconds} ثانية`;
      } else if (diffInMinutes < 60) {
        if (diffInMinutes === 1) return 'منذ دقيقة واحدة';
        if (diffInMinutes === 2) return 'منذ دقيقتين';
        if (diffInMinutes >= 3 && diffInMinutes <= 10) return `منذ ${diffInMinutes} دقائق`;
        return `منذ ${diffInMinutes} دقيقة`;
      } else if (diffInHours < 24) {
        if (diffInHours === 1) return 'منذ ساعة واحدة';
        if (diffInHours === 2) return 'منذ ساعتين';
        if (diffInHours >= 3 && diffInHours <= 10) return `منذ ${diffInHours} ساعات`;
        return `منذ ${diffInHours} ساعة`;
      } else if (diffInDays < 7) {
        if (diffInDays === 1) return 'منذ يوم واحد';
        if (diffInDays === 2) return 'منذ يومين';
        if (diffInDays >= 3 && diffInDays <= 10) return `منذ ${diffInDays} أيام`;
        return `منذ ${diffInDays} يوم`;
      } else if (diffInWeeks < 4) {
        if (diffInWeeks === 1) return 'منذ أسبوع واحد';
        if (diffInWeeks === 2) return 'منذ أسبوعين';
        if (diffInWeeks >= 3 && diffInWeeks <= 10) return `منذ ${diffInWeeks} أسابيع`;
        return `منذ ${diffInWeeks} أسبوع`;
      } else if (diffInMonths < 12) {
        if (diffInMonths === 1) return 'منذ شهر واحد';
        if (diffInMonths === 2) return 'منذ شهرين';
        if (diffInMonths >= 3 && diffInMonths <= 10) return `منذ ${diffInMonths} أشهر`;
        return `منذ ${diffInMonths} شهر`;
      } else {
        if (diffInYears === 1) return 'منذ سنة واحدة';
        if (diffInYears === 2) return 'منذ سنتين';
        if (diffInYears >= 3 && diffInYears <= 10) return `منذ ${diffInYears} سنوات`;
        return `منذ ${diffInYears} سنة`;
      }
    } catch (error) {
      console.error("خطأ في حساب التاريخ:", error, "التاريخ:", utcDateString);
      return "تاريخ غير متاح";
    }
  };

  // دالة تبديل حالة المفضلة (إضافة/حذف) لمنتج معيّن
 const toggleFavorite = async (productId) => {
  const exists = await verifyProductExists(productId);
  if (!exists) {
    alert("هذا المنتج لم يعد متاحاً");
    setLocalFavorites(prev => ({ ...prev, [productId]: false }));
    return;
  }
  const userId = Number(localStorage.getItem('userId'));
  const token = localStorage.getItem('userToken');

  if (!userId || !productId || !token) {
    console.error("userId أو productId أو token غير موجود!");
    alert("حدث خطأ: بيانات غير مكتملة.");
    return;
  }

  try {
    // تحقق هل المنتج موجود بالفعل في المفضلة
    const checkRes = await axios.get(
      `https://ourheritage.runasp.net/api/Favorites/handicraft/${productId}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    const favoriteData = checkRes.data;

    if (favoriteData?.id) {
      // إذا موجود، نحذفه
      await axios.delete(
        `https://ourheritage.runasp.net/api/Favorites/${favoriteData.id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      localStorage.setItem(`favorite-${productId}`, 'false');
      setFavorites(prev => prev.filter(p => p.id !== productId));
    } else {
      // إذا غير موجود نضيفه
      await axios.post(
        "https://ourheritage.runasp.net/api/Favorites/add",
        {
          userId,
          handiCraftId: productId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
        }
      );
      localStorage.setItem(`favorite-${productId}`, 'true');
    }
  } catch (err) {
    console.error('❌ خطأ أثناء التبديل في المفضلة:', err.response?.data || err.message);

    if (err.response?.status === 409) {
      alert('⚠️ هذا المنتج موجود بالفعل في المفضلة.');
    } else {
      alert('حدث خطأ أثناء التفاعل مع المفضلة.');
    }
  }
};


 const handleFavoriteClick = async (productId) => {
  const product = allProducts.find(p => p.id === productId);
  if (!product) return;

  const wasFav = localFavorites[productId];
  
  // تحديث واجهة المستخدم فوراً
  setLocalFavorites(prev => ({ ...prev, [productId]: !wasFav }));

  try {
    const userId = Number(localStorage.getItem("userId"));
    
    // محاولة الحصول على معرف المفضلة الحالي
    let favoriteId = product.favoriteId;
    
    // إذا لم يكن لدينا معرف، نحاول الحصول عليه من الخادم
    if (!favoriteId && wasFav) {
      try {
        const favResponse = await axios.get(
          `https://ourheritage.runasp.net/api/Favorites/handicraft/${productId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (favResponse.data) {
          favoriteId = favResponse.data.id;
        }
      } catch (fetchError) {
        console.warn("Failed to fetch favorite ID", fetchError);
      }
    }

    if (wasFav) {
      // إزالة من المفضلة
      if (!favoriteId) {
        // إذا لم نجد معرف، نبحث عن المفضلة للمستخدم الحالي
        const userFavorites = await axios.get(
          `https://ourheritage.runasp.net/api/Favorites/user/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        const fav = userFavorites.data.find(f => f.handiCraftId === productId);
        if (fav) {
          favoriteId = fav.id;
        } else {
          throw new Error("Favorite not found");
        }
      }
      
      await axios.delete(
        `https://ourheritage.runasp.net/api/Favorites/${favoriteId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // تحديث حالة المنتج
      setAllProducts(prev => prev.map(p => 
        p.id === productId ? { ...p, favoriteId: null } : p
      ));
    } else {
      // إضافة إلى المفضلة
      try {
        const response = await axios.post(
          "https://ourheritage.runasp.net/api/Favorites",
          {
            userId,
            handiCraftId: productId
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          }
        );
        
        // تحديث معرف المفضلة
        setAllProducts(prev => prev.map(p => 
          p.id === productId ? { ...p, favoriteId: response.data.id } : p
        ));
      } catch (addError) {
        if (addError.response?.status === 409) {
          // إذا كان المنتج مضافاً بالفعل، نحصل على المعرف
          const existingFav = await axios.get(
            `https://ourheritage.runasp.net/api/Favorites/handicraft/${productId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          if (existingFav.data?.id) {
            // تحديث الحالة المحلية
            setAllProducts(prev => prev.map(p => 
              p.id === productId ? { ...p, favoriteId: existingFav.data.id } : p
            ));
            
            // نبقى في حالة "مفضل"
            return;
          }
        }
        throw addError;
      }
    }
  } catch (error) {
    // التراجع عن التغيير في حالة الخطأ
    setLocalFavorites(prev => ({ ...prev, [productId]: wasFav }));
    
    console.error("❌ خطأ أثناء التبديل في المفضلة:", error);
    
    if (error.response?.status === 409) {
      alert("هذا المنتج مضاف بالفعل إلى المفضلة");
      // تحديث الحالة لتعكس الواقع
      setLocalFavorites(prev => ({ ...prev, [productId]: true }));
    } else {
      alert(error.response?.data?.message || "حدث خطأ أثناء التبديل في المفضلة");
    }
  }
};

// إضافة دالة لتحميل المفضلات بشكل دوري
useEffect(() => {
  const interval = setInterval(() => {
    if (token) {
      fetchUserFavorites();
    }
  }, 30000); // تحديث كل 30 ثانية
  
  return () => clearInterval(interval);
}, [token]);

// إضافة دالة لتحميل المفضلات عند التركيز على الصفحة
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible' && token) {
      fetchUserFavorites();
    }
  };
  
  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}, [token]);
useEffect(() => {
  const interval = setInterval(() => {
    if (token) fetchUserFavorites();
  }, 100000); // كل 5 دقائق
  
  return () => clearInterval(interval);
}, [token]);

  useEffect(() => {
    if (token) {
      fetchCategories();
      fetchProducts();
    }
  }, [token]);
  
  useEffect(() => {
    if (token && allProducts.length) {
      const userIds = Array.from(new Set(allProducts.map(p => p.userId)));
      userIds.forEach((id) => fetchUserData(id));
    }
  }, [allProducts, token]);

  useEffect(() => {
    setCurrentPage(1);
  }, [appliedFilters]);

  // إعادة تحميل المفضلات عند تغيير المستخدم أو التوكن
  useEffect(() => {
    if (token) {
      fetchCategories();
      fetchProducts();
      cleanInvalidFavorites(); // Clean invalid favorites on load
    }
  }, [token]);
  const filteredProducts = allProducts.filter((product) => {
    const matchesCategory =
      appliedFilters.categories.length === 0 ||
      appliedFilters.categories.includes(product.categoryId);
    
    const matchesPrice = product.price <= appliedFilters.price;
    
    return matchesCategory && matchesPrice;
  });

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const displayedProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  const handleApplyFilters = () => {
    setAppliedFilters({
      categories: selectedCategories,
      price: priceRange,
    });
  };

  const handleImageChange = (e) => {
    setNewProduct((p) => ({ ...p, image: e.target.files[0] }));
  };
  
  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    
    const { name, description, price, category, image } = newProduct;

    if (!name || !description || !price || !category || !image) {
      return alert("يرجى ملء جميع الحقول واختيار صورة");
    }

    const categoryId = parseInt(category);
    if (!categoryId) {
      return alert("فئة غير صالحة");
    }

    const formData = new FormData();
    formData.append("Title", name);
    formData.append("Description", description);
    formData.append("Price", price.toString());
    formData.append("CategoryId", categoryId.toString());
    formData.append("Images", image);

    try {
      const response = await axios.post(
        "https://ourheritage.runasp.net/api/HandiCrafts/create",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      
      alert("✅ تم إضافة المنتج بنجاح");
      setIsModalOpen(false);
      setNewProduct({
        name: "",
        description: "",
        price: "",
        category: "",
        image: null,
      });
      fetchProducts();
    } catch (error) {
      let errorMessage = "❌ فشل في إرسال المنتج";
      if (error.response) {
        errorMessage += `: ${error.response.data?.message || error.response.statusText}`;
      } else if (error.request) {
        errorMessage += ": لا يوجد اتصال بالخادم";
      } else {
        errorMessage += ": خطأ في إعداد الطلب";
      }
      alert(errorMessage);
    }
  };

  return (
    <div className={styles.shopContainer}>
      <div className={styles.filtersSidebar}>
        <h3 className={styles.filterTitle}>تصفية حسب</h3>
        
        <div className={styles.filterSection}>
          <h4>التصنيف</h4>
          {categories.map((cat) => (
            <label key={cat.id} className={styles.filterItem}>
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat.id)}
                onChange={() =>
                  setSelectedCategories((prev) =>
                    prev.includes(cat.id)
                      ? prev.filter((c) => c !== cat.id)
                      : [...prev, cat.id]
                  )
                }
              />
              {cat.name}
            </label>
          ))}
        </div>
        
        <div className={styles.filterSection}>
          <h4>السعر</h4>
          <div className={styles.priceFilter}>
            <input
              type="range"
              min="0"
              max="500"
              value={priceRange}
              onChange={(e) => setPriceRange(+e.target.value)}
            />
            <span>{priceRange} $</span>
          </div>
        </div>
        
        <button
          className={styles.applyButton}
          onClick={handleApplyFilters}
        >
          تطبيق
        </button>
        
        <button
          className={styles.applyButton}
          style={{ marginTop: "10px", backgroundColor: `#A67C52` }}
          onClick={() => setIsModalOpen(true)}
        >
          ➕ إضافة منتج
        </button>
        {/* رابط جديد للمفضلة */}
  <Link 
  to="/favorites" 
  className={styles.favoritesLink}
  style={{ display: 'block', marginTop: '15px' }}
>
  <button 
    className={styles.applyButton}
    style={{ 
      backgroundColor: '#B22222',  
      color: 'white',
      width: '100%',
      padding: '12px 0',
      border: 'none',
      borderRadius: '8px',
      fontSize: '1.1rem',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease'
    }}
  
  >
     منتجاتي المفضلة
  </button>
</Link>

      </div>

      {isModalOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>إضافة منتج جديد</h2>
            <form onSubmit={handleSubmitProduct}>
              <label>اسم المنتج</label>
              <input
                type="text"
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct((p) => ({ ...p, name: e.target.value }))
                }
              />
              <label>وصف المنتج</label>
              <textarea
                value={newProduct.description}
                onChange={(e) =>
                  setNewProduct((p) => ({
                    ...p,
                    description: e.target.value,
                  }))
                }
              />
              <label>السعر</label>
              <input
                type="number"
                value={newProduct.price}
                onChange={(e) =>
                  setNewProduct((p) => ({ ...p, price: e.target.value }))
                }
              />
              <label>الفئة</label>
              <select
                value={newProduct.category}
                onChange={(e) =>
                  setNewProduct((p) => ({ ...p, category: e.target.value }))
                }
              >
                <option value="">اختر الفئة</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <label>صورة المنتج</label>
              <input type="file" onChange={handleImageChange} />
              <div className={styles.modalActions}>
                <button type="submit">إضافة</button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className={styles.mainContent}>
        {loading ? (
          <div className="h-screen flex justify-center items-center">
            <ColorRing
              visible={true}
              height="80"
              width="80"
              ariaLabel="color-ring-loading"
              wrapperStyle={{}}
              wrapperClass="color-ring-wrapper"
              colors={['#e15b64', '#f47e60', '#f8b26a', '#abbd81', '#849b87']}
            />
          </div>
        ) : (
          <>
            <div className={styles.productsGrid}>
              {displayedProducts.map((p) => {
                const isFavorite = localFavorites[p.id] || false;
                
                return (
                  <div key={p.id} className={styles.productPost}>
                    <div className={styles.postHeader}>
                         <div className={styles.profileWrapper}>
                        <Link to={`/profile/${p.userId}`}>
     <img
  src={userMap[p.userId]?.profilePicture || profileimg}
  alt="User"
  className={styles.profileImage}
  onError={(e) => {
    e.target.onerror = null;
    e.target.src = profileimg;
  }}
/>


                        </Link>
                      </div>
                      <div>
                        <p className={styles.username}>
                          {userMap[p.userId]
                            ? `${userMap[p.userId].firstName} ${userMap[p.userId].lastName}`
                            : "مستخدم غير معروف"}
                        </p>
                        <p className={styles.postDate}>
                          {p.dateAdded ? timeAgoCustom(p.dateAdded) : "تاريخ غير متاح"}
                        </p>
                      </div>
                   
                    </div>

                    <Link to={`/product-details/${p.id}`}>
                      <img
                        src={p.imageOrVideo?.[0] || defaultProductImage}
                        alt={p.title}
                        className={styles.productImage}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = defaultProductImage;
                        }}
                      />
                    </Link>

                    <div className={styles.productInfo}>
                      <h3>{p.title}</h3>
                      <p>{p.description}</p>
                      <div className={styles.productFooter}>
                        <button
                          onClick={() => {
                            const cartItem = {
                              id: p.id,
                              name: p.title,
                              price: Number(p.price),
                              image: p.imageOrVideo?.[0] || p.image || defaultProductImage,
                              quantity: 1,
                            };
                            addToCart(cartItem);
                            alert("تمت إضافة المنتج إلى السلة");
                          }}
                          className={styles.cartButton}
                        >
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="20" 
                            height="20" 
                            fill="currentColor" 
                            viewBox="0 0 16 16"
                            style={{ marginLeft: '5px' }}
                          >
                            <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM3.102 4l1.313 7h8.17l1.313-7H3.102zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                          </svg>
                          <span className="font-semibold">{p.price}$</span>
                        </button>
                        
                        <div 
                          className={`${styles.favoriteButton} ${isFavorite ? styles.favorited : ''}`}
                          onClick={() => handleFavoriteClick(p.id)}
                          title={isFavorite ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
                        >
                          <FaHeart className={isFavorite ? styles.favoriteIconActive : styles.favoriteIcon} />
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            
            <div className={styles.pagination}>
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
              >
                السابق
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  className={currentPage === i + 1 ? styles.activePage : ""}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                التالي
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Shop;