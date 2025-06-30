import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaTimes, FaArrowLeft, FaArrowRight } from 'react-icons/fa';

export default function HandicraftRecommendation() {
  const [description, setDescription] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedArtisan, setSelectedArtisan] = useState(null);
  const [userProducts, setUserProducts] = useState({});
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleSearch = async () => {
    if (!description.trim()) {
      setError('من فضلك أدخل وصفاً صحيحاً.');
      return;
    }
    setLoading(true);
    setError('');
    setSelectedArtisan(null);

    try {
      const token = localStorage.getItem('userToken');
      const response = await axios.get('https://ourheritage.runasp.net/api/HandicraftMatching/recommend', {
        params: { description },
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      if (response.data.length > 0) {
        setRecommendations(response.data);
      } else {
        setRecommendations([]);
        setError('لا توجد توصيات متاحة لهذا الوصف.');
      }
    } catch (err) {
      console.error(err);
      setError('حدث خطأ أثناء جلب التوصيات.');
    }

    setLoading(false);
  };

  const fetchUserProducts = async (userId) => {
    if (userProducts[userId]) return userProducts[userId];
    setLoadingProducts(true);
    try {
      const token = localStorage.getItem('userToken');
      const response = await axios.get(
        `https://ourheritage.runasp.net/api/HandiCrafts`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { PageIndex: 1, PageSize: 100, UserId: userId },
        }
      );
      const userProductsData = Array.isArray(response.data.items)
        ? response.data.items.filter(product => product.userId == userId)
        : [];
      const products = userProductsData.map(product => ({
        id: product.id,
        imageURL: product.imageOrVideo[0] || "https://via.placeholder.com/300x200?text=صورة+غير+متاحة",
        title: product.title || 'بدون عنوان',
        description: product.description || 'بدون وصف',
        price: product.price || 0
      }));
      setUserProducts(prev => ({ ...prev, [userId]: products }));
      setLoadingProducts(false);
      return products;
    } catch (err) {
      console.error('Error fetching user products:', err);
      setError('حدث خطأ أثناء جلب المنتجات.');
      setLoadingProducts(false);
      return [];
    }
  };

  const handleShowProducts = async (artisan) => {
    if (selectedArtisan && selectedArtisan.userId === artisan.userId) {
      setSelectedArtisan(null);
    } else {
      setSelectedArtisan(artisan);
      await fetchUserProducts(artisan.userId);
    }
  };

  const openImageModal = (imageURL, images) => {
    const imageIndex = images.findIndex(img => img.imageURL === imageURL);
    setCurrentImageIndex(imageIndex);
    setSelectedImage({ imageURL, images });
  };

  const closeImageModal = () => {
    setSelectedImage(null);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    if (selectedImage && selectedImage.images.length > 1) {
      const nextIndex = (currentImageIndex + 1) % selectedImage.images.length;
      setCurrentImageIndex(nextIndex);
      setSelectedImage(prev => ({ ...prev, imageURL: prev.images[nextIndex].imageURL }));
    }
  };

  const prevImage = () => {
    if (selectedImage && selectedImage.images.length > 1) {
      const prevIndex = currentImageIndex === 0 ? selectedImage.images.length - 1 : currentImageIndex - 1;
      setCurrentImageIndex(prevIndex);
      setSelectedImage(prev => ({ ...prev, imageURL: prev.images[prevIndex].imageURL }));
    }
  };

  const handleImageError = (e) => {
    e.target.src = "https://via.placeholder.com/300x200?text=صورة+غير+متاحة";
  };

  return (
    <div className="min-h-screen mt-24 bg-gray-100">
      <div className="flex flex-col lg:flex-row h-auto lg:h-screen">
        <div className="w-full lg:w-1/2 p-4 md:p-6 overflow-y-auto bg-white border-b lg:border-b-0 lg:border-l border-gray-300">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center text-[#8B4513]">نظام التوصيات</h2>
            <div className="mb-6 bg-gray-50 p-6 rounded-lg">
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="اكتب وصف المنتج هنا..."
                className="w-full p-4 mb-4 border border-gray-300 rounded-lg text-right text-lg"
              />
              <button
                onClick={handleSearch}
                className="w-full bg-[#8B4513] hover:bg-[#5D4037] text-white py-4 rounded-lg text-lg font-semibold transition-colors"
                disabled={loading}
              >
                {loading ? 'جاري البحث...' : 'بحث'}
              </button>
            </div>
            {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"><p className="text-red-600 text-center">{error}</p></div>}
            {recommendations.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-right mb-4">نتائج البحث:</h3>
                {recommendations.map((artisan, index) => (
                  <div
                    key={index}
                    onClick={() => handleShowProducts(artisan)}
                    className={`p-4 border rounded-lg shadow-sm transition-all cursor-pointer ${
                      selectedArtisan?.userId === artisan.userId
                        ? 'bg-[#8B4513] text-white border-[#8B4513]'
                        : 'bg-white border-gray-200 hover:border-[#8B4513]'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <Link to={`/profile/${artisan.userId}`} onClick={(e) => e.stopPropagation()}>
                        <img
                          src={artisan.profilePicture || "https://via.placeholder.com/60"}
                          alt={artisan.fullName}
                          className="w-16 h-16 rounded-full object-cover border-2 border-current"
                          onError={(e) => { e.target.src = "https://via.placeholder.com/60"; }}
                        />
                      </Link>
                      <div className="flex-1 text-right">
                        <Link to={`/profile/${artisan.userId}`} onClick={(e) => e.stopPropagation()}>
                          <h4 className="text-lg font-bold hover:underline mb-1">{artisan.fullName}</h4>
                        </Link>
                        {artisan.relevantSkills?.length > 0 && (
                          <div className="mb-1">
                            <span className="text-sm font-semibold">المهارات: </span>
                            <span className="text-sm opacity-90">{artisan.relevantSkills.join(', ')}</span>
                          </div>
                        )}
                        {artisan.connections?.length > 0 && (
                          <div className="flex gap-2 justify-end mt-2">
                            {artisan.connections.map((link, i) => (
                              <a
                                key={i}
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-300 underline text-sm hover:text-blue-100"
                                onClick={(e) => e.stopPropagation()}
                              >
                                رابط {i + 1}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 text-center">
                      <span className="text-sm opacity-90">
                        {selectedArtisan?.userId === artisan.userId ? 'اضغط لإخفاء المنتجات' : 'منتجات مشابهة لوصفك'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="w-full lg:w-1/2 p-4 md:p-6 overflow-y-auto bg-gray-50">
          {!selectedArtisan ? (
            <div className="flex items-center justify-center h-full text-center text-gray-500">
              <div>
                <div className="text-6xl mb-4">🖼️</div>
                <h3 className="text-xl font-semibold mb-2">عرض المنتجات</h3>
                <p>اضغط على "عرض بعض المنتجات" لعرض صور المنتجات هنا</p>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-6 text-center">
                <h3 className="text-2xl font-bold text-[#8B4513] mb-2">منتجات {selectedArtisan.fullName}</h3>
                {loadingProducts && <p className="text-gray-600">جاري تحميل المنتجات...</p>}
              </div>
              {userProducts[selectedArtisan.userId]?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userProducts[selectedArtisan.userId].map((product) => (
                    <Link
                      to={`/product/${product.id}`}
                      key={product.id}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="aspect-square overflow-hidden">
                        <img
                          src={product.imageURL}
                          alt={product.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          onError={handleImageError}
                        />
                      </div>
                      <div className="p-4">
                        <h5 className="font-semibold text-base mb-2 text-right text-[#8B4513]">{product.title}</h5>
                        <p className="text-sm text-gray-600 text-right line-clamp-3">{product.description}</p>
                        <p className="text-[#8B4513] font-bold text-right mt-2">{product.price} ر.س</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-12">
                  <div className="text-4xl mb-4">📷</div>
                  <p className="text-lg">لم يتم العثور على منتجات لهذا الحرفي</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={closeImageModal}>
          <div className="relative max-w-[90%] max-h-[90%] p-4" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={closeImageModal}
              className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 z-10"
            >
              <FaTimes size={20} />
            </button>
            {selectedImage.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 z-10"
                >
                  <FaArrowLeft size={20} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 z-10"
                >
                  <FaArrowRight size={20} />
                </button>
              </>
            )}
            <img
              src={selectedImage.imageURL}
              alt="منتج"
              className="max-w-full max-h-full object-contain rounded-lg"
              onError={handleImageError}
            />
            {selectedImage.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-50 px-3 py-1 rounded">
                {currentImageIndex + 1} من {selectedImage.images.length}
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}