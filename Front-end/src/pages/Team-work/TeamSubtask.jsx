import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "../../instance/Axios";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
} from "lucide-react";

export default function TeamSubtask() {
  const [subTasks, setSubTasks] = useState([]);
  const { id } = useParams(); // main task ID

  const navigate = useNavigate()

  console.log("id", id);

  // --- Fetch Sub Tasks ---
  const getSubTask = async () => {
    try {
      const response = await axios.get(`/sub-task/get/team/${id}`);
      if (response.data?.success && Array.isArray(response.data.data)) {
        setSubTasks(response.data.data);
      }
    } catch (error) {
      console.log("error found in getting sub task", error);
    }
  };

  useEffect(() => {
    getSubTask();
  }, []);

  return (
    <div className="p-6 sm:p-10 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* --- Header --- */}
        <header className="mb-10 border-b pb-4 flex justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Sub-Tasks</h1>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-gray-700 bg-gray-200 px-3 py-2 rounded-lg hover:bg-gray-300 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </header>

        {/* --- Sub Task Cards --- */}
        {subTasks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {subTasks.map((task) => (
              <div
                key={task.id}
                className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-blue-500"
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  {task.title}
                </h3>

                <ul className="space-y-2">
                  {[...task.checked, ...task.notChecked].map((item, idx) => {
                    const isChecked = task.checked.includes(item);
                    return (
                      <li
                        key={idx}
                        className="flex items-center gap-2 text-gray-700"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          readOnly
                          className="w-4 h-4 accent-blue-600 cursor-default"
                        />
                        <span>{item}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center bg-white p-10 rounded-xl shadow-inner text-gray-500">
            <p>No sub-tasks found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
