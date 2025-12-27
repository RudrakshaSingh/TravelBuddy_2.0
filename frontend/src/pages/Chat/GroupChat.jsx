import { useAuth } from "@clerk/clerk-react";
import { Loader2, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";

import { createAuthenticatedApi, groupChatService, userService } from "../../redux/services/api";

function GroupChat() {
  const { activityId } = useParams();
  const { getToken, userId } = useAuth();

  const authApi = createAuthenticatedApi(getToken);

  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const messagesEndRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load User Profile (to get Mongo ID)
  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await userService.getProfile(authApi);
        setCurrentUser(res.data);
      } catch (err) {
        console.error("Failed to load user profile", err);
      }
    };
    if (userId) { // Only fetch if we have a Clerk ID (logged in)
      loadUser();
    }
  }, [userId]);

  // Load chat + messages
  useEffect(() => {
    const loadChat = async () => {
      try {
        setLoading(true);

        // 1️⃣ Fetch group chat by activity
        const chatRes = await groupChatService.getGroupChatByActivity(
          authApi,
          activityId
        );

        const chatGroup = chatRes.data;
        setChat(chatGroup);

        // 2️⃣ Fetch messages
        const msgRes = await groupChatService.getGroupChatMessages(
          authApi,
          chatGroup._id
        );

        setMessages(msgRes.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load chat");
      } finally {
        setLoading(false);
      }
    };

    if (activityId) {
      loadChat();
    }
  }, [activityId]);

  // Send message
  const handleSend = async () => {
    if (!message.trim() || !chat?._id || isSending) return;

    try {
      setIsSending(true);
      const res = await groupChatService.sendGroupChatMessage(
        authApi,
        chat._id,
        message
      );

      setMessages((prev) => [...prev, res.data]);
      setMessage("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-black text-white">

      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-800 sticky top-0 bg-black z-10">
        <h1 className="text-lg font-semibold">{chat?.name}</h1>
        <p className="text-xs text-gray-400">
          {chat?.participants?.length} members
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
        {messages.map((msg) => {
          const isOwn = msg.senderId === currentUser?._id;

          return (
            <div
              key={msg._id}
              className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-4 py-2 rounded-2xl max-w-[70%] text-sm
                  ${isOwn
                    ? "bg-orange-600 text-white rounded-br-sm"
                    : "bg-gray-800 text-white rounded-bl-sm"
                  }`}
              >
                <p>{msg.message}</p>
                <p className="text-[10px] text-gray-300 mt-1 text-right">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-800 bg-black flex gap-3">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-gray-900 border border-gray-700 rounded-full px-4 py-2 text-sm outline-none focus:border-orange-500"
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          disabled={isSending}
        />
        <button
          onClick={handleSend}
          disabled={isSending}
          className={`p-3 rounded-full flex items-center justify-center ${isSending
            ? "bg-gray-700 cursor-not-allowed"
            : "bg-orange-600 hover:bg-orange-700"
            }`}
        >
          {isSending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}

export default GroupChat;
