// src/components/Routes/ProtectedRoute.jsx
import { Navigate, useLocation , useNavigate} from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "../../instance/Axios"; // adjust path if needed
import socket from "../../components/utils/SocketIO";


export default function ProtectedRoute({ allowedRoles, children }) {
  const navigate = useNavigate()
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation(); // 👈 get current location (path + state)

  useEffect(() => {
    const getRole = async () => {
      try {
        const { data } = await axios.get("/auth/get/role");
        const userId = data?.data?.id
        setRole(data?.data?.role);

         if (userId) {
      socket.emit("registerUser", userId);

      socket.on("receiveNotification", (data) => {
        console.log("🔔 New Notification:", data);
        // show toast or badge here
      });
    }


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
