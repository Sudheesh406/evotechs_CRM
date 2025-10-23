// src/components/Routes/ProtectedRoute.jsx
import { Navigate, useLocation , useNavigate} from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "../../instance/Axios"; // adjust path if needed
import socket from "../../instance/Socket";
import toast from 'react-hot-toast';

export default function ProtectedRoute({ allowedRoles, children }) {
  const navigate = useNavigate()
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation(); // 👈 get current location (path + state)
  

  useEffect(() => {
    const getRole = async () => {
      try {
        const { data } = await axios.get("/auth/get/role");
        setRole(data?.data?.role);
        const id = data?.data?.id

         if (id) {
      // join notification room once user is known
      socket.emit("joinNotificationRoom", id);
      console.log("Joined notification room:", id);
    }


  const handleNotification = (data) => {
      console.log("🔔 New Notification:", data);
      // ✅ Show global notification
      toast.success(`${data.title}: ${data.message}`);
      // or:
      // alert(`${data.title}\n${data.message}`);
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

  if (loading) return <div className="text-center mt-20 text-xl">Loading...</div>;

   if(location.pathname == '/'){
      if(role === 'admin'){
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

  return children;
}
