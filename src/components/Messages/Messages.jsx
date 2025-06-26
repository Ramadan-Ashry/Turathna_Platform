import { useEffect, useState, useContext, useCallback } from "react";
import axios from "axios";
import { TokenContext } from "../../Context/TokenContext";
import { FaReply, FaTimes, FaUsers, FaCheck } from "react-icons/fa";
import chatBackground from "../../assets/back2.jpg";

export default function ChatApp() {
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [showFriendList, setShowFriendList] = useState(false);
  const [friends, setFriends] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [chatSearchTerm, setChatSearchTerm] = useState("");
  const [chatAreaMessage, setChatAreaMessage] = useState("");
  const [error, setError] = useState(null);
  const [friendError, setFriendError] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [replyToMessage, setReplyToMessage] = useState(null);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [groupProfilePicture, setGroupProfilePicture] = useState(null);

  const userId = localStorage.getItem("userId") || "tempUserId";
  const userName = localStorage.getItem("userName") || "You";
  const { token } = useContext(TokenContext);

  // Fetch friends when showing friend list or group modal
  useEffect(() => {
    if ((showFriendList || showGroupModal) && userId && token) {
      axios
        .get(`https://ourheritage.runasp.net/api/Follow/${userId}/followings`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          const friendsData = res.data || [];
          setFriends(friendsData.filter((f) => f.id && f.userName));
          setFriendError(null);
        })
        .catch((err) => {
          console.error("Error fetching friends:", err.response?.data);
          setFriendError("خطأ في جلب الأصدقاء");
        });
    }
  }, [showFriendList, showGroupModal, token, userId]);

  // Fetch messages (initial and periodic polling)
  const fetchMessages = useCallback(async () => {
    if (!token) {
      setError("يرجى تسجيل الدخول لعرض الرسائل");
      return;
    }
    try {
      // Fetch all messages
      const res = await axios.get(
        `https://ourheritage.runasp.net/api/Chat/messages/all?page=${page}&pageSize=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const messages = res.data.items.map((msg) => ({
        id: msg.id || `msg-${Date.now()}`,
        conversationId: msg.conversationId,
        content: msg.content,
        senderId: msg.sender?.id || null,
        sentBy: msg.sender?.firstName || "Unknown",
        fullName: `${msg.sender?.firstName || "Unknown"} ${msg.sender?.lastName || ""}`.trim(),
        profilePicture: msg.sender?.profilePicture || "https://via.placeholder.com/40",
        sentAt: msg.sentAt || new Date().toISOString(),
        type: msg.type === 0 ? "normal" : "system",
        replyToMessageId: msg.replyToMessageId || null,
        isRead: true,
      }));

      // Fetch unread messages
      const unreadRes = await axios.get(
        "https://ourheritage.runasp.net/api/Chat/unread?page=1&pageSize=10",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const unreadMessages = unreadRes.data.unreadMessages.items.map((msg) => ({
        id: msg.id || `msg-${Date.now()}`,
        conversationId: msg.conversationId,
        content: msg.content || "",
        senderId: msg.sender?.id || null,
        sentBy: msg.sender?.firstName || "Unknown",
        fullName: `${msg.sender?.firstName || "Unknown"} ${msg.sender?.lastName || ""}`.trim(),
        profilePicture: msg.sender?.profilePicture || "https://via.placeholder.com/40",
        sentAt: msg.sentAt || new Date().toISOString(),
        type: msg.type === 0 ? "normal" : "system",
        replyToMessageId: msg.replyToMessageId || null,
        isRead: false,
      }));

      // Merge messages, prioritizing unread status
      const allMessages = messages
        .map((msg) => {
          const unreadMsg = unreadMessages.find((u) => u.id === msg.id);
          return unreadMsg ? { ...msg, isRead: false } : msg;
        })
        .concat(unreadMessages.filter((u) => !messages.some((m) => m.id === u.id)));

      // Fetch conversations
      const convRes = await axios.get(
        "https://ourheritage.runasp.net/api/Chat/conversations?page=1&pageSize=20",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const conversationMap = convRes.data.items.reduce((acc, conv) => {
        const isGroup = conv.participants?.length > 2;
        acc[conv.id] = {
          id: conv.id,
          title: conv.title || (isGroup ? "مجموعة بدون اسم" : conv.participants
            ?.filter((p) => p.id !== Number(userId))
            .map((p) => `${p.firstName} ${p.lastName || ""}`)
            .join(", ") || "غير معروف"),
          originalTitle: conv.title, // Store the original title from API
          participants: conv.participants || [],
          isGroup,
          profilePicture: conv.profilePicture || (isGroup ? "https://via.placeholder.com/40?text=Group" : null),
        };
        return acc;
      }, {});

      // Calculate unread count per conversation
      const unreadCountMap = unreadMessages.reduce((acc, msg) => {
        acc[msg.conversationId] = (acc[msg.conversationId] || 0) + 1;
        return acc;
      }, {});

      setConversations((prev) => {
        const groupedConversations = allMessages.reduce((acc, msg) => {
          const convId = msg.conversationId;
          if (!acc[convId]) {
            const convData = conversationMap[convId] || {};
            const existingConv = prev.find(c => c.id === convId);
            
            acc[convId] = {
              id: convId,
              // احتفظ بالاسم والصورة من البيانات السابقة إذا كانت موجودة
              title: existingConv?.originalTitle || convData.originalTitle || convData.title || "غير معروف",
              originalTitle: existingConv?.originalTitle || convData.originalTitle,
              messages: [],
              participants: convData.participants || [{ firstName: msg.sentBy || "Unknown", lastName: "" }],
              lastMessage: msg,
              isGroup: convData.isGroup || false,
              unreadCount: unreadCountMap[convId] || 0,
              profilePicture: existingConv?.profilePicture || convData.profilePicture || (convData.isGroup ? "https://via.placeholder.com/40?text=Group" : "https://via.placeholder.com/40"),
            };
          }
          if (!acc[convId].messages.some((m) => m.id === msg.id)) {
            acc[convId].messages.push(msg);
          }
          
          // تحديث آخر رسالة بناءً على التاريخ
          if (!acc[convId].lastMessage || new Date(msg.sentAt) > new Date(acc[convId].lastMessage.sentAt)) {
            acc[convId].lastMessage = msg;
          }
          return acc;
        }, {});

        // ترتيب الرسائل داخل كل محادثة حسب التاريخ (الأقدم أولاً)
        Object.values(groupedConversations).forEach(conv => {
          conv.messages.sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt));
        });

        const updatedConversations = Object.values(groupedConversations).map((newConv) => {
          const existingConv = prev.find((c) => c.id === newConv.id);
          return {
            ...newConv,
            originalTitle: existingConv?.originalTitle || newConv.originalTitle,
            profilePicture: existingConv?.profilePicture || newConv.profilePicture,
          };
        });

        // إضافة المحادثات التي لا تحتوي على رسائل جديدة
        prev.forEach((oldConv) => {
          if (!updatedConversations.some((c) => c.id === oldConv.id)) {
            updatedConversations.push(oldConv);
          }
        });

        // ترتيب المحادثات حسب آخر رسالة (الأحدث أولاً)
        return updatedConversations.sort((a, b) => {
          if (!a.lastMessage && !b.lastMessage) return 0;
          if (!a.lastMessage) return 1;
          if (!b.lastMessage) return -1;
          return new Date(b.lastMessage.sentAt) - new Date(a.lastMessage.sentAt);
        });
      });

      setTotalPages(res.data.totalPages || 1);
      
      // تحديث المحادثة المختارة إذا كانت موجودة
      if (selectedChat) {
        setSelectedChat(prev => {
          const updatedChat = conversations.find(c => c.id === prev.id);
          if (updatedChat) {
            return {
              ...updatedChat,
              messages: updatedChat.messages.sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt))
            };
          }
          return prev;
        });
      }
      
    } catch (err) {
      console.error("خطأ في جلب الرسائل:", err.response?.data);
      setError("خطأ في جلب الرسائل: " + (err.response?.data?.text || err.message));
    }
  }, [token, page, userName, userId]);

  // Periodic polling for new messages - تم تقليل الفترة لاستقبال الرسائل بشكل أسرع
  useEffect(() => {
    fetchMessages();
    const intervalId = setInterval(fetchMessages, 2000); // كل ثانيتين بدلاً من 5 ثوان
    return () => clearInterval(intervalId);
  }, [fetchMessages]);

  // Mark messages as read when selecting a chat
  useEffect(() => {
    async function markMessagesAsRead() {
      if (!selectedChat || !token || !selectedChat.messages) return;

      const unreadMessages = selectedChat.messages.filter((msg) => !msg.isRead && msg.senderId !== Number(userId));
      if (unreadMessages.length === 0) return;

      try {
        for (const msg of unreadMessages) {
          await axios.post(
            `https://ourheritage.runasp.net/api/Chat/messages/${msg.id}/read`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
              },
            }
          );
        }

        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === selectedChat.id
              ? {
                  ...conv,
                  messages: conv.messages.map((m) =>
                    unreadMessages.some((u) => u.id === m.id) ? { ...m, isRead: true } : m
                  ),
                  unreadCount: 0,
                }
              : conv
          )
        );
        setSelectedChat((prev) => ({
          ...prev,
          messages: prev.messages.map((m) =>
            unreadMessages.some((u) => u.id === m.id) ? { ...m, isRead: true } : m
          ),
          unreadCount: 0,
        }));
      } catch (err) {
        console.error("Error marking messages as read:", err.response?.data);
      }
    }

    markMessagesAsRead();
  }, [selectedChat, token, userId]);

  // Send message
  const sendMessage = async (messageContent, fromChatArea = false) => {
    const trimmed = messageContent.trim();
    if (!selectedChat?.id || !trimmed || !Number.isFinite(Number(selectedChat.id)) || isSending || isCreatingChat) {
      setError("يرجى تحديد محادثة صالحة أو إدخال رسالة");
      return;
    }

    setIsSending(true);
    const payload = {
      conversationId: Number(selectedChat.id),
      content: trimmed,
      type: 0,
      attachment: "",
      replyToMessageId: replyToMessage?.id || 0,
    };

    try {
      const endpoint = replyToMessage
        ? "https://ourheritage.runasp.net/api/Chat/messages/reply"
        : "https://ourheritage.runasp.net/api/Chat/messages";

      const res = await axios.post(endpoint, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (res.status === 200 || res.status === 201) {
        const newMsg = {
          id: res.data.id || Date.now(),
          conversationId: selectedChat.id,
          content: trimmed,
          senderId: Number(userId),
          sentBy: userName,
          fullName: userName,
          profilePicture: "https://via.placeholder.com/40",
          sentAt: new Date().toISOString(),
          type: "normal",
          replyToMessageId: replyToMessage?.id || null,
          isRead: false,
        };
        
        setSelectedChat((prev) => ({
          ...prev,
          messages: [...(prev?.messages || []), newMsg].sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt)),
        }));
        
        if (fromChatArea) {
          setChatAreaMessage("");
          setReplyToMessage(null);
        }

        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === selectedChat.id
              ? {
                  ...conv,
                  messages: [...(conv.messages || []), newMsg].sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt)),
                  lastMessage: newMsg,
                }
              : conv
          ).sort((a, b) => {
            if (!a.lastMessage && !b.lastMessage) return 0;
            if (!a.lastMessage) return 1;
            if (!b.lastMessage) return -1;
            return new Date(b.lastMessage.sentAt) - new Date(a.lastMessage.sentAt);
          })
        );
        
        // تحديث فوري للرسائل بعد الإرسال
        setTimeout(() => {
          fetchMessages();
        }, 500);
      }
    } catch (err) {
      console.error("Error sending message:", err.response?.data);
      setError(`حدث خطأ أثناء إرسال الرسالة: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsSending(false);
    }
  };

  // Start a new chat (unchanged)
  const handleStartChat = async (friend) => {
    if (!friend?.id || !friend?.userName) {
      setError("بيانات المستخدم غير صالحة. حاول مرة أخرى.");
      return;
    }

    setIsCreatingChat(true);
    const existing = conversations.find((c) =>
      c.participants.some((p) => p.id === friend.id && !c.isGroup)
    );
    if (existing) {
      setSelectedChat(existing);
      setIsCreatingChat(false);
    } else {
      try {
        const res = await axios.post(
          "https://ourheritage.runasp.net/api/Chat/conversations",
          {
            participantIds: [Number(friend.id)],
            title: friend.userName,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );
        if (!res.data?.conversationId) {
          throw new Error("Invalid conversation ID returned");
        }
        const newConv = {
          id: res.data.conversationId,
          title: friend.userName,
          originalTitle: friend.userName,
          messages: [],
          participants: [{ firstName: friend.userName, id: friend.id }],
          lastMessage: null,
          isGroup: false,
          unreadCount: 0,
          profilePicture: friend.profilePicture || "https://via.placeholder.com/40",
        };
        setConversations((prev) => [...prev, newConv]);
        setSelectedChat(newConv);
      } catch (err) {
        console.error("Error creating conversation:", err.response?.data || err.message);
        setError(`خطأ في إنشاء المحادثة: ${err.response?.data?.message || err.message}`);
      } finally {
        setIsCreatingChat(false);
      }
    }

    setShowFriendList(false);
    setSearchTerm("");
    setChatSearchTerm("");
  };

  // Create group - تم تحسينه للاحتفاظ بأسماء وصور المجموعات
  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      setError("يرجى إدخال اسم المجموعة");
      return;
    }
    if (selectedParticipants.length === 0) {
      setError("يرجى اختيار مشارك واحد على الأقل");
      return;
    }

    setIsCreatingChat(true);
    try {
      let profilePictureUrl = "https://via.placeholder.com/40?text=Group";
      if (groupProfilePicture) {
        profilePictureUrl = "https://via.placeholder.com/40?text=Uploaded";
      }

      const createRes = await axios.post(
        "https://ourheritage.runasp.net/api/Chat/conversations",
        {
          participantIds: selectedParticipants.map((id) => Number(id)),
          title: groupName,
          profilePicture: profilePictureUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (!createRes.data?.conversationId) {
        throw new Error("Invalid conversation ID returned");
      }

      const conversationId = createRes.data.conversationId;

      for (const participantId of selectedParticipants) {
        try {
          await axios.post(
            "https://ourheritage.runasp.net/api/Chat/conversations/join",
            { conversationId: Number(conversationId) },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                Accept: "application/json",
              },
            }
          );
          console.log(`Participant ${participantId} joined group ${conversationId}`);
        } catch (joinErr) {
          console.error(`Error joining participant ${participantId}:`, joinErr.response?.data);
        }
      }

      const newConv = {
        id: conversationId,
        title: groupName,
        originalTitle: groupName, // تأكد من حفظ الاسم الأصلي
        messages: [],
        participants: [
          { firstName: userName, id: Number(userId) },
          ...friends
            .filter((f) => selectedParticipants.includes(f.id))
            .map((f) => ({ firstName: f.userName, id: f.id })),
        ],
        lastMessage: null,
        isGroup: true,
        unreadCount: 0,
        profilePicture: profilePictureUrl,
      };
      
      setConversations((prev) => [...prev, newConv]);
      setSelectedChat(newConv);

      // تحديث فوري بعد إنشاء المجموعة
      setTimeout(() => {
        fetchMessages();
      }, 1000);

      setShowGroupModal(false);
      setGroupName("");
      setSelectedParticipants([]);
      setGroupProfilePicture(null);
    } catch (err) {
      console.error("Error creating group:", err.response?.data || err.message);
      setError(`خطأ في إنشاء المجموعة: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsCreatingChat(false);
    }
  };

  const toggleParticipant = (friendId) => {
    setSelectedParticipants((prev) =>
      prev.includes(friendId) ? prev.filter((id) => id !== friendId) : [...prev, friendId]
    );
  };

  const handleReply = (message) => {
    setReplyToMessage(message);
    setChatAreaMessage(`رد على "${message.content}": `);
  };

  const toggleFriendList = () => {
    setShowFriendList((prev) => !prev);
    if (showFriendList) {
      setFriendError(null);
      setFriends([]);
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    const search = chatSearchTerm.toLowerCase();
    return (
      conv.title?.toLowerCase().includes(search) ||
      conv.participants?.some(
        (p) =>
          p.firstName.toLowerCase().includes(search) ||
          p.lastName?.toLowerCase()?.includes(search)
      )
    );
  });

  const filteredFriends = friends.filter((f) =>
    f.userName?.toLowerCase().includes(searchTerm?.toLowerCase())
  );

  if (error) {
    return <div className="text-center p-4 text-red-500">{error}</div>;
  }

