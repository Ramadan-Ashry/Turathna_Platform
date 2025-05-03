import axios from "axios";
import { TokenContext } from "../../Context/TokenContext";
import React, { useState, useContext, useEffect } from "react";
import styles from './Home.module.css';

export default function NewPost() {
  const { token } = useContext(TokenContext);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [postData, setPostData] = useState({
    title: "",
    content: "",
    images: null,   // <-- لاحظي هنا الصور تبتدي null مش مصفوفة
    categoryId: "",
    userId: "",
  });

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setPostData((prev) => ({ ...prev, userId: storedUserId }));
    }
  }, []);

  async function addNewPost(formData) {
    try {
      const res = await axios.post(
        "https://ourheritage.runasp.net/api/Articles",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
          timeout: 20000,
        }
      );
      console.log("Post created successfully:", res.data);
      setIsFormVisible(false);
    } catch (error) {
      console.error("Error creating post:", error.response?.data || error);
    }
  }

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setPostData((prev) => ({
        ...prev,
        [name]: files.length > 0 ? files : null,
      }));
    } else {
      setPostData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    formData.append("Title", postData.title);
    formData.append("Content", postData.content);
    formData.append("UserId", postData.userId);

    if (postData.categoryId) {
      formData.append("CategoryId", postData.categoryId);
    }

    // ✨ فقط لو فيه صور، نضيفها
    if (postData.images) {
      for (let i = 0; i < postData.images.length; i++) {
        formData.append("Images", postData.images[i]);
      }
    }

    await addNewPost(formData);
  };

  return (
    <div className="create-post bg-white rounded shadow-md p-4 mb-6 border-t-4 border-[#A0522D]">
      <h2 className="text-right text-lg font-bold text-brown-700">إنشاء منشور جديد</h2>

      <div className="mt-2">
        <input
          type="text"
          placeholder="اضغط هنا لكتابة منشور..."
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none text-right cursor-pointer"
          onClick={() => setIsFormVisible(true)}
          readOnly
        />
      </div>

      {isFormVisible && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent}>
            <form onSubmit={handleSubmit} className="mt-4">
              <input
                type="text"
                name="title"
                placeholder="العنوان (اختياري)"
                value={postData.title}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md mt-2 text-right"
              />

              <textarea
                name="content"
                placeholder="ماذا يدور في بالك؟"
                value={postData.content}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none text-right mt-2"
              />

              <div className="mt-2">
                <label className="block text-gray-600 text-sm mb-1 text-right">رفع صورة (اختياري):</label>
                <input
                  type="file"
                  name="images"
                  multiple
                  onChange={handleChange}
                  className="w-full"
                />
              </div>

              <input
                type="text"
                name="categoryId"
                placeholder="معرف الفئة (اختياري)"
                value={postData.categoryId}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md mt-2 text-right"
              />

              <div className="flex justify-between mt-4">
                <button
                  type="submit"
                  className="bg-[#A0522D] text-white px-4 py-2 rounded-lg hover:bg-[#8B4513] transition text-sm"
                >
                  نشر
                </button>
                <button
                  type="button"
                  className="bg-gray-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-gray-600 text-sm"
                  onClick={() => setIsFormVisible(false)}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
