import React, { useEffect, useState } from "react";
import axios from '../../instance/Axios';
import { useNavigate, useParams } from "react-router-dom";

function ProjectCard({ projectName, handleProjectView }) {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 w-full sm:w-64"onClick={ ()=> handleProjectView(projectName)}>
      <h3 className="text-base font-semibold text-gray-900">{projectName}</h3>
    </div>
  );
}

export default function TeamWorkView() {
  const params = useParams();
  const [projects, setProjects] = useState([]);
  const [staffIds, setStaffIds] = useState()
  const navigate = useNavigate()

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`/team/sectors/get/${params.id}`);
      const projectNames = response.data.requirements.map(item => item.project);
      setProjects(projectNames);
      const staffArray = response?.data?.team?.staffIds
      setStaffIds(staffArray)
    } catch (error) {
      console.log('Error fetching projects:', error);
    }
  };

  const handleProjectView = (projectName)=>{
    const dataToSend = encodeURIComponent(JSON.stringify({ staffIds, projectName }));
    navigate(`/team/work/manage/${dataToSend}`)
  }
  

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Projects</h1>
      {projects.length > 0 ? (
        <div className="flex flex-wrap gap-4">
          {projects.map((project, index) => (
            <ProjectCard key={index} projectName={project} handleProjectView={handleProjectView}/>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg p-6 text-center text-gray-500">
          No Projects found.
        </div>
      )}
    </div>
  );
}
