import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, ClipboardList, CheckCircle, Menu, X } from "lucide-react";
import Sidebar from "../../components/SideBar";

export default function WorkManagementPage() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [totalTime, setTotalTime] = useState("");
  const [requirements, setRequirements] = useState([]);
  const [levels, setLevels] = useState([]);

  const [reqInput, setReqInput] = useState("");
  const [levelData, setLevelData] = useState({ title: "", description: "" });

  // Add requirement
  const addRequirement = () => {
    if (reqInput.trim() === "") return;
    setRequirements([
      ...requirements,
      { id: Date.now(), text: reqInput, checked: false }
    ]);
    setReqInput("");
  };

  // Toggle requirement checkbox
  const toggleRequirementCheck = (id) => {
    setRequirements(
      requirements.map((req) =>
        req.id === id ? { ...req, checked: !req.checked } : req
      )
    );
  };

  // Add level
  const addLevel = () => {
    if (levelData.title.trim() === "" || levelData.description.trim() === "")
      return;
    setLevels([
      ...levels,
      {
        id: Date.now(),
        title: levelData.title,
        description: levelData.description,
        timeTaken: "",
        comments: "",
        completed: false
      }
    ]);
    setLevelData({ title: "", description: "" });
  };

  // Mark level as done
  const markLevelDone = (id) => {
    setLevels(
      levels.map((level) =>
        level.id === id ? { ...level, completed: true } : level
      )
    );
  };

  // Save modal data
  const handleSave = () => {
    console.log({
      totalTime,
      requirements,
      levels
    });
    setShowModal(false);
  };

  return (
    <div className="flex bg-gray-100 min-h-screen">
      {/* Sidebar - Desktop */}
      <div className="hidden md:flex md:flex-col md:w-64 fixed inset-y-0 left-0 z-30">
        <Sidebar />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform md:hidden transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar />
      </div>

      {/* Main Content */}
      <main
        className={`flex-1 min-w-0 p-4 sm:p-6 md:p-8 transition-all duration-300 md:ml-64`}
      >
        {/* Top Bar */}
        <div className="mb-6 flex items-center gap-2">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md bg-gray-200 hover:bg-gray-300 md:hidden"
          >
            <Menu className="w-6 h-6" />
          </button>
          {/* Heading */}
          <div className="flex items-center w-full justify-between">
            <h1 className="text-lg sm:text-xl font-bold  text-gray-800">Task Management</h1>
            <button
              onClick={() => setShowModal(true)}
              className="px-3 py-1 rounded bg-green-500 text-white hover:bg-green-600"
            >
              Create
            </button>
          </div>
        </div>

        {/* Show saved data */}
        {totalTime && (
          <div className="bg-white rounded-xl shadow-md p-4 mb-6 flex items-center gap-4">
            <Clock className="text-red-500 w-8 h-8" />
            <div>
              <p className="text-sm text-gray-500">Maximum Time Allowed</p>
              <p className="text-lg font-semibold">{totalTime}</p>
            </div>
          </div>
        )}

        {requirements.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-4 mb-6">
            <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <ClipboardList className="w-5 h-5 text-red-500" /> Requirements
            </h2>
            <ul className="space-y-2">
              {requirements.map((req) => (
                <li key={req.id} className="flex items-center gap-2 text-gray-700">
                  <input
                    type="checkbox"
                    checked={req.checked}
                    onChange={() => toggleRequirementCheck(req.id)}
                  />
                  <span>{req.text}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {levels.length > 0 && (
          <div className="grid gap-6">
            {levels.map((level) => (
              <div
                key={level.id}
                className="bg-white rounded-xl shadow-md p-4 border-l-4 border-red-500"
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold">{level.title}</h3>
                  {level.completed && (
                    <span className="flex items-center gap-1 text-green-600 font-semibold">
                      <CheckCircle className="w-5 h-5" /> Completed
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mb-4">{level.description}</p>

                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Time Taken (hrs/days)
                    </label>
                    <input
                      type="text"
                      value={level.timeTaken}
                      onChange={(e) =>
                        setLevels(
                          levels.map((l) =>
                            l.id === level.id
                              ? { ...l, timeTaken: e.target.value }
                              : l
                          )
                        )
                      }
                      className="w-full border rounded-lg p-2"
                      placeholder="Enter time taken"
                      disabled={level.completed}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Comments
                    </label>
                    <input
                      type="text"
                      value={level.comments}
                      onChange={(e) =>
                        setLevels(
                          levels.map((l) =>
                            l.id === level.id
                              ? { ...l, comments: e.target.value }
                              : l
                          )
                        )
                      }
                      className="w-full border rounded-lg p-2"
                      placeholder="Write your comments"
                      disabled={level.completed}
                    />
                  </div>
                </div>

                {!level.completed && (
                  <button
                    onClick={() => markLevelDone(level.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                  >
                    Done
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Create Task Plan</h2>
              <button onClick={() => setShowModal(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Total time */}
            <div className="mb-4">
              <label className="block font-medium mb-1">
                Total Time Allowed
              </label>
              <input
                type="text"
                value={totalTime}
                onChange={(e) => setTotalTime(e.target.value)}
                placeholder="e.g. 10 Days or 80 Hours"
                className="w-full border rounded p-2"
              />
            </div>

            {/* Requirements */}
            <div className="mb-4">
              <label className="block font-medium mb-1">Requirements</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={reqInput}
                  onChange={(e) => setReqInput(e.target.value)}
                  placeholder="Enter requirement"
                  className="flex-1 border rounded p-2"
                />
                <button
                  onClick={addRequirement}
                  className="px-3 py-1 bg-blue-500 text-white rounded"
                >
                  Add
                </button>
              </div>
              <ul className="mt-2 text-sm text-gray-600">
                {requirements.map((req) => (
                  <li
                    key={req.id}
                    className="py-1"
                  >
                    {req.text}
                  </li>
                ))}
              </ul>
            </div>

            {/* Levels */}
            <div className="mb-4">
              <label className="block font-medium mb-1">Add Levels</label>
              <input
                type="text"
                value={levelData.title}
                onChange={(e) =>
                  setLevelData({ ...levelData, title: e.target.value })
                }
                placeholder="Level title"
                className="w-full border rounded p-2 mb-2"
              />
              <textarea
                value={levelData.description}
                onChange={(e) =>
                  setLevelData({ ...levelData, description: e.target.value })
                }
                placeholder="Level description"
                className="w-full border rounded p-2 mb-2"
              />
              <button
                onClick={addLevel}
                className="px-3 py-1 bg-blue-500 text-white rounded"
              >
                Add Level
              </button>
              <ul className="mt-2 text-sm text-gray-600">
                {levels.map((lvl) => (
                  <li key={lvl.id}>
                    {lvl.title} - {lvl.description}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded border"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded bg-green-500 text-white"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
