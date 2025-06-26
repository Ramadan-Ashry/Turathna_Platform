import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import borderPattern from '../../assets/pattern.png';
import man from '../../assets/img1.webp';
import man2 from '../../assets/p1.jpg';
import AboutSection from './about';
import video from '../../assets/hero.mp4';
import style from './home2.module.css';
import video2 from '../../assets/carve.mp4';
import MessagingDropdown from '../Navbar/MessagingDropdown.jsx';
import background from '../../assets/background.jpg';
import { FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Footer from "../Footer/Footer";
import Features from '../Landing/Feature.jsx';
import { TokenContext } from '../../Context/TokenContext.jsx';

const HandicraftsHomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const productsContainerRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);

  const { isAuthenticated, token } = useContext(TokenContext);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          `https://ourheritage.runasp.net/api/HandiCrafts?PageIndex=1&PageSize=12`,
          {
            headers: {
              Accept: 'text/plain',
              Authorization: `Bearer ${token}`  },
          }
        );
        setProducts(response.data.items || []);
        setLoading(false);
      } catch (err) {
        setError('فشل في تحميل المنتجات. حاول مرة أخرى لاحقًا.');
        setLoading(false);
      }
    };

    fetchProducts();
  }, [token]);

  useEffect(() => {
    if (products.length > 0 && !isHovering) {
      const interval = setInterval(() => {
        setCurrentProductIndex((prevIndex) => 
          (prevIndex + 1) % Math.ceil(products.length / 4)
        );
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [products, isHovering]);

  const getCurrentProducts = () => {
    const startIndex = currentProductIndex * 4;
    return products.slice(startIndex, startIndex + 4);
  };

  const handleDotClick = (index) => {
    setCurrentProductIndex(index);
  };

  return (
    <div className="min-h-screen text-[#5C4033] font-serif">
      {/* Navbar */}
      <div className="relative h-screen flex items-center justify-center">
        {/* الفيديو */}
        <video
          autoPlay
          loop
          muted
          className="absolute w-full h-full object-cover"
        >
          <source src={video} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* طبقة شفافة تغطي الفيديو */}
        <div className="absolute w-full h-full bg-[rgba(62,34,15,0.3)] z-10"></div>

        {/* النصوص فوق الفيديو */}
        <section className="hero bg-cover bg-center h-[60vh] flex items-center justify-center text-center relative z-20">
          <div className=" p-8 rounded-lg max-w-4xl mx-4">
            <h1 className="text-5xl md:text-5xl font-bold mb-4 text-white">
              منصة تراثنا للصناعات والحرف العربية اليدوية
            </h1>
            <p className="text-lg md:text-2xl text-white mb-8">
              اكتشف تراثنا الغني عبر متجر إلكتروني يعرض أجمل الحرف اليدوية، وورش تعليمية مباشرة مع الحرفيين، ومجتمع متكامل لعشاق التراث العربي
            </p>
            <Link
              to="/register"
              className="btn bg-[#8B4513] text-white py-3 px-6 rounded font-semibold hover:bg-[#5D4037] transition transform hover:-translate-y-1 inline-flex items-center"
            >
              استكشف الآن
              <FaArrowLeft className="mr-2" />
            </Link>
          </div>
        </section>
      </div>

      <section className="bg-[#f8f6e8] py-20 relative">
        {/* النص العربي عنّا */}
        <div className="max-w-6xl mx-auto text-center px-4 mt-24 mb-32 !font-cairo">
          <h2 className="text-4xl md:text-5xl font-bold text-[#3b312a] mb-6">
            بأيدٍ عربيه ماهرة، ننسج حكاية المستقبل من خيوط الماضي.
          </h2>
          <p className="text-[#3b312a] text-3xl leading-relaxed">
            نؤمن بأن الحِرفة ليست مجرّد منتج، بل قصة تُروى بروح الأصالة. <br />
            نعمل مع الحرفيين لصناعة قطع تعبّر عن تراثنا… بهويةٍ معاصرة.
          </p>
        </div>

        <div className="flex flex-col md:flex-row mt-10">
          {/* فيديو يسار (لاصق بالحافة) */}
          <div className="w-64 md:w-1/3">
            <video
              autoPlay
              loop
              muted
              src={video}
              playsInline
              className="w-64 h-[700px] object-cover shadow-md"
            />
          </div>

          {/* الصور في المنتصف */}
          <div className="flex-grow flex flex-wrap gap-4 w-full justify-start items-start px-2">
            <img
              src={man}
              alt="clay1"
              className="w-[400px] h-72 object-cover shadow"
            />
            <img
              src={man2}
              alt="heritage wall"
              className="w-[300px] h-65 mr-28 mt-36 object-cover shadow"
            />
            <img
              src={man2}
              alt="palms"
              className="w-[350px] h-64 object-cover shadow"
            />
            <img
              src={man}
              alt="clay2"
              className="w-[300px] h-[150px] mr-[160px] object-cover shadow"
            />
          </div>

          {/* فيديو يمين (لاصق بالحافة) */}
          <div className="w-96 md:w-[40%]">
            <video
              autoPlay
              loop
              muted
              src={video2}
              playsInline
              className="w-full h-[750px] object-cover shadow-md"
            />
          </div>
        </div>

        <Features />

        {/* Products Cards Section */}
        <section className="max-w-6xl mx-auto px-4 py-12">
          <h2 className="text-4xl font-bold text-[#3b312a] text-center mb-10 !font-cairo">
            منتجاتنا المميزة
          </h2>
          {loading ? (
            <p className="text-center text-[#5C4033] !font-cairo">جارٍ تحميل المنتجات...</p>
          ) : error ? (
            <p className="text-center text-red-600 !font-cairo">{error}</p>
          ) : products.length === 0 ? (
            <p className="text-center text-[#5C4033] !font-cairo">لا توجد منتجات لعرضها.</p>
          ) : (
            <div 
              className="relative"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <div 
                ref={productsContainerRef}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 transition-opacity duration-500 ease-in-out"
              >
                {getCurrentProducts().map((product) => (
                  <Link
                    to={`/product/${product.id}`}
                    key={`${product.id}-${currentProductIndex}`}
                    className="bg-white rounded-lg shadow-md overflow-hidden transform transition hover:scale-105 flex flex-col h-full"
                  >
                    <img
                      src={product.imageOrVideo[0] || man}
                      alt={product.title}
                      className="w-full h-48 object-cover transition-opacity duration-300"
                      onError={(e) => { e.target.src = man; }}
                    />
                    <div className="p-4 flex-grow">
                      <h3 className="text-lg font-semibold text-[#3b312a] mb-2 !font-cairo">
                        {product.title}
                      </h3>
                      <p className="text-[#5C4033] text-sm mb-3 !font-cairo line-clamp-2">
                        {product.description}
                      </p>
                      <p className="text-[#8B4513] font-bold text-lg !font-cairo mt-auto">
                        {product.price} ر.س
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="flex justify-center mt-8 space-x-2">
                {Array.from({ length: Math.ceil(products.length / 4) }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleDotClick(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentProductIndex ? 'bg-[#8B4513] w-6' : 'bg-gray-300'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
              <div className="text-center mt-8">
                <Link
                  to={isAuthenticated ? "/shop" : "/login"}
                  className="bg-[#8B4513] text-white py-3 px-8 rounded-lg font-semibold hover:bg-[#5D4037] transition inline-block !font-cairo text-lg shadow-md hover:shadow-lg"
                >
                  عرض جميع المنتجات
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* زر الرجوع للأعلى */}
        <button
          className="fixed bottom-6 w-14 h-14 left-6 bg-[#9e4f1b] text-white p-3 rounded-full shadow-md hover:bg-[#c2601e] transition transform hover:scale-110"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          ↑
        </button>
      </section>

      <Footer />
    </div>
  );
};

export default HandicraftsHomePage;