
import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FaCalendarAlt, FaThumbsUp, FaComment, FaShare, FaRedo, FaEllipsisH, FaBars, FaUserPlus, FaUserMinus, FaCog, FaPlus, FaTimes, FaStar } from "react-icons/fa";
import styles from "./Profile.module.css";
import ProfileLeftside from './ProfileLeftside';
import NewPost from '../Home/newpost';
import PostSettings from '../Home/postSetting';
import { TokenContext } from "../../Context/TokenContext";
import Like from '../Home/like';
import Comment from '../Home/comment';
import Repost from '../Home/Repost';
import profileimg from "../../assets/profile-icon-9.png";
import { ColorRing } from 'react-loader-spinner';

export default function Profile() {
  const { id } = useParams();
  const [userData, setUserData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newSkill, setNewSkill] = useState("");
  const [userSkills, setUserSkills] = useState([]);
  const [profilePicture, setProfilePicture] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [profilePictures, setProfilePictures] = useState({});
  const [isFollowing, setIsFollowing] = useState(() => {
    const storedFollowStatus = localStorage.getItem(`followStatus_${id}`);
    return storedFollowStatus ? JSON.parse(storedFollowStatus) : false;
  });
  const [activeTab, setActiveTab] = useState("Posts");
  const { token } = useContext(TokenContext);
  const currentUserId = localStorage.getItem("userId");
  const skillInputRef = useRef(null);
  const [suggestedFriends, setSuggestedFriends] = useState([]);
  const [followedCraftsmen, setFollowedCraftsmen] = useState([]);
  const [openComments, setOpenComments] = useState({});

  const picKey = `profilePicture_${id}`;
  const coverKey = `coverImage_${id}`;

  const fetchUserProfilePicture = async (userId) => {
    try {
      const res = await axios.get(
        `https://ourheritage.runasp.net/api/Users/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.data.profilePicture || profileimg;
    } catch (err) {
      console.error(`Error fetching profile picture for user ${userId}:`, err);
      return profileimg;
    }
  };

  const fetchData = async () => {
    try {
      const userRes = await axios.get(
        `https://ourheritage.runasp.net/api/Users/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      const postsRes = await axios.get(
        `https://ourheritage.runasp.net/api/Articles`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            PageIndex: 1,
            PageSize: 100,
            UserId: id,
          },
        }
      );
  
      const followersRes = await axios.get(
        `https://ourheritage.runasp.net/api/Follow/${id}/followers`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      const followingsRes = await axios.get(
        `https://ourheritage.runasp.net/api/Follow/${id}/followings`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      setUserData(userRes.data);
      setUserSkills(userRes.data.skills || []);
      setFollowers(followersRes.data || []);
      setFollowing(followingsRes.data || []);
      const isUserFollowing = followersRes.data.some(
        (follower) => follower.id === parseInt(currentUserId)
      );
      setIsFollowing(isUserFollowing);
      localStorage.setItem(`followStatus_${id}`, JSON.stringify(isUserFollowing));
  
      if (Array.isArray(postsRes.data.items)) {
        setUserPosts(postsRes.data.items.filter((p) => p.userId == id));
      }
  
      setProfilePicture(userRes.data.profilePicture || profileimg);
      setCoverImage(userRes.data.coverProfilePicture || "https://via.placeholder.com/1500x500");
    } catch (err) {
      console.error(err);
      setError("حدث خطأ أثناء جلب البيانات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id || !token) {
      setError("لم يتم العثور على بيانات المستخدم. تأكد من تسجيل الدخول.");
      setLoading(false);
      return;
    }

    fetchData();
  }, [id, token, currentUserId]);

  useEffect(() => {
    if (!token) {
      setError("لم يتم العثور على التوكن. تأكد من تسجيل الدخول.");
      return;
    }

    const fetchSkills = async () => {
      try {
        const response = await axios.get('https://ourheritage.runasp.net/api/Users/me/skills', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUserSkills(response.data);
      } catch (err) {
        console.error(err);
        setError("حدث خطأ أثناء جلب المهارات.");
      }
    };

    const fetchSuggestedFriends = async () => {
      try {
        const res = await axios.get('https://ourheritage.runasp.net/api/Users/suggested-friends', {
          headers: {
            accept: '*/*',
            Authorization: `Bearer ${token}`
          },
        });
        setSuggestedFriends(res.data);
      } catch (error) {
        console.error("خطأ في جلب الأصدقاء المقترحين:", error);
      }
    };

    fetchSkills();
    fetchSuggestedFriends();
  }, [token]);

  useEffect(() => {
    const fetchAllProfilePictures = async () => {
      const followerPromises = followers.map(follower =>
        !profilePictures[follower.id]
          ? fetchUserProfilePicture(follower.id).then(pic => [follower.id, pic])
          : Promise.resolve([follower.id, profilePictures[follower.id]])
      );
      const followingPromises = following.map(followingUser =>
        !profilePictures[followingUser.id]
          ? fetchUserProfilePicture(followingUser.id).then(pic => [followingUser.id, pic])
          : Promise.resolve([followingUser.id, profilePictures[followingUser.id]])
      );
      const pics = Object.fromEntries(await Promise.all([...followerPromises, ...followingPromises]));
      setProfilePictures(prev => ({ ...prev, ...pics }));
    };

    if (followers.length > 0 || following.length > 0) {
      fetchAllProfilePictures();
    }
  }, [followers, following, token]);

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("ImageProfile", file);

    try {
      const response = await axios.post(
        "https://ourheritage.runasp.net/api/Users/profile-picture",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        const userRes = await axios.get(
          `https://ourheritage.runasp.net/api/Users/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setProfilePicture(userRes.data.profilePicture);
        setUserData(userRes.data); 
      }
    } catch (err) {
      console.error("Error uploading profile picture:", err);
      setError("حدث خطأ أثناء رفع صورة الملف الشخصي.");
    }
  };

  const handleCoverImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    const formData = new FormData();
    formData.append("ImageCover", file);
  
    try {
      const response = await axios.post(
        "https://ourheritage.runasp.net/api/Users/cover-photo",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
  
      if (response.status === 200) {
        const userRes = await axios.get(
          `https://ourheritage.runasp.net/api/Users/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCoverImage(userRes.data.coverProfilePicture || "https://via.placeholder.com/1500x500");
        setUserData(userRes.data);
      }
    } catch (err) {
      console.error("Error uploading cover image:", err);
      setError("حدث خطأ أثناء رفع صورة الغلاف.");
    }
  };

  const handleCoverClick = (e) => {
    e.stopPropagation();
    if (id === currentUserId) {
      const input = document.getElementById("coverImageInput");
      if (input) {
        input.click();
      } else {
        console.error("Input element not found");
      }
    }
  };

  const handleAddSkills = async (e) => {
    e.preventDefault();
    if (!newSkill) return setError("يجب إدخال مهارة.");
    
    const updatedSkills = [...userSkills, newSkill];
    setUserSkills(updatedSkills);
    
    try {
      await axios.post(
        `https://ourheritage.runasp.net/api/Users/skills`,
        newSkill,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
  
      setNewSkill("");
      setError(null);
    } catch (err) {
      console.error(err);
      setError("حدث خطأ أثناء إضافة المهارة.");
      setUserSkills(userSkills); 
    }
  };

  const handleDeleteSkill = async (skill) => {
    if (!token) {
      setError("لم يتم العثور على التوكن. تأكد من تسجيل الدخول.");
      return;
    }

    const updatedSkills = userSkills.filter(s => s !== skill);
    setUserSkills(updatedSkills);

    try {
      await axios.delete(
        `https://ourheritage.runasp.net/api/Users/skills/${encodeURIComponent(skill)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Accept': '*/*',
          },
        }
      );

      setError(null);
    } catch (err) {
      console.error("Error deleting skill:", err);
      setError("حدث خطأ أثناء حذف المهارة.");
      setUserSkills(userSkills); 
    }
  };

  const handleFollowToggle = async () => {
    if (!id || !token || !currentUserId) {
      setError("معرف المستخدم أو التوكن غير صالح.");
      return;
    }

    try {
      const endpoint = isFollowing 
        ? `https://ourheritage.runasp.net/api/Follow/unfollow/${parseInt(currentUserId)}/${parseInt(id)}`
        : `https://ourheritage.runasp.net/api/Follow/follow`;

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };

      const body = { followerId: parseInt(currentUserId), followingId: parseInt(id) };

      const response = isFollowing 
        ? await axios.delete(endpoint, { ...config, data: body })
        : await axios.post(endpoint, body, config);
      
      if (response.status === 200 || response.status === 201) {
        const followersRes = await axios.get(
          `https://ourheritage.runasp.net/api/Follow/${id}/followers`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFollowers(followersRes.data || []);
        const isUserFollowing = followersRes.data.some(follower => follower.id === parseInt(currentUserId));
        setIsFollowing(isUserFollowing);
        localStorage.setItem(`followStatus_${id}`, JSON.stringify(isUserFollowing));
      } else {
        throw new Error("Unexpected response status");
      }
    } 
    catch (err) {
      console.error("Follow/Unfollow error:", err);
      if (err.response?.status === 400 && err.response?.data?.message === "You are already following this user.") {
        setIsFollowing(true);
        localStorage.setItem(`followStatus_${id}`, JSON.stringify(true));
      } else if (err.response?.status === 400 && err.response?.data?.message === "Follower or following user not found.") {
        setError("المستخدم المتابع أو المستخدم الذي يتم متابعته غير موجود.");
      } else if (err.response?.status === 400) {
        setError(err.response?.data?.message || "طلب غير صالح. تحقق من معرف المستخدم أو حاول مرة أخرى.");
      } else if (err.response?.status === 401) {
        setError("غير مصرح. تأكد من تسجيل الدخول.");
      } else {
        setError("حدث خطأ أثناء تحديث حالة المتابعة. حاول مرة أخرى لاحقًا.");
      }
    }
  };

  const toggleFollow = (friendId) => {
    if (followedCraftsmen.includes(friendId)) {
      setFollowedCraftsmen(followedCraftsmen.filter(item => item !== friendId));
    } else {
      setFollowedCraftsmen([...followedCraftsmen, friendId]);
    }
  };

  const handleImageError = (e) => {
    e.target.src = profileimg;
  };

  const toggleComments = (postId) => {
    setOpenComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const handleRepostSuccess = async (culturalArticleId) => {
    try {
      const postsRes = await axios.get(
        `https://ourheritage.runasp.net/api/Articles`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            PageIndex: 1,
            PageSize: 100,
            UserId: id,
          },
        }
      );
  
      if (Array.isArray(postsRes.data.items)) {
        setUserPosts(postsRes.data.items.filter((p) => p.userId == id));
      }
    } catch (err) {
      console.error("Error refreshing posts after repost:", err);
      setError("حدث خطأ أثناء تحديث المنشورات.");
    }
  };

  const postImages = userPosts
    .filter(post => post.imageURL)
    .map(post => ({
      id: post.id,
      imageURL: post.imageURL,
    }));

  const handleAddSkillClick = () => {
    setActiveTab("Posts");
    setTimeout(() => {
      if (skillInputRef.current) {
        skillInputRef.current.focus();
      }
    }, 0);
  };

  if (loading) return (
    <div className="h-screen flex justify-center items-center">
      <ColorRing
        visible={true}
        height="80"
        width="80"
        ariaLabel="color-ring-loading"
        wrapperStyle={{}}
        wrapperClass="color-ring-wrapper"
        colors={['#e15b64', '#f47e60', '#f8b26a', '#abbd81', '#849b87']}
      />
    </div>
  );
  if (error) return <p className="text-red-600 text-center py-8">{error}</p>;
  if (!userData) return <p className="text-center py-8">لا يوجد بيانات</p>;

 return (
    <div className={styles.container}>
      <div className="grid grid-cols-12 gap-4 p-4">
        <div className="col-span-12 lg:col-span-9">
          <div
            className={`${styles.coverContainer} ${id === currentUserId ? styles.editableCover : ''}`}
            onClick={handleCoverClick}
            style={{
              backgroundImage: `url(${coverImage || userData.coverImage || ''})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              position: 'relative',
              paddingBottom: '120px'
            }}
          >
            <input
              type="file"
              id="coverImageInput"
              style={{
                display: 'none',
                position: 'absolute',
                top: 0,
                left: '0px',
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: 'pointer'
              }}
              accept="image/*"
              onChange={handleCoverImageChange}
            />
            {id === currentUserId && (
              <div className={styles.coverEditOverlay}>
                <span>تغيير صورة الغلاف</span>
              </div>
            )}

            <div className={`${styles.profileInfo} flex flex-col sm:flex-row items-start sm:items-end justify-between`} style={{ position: 'absolute', bottom: '10px', left: '10px', padding: '10px', borderRadius: '10px', right: '10px' }}>
              <div className={styles.profilePictureLabel}>
                <img
                  src={profilePicture || userData.profilePicture || profileimg}
                  alt="Profile"
                  className={`${styles.profilePicture} ${id === currentUserId ? styles.editableProfile : ''}`}
                  onError={handleImageError}
                  onClick={() => {
                    if (id === currentUserId) {
                      document.getElementById("profilePictureInput").click();
                    }
                  }}
                />
                <input
                  type="file"
                  id="profilePictureInput"
                  style={{ display: 'none' }}
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                />
              </div>
              {id !== currentUserId && (
                <div className="mt-2 sm:mt-0">
                  <button
                    onClick={handleFollowToggle}
                    className="px-3 py-2 sm:px-4 sm:py-2 bg-[#B22222] text-white rounded flex items-center gap-2 hover:bg-[#8B0000] text-sm sm:text-base"
                  >
                    {isFollowing ? (
                      <>
                        <FaUserMinus className="text-sm" /> 
                        <span className="hidden sm:inline">إلغاء المتابعة</span>
                        <span className="sm:hidden">إلغاء</span>
                      </>
                    ) : (
                      <>
                        <FaUserPlus className="text-sm" /> 
                        <span className="hidden sm:inline">متابعة</span>
                        <span className="sm:hidden">متابعة</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className={styles.nameAndTabs}>
            <h2 className="text-black text-lg sm:text-xl lg:text-2xl">{userData.fullName || `${userData.firstName} ${userData.lastName}`}</h2>
            
            {/* Mobile Toggle Stats */}
            <div className="block sm:hidden mb-4">
              <div className="grid grid-cols-4 gap-1 bg-white rounded-lg shadow-sm p-2">
                <button
                  onClick={() => setActiveTab("Posts")}
                  className={`flex flex-col items-center p-3 rounded-lg transition-all ${activeTab === "Posts" ? 'bg-[#B22222] text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
                >
                  <div className="text-lg font-bold">{userPosts.length}</div>
                  <div className="text-xs">منشورات</div>
                </button>
                <button
                  onClick={() => setActiveTab("Pictures")}
                  className={`flex flex-col items-center p-3 rounded-lg transition-all ${activeTab === "Pictures" ? 'bg-[#B22222] text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
                >
                  <div className="text-lg font-bold">{postImages.length}</div>
                  <div className="text-xs">صور</div>
                </button>
                <button
                  onClick={() => setActiveTab("Followers")}
                  className={`flex flex-col items-center p-3 rounded-lg transition-all ${activeTab === "Followers" ? 'bg-[#B22222] text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
                >
                  <div className="text-lg font-bold">{followers.length}</div>
                  <div className="text-xs">متابع</div>
                </button>
                <button
                  onClick={() => setActiveTab("Following")}
                  className={`flex flex-col items-center p-3 rounded-lg transition-all ${activeTab === "Following" ? 'bg-[#B22222] text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
                >
                  <div className="text-lg font-bold">{following.length}</div>
                  <div className="text-xs">يتابع</div>
                </button>
              </div>
              
              <button
                onClick={() => setActiveTab("About")}
                className={`w-full mt-2 p-3 rounded-lg transition-all ${activeTab === "About" ? 'bg-[#B22222] text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} shadow-sm border`}
              >
                <div className="text-sm font-medium">حول الملف الشخصي</div>
              </button>
            </div>

            {/* Desktop Tabs */}
            <div className={`${styles.tabNav} overflow-x-auto hidden sm:block`}>
              <div className="flex min-w-max sm:min-w-0 gap-1 sm:gap-0">
                <button
                  className={`${styles.tabButton} ${activeTab === "Posts" ? styles.activeTab : ''} px-2 py-2 sm:px-4 sm:py-2 text-sm sm:text-base whitespace-nowrap`}
                  onClick={() => setActiveTab("Posts")}
                >
                  المنشورات
                </button>
                <button
                  className={`${styles.tabButton} ${activeTab === "Pictures" ? styles.activeTab : ''} px-2 py-2 sm:px-4 sm:py-2 text-sm sm:text-base whitespace-nowrap`}
                  onClick={() => setActiveTab("Pictures")}
                >
                  الصور
                </button>
                <button
                  className={`${styles.tabButton} ${activeTab === "Followers" ? styles.activeTab : ''} px-2 py-2 sm:px-4 sm:py-2 text-sm sm:text-base whitespace-nowrap`}
                  onClick={() => setActiveTab("Followers")}
                >
                  متابع
                </button>
                <button
                  className={`${styles.tabButton} ${activeTab === "Following" ? styles.activeTab : ''} px-2 py-2 sm:px-4 sm:py-2 text-sm sm:text-base whitespace-nowrap`}
                  onClick={() => setActiveTab("Following")}
                >
                  يتابع
                </button>
                <button
                  className={`${styles.tabButton} ${activeTab === "About" ? styles.activeTab : ''} px-2 py-2 sm:px-4 sm:py-2 text-sm sm:text-base whitespace-nowrap`}
                  onClick={() => setActiveTab("About")}
                >
                  حول
                </button>
              </div>
            </div>
          </div>

          {activeTab === "Posts" && (
            <div className={styles.postsSection}>
              {/* Desktop Stats */}
              <div className={`${styles.stats} hidden sm:grid grid-cols-3 gap-2 sm:gap-4 text-center`}>
                <div className="p-2 sm:p-4">
                  <div className="text-xs sm:text-sm font-medium text-gray-600">متابع</div>
                  <p className="text-lg sm:text-xl font-bold text-[#B22222]">{followers.length}</p>
                </div>
                <div className="p-2 sm:p-4">
                  <div className="text-xs sm:text-sm font-medium text-gray-600">يتابع</div>
                  <p className="text-lg sm:text-xl font-bold text-[#B22222]">{following.length}</p>
                </div>
                <div className="p-2 sm:p-4">
                  <div className="text-xs sm:text-sm font-medium text-gray-600">المنشورات</div>
                  <p className="text-lg sm:text-xl font-bold text-[#B22222]">{userPosts.length}</p>
                </div>
              </div>

              {id === currentUserId && (
                <form onSubmit={handleAddSkills} className="my-4">
                  <input 
                    type="text" 
                    value={newSkill} 
                    onChange={(e) => setNewSkill(e.target.value)} 
                    placeholder="أدخل مهارة جديدة" 
                    className="mb-2 p-2 border border-gray-300 rounded w-full text-sm sm:text-base"
                    ref={skillInputRef}
                  />
                  <button type="submit" className="px-3 py-2 sm:px-4 sm:py-2 bg-[#B22222] text-white rounded hover:bg-[#8B0000] text-sm sm:text-base">
                    إضافة مهارة
                  </button>
                </form>
              )}

              {id === currentUserId && <NewPost />}

              <h3 className="text-lg sm:text-xl font-bold mb-4">منشورات المستخدم</h3>
              {userPosts.length > 0 ? userPosts.map(post => (
                <div key={post.id} className="mb-8 p-3 sm:p-4 bg-white shadow-md rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <div className="setting"></div>
                    {id === currentUserId && (
                      <PostSettings post={post} setUserPosts={setUserPosts} />
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <img
                      src={profilePicture || userData.profilePicture || profileimg}
                      alt="User"
                      className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-red-900 rounded-full"
                      onError={handleImageError}
                    />
                    <div>
                      <p className="font-bold text-red-800 text-sm sm:text-base">
                        {userData.fullName || `${userData.firstName} ${userData.lastName}`}
                      </p>
                    </div>
                  </div>

                  {post.imageURL && (
                    <div className="w-full h-64 sm:h-80 lg:h-96 rounded-md mb-4">
                      <img
                        src={post.imageURL}
                        alt="Post"
                        className="w-full h-full object-cover rounded-md"
                      />
                    </div>
                  )}

                  <h4 className="text-base sm:text-lg font-bold mb-2">{post.title || "بدون عنوان"}</h4>
                  <p className="border-b-2 border-black pb-2 mb-2 text-sm sm:text-base">{post.content || "بدون محتوى"}</p>

                  <div className="flex justify-between items-center mt-4 text-red-900">
                    <div className="flex gap-4 sm:gap-8 items-center">
                      <Like post={post} />
                      <div
                        className="post-action flex items-center text-gray-600 cursor-pointer transition hover:text-[#A0522D] text-sm"
                        onClick={() => toggleComments(post.id)}
                      >
                        <FaComment className="ml-1 text-gray-500 text-base sm:text-xl" />
                        <span className='text-base sm:text-xl'>تعليق</span>
                        <span className='text-base sm:text-xl mr-2 mt-1'>{post.commentCount || 0}</span>
                      </div>
                    </div>
                    <div className="post-action flex items-center text-gray-600 cursor-pointer transition hover:text-[#A0522D] text-sm">
                      <Repost post={post} userId={parseInt(currentUserId) || 0} onSuccess={() => handleRepostSuccess(post.id)} />
                      <span className='text-base sm:text-xl mr-2'>{post.reposts?.length || 0}</span>
                    </div>
                  </div>
                  {openComments[post.id] && <Comment post={post} />}
                </div>
              )) : (
                <p className="text-center text-gray-500 py-8">لا توجد منشورات.</p>
              )}
            </div>
          )}

          {activeTab === "Pictures" && (
            <div className={styles.postsSection}>
              <h3 className="text-lg sm:text-xl font-bold mb-4">الصور</h3>
              {postImages.length > 0 ? (
                <div className={`${styles.imagesGrid} grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4`}>
                  {postImages.map(image => (
                    <div key={image.id} className={`${styles.imageCard} aspect-square`}>
                      <img
                        src={image.imageURL}
                        alt="Post Image"
                        className={`${styles.postImage} w-full h-full object-cover rounded-lg`}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">لم يتم إضافة صور بعد.</p>
              )}
            </div>
          )}

          {activeTab === "Followers" && (
            <div className={styles.postsSection}>
              <h3 className="text-lg sm:text-xl font-bold mb-4">المتابعون</h3>
              {followers.length > 0 ? (
                <div className={`${styles.friendsGrid} grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4`}>
                  {followers.map(follower => (
                    <Link key={follower.id} to={`/profile/${follower.id}`} className={`${styles.friendCard} bg-white rounded-lg p-3 sm:p-4 shadow-md hover:shadow-lg transition-shadow text-center`}>
                      <img
                        src={profilePictures[follower.id] || profileimg}
                        alt={`${follower.userName || 'User'}'s profile`}
                        className={`${styles.friendImage} w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto mb-2 object-cover`}
                        onError={handleImageError}
                      />
                      <span className={`${styles.friendName} text-sm sm:text-base font-medium text-gray-800 block truncate`}>{follower.userName || `User ${follower.id}`}</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">لا يوجد متابعون.</p>
              )}
            </div>
          )}

          {activeTab === "Following" && (
            <div className={styles.postsSection}>
              <h3 className="text-lg sm:text-xl font-bold mb-4">المتابعة</h3>
              {following.length > 0 ? (
                <div className={`${styles.friendsGrid} grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4`}>
                  {following.map(followingUser => (
                    <Link key={followingUser.id} to={`/profile/${followingUser.id}`} className={`${styles.friendCard} bg-white rounded-lg p-3 sm:p-4 shadow-md hover:shadow-lg transition-shadow text-center`}>
                      <img
                        src={profilePictures[followingUser.id] || profileimg}
                        alt={`${followingUser.userName || 'User'}'s profile`}
                        className={`${styles.friendImage} w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto mb-2 object-cover`}
                        onError={handleImageError}
                      />
                      <span className={`${styles.friendName} text-sm sm:text-base font-medium text-gray-800 block truncate`}>{followingUser.userName || `User ${followingUser.id}`}</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">لا يوجد متابعة.</p>
              )}
            </div>
          )}

          {activeTab === "About" && (
            <div className={styles.postsSection}>
              <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-[#B22222] border-b-2 border-[#B22222] pb-2">
                  حول {userData.fullName || `${userData.firstName} ${userData.lastName}`}
                </h3>
                
                <div className="mb-6 sm:mb-8">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-10 gap-4">
                    <h4 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center gap-2">
                      <FaCog className="text-[#B22222]" />
                      المهارات
                    </h4>
                    {id === currentUserId && (
                      <button
                        onClick={handleAddSkillClick}
                        className="text-[#B22222] px-3 py-2 sm:py-3 hover:text-[#8B0000] flex items-center gap-2 sm:gap-4 text-base sm:text-lg self-start sm:self-auto"
                      >
                        <FaPlus size={16} className="sm:w-5 sm:h-5" />
                        إضافة مهارة
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {userSkills.length > 0 ? (
                      userSkills.map((skill, index) => (
                        <div 
                          key={index} 
                          className="flex items-center px-4 sm:px-8 justify-between text-black mb-2 sm:mb-4 rounded-full text-center shadow-md hover:shadow-lg transition-shadow duration-200 min-h-[40px] sm:min-h-[50px]"
                          style={{ backgroundColor: '#F5F5DC' }}
                        >
                          <span className='flex-1 py-2 sm:py-1 px-2 text-sm sm:text-base text-center' >{skill}</span>
                          {id === currentUserId && (
                            <button
                              onClick={() => handleDeleteSkill(skill)}
                              className="text-red-600 hover:text-red-800 ml-2 sm:mr-16 flex-shrink-0"
                              title="حذف المهارة"
                            >
                              <FaTimes size={12} className="sm:w-3.5 sm:h-3.5 mr-12" />
                            </button>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full text-gray-500 text-center py-6 sm:py-8 italic text-sm sm:text-base">
                        لا توجد مهارات مضافة بعد
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2 mt-8 sm:mt-16">
                    <FaCalendarAlt className="text-[#B22222]" />
                    معلومات الانضمام
                  </h4>
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-3 sm:p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-[#B22222] rounded-full flex-shrink-0"></div>
                      <span className="text-gray-700 font-medium text-sm sm:text-base">
                        انضم في: {new Date(userData.dateJoined).toLocaleDateString('ar-EG', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="mt-2 text-xs sm:text-sm text-gray-600">
                      عضو منذ {Math.floor((new Date() - new Date(userData.dateJoined)) / (1000 * 60 * 60 * 24))} يوم
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="col-span-12 lg:col-span-3">
          <ProfileLeftside 
            userData={userData} 
            suggestedFriends={suggestedFriends} 
            followedCraftsmen={followedCraftsmen} 
            toggleFollow={toggleFollow}
          />
        </div>
      </div>
    </div>
  );
}
