import React, { useState, useEffect, useCallback } from "react";
import LeaveModal from "../../components/modals/LeaveModal";
import LeaveList from "../../components/LeaveList";
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

  const [showModal, setShowModal] = useState(false);
  const [editingLeave, setEditingLeave] = useState(null);
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    const todayInput = ddmmyyyyToInput(formatDateObjToDDMMYYYY(now));
    setFormData((prev) => ({
      ...prev,
      startDate: todayInput,
      endDate: todayInput,
    }));
  }, []);

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

  useEffect(() => {
    fetchHolidays(displayedYear, displayedMonth + 1);
    fetchLeaves(displayedYear, displayedMonth + 1);
  }, [displayedMonth, displayedYear, fetchHolidays, fetchLeaves]);

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

  const onDayClick = (day) => {
    if (day.holidayItem) return;

    setEditingLeave(null);
    setFormData({
      ...initialFormData,
      startDate: ddmmyyyyToInput(day.formatted),
      endDate: ddmmyyyyToInput(day.formatted),
    });
    setShowModal(true);
  };

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
      startDate: ddmmyyyyToInput(leave.startDate),
      endDate: ddmmyyyyToInput(leave.endDate),
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
      });
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
    });

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
        });
      } catch (err) {
        console.error("Failed to delete leave", err);
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: "Failed to delete leave",
        });
      }
    }
  };

  const handleSubmitLeave = async (formDataToSubmit, currentEditingLeave) => {
    try {
      const payload = {
        leaveType: formDataToSubmit.leaveType,
        category: formDataToSubmit.category,
        leaveDate: formDataToSubmit.startDate,
        endDate: formDataToSubmit.endDate,
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
        startDate: formatInputToDDMMYYYY(
          res.data.leaveDate || formDataToSubmit.startDate
        ),
        endDate: formatInputToDDMMYYYY(
          res.data.endDate || formDataToSubmit.endDate
        ),
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
      setFormData(initialFormData);

      Swal.fire({
        icon: "success",
        title: `Leave ${currentEditingLeave ? "updated" : "created"} successfully!`,
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      const status = err.response?.status;
      if (status === 406) {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: "End date cannot be before start date",
        });
      } else {
        console.error("Failed to save leave", err);
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: "Server Error please check after some time",
        });
      }
    }
  };

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
        <div className="md:col-span-12 bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4 gap-3">
            <button
              onClick={handlePrevMonth}
              className="px-3 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition"
            >
              Prev
            </button>
            <h2 className="text-lg font-semibold text-gray-800">
              {new Date(displayedYear, displayedMonth).toLocaleString("default", {
                month: "long",
                year: "numeric",
              })}
            </h2>
            <button
              onClick={handleNextMonth}
              className="px-3 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition"
            >
              Next
            </button>
          </div>

          {/* Weekdays */}
          <div className="grid grid-cols-7 text-center text-xs font-semibold text-gray-500 uppercase mb-3">
            {weekDays.map((wd) => (
              <div key={wd}>{wd}</div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-2">
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
              const hasApprovedLeave = d.approvedLeaves.length > 0;
              const showTooltip = isHoliday || hasApprovedLeave;

              let cellClass = "bg-white border-gray-200 hover:bg-gray-50";
              if (isSunday || isHoliday)
                cellClass = "bg-red-500 border-red-300 text-white";
              if (isMaintenance)
                cellClass = "bg-purple-500 border-purple-300 text-white";

              if (
                hasApprovedLeave &&
                !isSunday &&
                !isHoliday &&
                !isMaintenance
              ) {
                const hasFullDay = d.approvedLeaves.some(
                  (l) =>
                    l.leaveType === "Full Day" || l.leaveType === "fullday"
                );
                cellClass = hasFullDay
                  ? "bg-blue-800 border-blue-500 text-white"
                  : "bg-orange-500 border-orange-300 text-white";
              }

              let tooltipContent;
              if (d.holidayItem) {
                tooltipContent = (
                  <div className="p-2">
                    <div className="font-bold text-red-500 uppercase">
                      {d.holidayItem.type === "maintenance"
                        ? "Maintenance Day"
                        : "Public Holiday"}
                    </div>
                    <div className="text-xs">{d.holidayItem.description}</div>
                  </div>
                );
              } else if (hasApprovedLeave) {
                tooltipContent = (
                  <div className="p-2 space-y-1">
                    <div className="font-bold text-blue-500">
                      Approved Leave(s)
                    </div>
                    {d.approvedLeaves.map((l, index) => (
                      <div
                        key={index}
                        className="text-xs border-t pt-1 first:border-t-0 first:pt-0"
                      >
                        <span className="font-medium">
                          {l.leaveType} ({l.category})
                        </span>
                      </div>
                    ))}
                  </div>
                );
              }

              return (
                <div
                  key={d.formatted}
                  onClick={() => onDayClick(d)}
                  className={`relative rounded-lg h-16 flex flex-col items-center justify-center text-sm cursor-pointer border shadow-sm transition ${cellClass}`}
                >
                  {showTooltip ? (
                    <div className="group relative w-full h-full flex flex-col items-center justify-center">
                      <div className="font-medium">{d.day}</div>
                      {d.holidayItem && (
                        <div className="text-[10px] px-1 text-center mt-1 w-full truncate">
                          {d.holidayItem.description}
                        </div>
                      )}
                      {hasApprovedLeave &&
                        !isSunday &&
                        !isHoliday &&
                        !isMaintenance && (
                          <div className="text-[10px] px-1 text-center mt-1 w-full truncate">
                            {d.approvedLeaves
                              .map((l) => l.leaveType)
                              .join(", ")}
                          </div>
                        )}
                      <div
                        className="opacity-0 group-hover:opacity-100 absolute z-20 transition-opacity duration-300 pointer-events-none top-full mt-1 w-64 md:left-full md:ml-2 bg-white text-gray-800 rounded-lg shadow-xl border border-gray-200 text-left"
                        style={{ minWidth: "150px" }}
                      >
                        {tooltipContent}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="font-medium">{d.day}</div>
                      {d.holidayItem && (
                        <div className="text-[10px] px-1 text-center mt-1 w-full truncate">
                          {d.holidayItem.description}
                        </div>
                      )}
                      {d.approvedLeaves.length > 0 &&
                        !isSunday &&
                        !isHoliday &&
                        !isMaintenance && (
                          <div className="text-[10px] px-1 text-center mt-1 w-full truncate">
                            {d.approvedLeaves
                              .map((l) => l.leaveType)
                              .join(", ")}
                          </div>
                        )}
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
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

      <LeaveList
        leaves={leaves}
        handleCreateLeave={handleCreateLeave}
        handleEditLeave={handleEditLeave}
        handleDeleteLeave={handleDeleteLeave}
      />

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
