import { useEffect, useState } from "react";
import axios from "../../../instance/Axios";
import Swal from "sweetalert2";

export default function AdminPinGenerator() {
  const [currentPin, setCurrentPin] = useState({
    pin: "",
    generatedBy: "",
    email: "",
    date: "",
    time: "",
  });

  const [pinInput, setPinInput] = useState("");
  const [confirmPinInput, setConfirmPinInput] = useState("");
  const [revealCurrent, setRevealCurrent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [staffList, setStaffList] = useState([]);

  const pinPattern = /^[A-Z]{3}\d{3}$/;

  const handlePinChange = (e) => {
    setPinInput(e.target.value.toUpperCase().slice(0, 6));
  };

  const handleConfirmPinChange = (e) => {
    setConfirmPinInput(e.target.value.toUpperCase().slice(0, 6));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pinPattern.test(pinInput) || !pinPattern.test(confirmPinInput)) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Format",
        text: "PIN must be 3 letters followed by 3 digits (e.g., ABC123).",
      });
      return;
    }

    if (pinInput !== confirmPinInput) {
      Swal.fire({
        icon: "error",
        title: "Mismatch",
        text: "PIN and confirmation PIN do not match.",
      });
      return;
    }

    if (pinInput === currentPin.pin) {
      Swal.fire({
        icon: "info",
        title: "Duplicate PIN",
        text: "This PIN is the same as the current PIN. Please choose a new one.",
      });
      return;
    }

    try {
      Swal.fire({
        title: "Creating PIN...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await axios.post("/auth/create/pin", { pin: pinInput });
      const newPin = response.data.pin;
      console.log(response);

      setCurrentPin({
        pin: newPin.code.toUpperCase(),
        generatedBy: newPin.staff?.name || "Unknown",
        email: newPin.staff?.email || "",
        date: newPin.date,
        time: newPin.time,
      });

      setPinInput("");
      setConfirmPinInput("");
      setRevealCurrent(false);

      Swal.fire({
        icon: "success",
        title: "PIN Created",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.log("error", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error?.response?.data?.message ||
          "Failed to create PIN. Please try again.",
      });
    }
  };

  // === Staff Handling ===
  const getStaffDetails = async () => {
    try {
      const response = await axios.get("/team/staff/get");
      setStaffList(response.data.data.staffList || []);
    } catch (error) {
      console.log("error found in getting staff details", error);
    }
  };

  const toggleBlockUnblock = async (id, action) => {
    try {
      Swal.fire({
        title: action === "block" ? "Blocking Staff..." : "Unblocking Staff...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      await axios.put(`/auth/acess/update/${id}`);
      await getStaffDetails();

      Swal.fire({
        icon: "success",
        title: "Success",
        text: `Acess changed Successfully.`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.log('error',error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update staff. Please try again.",
      });
    }
  };


  const deleteStaff = async (id) => {
    try {
      const confirm = await Swal.fire({
        title: "Are you sure?",
        text: "This staff will be permanently deleted.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete",
      });

      if (!confirm.isConfirmed) return;

      Swal.fire({
        title: "Deleting Staff...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      await axios.delete(`/auth/user/delete/${id}`);
      await getStaffDetails();

      Swal.fire({
        icon: "success",
        title: "Deleted",
        text: "Staff has been deleted successfully.",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to delete staff.",
      });
    }
  };


  const getCurrentPin = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/auth/pin");

      const existingPin = response.data.data.existing;
      setCurrentPin({
        pin: existingPin.code.toUpperCase(),
        generatedBy:
          existingPin.staff?.name || `Staff ID: ${existingPin.staffId}`,
        email: existingPin.staff?.email || "",
        date: existingPin.date,
        time: existingPin.time,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch current PIN. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCurrentPin();
    getStaffDetails();
  }, []);

  const formatDateTime = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-600 animate-pulse">Loading current PIN...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 bg-gray-50 h-full">
      {/* PIN Section */}
      <div className="bg-white rounded-lg shadow-md p-6 w-full lg:w-2/3 text-center">
        <h1 className="text-xl font-bold text-gray-800 mb-6 flex items-center justify-center gap-2">
          🔒 Admin PIN Creator
        </h1>

        {/* Current PIN */}
        <div className="bg-gray-100 rounded-lg p-4 text-left mb-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-600 text-sm font-medium">Current PIN</p>
              <p className="text-gray-800 mt-1 font-bold text-2xl tracking-widest">
                {revealCurrent
                  ? currentPin.pin
                  : "•".repeat(currentPin.pin.length || 6)}
              </p>
              {currentPin.date && (
                <p className="text-gray-500 text-xs mt-1">
                  Created at: {formatDateTime(currentPin.date)}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-gray-500 text-sm">Generated by</p>
              <p className="text-gray-700 font-semibold">
                {currentPin.generatedBy}
              </p>
              {currentPin.email && (
                <p className="text-gray-500 text-xs">{currentPin.email}</p>
              )}
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setRevealCurrent((r) => !r)}
              className="px-3 py-1 rounded-md bg-blue-100 text-blue-700 text-sm font-medium"
            >
              {revealCurrent ? "Hide" : "Reveal"}
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          <p className="text-gray-500 text-sm mb-3">
            PIN must be{" "}
            <strong>3 letters (A-Z) followed by 3 digits (0-9)</strong> e.g.,
            ABC123
          </p>

          <label htmlFor="pin" className="block text-gray-700 mb-1">
            New PIN
          </label>
          <input
            type="text"
            id="pin"
            value={pinInput}
            onChange={handlePinChange}
            maxLength={6}
            className="w-full p-2 rounded-md border border-gray-300 mb-3 text-center focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="ABC123"
            required
          />

          <label htmlFor="confirmPin" className="block text-gray-700 mb-1">
            Confirm PIN
          </label>
          <input
            type="text"
            id="confirmPin"
            value={confirmPinInput}
            onChange={handleConfirmPinChange}
            maxLength={6}
            className="w-full p-2 rounded-md border border-gray-300 mb-3 text-center focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="ABC123"
            required
          />

          <button
            type="submit"
            disabled={
              !pinPattern.test(pinInput) ||
              pinInput !== confirmPinInput ||
              pinInput === currentPin.pin
            }
            className={`w-full p-2 rounded-md font-semibold transition-colors ${
              pinPattern.test(pinInput) &&
              pinInput === confirmPinInput &&
              pinInput !== currentPin.pin
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Create Admin PIN
          </button>
        </form>
      </div>

      {/* Staff Section */}
      <div className="bg-white rounded-lg shadow-md p-6 w-full lg:w-1/3">
        <h2 className="text-lg font-bold text-gray-800 mb-4">👥 Staff List</h2>
        {staffList.length === 0 ? (
          <p className="text-gray-500 text-sm">No staff available.</p>
        ) : (
          <ul className="space-y-3">
            {staffList.map((staff) => (
              <li
                key={staff.id}
                className="flex justify-between items-center bg-gray-50 p-3 rounded-md"
              >
                <div>
                  <p className="font-semibold text-gray-700">{staff.name}</p>
                  <p className="text-sm text-gray-500">{staff.email}</p>
                  <p
                    className={`text-xs mt-1 ${
                      staff.verified ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {staff.verified ? "Not Verified" : "Verified"}
                  </p>
                </div>
                <div className="flex gap-2">
                  {staff.verified ? (
                    <>
                      <button
                        onClick={() => toggleBlockUnblock(staff.id, "unblock")}
                        className="px-2 py-1 text-xs rounded bg-green-100 text-green-600 hover:bg-green-200"
                      >
                        Unblock
                      </button>
                      <button
                        onClick={() => deleteStaff(staff.id)}
                        className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
                      >
                        Delete
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => toggleBlockUnblock(staff.id, "block")}
                      className="px-2 py-1 text-xs rounded bg-red-100 text-red-600 hover:bg-red-200"
                    >
                      Block
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
