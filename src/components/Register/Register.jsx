import React, { useState } from 'react';
import styles from "./Register.module.css";
import { useFormik } from 'formik';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [userMessage, setUserMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  let navigate = useNavigate();

  function validate(values) {
    let errors = {};
    if (!values.firstName || values.firstName.length < 3) {
      errors.firstName = "الاسم الأول يجب أن يكون على الأقل 3 أحرف";
    }
    if (!values.lastName || values.lastName.length < 3) {
      errors.lastName = "الاسم الأخير يجب أن يكون على الأقل 3 أحرف";
    }
    if (!values.email || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
      errors.email = 'بريد إلكتروني غير صحيح';
    }
    if (!values.password || values.password.length < 8) {
      errors.password = "كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل";
    }
    if (!values.confirmPassword || values.confirmPassword !== values.password) {
      errors.confirmPassword = "كلمة المرور غير متطابقة";
    }
    if (!values.dateOfBirth) {
      errors.dateOfBirth = "تاريخ الميلاد مطلوب";
    }
    if (!values.gender) {
      errors.gender = "النوع مطلوب";
    }
    return errors;
  }

  let formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      dateOfBirth: "",
      gender: ""
    },
    validate,
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        console.log("Data being sent to API:", values); 

        const response = await axios.post("https://ourheritage.runasp.net/api/Auth/register", values, {
          headers: {
            "Content-Type": "multipart/form-data",
          }
        });

        console.log("Response from API:", response.data); 

        if (response.data.isSucceeded) {
          setUserMessage("تم التسجيل بنجاح");

         
          const fullName = `${values.firstName} ${values.lastName}`;
          localStorage.setItem("userName", fullName); 
          setTimeout(() => {
            navigate('/');
          }, 1000); 

        } else {
          setErrorMessage(response.data.message || "حدث خطأ أثناء التسجيل");
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || "حدث خطأ أثناء التسجيل";
        console.error("Error during registration:", errorMessage);

        if (errorMessage.includes("email already exists")) {
          setErrorMessage("البريد الإلكتروني مستخدم بالفعل");
        } else {
          setErrorMessage(errorMessage);
        }
      }
      setIsLoading(false);
    },
  });

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <h1 className='text-3xl text-center mb-6'>إنشاء حساب</h1>
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
            <label style={{fontSize:"18px" , color:"beige"}}>الاسم الأول</label>
            <input
              name="firstName"
              onChange={formik.handleChange}
              value={formik.values.firstName}
              placeholder="الاسم الأول"
            />
            {formik.errors.firstName && <div className="text-red-500">{formik.errors.firstName}</div>}
          </div>
          <div className='my-2'>
            <label style={{fontSize:"18px" , color:"beige"}}>الاسم الأخير</label>
            <input
              name="lastName"
              onChange={formik.handleChange}
              value={formik.values.lastName}
              placeholder="الاسم الأخير"
            />
            {formik.errors.lastName && <div className="text-red-500">{formik.errors.lastName}</div>}
          </div>
          <div className='my-2'>
            <label style={{fontSize:"18px" , color:"beige"}}>البريد الإلكتروني</label>
            <input
              name="email"
              type="email"
              onChange={formik.handleChange}
              value={formik.values.email}
              placeholder="البريد الإلكتروني"
            />
            {formik.errors.email && <div className="text-red-500">{formik.errors.email}</div>}
          </div>
          <div className='my-2'>
            <label style={{fontSize:"18px" , color:"beige"}}>كلمة المرور</label>
            <input
              name="password"
              type="password"
              onChange={formik.handleChange}
              value={formik.values.password}
              placeholder="كلمة المرور"
            />
            {formik.errors.password && <div className="text-red-500">{formik.errors.password}</div>}
          </div>
          <div className='my-2'>
            <label style={{fontSize:"18px" , color:"beige"}}>تأكيد كلمة المرور</label>
            <input
              name="confirmPassword"
              type="password"
              onChange={formik.handleChange}
              value={formik.values.confirmPassword}
              placeholder="تأكيد كلمة المرور"
            />
            {formik.errors.confirmPassword && <div className="text-red-500">{formik.errors.confirmPassword}</div>}
          </div>
          <div className='my-2'>
            <label style={{fontSize:"18px" , color:"beige"}}>تاريخ الميلاد</label>
            <input
              name="dateOfBirth"
              type="date"
              onChange={formik.handleChange}
              value={formik.values.dateOfBirth}
            />
            {formik.errors.dateOfBirth && <div className="text-red-500">{formik.errors.dateOfBirth}</div>}
          </div>
         <div className='my-2'>
 <label style={{fontSize:"18px" , color:"beige"}}>النوع</label>
 <div className='flex gap-12 mt-2'>
   <label className='flex items-center justify-center gap-2'>
     <input
       type="radio"
       name="gender"
       value="1"
       checked={formik.values.gender === "1"}
       onChange={formik.handleChange}
       className='w-4 h-4 mt-2 '
     />
     <span style={{fontSize:"18px" , color:"beige" , marginRight:"10px"  }}>ذكر</span>
   </label>
   <label className='flex items-center gap-2'>
     <input
       type="radio"
       name="gender"
       value="0"
       checked={formik.values.gender === "0"}
       onChange={formik.handleChange}
       className='w-4 h-4 mt-2'
     />
     <span style={{fontSize:"18px" , color:"beige" ,marginRight:"10px" }}>أنثى</span>
   </label>
 </div>
 {formik.errors.gender && <div className="text-red-500">{formik.errors.gender}</div>}
</div>
          <button
            type="submit"
            disabled={isLoading}
            className='bg-[#2E230D] text-white px-4 py-2 rounded-lg w-full'
          >
            {isLoading ? "جارٍ التحميل..." : "إنشاء حساب"}
          </button>
        </form>
      </div>
    </div>
  );
}