return (
    <div className="flex h-screen mt-24 border border-amber-200 shadow-2xl" dir="rtl">
      {/* Sidebar */}
      <div
        className="w-1/4 border-r border-amber-300 overflow-y-auto"
        style={{ 
          background: "linear-gradient(135deg, #f4f1e8 0%, #e8dcc0 100%)",
          borderLeft: "2px solid #d4af37",
          boxShadow: "inset 0 0 20px rgba(212, 175, 55, 0.1)"
        }}
      >
        <div className="p-4 border-b border-amber-300 flex justify-between items-center"
             style={{ background: "linear-gradient(135deg, #8b4513 0%, #a0522d 100%)" }}>
          <button
            onClick={toggleFriendList}
            className="text-sm h-10 text-white px-4 py-2 w-40 rounded-lg font-semibold shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
            style={{ 
              background: "linear-gradient(135deg, #d4af37 0%, #b8860b 100%)",
              border: "1px solid #ffd700"
            }}
          >
            بدء محادثة
          </button>
          <button
            onClick={() => setShowGroupModal(true)}
            className="text-sm h-10 text-white px-4 w-40 py-2 rounded-lg font-semibold shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
            style={{ 
              background: "linear-gradient(135deg, #cd853f 0%, #8b4513 100%)",
              border: "1px solid #daa520"
            }}
          >
            <FaUsers className="inline-block w-4 h-4 ml-1" />
            إنشاء مجموعة
          </button>
        </div>

        {showFriendList && (
          <div className="bg-white shadow-lg border border-amber-200 rounded-lg m-3 p-3 space-y-2"
               style={{ background: "linear-gradient(135deg, #faf8f3 0%, #f5f2e8 100%)" }}>
            <input
              type="text"
              placeholder="ابحث عن صديق..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 border-2 border-amber-300 rounded-lg focus:border-amber-500 focus:outline-none transition-colors"
              style={{ background: "rgba(255, 255, 255, 0.9)" }}
            />
            {friendError ? (
              <div className="text-sm text-red-600 text-center bg-red-50 p-2 rounded-lg border border-red-200">
                {friendError}
              </div>
            ) : (
              <ul className="space-y-2 max-h-60 overflow-y-auto">
                {filteredFriends.length === 0 ? (
                  <div className="text-sm text-amber-700 text-center p-4 bg-amber-50 rounded-lg">
                    لا يوجد أصدقاء لعرضهم
                  </div>
                ) : (
                  filteredFriends.map((friend, index) => (
                    <li
                      key={friend.id || `friend-${index}`}
                      className="flex justify-between items-center p-3 hover:bg-amber-100 rounded-lg transition-colors border border-amber-200"
                    >
                      <span className="font-semibold text-amber-800">{friend.userName}</span>
                      <button
                        onClick={() => handleStartChat(friend)}
                        className="text-white text-sm px-3 py-1 rounded-lg w-20 transition-all duration-300 hover:shadow-md"
                        style={{ background: "linear-gradient(135deg, #d4af37 0%, #b8860b 100%)" }}
                        disabled={isCreatingChat}
                      >
                        ابدأ
                      </button>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>
        )}

        {filteredConversations.length === 0 ? (
          <div className="text-center p-6 text-amber-700 bg-amber-50 m-3 rounded-lg border border-amber-200">
            <div className="text-6xl mb-4">💬</div>
            <p>لا توجد محادثات متاحة</p>
            <p className="text-sm mt-2">ابدأ محادثة جديدة!</p>
          </div>
        ) : (
          <ul className="p-2">
            {filteredConversations.map((conv, index) => (
              <li
                key={conv.id || `conv-${index}`}
                onClick={() => setSelectedChat(conv)}
                className={`cursor-pointer p-4 m-2 rounded-lg hover:shadow-lg transition-all duration-300 border ${
                  selectedChat?.id === conv.id 
                    ? "bg-gradient-to-r from-amber-100 to-amber-200 border-amber-400 shadow-lg transform scale-[1.02]" 
                    : "bg-white hover:bg-amber-50 border-amber-200"
                }`}
              >
                <div className="flex items-center gap-3 text-sm">
                  <div className="relative">
                    <img
                      src={
                        conv.isGroup
                          ? conv.profilePicture || "https://via.placeholder.com/40?text=Group"
                          : conv.participants?.find((p) => p.id !== Number(userId))?.profilePicture ||
                            "https://via.placeholder.com/40"
                      }
                      alt={conv.isGroup ? conv.title || "Group" : `${conv.participants?.find((p) => p.id !== Number(userId))?.firstName || "Unknown"}'s profile`}
                      className="w-12 h-12 rounded-full object-cover border-2 border-amber-300 shadow-md"
                      onError={(e) => (e.target.src = "https://via.placeholder.com/40")}
                    />
                    {conv.unreadCount > 0 && (
                      <span
                        className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center text-xs font-bold text-white rounded-full shadow-md"
                        style={{
                          background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                          border: "2px solid white"
                        }}
                      >
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col flex-1">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-amber-900">
                        {conv.originalTitle || conv.title || "غير معروف"}
                      </span>
                    </div>
                    <div className="text-xs text-amber-700 truncate pr-2 mt-1">
                      {conv.lastMessage?.content || conv.messages?.[0]?.content || "لا توجد رسائل"}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Group Creation Modal */}
      {showGroupModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            backdropFilter: "blur(5px)"
          }}
          dir="rtl"
        >
          <div
            style={{
              background: "linear-gradient(135deg, #faf8f3 0%, #f5f2e8 100%)",
              borderRadius: "16px",
              padding: "32px",
              width: "420px",
              boxShadow: "0 20px 40px rgba(139, 69, 19, 0.3)",
              border: "2px solid #d4af37"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h3 style={{ fontSize: "22px", fontWeight: "bold", color: "#8b4513" ,width:"2000px" }}>إنشاء مجموعة جديدة</h3>
              <button
                onClick={() => {
                  setShowGroupModal(false);
                  setGroupName("");
                  setSelectedParticipants([]);
                  setGroupProfilePicture(null);
                }}
                style={{ 
                  color: "#dc2626", 
                  fontSize: "24px", 
                  cursor: "pointer",
                  padding: "4px",
                  borderRadius: "50%",
                  transition: "all 0.3s ease"
                }}
                // className="hover:bg-red-100"
              >
                <FaTimes />
              </button>
            </div>
            <input
              type="text"
              placeholder="اسم المجموعة..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                border: "2px solid #d4af37",
                borderRadius: "8px",
                marginBottom: "16px",
                fontSize: "16px",
                background: "rgba(255, 255, 255, 0.9)"
              }}
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setGroupProfilePicture(e.target.files[0])}
              style={{
                width: "100%",
                padding: "12px",
                border: "2px solid #d4af37",
                borderRadius: "8px",
                marginBottom: "16px",
                background: "rgba(255, 255, 255, 0.9)"
              }}
            />
            {groupProfilePicture && (
              <img
                src={URL.createObjectURL(groupProfilePicture)}
                alt="Group Preview"
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  marginBottom: "16px",
                  border: "3px solid #d4af37",
                  display: "block",
                  margin: "0 auto 16px auto"
                }}
              />
            )}
            <input
              type="text"
              placeholder="ابحث عن أصدقاء..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                border: "2px solid #d4af37",
                borderRadius: "8px",
                marginBottom: "16px",
                background: "rgba(255, 255, 255, 0.9)"
              }}
            />
            <ul style={{ 
              maxHeight: "180px", 
              overflowY: "auto", 
              // marginBottom: "20px",
              background: "rgba(255, 255, 255, 0.5)",
              borderRadius: "8px",
              padding: "8px"
            }}>
              {filteredFriends.length === 0 ? (
                <div style={{ 
                  fontSize: "14px", 
                  color: "#8b4513", 
                  textAlign: "center",
                  padding: "16px",
                  background: "#f5f2e8",
                  borderRadius: "8px"
                }}>
                  لا يوجد أصدقاء لعرضهم
                </div>
              ) : (
                filteredFriends.map((friend) => (
                  <li
                    key={friend.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      // padding: "12px",
                      borderRadius: "8px",
                      // marginBottom: "4px",
                      background: selectedParticipants.includes(friend.id) ? "#e6f3ff" : "transparent",
                      border: selectedParticipants.includes(friend.id) ? "2px solid #d4af37" : "1px solid transparent"
                    }}
                  >
                    <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={selectedParticipants.includes(friend.id)}
                        onChange={() => toggleParticipant(friend.id)}
                        style={{ 
                          width: "18px", 
                          height: "18px",
                          accentColor: "#d4af37"
                        }}
                      />
                      <span style={{ fontWeight: "500", color: "#8b4513" }}>{friend.userName}</span>
                    </label>
                  </li>
                ))
              )}
            </ul>
            <div style={{ display: "flex", justifyContent: "end", gap: "12px" }}>
              <button
                onClick={handleCreateGroup}
                style={{
                  padding: "12px 24px",
                  background: "linear-gradient(135deg, #d4af37 0%, #b8860b 100%)",
                  color: "white",
                  borderRadius: "8px",
                  cursor: isCreatingChat ? "not-allowed" : "pointer",
                  fontWeight: "bold",
                  border: "none",
                  boxShadow: "0 4px 8px rgba(212, 175, 55, 0.3)"
                }}
                disabled={isCreatingChat}
              >
                {isCreatingChat ? "جاري الإنشاء..." : "إنشاء"}
              </button>
              <button
                onClick={() => {
                  setShowGroupModal(false);
                  setGroupName("");
                  setSelectedParticipants([]);
                  setGroupProfilePicture(null);
                }}
                style={{
                  padding: "12px 24px",
                  background: "linear-gradient(135deg, #94a3b8 0%, #64748b 100%)",
                  color: "white",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  border: "none"
                }}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 flex flex-col relative"
           style={{ background: "linear-gradient(135deg, #faf8f3 0%, #f0ead6 100%)" }}>
        {conversations.length === 0 ? (
          <div className="flex items-center justify-center flex-1 text-amber-700">
            <div className="text-center">
              <div className="text-8xl mb-6">🕌</div>
              <h2 className="text-2xl font-bold mb-2">مرحباً بك</h2>
              <p>لا توجد محادثات. ابدأ محادثة جديدة من القائمة الجانبية.</p>
            </div>
          </div>
        ) : selectedChat ? (
          <>
            <div
              className="p-4 border-b font-bold sticky top-0 z-10 shadow-md"
              style={{ 
                background: "linear-gradient(135deg, #8b4513 0%, #a0522d 100%)",
                borderBottom: "3px solid #d4af37",
                color: "white"
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center">
                  💬
                </div>
                {selectedChat.originalTitle || selectedChat.title || "غير معروف"}
              </div>
            </div>
            <div
              className="flex-1 p-4 mt-0 overflow-y-auto space-y-4"
              style={{
                paddingBottom: "120px",
                backgroundImage: `url(${chatBackground})`,
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                background: "linear-gradient(135deg, #faf8f3 0%, #f0ead6 100%)"
              }}
            >
              {(selectedChat.messages || []).map((msg, index) => {
                const isUser = msg.senderId
                  ? String(msg.senderId) === String(userId)
                  : (msg.sentBy || "Unknown").trim().toLowerCase() === userName.trim().toLowerCase();
                const isSystem = msg.type === "system";
                const repliedMessage = msg.replyToMessageId
                  ? selectedChat.messages.find((m) => m.id === msg.replyToMessageId)
                  : null;

                return (
                  <div
                    key={`msg-${msg.id || index}`}
                    className={`flex items-start gap-3 max-w-[98%] ${
                      isSystem
                        ? "text-center text-sm text-amber-700 bg-amber-100 px-4 py-2 rounded-lg w-fit mx-auto border border-amber-300"
                        : isUser
                        ? "ml-auto flex-row-reverse"
                        : "mr-auto flex-row"
                    }`}
                  >
                    {!isSystem && (
                      <img
                        src={msg.profilePicture}
                        alt={`${msg.fullName || "Unknown"}'s profile`}
                        className="w-10 h-10 rounded-full object-cover border-2 border-amber-300 shadow-md"
                        onError={(e) => (e.target.src = "https://via.placeholder.com/40")}
                      />
                    )}
                    <div
                      className={`rounded-xl p-4 shadow-lg max-w-sm ${
                        isSystem
                          ? ""
                          : isUser
                          ? "text-white"
                          : "bg-white text-gray-800 border border-amber-200"
                      }`}
                      style={isUser && !isSystem ? {
                        background: "linear-gradient(135deg, #d4af37 0%, #b8860b 100%)"
                      } : {}}
                    >
                      {!isSystem && (
                        <div className="flex justify-between items-center mb-2">
                          <p className={`text-sm font-bold ${isUser ? 'text-amber-100' : 'text-amber-800'}`}>
                            {msg.fullName || "Unknown"}
                          </p>
                          <FaReply
                            className={`w-4 h-4 cursor-pointer transition-colors ${
                              isUser ? 'text-amber-200 hover:text-white' : 'text-amber-400 hover:text-amber-600'
                            }`}
                            title="رد"
                            onClick={() => handleReply(msg)}
                          />
                        </div>
                      )}
                      {repliedMessage && (
                        <div className="text-xs bg-amber-50 border border-amber-200 p-3 rounded-lg mb-3">
                          <p className="font-semibold text-amber-800">{repliedMessage.fullName || "Unknown"}</p>
                          <p className="truncate text-amber-700">{repliedMessage.content}</p>
                        </div>
                      )}
                      <p className="leading-relaxed">{msg.content}</p>
                      {!isSystem && (
                        <div className="flex justify-between items-center mt-2">
                          <small className={`text-xs ${isUser ? 'text-amber-100' : 'text-amber-600'}`}>
                            {new Date(msg.sentAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </small>
                          {isUser && (
                            <span className="text-xs text-amber-200">
                              {msg.isRead ? (
                                <>
                                  <FaCheck className="inline w-3 h-3" />
                                  <FaCheck className="inline w-3 h-3 -ml-1" />
                                </>
                              ) : (
                                <FaCheck className="inline w-3 h-3" />
                              )}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="absolute bottom-0 w-full border-t p-4 z-20"
                 style={{ 
                   background: "linear-gradient(135deg, #f4f1e8 0%, #e8dcc0 100%)",
                   borderTop: "2px solid #d4af37"
                 }}>
              {replyToMessage && (
                <div className="w-full bg-amber-100 border border-amber-300 p-3 mb-3 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="text-sm font-semibold text-amber-800">رد على:</p>
                    <p className="text-sm text-amber-700">{replyToMessage.content}</p>
                  </div>
                  <span
                    onClick={() => setReplyToMessage(null)}
                    className="text-red-500 text-2xl cursor-pointer hover:scale-110 hover:bg-red-100 rounded-full p-1 transition-all"
                    title="إلغاء الرد"
                  >
                    ×
                  </span>
                </div>
              )}
              <form
                className="flex gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!selectedChat || isCreatingChat || !selectedChat.id) return;
                  sendMessage(chatAreaMessage, true);
                }}
              >
                <input
                  type="text"
                  placeholder="اكتب رسالة..."
                  value={chatAreaMessage}
                  onChange={(e) => setChatAreaMessage(e.target.value)}
                  disabled={!selectedChat || isSending || isCreatingChat || !selectedChat.id}
                  className={`flex-1 p-3 h-12 border-2 border-amber-300 rounded-lg focus:outline-none focus:border-amber-500 transition-colors ${
                    !selectedChat || isSending || isCreatingChat || !selectedChat.id
                      ? "bg-gray-200 cursor-not-allowed"
                      : "bg-white"
                  }`}
                />
                <button
                  type="submit"
                  disabled={!selectedChat || !chatAreaMessage.trim() || isSending || isCreatingChat || !selectedChat.id}
                  className="px-6 py-2 w-24 h-12 rounded-lg text-white font-bold cursor-pointer transition-all duration-300 hover:shadow-lg"
                  style={{
                    background: selectedChat && chatAreaMessage.trim() && !isSending && !isCreatingChat && selectedChat.id
                        ? "linear-gradient(135deg, #d4af37 0%, #b8860b 100%)"
                        : "linear-gradient(135deg, #d1d5db 0%, #9ca3af 100%)",
                  }}
                >
                  {isSending ? "جاري..." : "إرسال"}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center flex-1 text-amber-700">
            <div className="text-center">
              <div className="text-8xl mb-6">💬</div>
              <h2 className="text-2xl font-bold mb-2">اختر محادثة</h2>
              <p>اختر محادثة من القائمة لبدء الدردشة</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}