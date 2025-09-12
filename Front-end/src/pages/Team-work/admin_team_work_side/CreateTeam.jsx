import React, { useState } from "react";

const mockStaffs = [
  { id: 1, name: "John Doe", phone: "9876543210" },
  { id: 2, name: "Jane Smith", phone: "9123456789" },
  { id: 3, name: "Michael Johnson", phone: "9988776655" },
  { id: 4, name: "Emily Brown", phone: "9012345678" },
  { id: 5, name: "David Wilson", phone: "9090909090" },
];

function CreateTeam() {
  const [selectedStaff, setSelectedStaff] = useState([]);
  const [teamName, setTeamName] = useState("");
  const [teamDescription, setTeamDescription] = useState("");
  const [teamLeader, setTeamLeader] = useState("");
  const [teamColor, setTeamColor] = useState("#3b82f6");
  const [teams, setTeams] = useState([]);

  const [staffSearch, setStaffSearch] = useState("");
  const [teamSearch, setTeamSearch] = useState("");
  const [editingTeamId, setEditingTeamId] = useState(null);

  const toggleSelect = (id) => {
    if (selectedStaff.includes(id)) {
      setSelectedStaff(selectedStaff.filter((s) => s !== id));
      if (teamLeader === id) setTeamLeader(""); // remove leader if deselected
    } else {
      setSelectedStaff([...selectedStaff, id]);
    }
  };

  const handleCreateOrUpdateTeam = () => {
    if (!teamName.trim()) return alert("Please enter a team name");
    if (selectedStaff.length === 0) return alert("Please select staff");

    // prevent duplicate names
    if (
      !editingTeamId &&
      teams.some((t) => t.name.toLowerCase() === teamName.toLowerCase())
    ) {
      return alert("A team with this name already exists!");
    }

    const teamMembers = mockStaffs.filter((s) => selectedStaff.includes(s.id));

    const newTeam = {
      id: editingTeamId || Date.now(),
      name: teamName,
      description: teamDescription,
      leader: teamLeader,
      color: teamColor,
      members: teamMembers,
    };

    if (editingTeamId) {
      setTeams(teams.map((t) => (t.id === editingTeamId ? newTeam : t)));
      setEditingTeamId(null);
    } else {
      setTeams([...teams, newTeam]);
    }

    // reset form
    setTeamName("");
    setTeamDescription("");
    setSelectedStaff([]);
    setTeamLeader("");
    setTeamColor("#3b82f6");
  };

  const handleEditTeam = (team) => {
    setEditingTeamId(team.id);
    setTeamName(team.name);
    setTeamDescription(team.description);
    setSelectedStaff(team.members.map((m) => m.id));
    setTeamLeader(team.leader);
    setTeamColor(team.color);
  };

  const handleDeleteTeam = (id) => {
    if (window.confirm("Are you sure you want to delete this team?")) {
      setTeams(teams.filter((t) => t.id !== id));
    }
  };

  const filteredStaffs = mockStaffs.filter(
    (s) =>
      s.name.toLowerCase().includes(staffSearch.toLowerCase()) ||
      s.phone.includes(staffSearch)
  );

  const filteredTeams = teams.filter((t) =>
    t.name.toLowerCase().includes(teamSearch.toLowerCase())
  );

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
      {/* Left: Teams */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Teams</h2>
        <input
          type="text"
          placeholder="Search teams..."
          className="w-full border rounded-lg px-3 py-2 mb-4"
          value={teamSearch}
          onChange={(e) => setTeamSearch(e.target.value)}
        />

        {filteredTeams.length === 0 ? (
          <p className="text-gray-500">No teams found.</p>
        ) : (
          <div className="space-y-4">
            {filteredTeams.map((team) => (
              <div
                key={team.id}
                className="border rounded-lg p-3"
                style={{ borderLeft: `6px solid ${team.color}` }}
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold" style={{ color: team.color }}>
                    {team.name}{" "}
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                      {team.members.length} members
                    </span>
                  </h3>
                  <div className="space-x-2">
                    <button
                      onClick={() => handleEditTeam(team)}
                      className="text-sm text-yellow-600 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTeam(team.id)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {team.description && (
                  <p className="text-sm text-gray-600 mt-1">{team.description}</p>
                )}
                {team.leader && (
                  <p className="text-sm text-blue-700 mt-1">
                    Leader:{" "}
                    {mockStaffs.find((s) => s.id === team.leader)?.name}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  {team.members.map((m) => (
                    <span
                      key={m.id}
                      className="px-3 py-1 bg-gray-200 rounded-full text-sm"
                    >
                      {m.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right: Create/Edit */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          {editingTeamId ? "Edit Team" : "Create a New Team"}
        </h2>

        <input
          type="text"
          placeholder="Enter team name"
          className="w-full border rounded-lg px-4 py-2 mb-3"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
        />

        <textarea
          placeholder="Enter team description..."
          className="w-full border rounded-lg px-4 py-2 mb-3"
          value={teamDescription}
          onChange={(e) => setTeamDescription(e.target.value)}
        />

        {/* Color Picker */}
        <label className="block mb-3">
          <span className="text-gray-700 text-sm">Team Color:</span>
          <input
            type="color"
            value={teamColor}
            onChange={(e) => setTeamColor(e.target.value)}
            className="ml-2"
          />
        </label>

        {/* Staff Search */}
        <input
          type="text"
          placeholder="Search staff..."
          className="w-full border rounded-lg px-3 py-2 mb-3"
          value={staffSearch}
          onChange={(e) => setStaffSearch(e.target.value)}
        />

        <div className="max-h-60 overflow-y-auto border rounded-lg p-3">
          {filteredStaffs.map((staff) => (
            <label
              key={staff.id}
              className="flex items-center justify-between p-2 border-b cursor-pointer hover:bg-gray-50"
            >
              <div>
                <p className="font-medium text-gray-800">{staff.name}</p>
                <p className="text-sm text-gray-500">{staff.phone}</p>
              </div>
              <input
                type="checkbox"
                checked={selectedStaff.includes(staff.id)}
                onChange={() => toggleSelect(staff.id)}
                className="w-5 h-5 text-blue-500"
              />
            </label>
          ))}
        </div>

        {/* Leader Select */}
        {selectedStaff.length > 0 && (
          <div className="my-3">
            <label className="text-sm text-gray-700">Select Team Leader:</label>
            <select
              value={teamLeader}
              onChange={(e) => setTeamLeader(Number(e.target.value))}
              className="w-full border rounded-lg px-3 py-2 mt-1"
            >
              <option value="">-- Select Leader --</option>
              {mockStaffs
                .filter((s) => selectedStaff.includes(s.id))
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
            </select>
          </div>
        )}

        <button
          onClick={handleCreateOrUpdateTeam}
          className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition"
        >
          {editingTeamId ? "Update Team" : "Create Team"}
        </button>
      </div>
    </div>
  );
}

export default CreateTeam;
