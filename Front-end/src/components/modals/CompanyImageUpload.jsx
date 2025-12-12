// src/components/modals/ImageUploadModal.jsx

import React, { useState } from "react";
import axios from "../../instance/Axios"; 

const ImageUploadModal = ({ currentImageUrl, onSave, onClose }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file)); 
      setError(null);
    } else {
      setSelectedFile(null);
      setError("Please select a valid image file (JPEG, PNG, etc.).");
    }
  };

  // Handle the save button click and API upload
  const handleSave = async () => {
    if (!selectedFile) {
      setError("Please select an image to upload.");
      return;
    }

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("images", selectedFile); 

    try {
      // *** IMPORTANT: Update this endpoint to your actual backend API for image upload ***
      const res = await axios.post("/company/post-profile-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Assuming your API returns the new URL of the uploaded image
      const newImageUrl = res.data.data.profileImageUrl || previewUrl; 
      
      onSave(newImageUrl); // Calls the parent's function to update the displayed image
      
    } catch (err) {
      console.error("Upload error:", err);
      setError("Image upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      // Clean up the local preview URL
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl); 
      }
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-gray-800 border-b pb-4">
        Company Profile Image
      </h3>
      
      {/* Image Preview Area */}
      <div className="flex justify-center items-center">
        <div className="w-40 h-40 rounded-full bg-gray-100 flex items-center justify-center border-4 border-gray-200 overflow-hidden shadow-inner">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Profile Preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <svg
              className="w-20 h-20 text-gray-400"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"></path>
            </svg>
          )}
        </div>
      </div>

      {/* File Input */}
      <div className="w-full">
        <label
          htmlFor="file-upload"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Select an Image
        </label>
        <input
          id="file-upload"
          name="file-upload"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100 cursor-pointer
          "
        />
        <p className="mt-1 text-xs text-gray-500">
            *Only one image file (PNG, JPG, etc.) is allowed.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600 font-medium p-3 bg-red-50 rounded-lg border border-red-200">
          {error}
        </p>
      )}

      {/* Save Button */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          onClick={onClose}
          type="button"
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          disabled={isUploading}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          type="submit"
          disabled={isUploading || !selectedFile}
          className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition ${
            isUploading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 shadow-md"
          }`}
        >
          {isUploading ? "Uploading..." : "Save Image"}
        </button>
      </div>
    </div>
  );
};

export default ImageUploadModal;