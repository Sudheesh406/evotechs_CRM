import React, { useEffect, useState } from "react";
import axios from "../../instance/Axios";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";

// --- ProjectCard Component (Updated Design) ---
function ProjectCard({ projectName, handleProjectView }) {
  return (
    <div
      className="
        bg-white 
        shadow-xl 
        rounded-xl 
        p-6 
        w-full 
        sm:w-64 
        cursor-pointer 
        transform 
        hover:scale-[1.02] 
        hover:shadow-2xl 
        transition 
        duration-300 
        ease-in-out
        border-t-4 
        border-indigo-600
      "
      onClick={() => handleProjectView(projectName)}
    >
      <div className="flex items-center space-x-3">
        {/* Project Icon */}
        <span className="text-indigo-600 text-2xl">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        </span>
        {/* Project Name */}
        <h3 className="text-lg font-bold text-gray-800 truncate">{projectName}</h3>
      </div>
      <p className="text-sm text-gray-500 mt-2">Click to view details and manage work.</p>
    </div>
  );
}

// --- TeamWorkView Component (Updated Design) ---
export default function TeamWorkView() {
  const params = useParams();
  const [projects, setProjects] = useState([]);
  const [staffIds, setStaffIds] = useState();
  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      // Show loading
      Swal.fire({
        title: "Getting projects...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await axios.get(`/team/sectors/get/${params.id}`);

      // Check if requirements exist and are not empty
      if (!response.data?.requirements || response.data.requirements.length === 0) {
        Swal.close();
        return Swal.fire({
          icon: "info",
          title: "No Project Found",
          text: "There are no projects available right now.",
          confirmButtonText: "OK",
        });
      }

      // Extract projects
      const projectNames = response.data.requirements.map((item) => item.project);
      setProjects(projectNames);

      // Extract staff IDs
      const staffArray = response?.data?.team?.staffIds || [];
      setStaffIds(staffArray);

      Swal.close(); // close loading
    } catch (error) {
      Swal.close(); // close loading in case of failure

      // If backend specifically returns 405 -> no projects
      if (error?.response?.status === 405) {
        console.log("No team projects:", error);
        return Swal.fire({
          icon: "info",
          title: "No Project Found",
          text: "There are no projects available right now.",
          confirmButtonText: "OK",
        });
      }

      // Generic error
      console.log("Error fetching projects:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to get projects. Please try again later.",
        confirmButtonText: "OK",
      });
    }
  };

  const handleProjectView = (projectName) => {
    const dataToSend = encodeURIComponent(
      JSON.stringify({ staffIds, projectName })
    );
    navigate(`/team/work/manage/${dataToSend}`);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="bg-gray-50 p-4 sm:p-6 lg:p-8">
      <header className="mb-8 border-b pb-4">
         <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            <span className="text-indigo-600">Team</span> Projects
          </h1>
        <p className="mt-1 text-base text-gray-500">
          Select a project card to manage the team's work and requirements.
        </p>
      </header>
      
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {projects.map((project, index) => (
            <ProjectCard
              key={index}
              projectName={project}
              handleProjectView={handleProjectView}
            />
          ))}
        </div>
      ) : (
        // Enhanced Empty State
        <div className="flex flex-col items-center justify-center p-12 bg-white border-2 border-dashed border-gray-300 rounded-xl mt-10">
          <svg className="h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            No Projects Found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            It looks like there are no active projects assigned to this team yet.
          </p>
        </div>
      )}
    </div>
  );
}