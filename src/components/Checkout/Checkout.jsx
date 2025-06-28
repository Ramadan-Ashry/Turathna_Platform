import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Checkout() {
  const navigate = useNavigate();
  
  // حالة للقيم والأخطاء
  const [formData, setFormData] = useState({
    phone: '',
    city: ''
  });
  
  const [errors, setErrors] = useState({
    phone: '',
    city: ''
  });

  // دالة لتحديث القيم
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // إزالة رسالة الخطأ عند الكتابة
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // دالة التحقق من الصحة
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'رقم الهاتف مطلوب';
    }
    
    if (!formData.city.trim()) {
      newErrors.city = 'المدينة مطلوبة';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayNow = () => {
    if (validateForm()) {
      navigate('/pay');
    } else {
      alert('يرجى ملء جميع الحقول المطلوبة لإتمام الشراء');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5">
      <div className="bg-white p-8 rounded-lg w-full">
        {/* حقل الهاتف */}
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

        {/* حقل المدينة */}
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

        {/* زر الدفع */}
        <button
          className="w-3/4 bg-[#a67c52] border border-main text-main py-2 px-4 rounded-md hover:bg-main hover:text-white transition-colors mx-auto block"
          onClick={handlePayNow}
        >
       ادفع الان
        </button>
      </div>
    </div>
  );
}