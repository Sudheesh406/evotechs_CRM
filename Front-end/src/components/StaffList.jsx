import React, { useEffect, useState } from "react";
import {
  Briefcase,
  User,
  X,
  Upload,
  PlayCircle, // Stage 1: Not Started
  RotateCcw, // Stage 3: In Review
  Send, // Stage 2: Ongoing
  CheckSquare, // Stage 4: Completed
} from "lucide-react";
import axios from "../instance/Axios";

// --- Configuration / Fallback ---
const DEFAULT_AVATAR = "/path/to/default/avatar.png"; 
// *** IMPORT Swal (SweetAlert2) FOR MODAL ALERTS ***
import Swal from "sweetalert2";

// --- Base URL for Staff Profile Images (UPDATED based on user's new link) ---
const STAFF_PROFILE_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/images/`;


// --- Staff Tooltip Component (UNCHANGED) ---
const StaffTooltip = ({ staff, position, onStay, onLeave }) => {
  if (!staff || !staff.work) return null;

  const taskCounts = staff.work;

  return (
    <div
      className="absolute z-50 p-4 w-64 bg-white rounded-xl shadow-2xl border border-indigo-200"
      onMouseEnter={onStay}
      onMouseLeave={onLeave}
      style={{
        left: position.x,
        top: position.y,
        transform: "translateX(-50%)",
      }}
    >
      <h3 className="text-lg font-bold text-gray-800 mb-2 border-b pb-1 flex items-center">
        <User className="w-4 h-4 mr-2 text-indigo-500" />
        {staff.name}
      </h3>

      <div className="space-y-2 text-sm">
        {/* Stage 1: Not Started */}
        <div className="flex justify-between items-center text-gray-500">
          <span className="flex items-center">
            <PlayCircle className="w-4 h-4 mr-2" /> Stage 1: Not Started
          </span>
          <span className="font-semibold text-base">{taskCounts.stage1}</span>
        </div>

        {/* Stage 2: Ongoing */}
        <div className="flex justify-between items-center text-indigo-700">
          <span className="flex items-center">
            <Send className="w-4 h-4 mr-2" /> Stage 2: Ongoing
          </span>
          <span className="font-semibold text-base">{taskCounts.stage2}</span>
        </div>

        {/* Stage 3: In Review */}
        <div className="flex justify-between items-center text-yellow-700">
          <span className="flex items-center">
            <RotateCcw className="w-4 h-4 mr-2" /> Stage 3: In Review
          </span>
          <span className="font-semibold text-base">{taskCounts.stage3}</span>
        </div>

        {/* Stage 4: Completed */}
        <div className="flex justify-between items-center text-green-700">
          <span className="flex items-center">
            <CheckSquare className="w-4 h-4 mr-2" /> Stage 4: Completed
          </span>
          <span className="font-semibold text-base">{taskCounts.stage4}</span>
        </div>

        {/* Total Tasks */}
        <div className="pt-2 border-t mt-2 flex justify-between items-center text-red-700">
          <span className="flex items-center font-bold">
            <Briefcase className="w-4 h-4 mr-2" />
            Total Active Tasks
          </span>
          <span className="font-extrabold text-base">{taskCounts.total}</span>
        </div>
      </div>
    </div>
  );
};

// --- Staff Modal Component (FIXED) ---

const StaffModal = ({ isOpen, onClose, staffList, onStaffUpdate, refresh, setRefresh }) => {
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    // If the selected staff member is removed from staffList (e.g., API update), reset selection
    if (staffList.length > 0 && selectedStaffId !== "" && !staffList.find(s => s.id === Number(selectedStaffId))) {
      setSelectedStaffId("");
    }
  }, [staffList, selectedStaffId]);


  if (!isOpen) return null;

  const selectedStaff = staffList.find((s) => s.id === Number(selectedStaffId));

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
    
    // **FIX:** Clear the file input's value after processing the file. 
    // This allows the user to re-select the exact same file immediately after 
    // it was cleared from the state or if they want to try uploading it again.
    e.target.value = null; 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check against "" instead of null/false
    if (selectedStaffId === "" || !imageFile) {
      Swal.fire({
        title: "Missing Information",
        text: "Please select a staff member and upload an image.",
        icon: "warning",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    const currentStaff = staffList.find(
      (s) => s.id === Number(selectedStaffId)
    );

    if (!currentStaff) return;

    // Prepare form data
    const formData = new FormData();
    formData.append("id", currentStaff.id);
    formData.append("name", currentStaff.name);
    formData.append("email", currentStaff.email);
    formData.append("images", imageFile);

    try {
      const response = await axios.post("home/staff-profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const updatedStaff = response.data;

      onStaffUpdate(updatedStaff.id, updatedStaff.imageUrl);

      // Reset local state after successful submission
      setImageFile(null);
      setImagePreview(null);
      setSelectedStaffId(""); 
      onClose();

      // *** SweetAlert2 Success Alert ***
      Swal.fire({
        title: "Success!",
        text: `Image for ${currentStaff.name} updated successfully!`,
        icon: "success",
        confirmButtonColor: "#3085d6",
      });

      // Toggle refresh state to trigger main data fetch
      setRefresh(!refresh); 

    } catch (error) {
      console.error("Error updating staff image:", error);
      
      // *** SweetAlert2 Error Alert ***
      Swal.fire({
        title: "Error!",
        text: "Failed to update staff image. Please try again.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] backdrop-blur-[1px] bg-opacity-75 flex items-center justify-center p-4 transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b flex justify-between items-center">
          <h3 className="text-xl font-bold text-indigo-700 flex items-center">
            <Upload className="w-5 h-5 mr-2" /> Update Staff Profile Image
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body (Form) */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Staff Selection */}
          <div>
            <label
              htmlFor="staff-select"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Select Staff Member:
            </label>
            <select
              id="staff-select"
              value={selectedStaffId}
              onChange={(e) => {
                // **FIX:** We only update the staff ID. 
                // We keep the image selection persistent until the user selects a new image.
                setSelectedStaffId(e.target.value);
              }}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="" disabled>
                Select a staff member
              </option>

              {/* Map through the actual staff list */}
              {staffList.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.name} ({staff.email})
                </option>
              ))}
            </select>
          </div>

          {/* Current Info Display (name + email) */}
          {selectedStaff && (
            <div className="text-sm bg-indigo-50 p-3 rounded-lg border border-indigo-200">
              <p className="font-semibold text-indigo-700">
                Selected Staff: {selectedStaff.name}
              </p>
              <p className="text-gray-600">Email: {selectedStaff.email}</p>
            </div>
          )}

          {/* Image Upload Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-all">
            <label htmlFor="image-upload" className="block cursor-pointer">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                Click to upload a new profile image
              </p>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Image Preview */}
          {imagePreview ? (
            <div className="text-center">
              <p className="text-sm font-medium mb-2">Image Preview:</p>
              <img
                src={imagePreview}
                alt="Image Preview"
                className="w-20 h-20 object-cover rounded-full mx-auto shadow-lg border-2 border-indigo-300"
              />
            </div>
          ) : (
            <p className="text-center text-sm text-gray-500">
              No image selected.
            </p>
          )}

          {/* Submit Button */}
          <div className="pt-4 border-t">
            <button
              type="submit"
              className="w-full px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all duration-200 shadow-md disabled:bg-indigo-300"
              // Disabled if no staff is selected (selectedStaffId is "") OR no image is selected
              disabled={selectedStaffId === "" || !imageFile}
            >
              Save New Profile Image
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Main Component (UNCHANGED) ---

export default function TeamWorkOverview() {
  const [staffData, setStaffData] = useState([]);
  const [staffTaskDetails, setStaffTaskDetails] = useState({});
  const [hoveredStaff, setHoveredStaff] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refresh, setRefresh] = useState(false)

  // --- Helper to merge data and get final structure (UPDATED BASE URL) ---
  const mergeStaffData = (staffList, taskDetails) => {
    return staffList.map((staff) => {
      const taskDetail = taskDetails[staff.id] || {};

      const defaultWork = {
        stage1: 0,
        stage2: 0,
        stage3: 0,
        stage4: 0,
        total: 0,
      };

      // Construct the image URL using the UPDATED base URL
      const finalImageUrl = taskDetail.imageUrl
        ? `${STAFF_PROFILE_BASE_URL}${taskDetail.imageUrl}`
        : DEFAULT_AVATAR;

      return {
        ...staff,
        imageUrl: finalImageUrl,
        work: taskDetail.taskCounts || defaultWork,
      };
    });
  };

  const handleMouseEnter = (staff, event) => {
    const targetRect = event.currentTarget.getBoundingClientRect();
    const containerRect = event.currentTarget
      .closest(".relative")
      .getBoundingClientRect();

    const TOOLTIP_HALF_WIDTH = 128;
    const x_centered =
      targetRect.left - containerRect.left + targetRect.width / 2;
    const x = Math.max(x_centered, TOOLTIP_HALF_WIDTH + 10);

    const tooltipHeight = 150;
    const y = targetRect.top - containerRect.top - tooltipHeight;

    setHoveredStaff(staff);
    setTooltipPosition({ x, y });
  };

  const handleLeave = () => {
    setHoveredStaff(null);
  };

  // --- Handle staff update logic (UPDATED BASE URL) ---
  const handleStaffUpdate = (staffId, newImageUrl) => {
    // 1. Update staffTaskDetails with the new filename/path
    setStaffTaskDetails((prevDetails) => ({
      ...prevDetails,
      [staffId]: {
        ...prevDetails[staffId],
        imageUrl: newImageUrl,
      },
    }));

    // 2. Immediately update staffData with the full URL to refresh the avatar
    const fullImageUrl = `${STAFF_PROFILE_BASE_URL}${newImageUrl}`;

    setStaffData((prevData) =>
      prevData.map((staff) =>
        staff.id === staffId ? { ...staff, imageUrl: fullImageUrl } : staff
      )
    );
  };

  // --- Fetch real staff list from API ---
  const fetchStaffData = async () => {
    try {
      const { data } = await axios.get("home/staff-details");
      const apiStaff = data.staffDetails || data;

      const baseStaff = apiStaff.map((staff) => ({
        id: staff.id,
        name: staff.name,
        email: staff.email,
        role: staff.role,
        verified: staff.verified,
        imageUrl: DEFAULT_AVATAR,
        work: { stage1: 0, stage2: 0, stage3: 0, stage4: 0, total: 0 },
      }));

      setStaffData(baseStaff);
      return baseStaff;
    } catch (error) {
      console.error("Error fetching staff data:", error);
      return [];
    }
  };

  // --- Fetch staff profile and task data and merge ---
  const getStaffProfile = async (baseStaff) => {
    try {
      const { data } = await axios.get("home/staff-profile");

      const taskDetailsMap = (data.data || []).reduce((acc, profile) => {
        acc[profile.staffId] = {
          imageUrl: profile.imageUrl,
          taskCounts: profile.taskCounts,
        };
        return acc;
      }, {});

      setStaffTaskDetails(taskDetailsMap);

      if (baseStaff.length > 0) {
        const finalStaff = mergeStaffData(baseStaff, taskDetailsMap);
        setStaffData(finalStaff);
      }
    } catch (error) {
      console.error("Error fetching staff profile:", error);
    }
  };

  // --- Combined useEffect to fetch both sets of data ---
  useEffect(() => {
    const initializeData = async () => {
      const baseStaff = await fetchStaffData();
      if (baseStaff.length > 0) {
        await getStaffProfile(baseStaff);
      }
    };
    initializeData();
  }, [refresh]);

  return (
    <div className="relative p-6 font-sans bg-white rounded-2xl shadow-3xl border border-gray-100 max-w-7xl mx-auto">
      <div className="mb-6 border-b pb-4 flex justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 flex items-center">
            <Briefcase className="w-6 h-6 text-indigo-600 mr-3" />
            Our Squad
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Hover over any member to view their current task metrics.
          </p>
        </div>
        <div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-full bg-blue-600 text-white font-medium transition-all duration-200 hover:bg-blue-700 hover:scale-105 disabled:opacity-60"
            disabled={staffData.length === 0}
          >
            Update Profile Images
          </button>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-x-4 gap-y-6">
        {staffData.map((staff) => (
          <div
            key={staff.id}
            className="relative"
            onMouseEnter={(e) => handleMouseEnter(staff, e)}
            onMouseLeave={handleLeave}
          >
            <div
              className="w-1/8 min-w-[70px] flex flex-col items-center cursor-pointer transition-transform duration-200 hover:scale-110"
              style={{ width: "calc(100% / 8 - 10px)" }}
            >
              <div className="relative w-16 h-16 rounded-full overflow-hidden border-4 border-transparent hover:border-indigo-400 shadow-md">
                <img
                  src={staff.imageUrl}
                  alt={staff.name}
                  // Fallback to DEFAULT_AVATAR if the fetched image link is broken
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = DEFAULT_AVATAR;
                  }}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="mt-2 text-xs text-gray-700 text-center truncate w-16">
                {staff.name}
              </p>
            </div>
          </div>
        ))}

        {staffData.length === 0 && (
          <p className="text-sm text-gray-400 mt-4">Loading staff details...</p>
        )}
      </div>

      {hoveredStaff && (
        <StaffTooltip
          staff={hoveredStaff}
          position={tooltipPosition}
          onStay={() => setHoveredStaff(hoveredStaff)}
          onLeave={handleLeave}
        />
      )}

      <StaffModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        staffList={staffData}
        onStaffUpdate={handleStaffUpdate}
        setRefresh={setRefresh}
        refresh={refresh}
      />

      <p className="text-xs text-gray-500 mt-8 text-center">
        Here are the squad members along with their tasks.
      </p>
    </div>
  );
}