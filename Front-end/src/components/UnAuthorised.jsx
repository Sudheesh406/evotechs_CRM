import React from "react";
import { useNavigate } from "react-router-dom";
import NotFoundImage from "../assets/images/Screenshot 2025-10-03 173300.png"; // Put your 404 image in assets folder

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="text-center">
        <img
          src={NotFoundImage}
          alt="404 Not Found"
          className="mx-auto w-80 h-80 object-contain mb-6"
        />
        <h1 className="text-6xl font-extrabold text-red-500 mb-4">404</h1>
        <p className="text-xl text-gray-700 mb-6">
          Oops! The page you are looking for does not exist.
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
