// src/components/Routes/ProtectedRoute.jsx
import { Navigate, useLocation , useNavigate} from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "../../instance/Axios"; // adjust path if needed

export default function HelperRoute({ allowedRoles, children }) {
  const navigate = useNavigate()
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation(); // 👈 get current location (path + state)

  useEffect(() => {
    const getRole = async () => {
      try {
        const { data } = await axios.get("/auth/get/role");
        setRole(data?.data?.role);
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

   if(role && role == 'admin'){
     return <Navigate to="/admin" replace state={{ from: location }} />;
    }else if (role && role == 'staff'){
     return <Navigate to="/" replace state={{ from: location }} />;
    }

  return children;
}
