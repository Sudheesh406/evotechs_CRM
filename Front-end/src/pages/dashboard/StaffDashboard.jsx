import { useState, useEffect } from "react";
import axios from "../../instance/Axios";
import Swal from "sweetalert2";

const statuses = ["Pending", "Progress", "Completed"];
const statusColors = {
  Pending: "bg-blue-100",
  Progress: "bg-yellow-100",
  Completed: "bg-green-100",
};

const StaffDashboard = () => {
  const [workDetails, setWorkDetails] = useState([]);
  const [expandedTasks, setExpandedTasks] = useState({}); // Track which tasks are expanded

  const getWorkAssign = async () => {
    try {
      // Show loading alert
      Swal.fire({
        title: "Loading work assignments...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const { data } = await axios.get("/work/get");

      setWorkDetails(data.data);

      // Close loading alert
      Swal.close();
    } catch (error) {
      // Close loading if it was still open
      Swal.close();

      // Show error alert
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error?.response?.data?.message ||
          "Something went wrong while fetching work assignments",
      });

      console.log("error found in getWorkAssign", error);
    }
  };

  useEffect(() => {
    getWorkAssign();
  }, []);

  const handleUpdateClick = async (task) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to update the task "${task.title}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, update it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.put(`/work/stage/update/${task.id}`);
        console.log(response);
        if (response) {
          Swal.fire({
            title: "Updated!",
            text: "The task has been updated.",
            icon: "success",
            showConfirmButton: true, // hides the "OK" button
          }).then(()=>{
            getWorkAssign();
          })
        }
      } catch (error) {
        Swal.fire("Error!", "Something went wrong.", "error");
      }
    }
  };

  const toggleExpand = (taskId) => {
    setExpandedTasks((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  return (
    <div className="bg-[#f5f5f5] min-h-[680px] text-gray-800 p-4">
      <h1 className="text-2xl font-bold mb-4">Welcome Back</h1>

      <div className="flex gap-4 flex-wrap">
        {statuses.map((status) => {
          const filteredTasks = workDetails.filter(
            (t) => t.workUpdate === status
          );

          return (
            <div key={status} className="flex-1 min-w-[250px]">
              <div
                className={`rounded-t-lg p-3 text-black font-semibold ${
                  statusColors[status] || "bg-gray-200"
                }`}
              >
                {status}
                <span className="ml-2 bg-white text-gray-800 px-2 py-0.5 rounded-full text-sm">
                  {filteredTasks.length}
                </span>
              </div>

              <div className="bg-gray-50 rounded-b-lg p-2 flex flex-col gap-3 max-h-[70vh] overflow-y-auto">
                {filteredTasks.map((task) => {
                  const isExpanded = expandedTasks[task.id] || false;
                  const shortDesc =
                    task.description.length > 100
                      ? task.description.slice(0, 100) + "..."
                      : task.description;

                  return (
                    <div
                      key={task.id}
                      className="bg-white p-3 rounded-lg shadow hover:shadow-md transition"
                    >
                      <div className="flex justify-between items-start">
                        <h4 className=" mb-1 font-bold ">{task.title}</h4>
                        {(status === "Pending" || status === "Progress") && (
                          <button
                            onClick={() => handleUpdateClick(task)}
                            className="mt-2 px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                          >
                            Update
                          </button>
                        )}
                      </div>
                      <div className="flex flex-col gap-3">
                        <div className="flex justify-between pt-2">
                          <p className="text-sm text-gray-500 font-bold ">
                            {new Date(task.date).toLocaleDateString("en-GB")}
                          </p>
                          {task.team?.teamName && (
                            <p className="text-sm text-gray-600 font-medium text-indigo-600 font-bold">
                              {task.team.teamName}
                            </p>
                          )}
                        </div>
                        <p
                          className="inline-flex items-center px-3 py-1 text-sm font-bold rounded-full 
              bg-gradient-to-r from-red-400 to-pink-500 text-white shadow-md max-w-[150px]"
                        >
                          Priority: {task.priority}
                        </p>

                        <p className="text-sm text-gray-500 font-bold">
                          Description:{" "}
                          {isExpanded ? task.description : shortDesc}{" "}
                          {task.description.length > 100 && (
                            <span
                              onClick={() => toggleExpand(task.id)}
                              className="text-indigo-600 cursor-pointer ml-1 font-semibold"
                            >
                              {isExpanded ? "Show Less" : "Read More"}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {filteredTasks.length === 0 && (
                  <div className="text-center text-gray-400 mt-2 p-4">
                    No {status} tasks found.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StaffDashboard;
