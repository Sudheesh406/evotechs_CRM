// src/components/Routes/ProtectedRoute.jsx
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "../../instance/Axios"; // adjust path if needed
import socket from "../../instance/Socket";
import toast from "react-hot-toast";
import { Bell, X, Trash2 } from "lucide-react"; // icons for bell + close
import { motion, AnimatePresence } from "framer-motion";

export default function ProtectedRoute({ allowedRoles, children }) {
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [notification, setNotifications] = useState();
  const [loading, setLoading] = useState(true);
  const location = useLocation(); // 👈 get current location (path + state)
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const getRole = async () => {
      try {
        const { data } = await axios.get("/auth/get/role");
        setRole(data?.data?.role);
        setNotifications(data?.data?.allNotifications);
        const id = data?.data?.id;

        if (id) {
          // join notification room once user is known
          socket.emit("joinNotificationRoom", id);
          console.log("Joined notification room:", id);
        }

        const handleNotification = (data) => {
          console.log("🔔 New Notification:", data);
          toast.success(`${data.title}: ${data.message}`);
          setNotifications((prev) => [data, ...prev]);
        };

        socket.on("receive_notification", handleNotification);

        return () => {
          socket.off("receive_notification", handleNotification);
        };
      } catch (err) {
        console.error("Error fetching role:", err);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };
    getRole();
  }, []);

  const clearNotification = async (id) => {
    try {
      if (id) {
        const response = await axios.delete(`/notification/clear/${id}`);
        if (response) console.log("response", response);
      } else {
        const response = await axios.delete("/notification/clear");
        if (response) console.log("response", response);
      }
    } catch (error) {
      console.log("error found in clear notification", error);
    }
  };

  if (loading)
    return <div className="text-center mt-20 text-xl">Loading...</div>;

  if (location.pathname == "/") {
    if (role === "admin") {
      return <Navigate to="/admin" replace state={{ from: location }} />;
    }
  }

  if (!role) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!allowedRoles.includes(role)) {
    // redirect with "from" location info
    return <Navigate to="/access-denied" replace state={{ from: location }} />;
  }

  return (
    <>
      {children}

      {/* 🔔 Floating Notification Icon */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-teal-500 to-green-500 text-white p-3 rounded-full shadow-lg hover:scale-105 transition-transform"
      >
        <Bell className="w-6 h-6" />

        {/* Show red dot only if there are notifications */}
        {notification.length !== 0 && (
          <>
            <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full animate-ping" />
            <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full" />
          </>
        )}
      </button>

      {/* 🔔 Notification Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-80 rounded-2xl shadow-lg p-4 relative">
            {/* Close Modal */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center justify-between mb-4 pr-8">
              {/* Added `pr-8` to leave space for close button */}
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Bell className="w-5 h-5 text-green-600" /> Notifications
              </h2>

              {notification?.length > 0 && (
                <button
                  onClick={() => {
                    setTimeout(() => setNotifications([]), 400);
                    clearNotification();
                  }}
                  className="text-sm bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full shadow hover:scale-105 transition-transform"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {notification.length === 0 ? (
                <p className="text-gray-500 text-center text-sm py-6">
                  No notifications yet
                </p>
              ) : (
                <AnimatePresence>
                  {notification.map((n) => (
                    <motion.div
                      key={n.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="p-3 bg-gray-50 border border-gray-100 rounded-lg shadow-sm hover:bg-gray-100 transition flex justify-between items-start"
                    >
                      <div>
                        <p className="font-medium text-gray-800">{n.title}</p>
                        <p className="text-sm text-gray-600">{n.description}</p>
                        <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                      </div>
                      <button
                        onClick={() => {
                          clearNotification(n.id);
                          setNotifications((prev) =>
                            prev.filter((x) => x.id !== n.id)
                          );
                        }}
                        className="ml-2 text-red-400 hover:text-red-600 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
