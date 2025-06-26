import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { FaHeart, FaCalendarAlt, FaComment, FaShareAlt, FaSort, FaTimes } from "react-icons/fa";
import { TokenContext } from "../../Context/TokenContext";
import { useNavigate } from "react-router-dom";
import styles from './Home.module.css';
import Comment from "./comment";
import PostSettings from "./postSetting";
import Like from "./like";
import profileimg from '../../assets/profile-icon-9.png';
import Repost from './Repost';
import { CategoryContext } from "../../Context/CategoryContext";

export default function Posty() {
  const { token } = useContext(TokenContext);
  const { selectedCategory } = useContext(CategoryContext);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [openComments, setOpenComments] = useState({});
  const [sortOption, setSortOption] = useState('الأحدث');
  const [selectedPost, setSelectedPost] = useState(null);
  const navigate = useNavigate();

  const handleImageError = (e) => {
    e.target.src = profileimg;
  };

 const fetchReposts = async (culturalArticleId) => {
  try {
    const response = await axios.get(
      `https://ourheritage.runasp.net/api/Repost/get-reposts/${culturalArticleId}?pageIndex=1&pageSize=10`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      }
    );

    // ✅ التصحيح هنا
    return response.data?.items || [];
  } catch (err) {
    console.error('خطأ في جلب الريبوستات:', err);
    return [];
  }
};


  const fetchPostById = async (culturalArticleId) => {
    try {
      const response = await axios.get(
        `https://ourheritage.runasp.net/api/Articles/${culturalArticleId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        }
      );
      return response.data;
    } catch (err) {
      console.error(`خطأ في جلب المنشور ${culturalArticleId}:`, err);
      return null;
    }
  };

  useEffect(() => {
    if (!token) {
      setError('يرجى تسجيل الدخول لعرض المنشورات.');
      return;
    }

    const fetchAllPosts = async () => {
      try {
        const postsResponse = await axios.get(
          'https://ourheritage.runasp.net/api/Articles?PageIndex=1&PageSize=30',
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
          }
        );

        if (postsResponse.status === 200) {
          const items = postsResponse.data.data?.items || postsResponse.data.items || postsResponse.data || [];
          const originalPosts = Array.isArray(items) ? items : [];

          const postsWithReposts = await Promise.all(
            originalPosts.map(async (post) => {
              const reposts = await fetchReposts(post.id);
              const repostsWithOriginal = await Promise.all(
                reposts.map(async (repost) => {
                  const originalPost = await fetchPostById(repost.culturalArticleId);
                  return {
                    ...repost,
                    isRepost: true,
                    originalPost: originalPost || {
                      id: repost.culturalArticleId,
                      content: 'المنشور الأصلي غير متوفر',
                      userId: 0,
                      nameOfUser: 'مستخدم غير معروف',
                      userProfilePicture: profileimg,
                      dateCreated: repost.dateCreated,
                      imageURL: [],
                      commentCount: 0,
                      likeCount: 0,
                    },
                  };
                })
              );
              return {
                ...post,
                isRepost: false,
                reposts: repostsWithOriginal,
              };
            })
          );

          setPosts(postsWithReposts);
        } else {
          setError('لا توجد منشورات حالياً.');
        }
      } catch (err) {
        console.error('خطأ في جلب المنشورات:', err);
        setError('حدث خطأ أثناء جلب المنشورات. حاول مرة أخرى.');
      }
    };

    fetchAllPosts();
  }, [token]);

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  const toggleComments = (id) => {
    setOpenComments((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredPosts = posts.filter((post) =>
    selectedCategory === 'الكل' || post.nameOfCategory === selectedCategory
  );

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortOption === 'الأحدث') {
      return new Date(b.dateCreated) - new Date(a.dateCreated);
    }
    if (sortOption === 'الأكثر تفاعلاً') {
      return (b.commentCount + b.likeCount) - (a.commentCount + a.likeCount);
    }
    return 0;
  });

  const goToProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const handleRepostSuccess = async (culturalArticleId) => {
    const updatedPosts = await Promise.all(
      posts.map(async (post) => {
        if (post.id === culturalArticleId) {
          const reposts = await fetchReposts(post.id);
          const repostsWithOriginal = await Promise.all(
            reposts.map(async (repost) => {
              const originalPost = await fetchPostById(repost.culturalArticleId);
              return {
                ...repost,
                isRepost: true,
                originalPost: originalPost || {
                  id: repost.culturalArticleId,
                  content: 'المنشور الأصلي غير متوفر',
                  userId: 0,
                  nameOfUser: 'مستخدم غير معروف',
                  userProfilePicture: profileimg,
                  dateCreated: repost.dateCreated,
                  imageURL: [],
                  commentCount: 0,
                  likeCount: 0,
                },
              };
            })
          );
          return {
            ...post,
            reposts: repostsWithOriginal,
          };
        }
        return post;
      })
    );
    setPosts(updatedPosts);
  };

  if (error) {
    return <p className="text-center text-red-600 mt-5">{error}</p>;
  }
  return (
    <div>
      {/* Sorting Header */}
      <div className="feed-header bg-white rounded shadow-md p-3 mb-4 flex justify-between items-center">
        <h2 className="feed-title text-xl text-[#8B4513] font-semibold">أحدث المنشورات</h2>
        <div className="sort-options relative">
          {/* <FaSort className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none " /> */}
          <select
            className="pr-8 pl-2 py-1  rounded border bg-white text-[#5C4033] text-sm cursor-pointer w-[170px]"
            value={sortOption}
            onChange={handleSortChange}
          >
            <option >الأحدث</option>
            <option>الأكثر تفاعلاً</option>
          
          </select>
        </div>
      </div>

      {sortedPosts.filter((post) => !post.isHidden).map((post) => (
        <div key={post.id} className="mb-6 mt-8">
          {/* Original Post */}
          <div className="post-card bg-white rounded shadow-md transition hover:-translate-y-[3px] hover:shadow-lg border-t-4 border-[#B22222] relative p-4">
            <div className="post-header flex items-center mb-3">
              <img
                src={post.userProfilePicture || profileimg}
                onError={handleImageError}
                className="w-10 h-10 border-2 border-red-900 rounded-full cursor-pointer"
                onClick={() => goToProfile(post.userId)}
                alt="Profile"
              />
              <div className="post-author-info mt-2 mr-3 flex-1">
                <h3 className="post-author-name font-normal text-[#5C4033] text-lg flex items-center ">
                  {post.nameOfUser || 'مستخدم غير معروف'}
                </h3>
                <p className="post-time text-gray-500 text-xs mt-1">
                  {new Date(post.dateCreated).toLocaleString('ar-EG', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  {post.nameOfCategory && ` • ${post.nameOfCategory}`}
                </p>
              </div>
              <span>
                <PostSettings  post={post} setPosts={setPosts} />
              </span>
            </div>

            {/* محتوى المنشور */}
            <div className="post-content mb-3 text-base leading-relaxed">
              <p className="whitespace-pre-line">{post.content}</p>
              {post.imageURL?.length > 0 && (
                <div className="post-img-container mb-3 rounded overflow-hidden">
                  <img
                    src={post.imageURL[0]}
                    alt="صورة المنشور"
                    className="w-full max-h-96 object-cover cursor-pointer transition hover:scale-105"
                    onClick={() => setSelectedPost(post)}
                  />
                </div>
              )}
            </div>

            <p className="border-b-2 border-black pb-2 mb-2"></p>

            {/* التفاعلات */}
            <div className="flex justify-between items-center mt-4 text-red-900">
              <div className="flex gap-8 items-center">
                <Like post={post} />
                <div
                  className="post-action flex items-center mr-3 text-gray-600 cursor-pointer transition hover:text-[#A0522D] text-sm"
                  onClick={() => toggleComments(post.id)}
                >
                  <FaComment className="ml-1 text-gray-500" />
                  <span>تعليق</span>
                  <span>{post.commentCount || 0}</span>
                </div>
              </div>
              <div className="post-action flex items-center text-gray-600 cursor-pointer transition hover:text-[#A0522D] text-sm">
                <Repost post={post} userId={post.userId || 0} onSuccess={() => handleRepostSuccess(post.id)} />
                <span>{post.reposts?.length || 0}</span>
              </div>
            </div>

            {openComments[post.id] && <Comment post={post} />}
          </div>

        
         {/* Reposts */}
{post.reposts?.length > 0 && (
  <div className="mt-6 space-y-6">
    {post.reposts.map((repost) => (
      <div
        key={repost.id}
        className="post-card bg-white rounded shadow-md transition hover:-translate-y-[3px] hover:shadow-lg border-t-4 border-[#8B4513] relative p-4"
      >
        {/* شريط علوي: بيانات اللي عمل الريبوست */}
        <div className="post-header flex items-center mb-3">
          <img
            src={repost.user?.profilePicture || profileimg}
            onError={handleImageError}
            className="w-10 h-10 border-2 border-red-900 rounded-full cursor-pointer"
            onClick={() => goToProfile(repost.user?.id)}
            alt="Reposter"
          />
          <div className="post-author-info mt-2 mr-3 flex-1">
            <h3 className="post-author-name font-normal text-[#5C4033] text-lg flex items-center">
{repost.user?.fullName ||
 `${repost.user?.firstName || ''} ${repost.user?.lastName || ''}`.trim() ||
 'مستخدم غير معروف'}
            </h3>
            <p className="post-time text-gray-500 text-xs mt-1">
              أعاد النشر •{" "}
              {new Date(repost.dateCreated).toLocaleString('ar-EG', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>

        {/* محتوى المنشور الأصلي داخل نفس الكارد */}
        <div className="bg-[#fcfcfb] border border-[#ddd] rounded p-4">
          {/* صاحب البوست الأصلي */}
          <div className="flex items-center mb-3">
            <img
              src={repost.originalPost?.userProfilePicture || profileimg}
              onError={handleImageError}
              className="w-9 h-9 rounded-full border"
              onClick={() => goToProfile(repost.originalPost?.userId)}
              alt="Author"
            />
            <div className="ml-2">
              <p className="text-sm font-semibold text-[#8B4513]">
                {repost.originalPost?.nameOfUser || "مستخدم غير معروف"}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(repost.originalPost?.dateCreated).toLocaleString("ar-EG", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          <p className="text-sm leading-relaxed whitespace-pre-line">
            {repost.originalPost?.content || "بدون محتوى"}
          </p>

          {repost.originalPost?.imageURL?.[0] && (
            <div className="mt-2 rounded overflow-hidden">
              <img
                src={repost.originalPost.imageURL[0]}
                alt="Post Image"
                className="w-full max-h-60 object-cover rounded"
              />
            </div>
          )}

          <div className="flex justify-between items-center mt-4 text-sm text-red-900">
            <Like post={repost.originalPost} />
            <div
              className="flex items-center gap-1 text-gray-600 cursor-pointer hover:text-[#A0522D]"
              onClick={() => toggleComments(repost.id)}
            >
              <FaComment />
              <span>تعليق</span>
              <span>{repost.originalPost?.commentCount || 0}</span>
            </div>
          </div>

          {openComments[repost.id] && <Comment post={repost.originalPost} />}
        </div>
      </div>
    ))}
  </div>
)}
        </div>
      ))}
    </div>
  );
}
