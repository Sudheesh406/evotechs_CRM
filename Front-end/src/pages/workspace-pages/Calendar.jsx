// src/components/Calendar.jsx

import React, { useState, useEffect, useCallback } from "react";
// Import the new components
import LeaveModal from "../../components/modals/LeaveModal"; 
import LeaveList from "../../components/LeaveList";
// Assumed relative path, update as needed
import axios from "../../instance/Axios"; 
import Swal from "sweetalert2";

/* Helpers to convert between YYYY-MM-DD (input) and DD/MM/YYYY (display/storage) */
const formatDateObjToDDMMYYYY = (date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatInputToDDMMYYYY = (inputValue) => {
  if (!inputValue) return "";
  const [y, m, d] = inputValue.split("-");
  if (!y || !m || !d) return "";
  return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
};

const ddmmyyyyToInput = (ddmmyyyy) => {
  if (!ddmmyyyy) return "";
  const parts = ddmmyyyy.split("/");
  if (parts.length !== 3) return "";
  const [d, m, y] = parts;
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
};

// Define a default/initial state for the form data
const initialFormData = {
  leaveType: "Full Day",
  category: "",
  startDate: "",
  endDate: "",
  reason: "",
  status: "Pending",
};

export default function Calendar() {
  const now = new Date();
  const [displayedMonth, setDisplayedMonth] = useState(now.getMonth());
  const [displayedYear, setDisplayedYear] = useState(now.getFullYear());

  const [holidays, setHolidays] = useState([]);
  const [leaves, setLeaves] = useState([]);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingLeave, setEditingLeave] = useState(null);
  const [formData, setFormData] = useState(initialFormData);


  // Set the default dates for the modal on initial load
  useEffect(() => {
    const todayInput = ddmmyyyyToInput(formatDateObjToDDMMYYYY(now));
    setFormData((prev) => ({
      ...prev,
      startDate: todayInput,
      endDate: todayInput,
    }));
  }, []);

  // API Call functions wrapped in useCallback for dependency array stability
  const fetchHolidays = useCallback(async (year, month) => {
    try {
      const res = await axios.post("/calendar/get", { year, month });
      const holidaysArray = (res.data?.data || []).map((item) => ({
        id: item.id,
        date: formatInputToDDMMYYYY(item.holidayDate),
        description: item.description,
        type: item.holidayName || "holiday",
      }));
      setHolidays(holidaysArray.sort((a, b) => (a.date > b.date ? 1 : -1)));
    } catch (err) {
      console.error("Failed to load holidays", err);
    }
  }, []);

  const fetchLeaves = useCallback(async (year, month) => {
    try {
      const response = await axios.post("/calendar/get/staff/leave", {
        year,
        month,
      });
      const leavesArray = (response.data || []).map((item) => ({
        id: item.id,
        leaveType: item.leaveType,
        startDate: formatInputToDDMMYYYY(item.leaveDate),
        endDate: formatInputToDDMMYYYY(item.endDate),
        reason: item.description,
        category: item.category,
        status: item.status || "Pending",
      }));
      setLeaves(leavesArray);
    } catch (error) {
      console.error("Failed to load leaves", error);
    }
  }, []);

  // Effect to re-fetch data when month/year changes
  useEffect(() => {
    fetchHolidays(displayedYear, displayedMonth + 1);
    fetchLeaves(displayedYear, displayedMonth + 1);
  }, [displayedMonth, displayedYear, fetchHolidays, fetchLeaves]);

  // --- Calendar Navigation Handlers ---

  const handlePrevMonth = () => {
    if (displayedMonth === 0) {
      setDisplayedMonth(11);
      setDisplayedYear((y) => y - 1);
    } else setDisplayedMonth((m) => m - 1);
  };

  const handleNextMonth = () => {
    if (displayedMonth === 11) {
      setDisplayedMonth(0);
      setDisplayedYear((y) => y + 1);
    } else setDisplayedMonth((m) => m + 1);
  };

  // --- Leave Management Handlers ---

  // Function to handle opening the modal for creating a leave from the calendar day click
  const onDayClick = (day) => {
    setEditingLeave(null);
    setFormData({
      ...initialFormData,
      startDate: ddmmyyyyToInput(day.formatted),
      endDate: ddmmyyyyToInput(day.formatted),
    });
    setShowModal(true);
  };

  // Function to handle opening the modal for creating a leave from the main "Create Leave" button
  const handleCreateLeave = () => {
    setEditingLeave(null);
    const firstDayFormatted = formatDateObjToDDMMYYYY(
      new Date(displayedYear, displayedMonth, 1)
    );
    setFormData({
      ...initialFormData,
      startDate: ddmmyyyyToInput(firstDayFormatted),
      endDate: ddmmyyyyToInput(firstDayFormatted),
    });
    setShowModal(true);
  };

  const handleEditLeave = (leave) => {
    if (leave.status === "Approve") {
      Swal.fire({
        icon: "info",
        title: "Cannot Edit",
        text: "Approved leaves cannot be edited.",
      });
      return;
    }

    setEditingLeave(leave);
    setFormData({
      leaveType: leave.leaveType,
      category: leave.category,
      startDate: ddmmyyyyToInput(leave.startDate), // Convert DD/MM/YYYY to YYYY-MM-DD
      endDate: ddmmyyyyToInput(leave.endDate),     // Convert DD/MM/YYYY to YYYY-MM-DD
      reason: leave.reason,
      status: leave.status,
    });
    setShowModal(true);
  };

  const handleDeleteLeave = async (leave) => {
    if (leave.status === "Approve") {
      Swal.fire({
        icon: "warning",
        title: "Cannot Delete",
        text: "Approved leaves cannot be deleted.",
      } as any); // Use as any to suppress Swal TS error if not configured
      return;
    }

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this leave?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    } as any);

    if (result.isConfirmed) {
      try {
        await axios.delete(`/calendar/delete/leave/${leave.id}`);
        setLeaves((prev) => prev.filter((l) => l.id !== leave.id));

        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Leave deleted successfully!",
          timer: 2000,
          showConfirmButton: false,
        } as any);
      } catch (err) {
        console.error("Failed to delete leave", err);
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: "Failed to delete leave",
        } as any);
      }
    }
  };

  const handleSubmitLeave = async (formDataToSubmit, currentEditingLeave) => {
    try {
      const payload = {
        leaveType: formDataToSubmit.leaveType,
        category: formDataToSubmit.category,
        leaveDate: formDataToSubmit.startDate, // YYYY-MM-DD format for API
        endDate: formDataToSubmit.endDate, // YYYY-MM-DD format for API
        description: formDataToSubmit.reason,
        status: formDataToSubmit.status,
      };

      let res;
      if (currentEditingLeave) {
        res = await axios.put(
          `/calendar/update/leave/${currentEditingLeave.id}`,
          payload
        );
      } else {
        res = await axios.post("/calendar/create/leave", payload);
      }

      const newOrUpdatedLeave = {
        id: res.data.id || currentEditingLeave?.id,
        leaveType: res.data.leaveType || formDataToSubmit.leaveType,
        // API response might return YYYY-MM-DD, so format it back for state
        startDate: formatInputToDDMMYYYY(
          res.data.leaveDate || formDataToSubmit.startDate
        ),
        endDate: formatInputToDDMMYYYY(res.data.endDate || formDataToSubmit.endDate),
        reason: res.data.description || formDataToSubmit.reason,
        category: res.data.category || formDataToSubmit.category,
        status: res.data.status || formDataToSubmit.status,
      };

      setLeaves((prev) => {
        if (currentEditingLeave) {
          return prev.map((l) =>
            l.id === currentEditingLeave.id ? newOrUpdatedLeave : l
          );
        } else {
          return [...prev, newOrUpdatedLeave];
        }
      });

      setShowModal(false);
      setEditingLeave(null);
      setFormData(initialFormData); // Reset form data
      
      Swal.fire({
        icon: "success",
        title: `Leave ${currentEditingLeave ? "updated" : "created"} successfully!`,
        timer: 2000,
        showConfirmButton: false,
      } as any);
    } catch (err: any) {
      // Check for specific error status (like 406 for date validation)
      const status = err.response?.status;
      if (status === 406) {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: "End date cannot be before start date",
        } as any);
      } else {
        console.error("Failed to save leave", err);
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: "Server Error please check after some times",
        } as any);
      }
    }
  };

  // --- Calendar Day Generation Logic ---

  const daysInMonth = new Date(displayedYear, displayedMonth + 1, 0).getDate();
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => {
    const dayNum = i + 1;
    const dateObj = new Date(displayedYear, displayedMonth, dayNum);
    const formatted = formatDateObjToDDMMYYYY(dateObj);

    const holidayItem = holidays.find((h) => h.date === formatted);

    const approvedLeaves = leaves.filter((l) => {
      if (l.status !== "Approve") return false;
      const start = ddmmyyyyToInput(l.startDate);
      const end = ddmmyyyyToInput(l.endDate);
      const current = ddmmyyyyToInput(formatted);
      return current >= start && current <= end;
    });

    return { day: dayNum, dateObj, formatted, holidayItem, approvedLeaves };
  });

  return (
    <div className="p-6 bg-gray-50 min-h-[600px]">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Calendar Grid */}
        <div className="md:col-span-12 bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4 gap-3">
            <button
              onClick={handlePrevMonth}
              className="px-3 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition"
            >
              Prev
            </button>
            <h2 className="text-lg font-semibold text-gray-800">
              {new Date(displayedYear, displayedMonth).toLocaleString(
                "default",
                {
                  month: "long",
                  year: "numeric",
                }
              )}
            </h2>
            <button
              onClick={handleNextMonth}
              className="px-3 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition"
            >
              Next
            </button>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 text-center text-xs font-semibold text-gray-500 uppercase mb-3">
            {weekDays.map((wd) => (
              <div key={wd}>{wd}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Filler for start of month */}
            {Array.from({
              length: new Date(displayedYear, displayedMonth, 1).getDay(),
            }).map((_, i) => (
              <div key={"empty-" + i} className="h-16" />
            ))}

            {daysArray.map((d) => {
              const isSunday = d.dateObj.getDay() === 0;
              const isMaintenance =
                d.holidayItem && d.holidayItem.type === "maintenance";
              const isHoliday = !!d.holidayItem;

              let cellClass = "bg-white border-gray-200 hover:bg-gray-50";
              if (isSunday || isHoliday)
                cellClass = "bg-red-500 border-red-300 text-white";
              if (isMaintenance)
                cellClass = "bg-purple-500 border-purple-300 text-white";

              if (
                d.approvedLeaves.length > 0 &&
                !isSunday &&
                !isHoliday &&
                !isMaintenance
              ) {
                const hasFullDay = d.approvedLeaves.some(
                  (l) => l.leaveType === "fullday"
                );
                cellClass = hasFullDay
                  ? "bg-blue-800 border-blue-500 text-white"
                  : "bg-orange-500 border-orange-300 text-white";
              }

              return (
                <div
                  key={d.formatted}
                  onClick={() => onDayClick(d)}
                  className={`relative rounded-lg h-16 flex flex-col items-center justify-center text-sm cursor-pointer border shadow-sm transition ${cellClass}`}
                >
                  <div className="font-medium">{d.day}</div>

                  {/* holiday label */}
                  {d.holidayItem && (
                    <div className="text-[10px] px-1 text-center mt-1 w-full truncate">
                      {d.holidayItem.description}
                    </div>
                  )}

                  {/* leave type label */}
                  {d.approvedLeaves.length > 0 &&
                    !isSunday &&
                    !isHoliday &&
                    !isMaintenance && (
                      <div className="text-[10px] px-1 text-center mt-1 w-full truncate">
                        {d.approvedLeaves.map((l) => l.leaveType).join(", ")}
                      </div>
                    )}
                </div>
              );
            })}
          </div>

          {/* Color Legend */}
          <div className="mt-4 flex flex-wrap gap-4 items-center text-sm">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-red-500 rounded-sm border"></span>
              Holiday / Sunday
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-purple-500 rounded-sm border"></span>
              Maintenance
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-blue-800 rounded-sm border"></span>
              Full Day Leave
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-orange-500 rounded-sm border"></span>
              Half Day Leave
            </div>
          </div>
        </div>
      </div>

      {/* Leave List Component */}
      <LeaveList
        leaves={leaves}
        handleCreateLeave={handleCreateLeave}
        handleEditLeave={handleEditLeave}
        handleDeleteLeave={handleDeleteLeave}
      />

      {/* Leave Modal Component */}
      <LeaveModal
        showModal={showModal}
        setShowModal={setShowModal}
        editingLeave={editingLeave}
        formData={formData}
        setFormData={setFormData}
        handleSubmitLeave={handleSubmitLeave}
      />
    </div>
  );
}