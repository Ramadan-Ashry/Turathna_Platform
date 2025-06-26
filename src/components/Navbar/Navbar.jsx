import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  FaHandsHelping,
  FaUser,
  FaShoppingCart,
  FaBars,
  FaSearch
} from 'react-icons/fa';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import photo from "../../assets/Screenshot 2025-02-13 210809.png";
import styles from './Navbar.module.css';
import { TokenContext } from "../../Context/TokenContext";
import UserMenu from './UserMenu';
import NotificationBell from './notifications';
import ConversationListDropdown from './ConversationsList';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const { token } = useContext(TokenContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState(null);
  const searchRef = useRef(null);

  // تحديث بيانات المستخدم عند تغيير الـ token
  useEffect(() => {
    if (token) {
      const storedId = localStorage.getItem("userId");
      const storedName = localStorage.getItem("userName");
      setUserId(storedId);
      setUserName(storedName);
    } else {
      setUserId(null);
      setUserName(null);
    }
  }, [token]);

useEffect(() => {
  if (!token || searchQuery.length < 3) {
    setSearchResults([]);
    return;
  }

  const fetchAndFilterUsers = async () => {
    try {
      const res = await axios.get('https://ourheritage.runasp.net/api/Users', {
        params: { PageIndex: 1, PageSize: 100 },
        headers: { Authorization: `Bearer ${token}` }
      });

      const allUsers = res.data.items || [];

      // فلترة حسب الاسم
      const filtered = allUsers.filter((user) =>
        user.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
      );

      setSearchResults(filtered);
    } catch (err) {
      console.error('خطأ في جلب نتائج المستخدمين:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('userToken');
        navigate('/login');
      }
    }
  };

  fetchAndFilterUsers();
}, [searchQuery, token, navigate]);


  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchResults([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleShowSearch = () => setShowSearch(true);

  const handleLogout = async () => {
    try {
      await axios.post(
        'https://ourheritage.runasp.net/api/Auth/logout',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      localStorage.removeItem('userToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      setUserId(null);
      setUserName(null);
      navigate('/home2');
    } catch (error) {
      console.error('فشل تسجيل الخروج:', error);
    }
  };

return (
  <header className="bg-gradient-to-r from-[#8B4513] to-[#5D4037] text-white shadow-md h-24 fixed top-0 w-full z-30">
    <div className={styles.topBar}>
      <div className="flex items-center ml-6"><span>عربى</span></div>
    </div>

    <div className="container mx-auto flex justify-between items-center py-3 px-4 sm:px-6 lg:px-8 relative">
      {/* Logo */}
      <div className="logo flex items-center text-xl sm:text-2xl lg:text-3xl font-bold">
        <FaHandsHelping className="mr-2 text-[#E6D5B8] text-lg sm:text-xl lg:text-2xl" />
        <span>تراثنا</span>
      </div>

      {/* Desktop Navigation - Hidden on tablets and below */}
      {userId && (
        <nav className="hidden xl:block">
          <ul className="flex text-lg flex-row-reverse gap-6">
            <li><Link to="/admin" className={`${styles.navLink} ${location.pathname === '/admin' ? styles.activeLink : ''}`}>لوحة التحكم</Link></li>
            <li><Link to="/foryou" className={`${styles.navLink} ${location.pathname === '/foryou' ? styles.activeLink : ''}`}>مقترح لك</Link></li>
            <li><Link to="/shop" className={`${styles.navLink} ${location.pathname === '/shop' ? styles.activeLink : ''}`}>المتجر</Link></li>
            <li><Link to="/home" className={`${styles.navLink} ${location.pathname === '/home' ? styles.activeLink : ''}`}>المجتمع</Link></li>
            <li><Link to="/home2" className={`${styles.navLink} ${location.pathname === '/home2' ? styles.activeLink : ''}`}>الرئيسيه</Link></li>
          </ul>
        </nav>
      )}

      {/* Tablet Navigation - Visible only on tablets */}
      {userId && (
        <nav className="hidden lg:block xl:hidden">
          <ul className="flex text-sm flex-row-reverse gap-3">
            <li><Link to="/admin" className={`${styles.navLink} ${location.pathname === '/admin' ? styles.activeLink : ''} px-2 py-1`}>لوحة التحكم</Link></li>
            <li><Link to="/foryou" className={`${styles.navLink} ${location.pathname === '/foryou' ? styles.activeLink : ''} px-2 py-1`}>مقترح لك</Link></li>
            <li><Link to="/shop" className={`${styles.navLink} ${location.pathname === '/shop' ? styles.activeLink : ''} px-2 py-1`}>المتجر</Link></li>
            <li><Link to="/home" className={`${styles.navLink} ${location.pathname === '/home' ? styles.activeLink : ''} px-2 py-1`}>المجتمع</Link></li>
            <li><Link to="/home2" className={`${styles.navLink} ${location.pathname === '/home2' ? styles.activeLink : ''} px-2 py-1`}>الرئيسيه</Link></li>
          </ul>
        </nav>
      )}

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3 flex-row-reverse">
        {/* Mobile Menu Button - Show on tablets and mobile */}
        <FaBars
          className="xl:hidden text-xl sm:text-2xl cursor-pointer"
          onClick={() => setIsMenuOpen((prev) => !prev)}
        />

        {/* User Section */}
        {userId ? (
          <UserMenu userName={userName} photo={photo} onLogout={handleLogout} />
        ) : (
          <div className="flex gap-2 sm:gap-3">
            <Link 
              to="/login" 
              className="bg-[#2E230D] text-white px-2 sm:px-3 lg:px-4 py-1 sm:py-2 text-sm sm:text-base rounded-lg hover:bg-[#A68B55]"
            >
              تسجيل دخول
            </Link>
            <Link 
              to="/register" 
              className="bg-[#A68B55] text-white px-2 sm:px-3 lg:px-4 py-1 sm:py-2 text-sm sm:text-base rounded-lg hover:bg-[#2E230D]"
            >
              انشاء حساب
            </Link>
          </div>
        )}

        {/* Cart */}
        <div
          onClick={() => navigate('/cart')}
          className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-lg sm:text-xl text-white cursor-pointer"
        >
          <FaShoppingCart className="text-sm sm:text-lg" />
        </div>

        {/* Notifications */}
        <div className="hidden sm:block">
          <NotificationBell />
        </div>

        {/* Messages */}
        <div className="hidden sm:block">
          <ConversationListDropdown />
        </div>

        {/* Search - Responsive */}
        <div className="relative" ref={searchRef}>
          <div className="flex items-center">
            <input
              type="text"
              placeholder="ابحث عن الحرفيين..."
              className={`transition-all duration-300 ${
                showSearch 
                  ? 'w-48 sm:w-56 lg:w-64' 
                  : 'w-10 sm:w-12'
              } h-8 sm:h-10 px-1 py-3 sm:py-5 rounded-full border-2 border-[#E6D5B8] bg-white text-black outline-none text-sm sm:text-base`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2rem' }}
            />
            {!showSearch && (
              <FaSearch
                className="absolute left-3 sm:left-4 top-3 sm:top-4 text-black cursor-pointer text-sm sm:text-base"
                onClick={handleShowSearch}
              />
            )}
          </div>
          
          {searchResults.length > 0 && (
            <div className="absolute mt-1 w-full bg-white rounded shadow-lg z-50 text-black">
              <ul className="max-h-48 overflow-y-auto">
                {searchResults.map((user) => (
                  <li key={user.id} className="px-3 py-2 hover:bg-gray-100">
                    <Link to={`/profile/${user.id}`} className="flex items-center gap-2">
                      <img
                        src={user.profilePicture || 'https://via.placeholder.com/32'}
                        alt={user.fullName}
                        className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover"
                      />
                      <span className="text-sm sm:text-base">{user.fullName}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Mobile-only icons */}
        <div className="flex sm:hidden items-center gap-2">
          <div className="w-8 h-8 flex items-center justify-center">
            <NotificationBell />
          </div>
          <div className="w-8 h-8 flex items-center justify-center">
            <ConversationListDropdown />
          </div>
        </div>
      </div>
    </div>

    {/* Mobile Menu - Enhanced for tablets */}
    {isMenuOpen && userId && (
      <nav className="absolute top-24 right-0 w-full bg-[#5D4037] xl:hidden z-40">
        <ul className="flex flex-col text-base sm:text-lg lg:text-xl items-end p-4 gap-2 sm:gap-3">
          <li><Link to="/admin" onClick={() => setIsMenuOpen(false)} className={`${styles.navLink} ${location.pathname === '/admin' ? styles.activeLink : ''} block w-full text-right py-2`}>لوحة التحكم</Link></li>
          <li><Link to="/foryou" onClick={() => setIsMenuOpen(false)} className={`${styles.navLink} ${location.pathname === '/foryou' ? styles.activeLink : ''} block w-full text-right py-2`}>مقترح لك</Link></li>
          <li><Link to="/shop" onClick={() => setIsMenuOpen(false)} className={`${styles.navLink} ${location.pathname === '/shop' ? styles.activeLink : ''} block w-full text-right py-2`}>المتجر</Link></li>
          <li><Link to="/home" onClick={() => setIsMenuOpen(false)} className={`${styles.navLink} ${location.pathname === '/home' ? styles.activeLink : ''} block w-full text-right py-2`}>المجتمع</Link></li>
          <li><Link to="/home2" onClick={() => setIsMenuOpen(false)} className={`${styles.navLink} ${location.pathname === '/home2' ? styles.activeLink : ''} block w-full text-right py-2`}>الرئيسيه</Link></li>
          
          {/* Mobile-only menu items */}
          <div className="sm:hidden w-full border-t border-white/20 mt-2 pt-2">
            <li className="py-2">
              <div className="flex justify-end items-center gap-4">
                <span className="text-sm">الإشعارات والرسائل</span>
                <div className="flex gap-3">
                  <NotificationBell />
                  <ConversationListDropdown />
                </div>
              </div>
            </li>
          </div>
        </ul>
      </nav>
    )}
  </header>
);
}