import React, { useEffect, useState } from "react";
import axios from "../../instance/Axios";

function TeamView() {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);

  async function getTeam() {
    try {
      const response = await axios.get("/team/details/get");
      if (response.data.success) {
        // Map API data to match your existing structure
        const mappedTeams = response.data.data.map((team) => ({
          id: team.id,
          name: team.teamName,
          description: team.teamDescription,
          members: team.members || [],
        }));
        setTeams(mappedTeams);
      }
    } catch (error) {
      console.log("Error fetching teams:", error);
    }
  }

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
        <div className="bg-gradient-to-r from-purple-200 to-blue-200 p-4 rounded-t-xl">
          <h2 className="text-2xl font-bold text-blue-800">
            {selectedTeam ? selectedTeam.name : "Team Details"}
          </h2>
        </div>
        <div className="p-6">
          {selectedTeam ? (
            <>
              <p className="text-gray-700 mb-4">{selectedTeam.description}</p>
              <h3 className="text-lg font-semibold mb-2 text-blue-700">
                Team Members:
              </h3>
              {selectedTeam.members.length > 0 ? (
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
