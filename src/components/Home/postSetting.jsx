import React, { useState } from 'react';
import { FaEllipsisH } from "react-icons/fa";
import styles from './Home.module.css';
import DeletePost from './deletePost';
import { usePostContext } from "../../Context/PostContext";

export default function PostSettings({post,setPosts}) {
  const [isListOpen, setIsListOpen] = useState(false);

  const handleShowList = () => {
    setIsListOpen(!isListOpen);
  };

  const hidePost = () => {
    setPosts(prevPosts =>
      prevPosts.map(p =>
        p.id === post.id ? { ...p, isHidden: true } : p
      )
    );
  };

  return (
    <div className={styles.settinglist}>
      <span
        className="text-red-900 text-lg cursor-pointer"
        onClick={handleShowList}
      >
        <FaEllipsisH />
      </span>

      {isListOpen && (
        <div 
          className="absolute  z-10 left-0  shadow-lg mt-2 p-2 w-60 " 
          style={{ border: '2px solid #B18B5E', backgroundColor: '#FFFCFC' }}
        >
          
          <div className="cursor-pointer hover:bg-gray-100 p-2 ">
            <p className="font-semibold text-red-600" onClick={hidePost}>إخفاء المنشور</p>
            <p className="text-sm text-gray-500">إخفاء هذا المنشور</p>
          </div>
          <DeletePost postId={post.id} />
        </div>
      )}
    </div>
  );
}