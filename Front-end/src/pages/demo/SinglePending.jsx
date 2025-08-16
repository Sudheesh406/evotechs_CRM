import React, { useState } from "react";
import { motion } from "framer-motion";
import Sidebar from "../../components/SideBar";
import { Menu, Download } from "lucide-react";

const dataDetail = {
  title: "Mudra Loan",
  description:
    "Arun Kumar has submitted the Mudra Loan review for your approval.",
  totalTime: "3h 20m",
  requirements: [
    "User login required",
    "High-speed internet",
    "Supported browser",
  ],
    startedDate: "2025-08-13",

  levels: 5,
};

export default function PendingDetailPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex bg-gray-50 min-h-screen text-gray-800">
      {/* Sidebar */}
      <div className="hidden md:block fixed top-0 left-0 h-full w-64 z-40">
        <Sidebar />
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <motion.div
        initial={{ x: -300 }}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed top-0 left-0 h-full w-64 bg-white z-50 md:hidden shadow-lg"
      >
        <Sidebar />
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 p-4 md:p-6 overflow-y-auto">
        {/* Mobile Header */}
        <div className="flex items-center  gap-2 mb-6 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md bg-gray-200 hover:bg-gray-300"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg sm:text-xl font-bold  text-gray-800">
            Pending Management
          </h1>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between mb-6">
          <h1 className="text-xl sm:text-1xl font-bold text-gray-800">
            Pending Management
          </h1>
        </div>

        {/* Header Card */}
        <div className="text-black rounded-xl p-4 md:p-6 mb-4 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold">
              {dataDetail.title}
            </h2>
            <p className="mt-2 text-gray-700 text-sm sm:text-base">
              {dataDetail.description}
            </p>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition">
            <span className="font-semibold text-gray-600">
              Total Time Allowed
            </span>
            <p className="text-xl font-bold mt-2">{dataDetail.totalTime}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition">
            <span className="font-semibold text-gray-600">
              Number of Levels
            </span>
            <p className="text-xl font-bold mt-2">{dataDetail.levels}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition">
            <span className="font-semibold text-gray-600">Started Date</span>
            <p className="text-xl font-bold mt-2">{dataDetail.startedDate}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow mb-4">
          <h2 className="text-xl font-semibold mb-3">Requirements</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {dataDetail.requirements.map((req, idx) => (
              <div
                key={idx}
                className="px-3 py-2 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200 transition text-sm sm:text-base"
              >
                {req}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
