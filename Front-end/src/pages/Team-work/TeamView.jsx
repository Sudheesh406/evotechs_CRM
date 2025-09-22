import React, { useEffect, useState } from "react";
import axios from "../../instance/Axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";


function TeamView() {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const navigate = useNavigate();


async function getTeam() {
  try {
    // Show loading alert
    Swal.fire({
      title: "Getting teams...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    const response = await axios.get("/team/details/get");

    if (response.data.success) {
      const mappedTeams = response.data.data.map((team) => ({
        id: team.id,
        name: team.teamName,
        description: team.teamDescription,
        members: team.members || [],
        leader: team.leader || null,
      }));
      setTeams(mappedTeams);

      // Close loading alert once done
      Swal.close();
    } else {
      Swal.fire({
        icon: "error",
        title: "Failed to get teams",
        text: response.data.message || "Unknown error",
      });
    }
  } catch (error) {
    console.log("Error getting teams:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to get teams. Please try again later.",
    });
  }
}


 const handleTeamViewHistory = async (selectedTeam) => {
  if (!selectedTeam) return;

  try {
    const response = await axios.post('/team/history/post', { selectedTeam });

    if (response) {
      console.log(response);
      navigate(`/team/work/${selectedTeam.id}`);
    }
  } catch (error) {
    console.log('Error found in team history:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Failed to get team history. Please try again later.'
    });
  }
};


  useEffect(() => {
    getTeam();
  }, []);

  return (
    <div className="flex min-h-[600px] max-w-7xl mx-auto p-6 gap-6 bg-gray-50">
      {/* Left side: Teams list */}
      <div className="w-1/3 bg-white rounded-xl shadow overflow-y-auto">
        <div className="bg-gradient-to-r from-purple-200 to-blue-200 p-4 rounded-t-xl">
          <h2 className="text-xl font-bold text-blue-800">Teams</h2>
        </div>
        <ul className="p-4">
          {teams.map((team) => (
            <li
              key={team.id}
              className={`p-3 rounded-lg cursor-pointer mb-2 transition ${
                selectedTeam?.id === team.id
                  ? "bg-blue-500 text-white"
                  : "bg-gray-300 hover:bg-blue-100"
              }`}
              onClick={() => setSelectedTeam(team)}
            >
              {team.name}
            </li>
          ))}
        </ul>
      </div>

      {/* Right side: Selected team details */}
      <div className="w-2/3 bg-white rounded-xl shadow overflow-y-auto">
        <div className="bg-gradient-to-r from-purple-200 to-blue-200 p-4 rounded-t-xl flex justify-between items-center">
          <h2 className="text-2xl font-bold text-blue-800">
            {selectedTeam ? selectedTeam.name : "Team Details"}
          </h2>

          {/* View button */}
          {selectedTeam && (
            <button
              onClick={() =>
                handleTeamViewHistory(selectedTeam)
              } // fake URL
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow"
            >
              View
            </button>
          )}
        </div>

        <div className="p-6">
          {selectedTeam ? (
            <>
              <p className="text-gray-700 mb-4">{selectedTeam.description}</p>

              {selectedTeam.leader && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-green-700">
                    Team Leader:
                  </h3>
                  <p className="text-gray-800">{selectedTeam.leader.name}</p>
                </div>
              )}

              <h3 className="text-lg font-semibold mb-2 text-blue-700">
                Team Members:
              </h3>
              {selectedTeam.members && selectedTeam.members.length > 0 ? (
                <ul className="list-disc pl-5 text-gray-700">
                  {selectedTeam.members.map((member) => (
                    <li key={member.id}>{member.name}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No members assigned</p>
              )}
            </>
          ) : (
            <p className="text-gray-500">Select a team to see details</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default TeamView;
