// src/components/Routes/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "../../instance/Axios"; // adjust path if needed

export default function ProtectedRoute({ allowedRoles, children }) {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getRole = async () => {
      try {
        const {data} = await axios.get("/auth/get/role"); // backend should return { role: "admin" } or "staff"
        console.log(data.data)
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

  console.log(role)

  if (loading) return <div className="text-center mt-20 text-xl">Loading...</div>;

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/access-denied" replace />;
  }

  return children;
}
