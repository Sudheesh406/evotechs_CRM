import React, { useState, useRef, useEffect } from "react";
import axios from "../../../instance/Axios";
import { io } from "socket.io-client";

// Connect to Socket.IO server
const socket = io(`${import.meta.env.VITE_BACKEND_URL}`);

const AdminMessagePortal = () => {
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [chats, setChats] = useState({});
  const [message, setMessage] = useState("");
  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [user, setUser] = useState(0); // current logged-in admin ID

  // 🔹 animation states
  const [sending, setSending] = useState(false); // click animation
  const [beat, setBeat] = useState(false); // pulse every 5s

  // Fetch staff list
  const fetchStaff = async () => {
    try {
      const response = await axios.get("/team/staff/get");
      if (response.data.success) {
        setStaffList(response.data?.data?.staffList);
        setUser(response.data?.data?.userId);
      }
    } catch (error) {
      console.log("Error fetching staff:", error);
    }
  };

  // Fetch messages for selected staff
  const getMessages = async () => {
    const id = selectedStaff?.id;
    if (!id) return;

    try {
      const { data } = await axios.get(`/message/get/${id}`);
      const formattedMessages = data.data.map((msg) => ({
        text: msg.message,
        time: new Date(msg.sendingTime).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        sender: msg.senderId === user ? "admin" : "staff",
      }));

      setChats((prev) => ({ ...prev, [id]: formattedMessages }));
    } catch (error) {
      console.log("Error fetching messages:", error);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
    getMessages();
  }, [selectedStaff]);

  // Listen for incoming messages from backend
  useEffect(() => {
    socket.on("receive_message", ({ staffId, message }) => {
      setChats((prev) => ({
        ...prev,
        [staffId]: [...(prev[staffId] || []), message],
      }));
    });

    return () => socket.off("receive_message");
  }, []);

  // 🔹 Pulse (beat) every 5s
  useEffect(() => {
    const interval = setInterval(() => {
      setBeat(true);
      setTimeout(() => setBeat(false), 300); // beat lasts 300ms
    }, 5000); // every 5 sec
    return () => clearInterval(interval);
  }, []);

  const handleSend = () => {
    if (!message.trim() || !selectedStaff) return;

    // trigger fly animation
    setSending(true);
    setTimeout(() => setSending(false), 300);

    const newMsg = {
      text: message,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      sender: "admin",
    };

    setChats((prev) => ({
      ...prev,
      [selectedStaff.id]: [...(prev[selectedStaff.id] || []), newMsg],
    }));

    socket.emit("send_message", {
      senderId: user,
      staffId: selectedStaff.id,
      message: newMsg,
    });

    setMessage("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chats, selectedStaff]);

  return (
    <div className="flex h-[92vh] bg-neutral-50 text-gray-800">
      {/* Staff list */}
      <div className="w-1/4 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-5 font-semibold text-sm tracking-wide border-b border-gray-200 text-gray-700 uppercase">
          Staff
        </div>
        <div className="flex-1 overflow-y-auto">
          {staffList && staffList.map((staff) => (
            <div
              key={staff.id}
              onClick={() => setSelectedStaff(staff)}
              className={`p-5 cursor-pointer transition-colors duration-150 ${
                selectedStaff?.id === staff.id
                  ? "bg-blue-200"
                  : "hover:bg-neutral-100"
              }`}
            >
              <div className="font-medium text-gray-900">
                {staff.name}{" "}
                <span className="text-xs text-gray-500">({staff.email})</span>
              </div>
              <div className="text-xs text-gray-500 truncate">
                {chats[staff.id]?.[chats[staff.id].length - 1]?.text || ""}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat section */}
      <div className="flex-1 flex flex-col">
        {selectedStaff ? (
          <>
            {/* Chat header */}
            <div className="p-5 bg-white border-b border-gray-200 flex items-center shadow-sm">
              <div className="font-semibold text-lg text-gray-900">
                {selectedStaff.name}{" "}
                <span className="text-sm text-gray-500">
                  ({selectedStaff.email})
                </span>
              </div>
            </div>

            {/* Chat messages */}
            <div className="flex-1 p-6 overflow-y-auto bg-neutral-50">
              {(chats[selectedStaff.id] || []).map((msg, index) => (
                <div
                  key={index}
                  className={`flex mb-4 ${
                    msg.sender === "admin" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs px-4 py-3 rounded-2xl text-sm shadow-sm ${
                      msg.sender === "admin"
                        ? "bg-blue-100 text-gray-800"
                        : "bg-white text-gray-800 border border-gray-200"
                    }`}
                  >
                    <div className="leading-snug">{msg.text}</div>
                    <div className="text-[10px] text-gray-500 text-right mt-1">
                      {msg.time}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input bar with animated send icon */}
            <div className="p-5 bg-white border-t border-gray-200 flex items-center shadow-inner">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message…"
                rows={1}
                className="flex-1 resize-none overflow-hidden p-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm placeholder-gray-400"
                onInput={(e) => {
                  e.target.style.height = "auto";
                  e.target.style.height = e.target.scrollHeight + "px";
                }}
              />
              <button
                onClick={handleSend}
                className={`ml-3 p-3 bg-gradient-to-br from-purple-400 via-violet-500 to-fuchsia-500 text-white rounded-full hover:bg-blue-600 
                  transition-transform duration-200 flex items-center justify-center
                  ${sending ? "scale-125 -translate-y-1 translate-x-1 rotate-12" : ""}
                  ${beat ? "scale-110" : ""}`}
              >
                <svg
                
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2 12l19-7-7 19-3-8-9-4z"
                  />
                </svg>
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-neutral-50">
            <div className="text-gray-500 text-center">
              <div className="text-xl font-semibold">
                Staff Notice / Announcement
              </div>
              <div className="text-sm mt-2 text-gray-400">
                Choose someone from the left panel
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMessagePortal;
