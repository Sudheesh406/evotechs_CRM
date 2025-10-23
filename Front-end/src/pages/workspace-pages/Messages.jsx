import { useState, useEffect, useRef } from "react";
import axios from "../../instance/Axios";
import { getRoomId } from "../../components/utils/Room";
import socket from '../../instance/Socket'

const Messages = () => {
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [chats, setChats] = useState({}); // { staffId: [msgs...] }
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null); // will store numeric id
  const [sending, setSending] = useState(false);

  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Fetch staff list and logged-in user ID
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const { data } = await axios.get("/message/get/all/staff/");
        if (data.data) {
          setStaffList(data.data.existing || []);
          // normalize to number if possible
          const excludedId = data.data.excludedId;
          setUser(
            excludedId !== undefined && excludedId !== null
              ? Number(excludedId)
              : null
          );
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchStaff();
  }, []);

  // Fetch messages for selected staff
  useEffect(() => {
    const getMessages = async () => {
      if (!selectedStaff || user == null) return;

      try {
        const { data } = await axios.get(`/message/get/${selectedStaff.id}`);
        const formatted = (data.data?.existing || []).map((msg) => ({
          text: msg.message,
          sendingDate: msg.sendingDate, // YYYY-MM-DD from backend
          sendingTime: msg.sendingTime, // HH:MM:SS from backend
          isMine: Number(msg.senderId) === Number(user),
          id: msg.id,
          raw: msg, // keep raw in case you need it
        }));

        // ensure sorted by date/time (stable)
        formatted.sort(
          (a, b) =>
            new Date(`${a.sendingDate}T${a.sendingTime}`) -
              new Date(`${b.sendingDate}T${b.sendingTime}`) ||
            (a.id || 0) - (b.id || 0)
        );

        setChats((prev) => ({ ...prev, [selectedStaff.id]: formatted }));
      } catch (err) {
        console.log(err);
      }
    };
    getMessages();
  }, [selectedStaff, user]);

  // Join socket room when selection changes
  useEffect(() => {
    if (!selectedStaff || user == null) return;
    const room = getRoomId(user, selectedStaff.id);
    socket.emit("joinRoom", room);
  }, [selectedStaff, user]);

  // Receive messages via socket (single handler, normalize incoming payload)
  useEffect(() => {
    const handler = ({ senderId, message: incomingMessage }) => {
      // incomingMessage may be an object or string depending on server
      if (!incomingMessage) return;

      // If the server broadcasted senderId === user (your own), ignore it (you already optimistic-updated)
      if (Number(senderId) === Number(user)) return;

      // Normalize message object
      const normalized = {
        text:
          incomingMessage.text ??
          incomingMessage.message ??
          (typeof incomingMessage === "string" ? incomingMessage : ""),
        sendingDate:
          incomingMessage.sendingDate ?? incomingMessage.sending_date ?? null,
        sendingTime:
          incomingMessage.sendingTime ?? incomingMessage.sending_time ?? null,
        isMine: false, // force false because senderId !== current user
        id: incomingMessage.id ?? `srv-${Date.now()}`, // fallback id
      };

      const otherId = Number(senderId);
      if (!otherId) return;

      setChats((prev) => {
        const updated = [...(prev[otherId] || []), normalized];

        updated.sort(
          (a, b) =>
            new Date(`${a.sendingDate}T${a.sendingTime}`) -
              new Date(`${b.sendingDate}T${b.sendingTime}`) ||
            (a.id || 0).toString().localeCompare((b.id || 0).toString())
        );

        return { ...prev, [otherId]: updated };
      });
    };

    socket.on("receiveMessage", handler);
    return () => socket.off("receiveMessage", handler);
  }, [user]); // note: don't depend on selectedStaff so that all incoming messages update proper chats

  // Send message
  const handleSend = async () => {
    if (!message.trim() || !selectedStaff || user == null) return;

    setSending(true);
    setTimeout(() => setSending(false), 300);

    const now = new Date();
    const sendingDate = now.toISOString().split("T")[0]; // YYYY-MM-DD
    const sendingTime = now.toTimeString().split(" ")[0]; // HH:MM:SS 24h

    // create optimistic message with a temporary id
    const tempId = `temp-${Date.now()}`;

    const newMsg = {
      text: message,
      sendingDate,
      sendingTime,
      isMine: true,
      id: tempId,
    };

    // Optimistic update (add to selected staff chat)
    setChats((prev) => ({
      ...prev,
      [selectedStaff.id]: [...(prev[selectedStaff.id] || []), newMsg],
    }));

    // Emit to server - do NOT send isMine flag
    const room = getRoomId(user, selectedStaff.id);
    socket.emit("send_message", {
      senderId: user,
      receiverId: selectedStaff.id,
      room,
      message: {
        text: newMsg.text,
        sendingDate: newMsg.sendingDate,
        sendingTime: newMsg.sendingTime,
        // do not include isMine
      },
    });

    setMessage("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  // Auto-scroll to bottom when chats change or selection changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats, selectedStaff]);

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
              } ${
                staff.role === "admin" ? "border-l-4 border-yellow-400" : ""
              }`}
            >
              <div className="font-medium text-gray-900 flex items-center justify-between">
                <span>
                  {staff.name}{" "}
                  <span className="text-xs text-gray-500">({staff.email})</span>
                </span>
                {staff.role === "admin" && (
                  <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full">
                    Management
                  </span>
                )}
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

            {/* Messages */}
            <div className="flex-1 p-6 overflow-y-auto bg-neutral-50">
              {(chats[selectedStaff.id] || []).map((msg) => (
                <div
                  key={msg.id ?? `${selectedStaff.id}-${Math.random()}`}
                  className={`flex mb-4 ${
                    msg.isMine ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs px-4 py-3 rounded-2xl text-sm shadow-sm ${
                      msg.isMine
                        ? "bg-blue-100 text-gray-800"
                        : "bg-white text-gray-800 border border-gray-200"
                    }`}
                  >
                    <div className="leading-snug">{msg.text}</div>
                    <div className="text-[10px] text-gray-500 text-right mt-1">
                      {msg.sendingDate && msg.sendingTime
                        ? new Date(
                            `${msg.sendingDate}T${msg.sendingTime}`
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}{" "}
                      ({msg.sendingDate ?? ""})
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
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
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault(); // Prevents new line
                    handleSend(); // Send message
                  }
                  // else Shift+Enter will naturally insert a new line
                }}
              />

              <button
                onClick={handleSend}
                className={`ml-3 p-3 bg-gradient-to-br from-purple-400 via-violet-500 to-fuchsia-500 text-white rounded-full hover:bg-blue-600 transition-transform duration-200 flex items-center justify-center ${
                  sending
                    ? "scale-125 -translate-y-1 translate-x-1 rotate-12"
                    : ""
                }`}
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

export default Messages;
