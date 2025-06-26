import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Share2, MessageCircle, Star, TrendingUp, Clock, Filter, RefreshCw, User, Calendar, Tag } from 'lucide-react';
import { TokenContext } from '../../Context/TokenContext';

const PostCard = ({ post, recommendation }) => {
  const [isLiked, setIsLiked] = useState(() => {
    // Initialize state from localStorage
    return JSON.parse(localStorage.getItem(`like-${post.itemId}`)) || false;
  });

  useEffect(() => {
    // Save liked state to localStorage whenever it changes
    localStorage.setItem(`like-${post.itemId}`, JSON.stringify(isLiked));
  }, [isLiked, post.itemId]);

  const handleLikeClick = (e) => {
    e.preventDefault(); // Prevent Link navigation
    e.stopPropagation(); // Prevent event bubbling
    setIsLiked(!isLiked);
  };

  return (
    <Link to={`/products/${post.itemId}`} className="block">
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105 flex flex-col min-h-[450px]">
        <div className="p-6 flex flex-col flex-grow">
          {post.images?.[0] && (
            <img
              src={post.images[0]}
              alt={post.title}
              className="w-full h-48 object-cover rounded-lg mb-4"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = defaultImage;
              }}
            />
          )}
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-bold text-xl text-[#5C4033] leading-tight line-clamp-2">{post.title}</h3>
            <div className="flex items-center bg-[#F5DEB3] px-2 py-1 rounded-full">
              <Star className="w-4 h-4 text-[#8B4513] mr-1" />
              <span className="text-sm font-medium text-[#5C4033]">{recommendation.score.toFixed(2)}</span>
            </div>
          </div>
          
          <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-3 flex-grow">
            {post.content && post.content.length > 5 ? post.content : 'لا يوجد وصف متاح'}
          </p>
          
          <div className="flex items-center text-xs text-gray-500 mb-3 gap-4">
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <Link 
                to={`/profile/${post.userId}`}
                className="hover:text-[#8B4513] hover:underline transition-colors cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              >
                {post.creator?.fullName || `المستخدم #${post.userId}`}
              </Link>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{post.dateAdded ? new Date(post.dateAdded).toLocaleDateString('ar-EG') : 'غير متاح'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Tag className="w-3 h-3" />
              <span>{post.categoryName || 'غير محدد'}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-1 mb-4">
            {recommendation.recommendationFactors?.map((factor, index) => (
              <span key={index} className="bg-[#E6D3A3] text-[#5C4033] px-2 py-1 rounded-full text-xs">
                {factor}
              </span>
            ))}
          </div>
          
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
            <div className="flex items-center gap-3">
              <button 
                className={`flex items-center gap-1 transition-colors ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
                onClick={handleLikeClick}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500' : ''}`} />
                <span className="text-sm">إعجاب</span>
              </button>
            
            </div>
            <span className="text-xs bg-[#8B4513] text-white px-2 py-1 rounded-full">
              منتج حرفي
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

const CulturalCard = ({ item, recommendation }) => {
  const [isLiked, setIsLiked] = useState(() => {
    // Initialize state from localStorage
    return JSON.parse(localStorage.getItem(`like-${item.itemId}`)) || false;
  });

  useEffect(() => {
    // Save liked state to localStorage whenever it changes
    localStorage.setItem(`like-${item.itemId}`, JSON.stringify(isLiked));
  }, [isLiked, item.itemId]);

  const handleLikeClick = (e) => {
    e.preventDefault(); // Prevent Link navigation
    e.stopPropagation(); // Prevent event bubbling
    setIsLiked(!isLiked);
  };

  return (
    <Link to={`/articles/${item.itemId}`} className="block">
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105 flex flex-col min-h-[450px]">
        <div className="p-6 flex flex-col flex-grow">
          {item.images?.[0] && (
            <img
              src={item.images[0]}
              alt={item.title}
              className="w-full h-48 object-cover rounded-lg mb-4"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = defaultImage;
              }}
            />
          )}
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-bold text-xl text-[#5C4033] leading-tight line-clamp-2">{item.title}</h3>
            <div className="flex items-center bg-[#F5DEB3] px-2 py-1 rounded-full">
              <Star className="w-4 h-4 text-[#8B4513] mr-1" />
              <span className="text-sm font-medium text-[#5C4033]">{recommendation.score.toFixed(2)}</span>
            </div>
          </div>
          
          <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-3 flex-grow">
            {item.content && item.content.length > 5 ? item.content : 'لا يوجد وصف متاح'}
          </p>
          
          <div className="flex items-center text-xs text-gray-500 mb-3 gap-4">
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <Link 
                to={`/profile/${item.userId}`}
                className="hover:text-[#8B4513] hover:underline transition-colors cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              >
                {item.creator?.fullName || `الكاتب #${item.userId}`}
              </Link>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{item.dateAdded ? new Date(item.dateAdded).toLocaleDateString('ar-EG') : 'غير متاح'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Tag className="w-3 h-3" />
              <span>{item.categoryName || 'غير محدد'}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-1 mb-4">
            {recommendation.recommendationFactors?.map((factor, index) => (
              <span key={index} className="bg-[#E6D3A3] text-[#5C4033] px-2 py-1 rounded-full text-xs">
                {factor}
              </span>
            ))}
          </div>
          
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
            <div className="flex items-center gap-3">
              <button 
                className={`flex items-center gap-1 transition-colors ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
                onClick={handleLikeClick}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500' : ''}`} />
                <span className="text-sm">إعجاب</span>
              </button>
           
            </div>
            <span className="text-xs bg-[#8B4513] text-white px-2 py-1 rounded-full">
              مقال ثقافي
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

const EmptyState = ({ activeTab }) => (
  <div className="flex flex-col items-center justify-center py-16">
    <div className="w-24 h-24 bg-[#F5DEB3] rounded-full flex items-center justify-center mb-4">
      {activeTab === 'handicraft' ? (
        <Star className="w-12 h-12 text-[#8B4513]" />
      ) : activeTab === 'cultural' ? (
        <TrendingUp className="w-12 h-12 text-[#8B4513]" />
      ) : (
        <Filter className="w-12 h-12 text-[#8B4513]" />
      )}
    </div>
    <h3 className="text-xl font-bold text-[#5C4033] mb-2">لا توجد توصيات متاحة</h3>
    <p className="text-gray-600 text-center max-w-md">
      لم نتمكن من العثور على توصيات مناسبة لك في هذه الفئة. جرب تصفح فئات أخرى أو عد لاحقاً.
    </p>
  </div>
);

const ErrorState = ({ onRetry }) => (
  <div className="flex flex-col items-center justify-center py-16">
    <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
      <RefreshCw className="w-12 h-12 text-red-500" />
    </div>
    <h3 className="text-xl font-bold text-red-600 mb-2">حدث خطأ في تحميل التوصيات</h3>
    <p className="text-gray-600 text-center max-w-md mb-4">
      نأسف، حدث خطأ أثناء تحميل التوصيات. يرجى المحاولة مرة أخرى.
    </p>
    <button 
      onClick={onRetry}
      className="bg-[#8B4513] text-white px-6 py-2 rounded-lg hover:bg-[#6d3410] transition-colors"
    >
      المحاولة مرة أخرى
    </button>
  </div>
);

const RecommendationsPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState(null);
  const { token } = useContext(TokenContext);

  const fetchRecommendations = async () => {
    if (!token) {
      setError('لم يتم العثور على رمز المصادقة. يرجى تسجيل الدخول.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const url = `https://ourheritage.runasp.net/api/Recommendation/for-user?pageNumber=1&pageSize=10`;
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      const combinedRecommendations = [
        ...(data.recommendedArticles || []).map(item => ({
          item: {
            itemType: 'CulturalArticle',
            id: item.itemId,
            itemId: item.itemId,
            title: item.title,
            content: item.content,
            images: item.images,
            categoryName: item.categoryName,
            userId: item.creator?.userId,
            creator: item.creator,
            dateAdded: item.dateAdded || new Date().toISOString(),
            price: item.price,
          },
          score: item.recommendationScore,
        })),
        ...(data.recommendedHandicrafts || []).map(item => ({
          item: {
            itemType: 'HandiCraft',
            id: item.itemId,
            itemId: item.itemId,
            title: item.title,
            content: item.content,
            images: item.images,
            categoryName: item.categoryName,
            userId: item.creator?.userId,
            creator: item.creator,
            dateAdded: item.dateAdded || new Date().toISOString(),
            price: item.price,
          },
          score: item.recommendationScore,
        })),
      ].sort((a, b) => b.score - a.score);

      setRecommendations(combinedRecommendations);
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
      if (error.name === 'AbortError') {
        setError('انتهت مهلة الاتصال. يرجى المحاولة مرة أخرى.');
      } else if (error.message.includes('401')) {
        setError('انتهت صلاحية جلسة المستخدم. يرجى تسجيل الدخول مرة أخرى.');
      } else if (error.message.includes('404')) {
        setError('لم يتم العثور على الخدمة المطلوبة.');
      } else {
        setError('حدث خطأ في تحميل التوصيات. يرجى المحاولة مرة أخرى.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [token, activeTab]);

  const tabs = [
    { id: 'all', label: 'الكل', icon: Filter, count: recommendations.length },
    { 
      id: 'handicraft', 
      label: 'المنتجات الحرفية', 
      icon: Star,
      count: recommendations.filter(r => r.item.itemType === 'HandiCraft').length
    },
    { 
      id: 'cultural', 
      label: 'المقالات الثقافية', 
      icon: TrendingUp,
      count: recommendations.filter(r => r.item.itemType === 'CulturalArticle').length
    }
  ];

  const filteredRecommendations = recommendations.filter(({ item }) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'handicraft') return item.itemType === 'HandiCraft';
    if (activeTab === 'cultural') return item.itemType === 'CulturalArticle';
    return true;
  });

 return (
  <div className="flex flex-col lg:flex-row min-h-screen bg-[#f5f2eb] mt-20">
    {/* Mobile/Tablet Header - Visible only on smaller screens */}
    <div className="lg:hidden bg-[#fdfaf4] shadow-md border-b-2 border-[#8B4513] p-4">
      <div className="text-center mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-[#5C4033] mb-1">مقترح ليك</h2>
        <p className="text-xs sm:text-sm text-[#6b4f3b]">محتوى مخصص حسب اهتماماتك وتفضيلاتك</p>
      </div>
      
      {/* Stats bar for mobile/tablet */}
      <div className="bg-[#F5DEB3] rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-[#5C4033]">إجمالي التوصيات</span>
          <span className="text-lg font-bold text-[#8B4513]">{recommendations.length}</span>
        </div>
        <div className="w-full bg-[#E6D3A3] rounded-full h-2">
          <div 
            className="bg-[#8B4513] h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.min((recommendations.length / 10) * 100, 100)}%` }}
          ></div>
        </div>
      </div>
      
      {/* Horizontal tabs for mobile/tablet */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map(({ id, label, icon: Icon, count }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap text-sm transition-all duration-200 ${
              activeTab === id
                ? 'bg-[#8B4513] text-white shadow-md'
                : 'text-[#5C4033] bg-[#f3ead8] hover:bg-[#E6D3A3] hover:shadow-sm'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="font-medium">{label}</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              activeTab === id 
                ? 'bg-white text-[#8B4513]' 
                : 'bg-[#E6D3A3] text-[#5C4033]'
            }`}>
              {count || 0}
            </span>
          </button>
        ))}
      </div>
    </div>

    {/* Desktop Sidebar - Hidden on mobile/tablet */}
    <aside className="hidden lg:block w-64 xl:w-80 bg-[#fdfaf4] shadow-lg border-l-4 border-[#8B4513]">
      <div className="p-4 xl:p-6">
        <div className="text-center mb-4 xl:mb-6">
          <h2 className="text-xl xl:text-2xl font-bold text-[#5C4033] mb-2">مقترح ليك</h2>
          <p className="text-xs xl:text-sm text-[#6b4f3b]">محتوى مخصص حسب اهتماماتك وتفضيلاتك</p>
        </div>
        
        <div className="bg-[#F5DEB3] rounded-lg p-3 xl:p-4 mb-4 xl:mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[#5C4033]">إجمالي التوصيات</span>
            <span className="text-lg font-bold text-[#8B4513]">{recommendations.length}</span>
          </div>
          <div className="w-full bg-[#E6D3A3] rounded-full h-2">
            <div 
              className="bg-[#8B4513] h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((recommendations.length / 10) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
        
        <div className="space-y-2">
          {tabs.map(({ id, label, icon: Icon, count }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center justify-between w-full px-3 xl:px-4 py-2 xl:py-3 rounded-lg text-right transition-all duration-200 ${
                activeTab === id
                  ? 'bg-[#8B4513] text-white shadow-md'
                  : 'text-[#5C4033] hover:bg-[#f3ead8] hover:shadow-sm'
              }`}
            >
              <div className="flex items-center gap-2 xl:gap-3">
                <Icon className="w-4 h-4 xl:w-5 xl:h-5" />
                <span className="font-medium text-sm xl:text-base">{label}</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                activeTab === id 
                  ? 'bg-white text-[#8B4513]' 
                  : 'bg-[#E6D3A3] text-[#5C4033]'
              }`}>
                {count || 0}
              </span>
            </button>
          ))}
        </div>
        
        <div className="mt-6 xl:mt-8 p-3 xl:p-4 bg-gradient-to-r from-[#F5DEB3] to-[#E6D3A3] rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-[#8B4513]" />
            <span className="text-sm font-medium text-[#5C4033]">آخر تحديث</span>
          </div>
          <p className="text-xs text-[#6b4f3b]">
            {new Date().toLocaleDateString('ar-EG', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>
    </aside>

    {/* Main Content */}
    <main className="flex-1 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6 lg:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#5C4033] mb-2">
              {activeTab === 'all' ? 'جميع التوصيات' : 
               activeTab === 'handicraft' ? 'المنتجات الحرفية' : 'المقالات الثقافية'}
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              {filteredRecommendations.length} توصية متاحة
            </p>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12 sm:py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-[#F5DEB3] border-t-[#8B4513] rounded-full animate-spin"></div>
              <div className="text-center">
                <p className="text-base sm:text-lg font-medium text-[#5C4033] mb-1">جاري تحديث التوصيات...</p>
                <p className="text-sm text-gray-600">يرجى الانتظار قليلاً</p>
              </div>
            </div>
          </div>
        ) : error ? (
          <ErrorState onRetry={fetchRecommendations} />
        ) : filteredRecommendations.length === 0 ? (
          <EmptyState activeTab={activeTab} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredRecommendations.map((recommendation) => {
              const { item } = recommendation;
              if (item.itemType === 'HandiCraft') {
                return <PostCard key={item.id} post={item} recommendation={recommendation} />;
              }
              if (item.itemType === 'CulturalArticle') {
                return <CulturalCard key={item.id} item={item} recommendation={recommendation} />;
              }
              return null;
            })}
          </div>
        )}
      </div>
    </main>
  </div>
);
};

export default RecommendationsPage;