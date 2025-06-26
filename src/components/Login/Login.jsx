import React, { useState, useContext } from 'react';
import { useFormik } from 'formik';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { TokenContext } from '../../Context/TokenContext';
import background from './../../assets/background.jpg';
import styles from './Login.module.css';

export default function Login() {
  const { token, setToken } = useContext(TokenContext);
  const [userMessage, setUserMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  let navigate = useNavigate();

  const userFirstName = localStorage.getItem("firstName");
  const userLastName = localStorage.getItem("lastName");
  const userName = `${userFirstName} ${userLastName}`; 

  function validate(values) {
    let errors = {};

    if (!values.email) {
      errors.email = 'البريد الإلكتروني مطلوب';
    } 
    else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
      errors.email = 'بريد إلكتروني غير صحيح';
    }

    if (!values.password) {
      errors.password = "كلمة المرور مطلوبة";
    }

    return errors;
  }

  let formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validate,
    onSubmit: (values) => {
      loginForm(values);
    },
  });

  async function loginForm(values) {
    setIsLoading(true);
    try {
      const response = await axios.post("https://ourheritage.runasp.net/api/Auth/login", values, {
        headers: {
          "Content-Type": "multipart/form-data",
        }
      });

      if (response.data && response.data.model && response.data.model.token) {
        const { token, userId } = response.data.model;
        localStorage.setItem("userToken", token);   
        localStorage.setItem("userId", userId);  
        localStorage.setItem("userName", userName); 
        setToken(token);
        setUserMessage(response.data.message);
        setIsLoading(false);
        navigate('/'); 
      } else {
        throw new Error("Invalid response structure");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "حدث خطأ ما";
      setErrorMessage(errorMessage);
      setIsLoading(false);
    }
  }

  const handleCreateAccountClick = () => {
    navigate('/register');
  };

  return (
    <div className={styles.container} style={{ backgroundImage: `url(${background})` }}>
      <div className={styles.formContainer}>
        <h1 className='text-3xl text-center mb-6'>تسجيل الدخول</h1>
        {userMessage && (
          <div className="p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400" role="alert">
            <p>{userMessage}</p>
          </div>
        )}
        {errorMessage && (
          <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
            <p>{errorMessage}</p>
          </div>
        )}
        <form onSubmit={formik.handleSubmit}>
          <div className='my-2'>
            <label htmlFor="email" className="block mb-2 text-sm font-medium">البريد الإلكتروني</label>
            <input
              name="email"
              type="email"
              id="email"
              onChange={formik.handleChange}
              value={formik.values.email}
              onBlur={formik.handleBlur}
              className="border border-[#A68B55] text-white text-sm rounded-lg focus:ring-[#A68B55] focus:border-[#A68B55] block w-full p-2.5"
              placeholder="أدخل بريدك الإلكتروني"
            />
          </div>
          {formik.touched.email && formik.errors.email && (
            <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
              <p>{formik.errors.email}</p>
            </div>
          )}

          <div className='my-2'>
            <label htmlFor="password" className="block mb-2 text-sm font-medium">كلمة المرور</label>
            <input
              name="password"
              type="password"
              id="password"
              onChange={formik.handleChange}
              value={formik.values.password}
              onBlur={formik.handleBlur}
              className="border border-[#A68B55] text-white text-sm rounded-lg focus:ring-[#A68B55] focus:border-[#A68B55] block w-full p-2.5"
              placeholder="أدخل كلمة المرور"
            />
          </div>
          {formik.touched.password && formik.errors.password && (
            <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
              <p>{formik.errors.password}</p>
            </div>
          )}

          <div className='my-4 flex items-center justify-between'>
            <div className='flex items-center'>
              <label htmlFor="rememberMe" className="text-[#A68B55] text-sm">ابقَ متصلاً على هذا الجهاز</label>
            </div>
            <span onClick={() => navigate('/repassword')} className="text-sm text-[#A68B55] hover:underline cursor-pointer">
              نسيت كلمة المرور؟
            </span>
          </div>

          <div className='my-4 text-end'>
            {isLoading ? (
              <button type='submit' className='bg-[#2E230D] text-white px-4 py-2 rounded-lg w-full'>
                <i className='fa fa-spinner fa-spin'></i>
              </button>
            ) : (
              <button
                disabled={!(formik.isValid && formik.dirty)}
                type='submit' className='bg-[#2E230D] text-white px-4 py-2 rounded-lg w-full'>تسجيل الدخول</button>
            )}
          </div>

          <div className='text-center mt-4'>
            <p className="text-sm">
              لست عضوًا؟{' '}
              <span
                onClick={handleCreateAccountClick}
                className="text-[#A68B55] hover:underline cursor-pointer"
              >
                أنشئ حسابًا
              </span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
