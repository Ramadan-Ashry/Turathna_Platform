import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from "../../Context/CartContext";
import { TokenContext } from "../../Context/TokenContext"; // ✅ ربط التوكن

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems } = useCart();
  const { token } = useContext(TokenContext); // ✅ التوكن من السياق
  const [user, setUser] = useState(null);

  const [formData, setFormData] = useState({
    phone: '',
    city: ''
  });

  const [errors, setErrors] = useState({
    phone: '',
    city: ''
  });

  useEffect(() => {
    if (token) {
      const userData = parseJwt(token);
      setUser(userData);
    }
  }, [token]); // ✅ إعادة التحميل لو التوكن اتحدث

  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Error parsing JWT:', e);
      return null;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.phone.trim()) newErrors.phone = 'رقم الهاتف مطلوب';
    if (!formData.city.trim()) newErrors.city = 'المدينة مطلوبة';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayNow = () => {
    if (!cartItems || cartItems.length === 0) {
      alert('لا توجد منتجات في السلة لإتمام الشراء');
      return;
    }

    if (validateForm()) {
      navigate('/pay', {
        state: {
          shippingInfo: formData,
          userData: user,
          cartItems
        }
      });
    } else {
      alert('يرجى ملء جميع الحقول المطلوبة لإتمام الشراء');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5">
      <div className="bg-white p-8 rounded-lg w-full">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2 w-3/4 mx-auto">
            رقم الهاتف <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className={`w-3/4 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-100 mx-auto block ${
              errors.phone ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="أدخل رقم الهاتف"
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1 w-3/4 mx-auto">{errors.phone}</p>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2 w-3/4 mx-auto">
            المدينه <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            className={`w-3/4 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-100 mx-auto block ${
              errors.city ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="أدخل المدينة"
          />
          {errors.city && (
            <p className="text-red-500 text-sm mt-1 w-3/4 mx-auto">{errors.city}</p>
          )}
        </div>

        <button
          className="w-3/4 bg-[#a67c52] border border-main text-main py-2 px-4 rounded-md hover:bg-main hover:text-white transition-colors mx-auto block"
          onClick={handlePayNow}
          disabled={!cartItems || cartItems.length === 0}
        >
          ادفع الان
        </button>

        {(!cartItems || cartItems.length === 0) && (
          <p className="text-red-500 text-center mt-4">
            لا يوجد منتجات في السلة
          </p>
        )}

        
      </div>
    </div>
  );
}
