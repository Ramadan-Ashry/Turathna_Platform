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
  const [userImage, setUserImage] = useState(null); // ✅ صورة المستخدم
  const [isAdmin, setIsAdmin] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    if (token) {
      const storedId = localStorage.getItem("userId");
      const storedName = localStorage.getItem("userName");
      setUserId(storedId);
      setUserName(storedName);

      const storedImage = localStorage.getItem("userImage");
      if (storedImage) {
        setUserImage(storedImage);
      } else {
        axios.get(`https://ourheritage.runasp.net/api/Users/${storedId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => {
          const image = res.data?.profilePicture;
          if (image) {
            setUserImage(image);
            localStorage.setItem("userImage", image);
          }
        })
        .catch(err => {
          console.error("خطأ في جلب صورة المستخدم:", err);
        });
      }
    } else {
      setUserId(null);
      setUserName(null);
      setUserImage(null);
    }
  }, [token]);

  useEffect(() => {
    const checkIfAdmin = async () => {
      if (!token) {
        setIsAdmin(false);
        return;
      }

      try {
        const res = await axios.get('https://ourheritage.runasp.net/api/Auth/is-admin', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 200 && res.data?.isAdmin === true) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        setIsAdmin(false);
      }
    };

    checkIfAdmin();
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
      localStorage.removeItem('userImage');
      setUserId(null);
      setUserName(null);
      setUserImage(null);
      setIsAdmin(false);
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
        <div className="logo flex items-center text-xl sm:text-2xl lg:text-3xl font-bold">
          <FaHandsHelping className="mr-2 text-[#E6D5B8] text-lg sm:text-xl lg:text-2xl" />
          <span>تراثنا</span>
        </div>

        {userId && (
          <nav className="hidden xl:block">
            <ul className="flex text-lg flex-row-reverse gap-6">
              {isAdmin && <li><Link to="/admin" className={`${styles.navLink} ${location.pathname === '/admin' ? styles.activeLink : ''}`}>لوحة التحكم</Link></li>}
              <li><Link to="/foryou" className={`${styles.navLink} ${location.pathname === '/foryou' ? styles.activeLink : ''}`}>مقترح لك</Link></li>
              <li><Link to="/shop" className={`${styles.navLink} ${location.pathname === '/shop' ? styles.activeLink : ''}`}>المتجر</Link></li>
              <li><Link to="/home" className={`${styles.navLink} ${location.pathname === '/home' ? styles.activeLink : ''}`}>المجتمع</Link></li>
              <li><Link to="/home2" className={`${styles.navLink} ${location.pathname === '/home2' ? styles.activeLink : ''}`}>الرئيسيه</Link></li>
            </ul>
          </nav>
        )}

        <div className="flex items-center gap-2 sm:gap-3 flex-row-reverse">
          <FaBars
            className="xl:hidden text-xl sm:text-2xl cursor-pointer"
            onClick={() => setIsMenuOpen((prev) => !prev)}
          />

          {userId ? (
            <UserMenu userName={userName} photo={userImage || photo} onLogout={handleLogout} />
          ) : (
            <div className="flex gap-2 sm:gap-3">
              <Link to="/login" className="bg-[#2E230D] text-white px-3 py-2 rounded-lg hover:bg-[#A68B55]">تسجيل دخول</Link>
              <Link to="/register" className="bg-[#A68B55] text-white px-3 py-2 rounded-lg hover:bg-[#2E230D]">انشاء حساب</Link>
            </div>
          )}

          <div onClick={() => navigate('/cart')} className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer">
            <FaShoppingCart />
          </div>

          <div className="hidden sm:block"><NotificationBell /></div>
          <div className="hidden sm:block"><ConversationListDropdown /></div>

          <div className="relative" ref={searchRef}>
            <div className="flex items-center">
              <input
                type="text"
                placeholder="ابحث عن الحرفيين..."
                className={`transition-all duration-300 ${showSearch ? 'w-48 sm:w-56 lg:w-64' : 'w-10 sm:w-12'} h-8 sm:h-10 px-1 py-3 sm:py-5 rounded-full border-2 border-[#E6D5B8] bg-white text-black outline-none text-sm sm:text-base`}
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
                        <img src={user.profilePicture || 'https://via.placeholder.com/32'} alt={user.fullName} className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover" />
                        <span className="text-sm sm:text-base">{user.fullName}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {isMenuOpen && userId && (
        <nav className="absolute top-24 right-0 w-full bg-[#5D4037] xl:hidden z-40">
          <ul className="flex flex-col text-base sm:text-lg lg:text-xl items-end p-4 gap-2 sm:gap-3">
            {isAdmin && <li><Link to="/admin" onClick={() => setIsMenuOpen(false)} className={`${styles.navLink} ${location.pathname === '/admin' ? styles.activeLink : ''} block w-full text-right py-2`}>لوحة التحكم</Link></li>}
            <li><Link to="/foryou" onClick={() => setIsMenuOpen(false)} className={`${styles.navLink} ${location.pathname === '/foryou' ? styles.activeLink : ''} block w-full text-right py-2`}>مقترح لك</Link></li>
            <li><Link to="/shop" onClick={() => setIsMenuOpen(false)} className={`${styles.navLink} ${location.pathname === '/shop' ? styles.activeLink : ''} block w-full text-right py-2`}>المتجر</Link></li>
            <li><Link to="/home" onClick={() => setIsMenuOpen(false)} className={`${styles.navLink} ${location.pathname === '/home' ? styles.activeLink : ''} block w-full text-right py-2`}>المجتمع</Link></li>
            <li><Link to="/home2" onClick={() => setIsMenuOpen(false)} className={`${styles.navLink} ${location.pathname === '/home2' ? styles.activeLink : ''} block w-full text-right py-2`}>الرئيسيه</Link></li>
          </ul>
        </nav>
      )}
    </header>
  );
}
