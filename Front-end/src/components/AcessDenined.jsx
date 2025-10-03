import React from "react";
import { useNavigate } from "react-router-dom";
import AccessDeniedImage from "../assets/images/Gemini_Generated_Image_2vctyc2vctyc2vct.png"; // Put your access denied image here

export default function AccessDenied() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="text-center">
        <img
          src={AccessDeniedImage}
          alt="Access Denied"
          className="mx-auto w-80 h-80 object-contain mb-6"
        />
        {/* <h1 className="text-5xl font-extrabold text-red-600 mb-4">Access Denied</h1> */}
        <p className="text-lg text-gray-700 mb-6">
          You do not have permission to access this page.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition"
        >
          Go Back Home
        </button>
      </div>
    </div>
  );
}
