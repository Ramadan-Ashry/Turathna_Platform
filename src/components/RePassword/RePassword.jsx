import React, { useState, useContext } from 'react';
import background from "./../../assets/background.jpg";
import styles from "./RePassword.module.css";
import { useFormik } from 'formik';
import { useNavigate } from 'react-router-dom';
import { TokenContext } from "../../Context/TokenContext";

export default function RePassword() {
  const [userMessage, setUserMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  let navigate = useNavigate();
  const { token } = useContext(TokenContext);

  function validate(values) {
    let errors = {};
    if (!values.email) {
      errors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
      errors.email = 'بريد إلكتروني غير صحيح';
    }
    return errors;
  }

  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validate,
    onSubmit: async (values) => {
      setIsLoading(true);
      setErrorMessage(null);
      setUserMessage(null);
      
      try {
        const requestData = new URLSearchParams();
        requestData.append('Email', values.email);
        
        const response = await fetch(
          "https://ourheritage.runasp.net/api/Auth/forgot-password",
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              ...(token && { 'Authorization': `Bearer ${token}` })
            },
            body: requestData.toString()
          }
        );

        if (response.ok) {
          const data = await response.text();
          setUserMessage(data || "تم إرسال رمز التحقق إلى بريدك الإلكتروني");
          localStorage.setItem("recoveryEmail", values.email);
          setTimeout(() => {
            navigate('/otp');
          }, 1500);
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || `خطأ في الخادم: ${response.status}`);
        }
      } catch (error) {
        console.error("Error details:", error);
        
        // معالجة خطأ 400 بشكل خاص
        if (error.message.includes('400')) {
          setErrorMessage("طلب غير صالح: يرجى التحقق من صحة البريد الإلكتروني");
        } else {
          setErrorMessage(error.message || "حدث خطأ ما");
        }
      } finally {
        setIsLoading(false);
      }
    }
  });

  return (
    <div className={styles.container} style={{ backgroundImage: `url(${background})` }}>
      <div className={styles.formContainer}>
        <h1 className='text-3xl text-center mb-6'>إعادة تعيين كلمة المرور</h1>

        {userMessage && <div className={styles.successMessage}>{userMessage}</div>}
        {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}

        <form onSubmit={formik.handleSubmit}>
          <div className='my-2'>
            <label htmlFor="email" className="block mb-4 text-xl text-[beige] font-medium text-right w-full">البريد الإلكتروني</label>
            <input
              name="email"
              type="email"
              id="email"
              onChange={formik.handleChange}
              value={formik.values.email}
              onBlur={formik.handleBlur}
              className="border border-[#A68B55] bg-[#A68B55] text-white text-sm rounded-lg focus:ring-[#A68B55] focus:border-[#A68B55] block w-full p-2.5 placeholder-white placeholder-opacity-100"
              placeholder="example@gmail.com"
            />
          </div>
          {formik.touched.email && formik.errors.email && (
            <div className={styles.errorMessage}>{formik.errors.email}</div>
          )}
          <div className='my-4 text-end'>
            {isLoading ? (
              <button type='submit' className='bg-[#2E230D] text-white px-4 py-2 rounded-lg w-full'>
                <i className='fa fa-spinner fa-spin'></i>
              </button>
            ) : (
              <button type='submit' className='bg-[#2E230D] text-white px-4 py-2 rounded-lg w-full'>طلب رابط استعادة</button>
            )}
          </div>
          <div className='text-center mt-4'>
            <p className="text-sm">
              <span onClick={() => navigate('/login')} className="text-[beige] hover:underline cursor-pointer">الرجوع إلى تسجيل الدخول</span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}