import React, { useState } from "react";
import logo from "../../assets/images/logo1.png";
import axios from "../../instance/Axios";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react"; // 👈 new

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    AuthorisationCode: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!form.email) newErrors.email = "Email is required";
    if (!form.password) newErrors.password = "Password is required";
    if (!isLogin && !form.name) newErrors.name = "Full Name is required";
    if (!isLogin && !form.AuthorisationCode)
      newErrors.AuthorisationCode = "Authorisation code is required";
    if (!isLogin && form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    if (isLogin) {
      handleLogin(form);
    } else {
      handleSignup(form);
    }
  };

  // signup function
  const handleSignup = async (data) => {
    try {
      const response = await axios.post("/auth/signup", data);
      setServerError(""); // clear error if success
      navigate("/");
    } catch (error) {
      setServerError(error.response?.data?.message || "Something went wrong");
    }
  };

  // login function
  const handleLogin = async (data) => {
    try {
      const response = await axios.post("/auth/login", data);
      setServerError(""); // clear error if success
      if (response?.data?.userDetails?.role === "admin") {
        localStorage.setItem("CRMsrtRolE", "admin");
        navigate("/admin");
      } else if (response?.data?.userDetails?.role === "staff") {
        navigate("/");
      }
    } catch (error) {
      setServerError(error.response?.data?.message || "Something went wrong");
    }
  };

  
  return (
    <div className="fixed inset-0 z-[9999] bg-gray-100 overflow-y-auto overscroll-contain">
      <div
        className={`min-h-full flex justify-center p-4 ${
          isLogin ? "items-center" : "items-start"
        }`}
      >
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-lg shadow-md p-8 my-8">
          {/* Branding */}
          <div className="text-center mb-2">
            <img src={logo} alt="Logo" className="mx-auto h-12" />
            <p>Evo pvt ltd</p>
            <h1 className="text-xl font-semibold text-gray-800 mt-2">
              CRM Portal
            </h1>
            <p className="text-sm text-gray-500">
              {isLogin ? "Secure Login" : "Register for an Account"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.name ? "border-red-500" : ""
                    }`}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Authorisation Code
                  </label>
                  <input
                    type="text"
                    name="AuthorisationCode"
                    value={form.AuthorisationCode}
                    onChange={handleChange}
                    placeholder="Enter Authorisation Code"
                    className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.AuthorisationCode ? "border-red-500" : ""
                    }`}
                  />
                  {errors.AuthorisationCode && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.AuthorisationCode}
                    </p>
                  )}
                </div>
              </>
            )}

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.email ? "border-red-500" : ""
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="relative">
              <label className="block text-gray-700 text-sm font-medium mb-1">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.password ? "border-red-500" : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password (only signup) */}
            {!isLogin && (
              <div className="relative">
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Confirm Password
                </label>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.confirmPassword ? "border-red-500" : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-medium transition"
            >
              {isLogin ? "Login" : "Sign Up"}
            </button>
          </form>

          {/* Global Error Message */}
          {serverError && (
            <div className="mb-4 p-3 rounded-md flex justify-center text-red-700 text-sm font-medium">
              {serverError}
            </div>
          )}

          {/* Switch */}
          <p className="text-center text-gray-600 mt-4 text-sm">
            {isLogin ? "Don’t have an account?" : "Already registered?"}{" "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setErrors({});
                setForm({
                  name: "",
                  email: "",
                  password: "",
                  confirmPassword: "",
                  AuthorisationCode: "",
                });
              }}
              className="text-blue-600 font-medium hover:underline"
            >
              {isLogin ? "Sign Up" : "Login"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
