import React, { useState, useRef, useEffect } from "react";
import axios from '../../../instance/Axios'

// dummy data for staff list
const staffList = [
  { id: 1, name: "John Doe", lastMsg: "Ok noted" },
  { id: 2, name: "Anita Sharma", lastMsg: "Will do" },
  { id: 3, name: "Mohammed Ali", lastMsg: "Sent files" },
  { id: 4, name: "Test User 1", lastMsg: "Test message" },
  { id: 5, name: "Test User 2", lastMsg: "Another test" },
  { id: 6, name: "Test User 3", lastMsg: "Hello!" },
  { id: 7, name: "Test User 4", lastMsg: "Hi!" },
  { id: 8, name: "Test User 5", lastMsg: "Hey there!" },
];

const initialChats = {
  1: [
    { sender: "admin", text: "Hello John!", time: "10:30 AM" },
    { sender: "staff", text: "Hi sir!", time: "10:31 AM" },
  ],
  2: [
    { sender: "admin", text: "Good morning Anita!", time: "09:00 AM" },
    { sender: "staff", text: "Morning Sir!", time: "09:01 AM" },
  ],
  3: [{ sender: "admin", text: "Hi Ali", time: "11:00 AM" }],
};

const AdminMessagePortal = () => {
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [chats, setChats] = useState(initialChats);
  const [message, setMessage] = useState("");
  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);

  const handleSend = () => {
    if (!message.trim() || !selectedStaff) return;
    const newMsg = {
      sender: "admin",
      text: message,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setChats((prev) => ({
      ...prev,
      [selectedStaff.id]: [...(prev[selectedStaff.id] || []), newMsg],
    }));

    setMessage("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  // Scroll to bottom when new message is added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chats, selectedStaff]);


//need to continue the work.........................................................

  const fetchStaffList = async ()=>{
    try {
         const res = await axios.get("/attendance/staff-list");
         console.log(res)
    } catch (error) {
        console.log('error found in staff list',error)
    }
  }

  useEffect(()=>{
    fetchStaffList()
  },[])


  return (
    <div className="flex h-[92vh] bg-neutral-50 text-gray-800">
      {/* Staff list */}
      <div className="w-1/4 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-5 font-semibold text-sm tracking-wide border-b border-gray-200 text-gray-700 uppercase">
          Staff
        </div>
        <div className="flex-1 overflow-y-auto">
          {staffList.map((staff) => (
            <div
              key={staff.id}
              onClick={() => setSelectedStaff(staff)}
              className={`p-5 cursor-pointer transition-colors duration-150 ${
                selectedStaff?.id === staff.id
                  ? "bg-blue-200"
                  : "hover:bg-neutral-100"
              }`}
            >
              <div className="font-medium text-gray-900">{staff.name}</div>
              <div className="text-xs text-gray-500 truncate">
                {staff.lastMsg}
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
                {selectedStaff.name}
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

            {/* Input bar */}
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
                className="ml-3 px-5 py-2 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors duration-150"
              >
                Send
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
