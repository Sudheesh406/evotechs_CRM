import { useNavigate } from "react-router-dom";
import axios from "../../../instance/Axios";
import React, { useState, useEffect } from "react";

function CreateTeam() {
  const navigate = useNavigate()
  const [staffs, setStaffs] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState([]);
  const [teamName, setTeamName] = useState("");
  const [teamDescription, setTeamDescription] = useState("");
  const [teamLeader, setTeamLeader] = useState("");
  const [teams, setTeams] = useState([]);

  const [staffSearch, setStaffSearch] = useState("");
  const [teamSearch, setTeamSearch] = useState("");
  const [editingTeamId, setEditingTeamId] = useState(null);
  const [originalTeamData, setOriginalTeamData] = useState(null);

  const [errors, setErrors] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false); // 👈 modal state

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const { data } = await axios.get("/team/get");
        const normalizedTeams = (data.data || []).map((t) => ({
          id: t.id,
          name: t.teamName || t.name || "",
          description: t.teamDescription || t.description || "",
          members: t.staffDetails || [],
          leader: t.leaderId || null,
        }));
        setTeams(normalizedTeams);
      } catch (error) {
        console.error("Error fetching teams:", error);
      }
    };

    const fetchStaffs = async () => {
      try {
        const { data } = await axios.get("/team/staff/get");
        setStaffs(data.data || []);
      } catch (error) {
        console.error("Error fetching staffs:", error);
      }
    };

    fetchTeams();
    fetchStaffs();
  }, []);

  const toggleSelect = (id) => {
    if (selectedStaff.includes(id)) {
      setSelectedStaff(selectedStaff.filter((s) => s !== id));
      if (teamLeader === id) setTeamLeader("");
    } else {
      setSelectedStaff([...selectedStaff, id]);
    }
    if (errors.staff) setErrors((prev) => ({ ...prev, staff: "" }));
  };

  const handleCreateOrUpdateTeam = async () => {
    let newErrors = {};
    if (!teamName.trim()) newErrors.teamName = "Team name is required.";
    if (selectedStaff.length === 0)
      newErrors.staff = "Please select at least one staff.";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const teamMembers = staffs.filter((s) => selectedStaff.includes(s.id));

    try {
      if (editingTeamId) {
        const hasChanged =
          teamName !== originalTeamData.name ||
          teamDescription !== originalTeamData.description ||
          teamLeader !== originalTeamData.leader ||
          selectedStaff.sort().join(",") !==
            originalTeamData.members.sort().join(",");

        if (!hasChanged) {
          alert("No changes detected. Update not required.");
          return;
        }

        await axios.put(`/team/update/${editingTeamId}`, {
          teamName,
          teamDescription,
          leaderId: teamLeader,
          staffIds: selectedStaff,
        });

        setTeams(
          teams.map((t) =>
            t.id === editingTeamId
              ? {
                  ...t,
                  name: teamName,
                  description: teamDescription,
                  members: teamMembers,
                  leader: teamLeader,
                }
              : t
          )
        );
        setEditingTeamId(null);
      } else {
        const { data } = await axios.post("/team/create", {
          teamName,
          teamDescription,
          leaderId: teamLeader,
          staffIds: selectedStaff,
        });

        const newTeam = {
          id: data?.data.id,
          name: data?.data.teamName || "",
          description: data?.data.teamDescription || "",
          members: staffs.filter((s) => selectedStaff.includes(s.id)),
          leader: data?.data.leaderId || null,
        };

        setTeams([...teams, newTeam]);
      }

      setTeamName("");
      setTeamDescription("");
      setSelectedStaff([]);
      setTeamLeader("");
      setErrors({});
      setOriginalTeamData(null);
      setIsModalOpen(false); // close modal after save
    } catch (error) {
      console.error("Error saving team:", error);
    }
  };

  const handleEditTeam = (team) => {
    setEditingTeamId(team.id);
    setTeamName(team.name);
    setTeamDescription(team.description);
    const memberIds = team.members.map((m) => m.id);
    setSelectedStaff(memberIds);
    setTeamLeader(team.leader);
    setOriginalTeamData({
      name: team.name,
      description: team.description,
      members: memberIds,
      leader: team.leader,
    });
    setErrors({});
    setIsModalOpen(true); // 👈 open modal when editing in mobile
  };

  const handleDeleteTeam = async (id) => {
    if (window.confirm("Are you sure you want to delete this team?")) {
      try {
        await axios.delete(`/team/delete/${id}`);
        setTeams(teams.filter((t) => t.id !== id));
      } catch (error) {
        console.error("Error deleting team:", error);
      }
    }
  };

  // Add this function to reset form values
  const resetForm = () => {
    setTeamName("");
    setTeamDescription("");
    setSelectedStaff([]);
    setTeamLeader("");
    setErrors({});
    setEditingTeamId(null);
    setOriginalTeamData(null);
  };

  // When closing modal, reset everything
  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const filteredStaffs = staffs.filter(
    (s) =>
      s.name?.toLowerCase().includes(staffSearch.toLowerCase()) ||
      s.email?.toLowerCase().includes(staffSearch.toLowerCase())
  );
  const filteredTeams = teams?.filter((t) =>
    t.name?.toLowerCase().includes(teamSearch.toLowerCase())
  );


  const handleTeamViewHistory = async (selectedTeam) => {
    try {
      if(selectedTeam){
        const response = await axios.post('/team/history/post',{
          selectedTeam
        })
        if(response){
          console.log(response)
          navigate(`/team/work/port${selectedTeam.id}`)
        }
      }
    } catch (error) {
      console.log('error found in team history',error)
    }
  };


  return (
    <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto"
>
      {/* Teams Section */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Teams</h2>
          {/* Mobile button for modal */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="md:hidden bg-blue-600 text-white px-3 py-1 rounded-lg text-sm"
          >
            Create Team
          </button>
        </div>

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
              <div key={team.id} className="border rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-blue-600">
                    {team.name}{" "}
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                      {team.members.length} members
                    </span>
                  </h3>
                  <div className="space-x-2">
                    <button
                      onClick={() => handleTeamViewHistory(team)}
                      className="text-sm px-2 py-1 rounded border border-gray-400 text-gray-700 hover:underline"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleEditTeam(team)}
                      className="text-sm px-2 py-1 rounded border border-gray-400 text-gray-700 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTeam(team.id)}
                      className="text-sm px-2 py-1 rounded border border-gray-400 text-gray-700 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {team.description && (
                  <p className="text-sm text-gray-600 mt-1">
                    {team.description}
                  </p>
                )}
                {team.leader && (
                  <p className="text-sm text-blue-700 mt-1">
                    Leader: {staffs.find((s) => s.id === team.leader)?.name}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  {team.members.map((m) => (
                    <span
                      key={m.id}
                      className="px-3 py-1 bg-gray-200 rounded-full text-sm"
                    >
                      {m.name} ({m.email})
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Desktop: Create/Edit Form */}
      <div className="hidden md:block bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          {editingTeamId ? "Edit Team" : "Create a New Team"}
        </h2>
        {/* reuse the form */}
        <TeamForm
          teamName={teamName}
          setTeamName={setTeamName}
          errors={errors}
          setErrors={setErrors}
          teamDescription={teamDescription}
          setTeamDescription={setTeamDescription}
          selectedStaff={selectedStaff}
          teamLeader={teamLeader}
          setTeamLeader={setTeamLeader}
          staffs={staffs}
          staffSearch={staffSearch}
          setStaffSearch={setStaffSearch}
          filteredStaffs={filteredStaffs}
          toggleSelect={toggleSelect}
          handleCreateOrUpdateTeam={handleCreateOrUpdateTeam}
          editingTeamId={editingTeamId}
        />
      </div>

      {/* Modal for Mobile */}
      {isModalOpen && (
        <div className="fixed inset-0 backdrop-blur-[1px] bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-11/12 max-h-[90vh] overflow-y-auto p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
              onClick={handleCloseModal}
            >
              ✖
            </button>
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              {editingTeamId ? "Edit Team" : "Create a New Team"}
            </h2>
            <TeamForm
              teamName={teamName}
              setTeamName={setTeamName}
              errors={errors}
              setErrors={setErrors}
              teamDescription={teamDescription}
              setTeamDescription={setTeamDescription}
              selectedStaff={selectedStaff}
              teamLeader={teamLeader}
              setTeamLeader={setTeamLeader}
              staffs={staffs}
              staffSearch={staffSearch}
              setStaffSearch={setStaffSearch}
              filteredStaffs={filteredStaffs}
              toggleSelect={toggleSelect}
              handleCreateOrUpdateTeam={handleCreateOrUpdateTeam}
              editingTeamId={editingTeamId}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// extracted form to reuse in modal + desktop
function TeamForm({
  teamName,
  setTeamName,
  errors,
  setErrors,
  teamDescription,
  setTeamDescription,
  selectedStaff,
  teamLeader,
  setTeamLeader,
  staffs,
  staffSearch,
  setStaffSearch,
  filteredStaffs,
  toggleSelect,
  handleCreateOrUpdateTeam,
  editingTeamId,
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Left: Team Form */}
      <div>
        <input
          type="text"
          placeholder="Enter team name"
          className="w-full border rounded-lg px-4 py-2 mb-1"
          value={teamName}
          onChange={(e) => {
            setTeamName(e.target.value);
            if (errors.teamName) {
              setErrors((prev) => ({ ...prev, teamName: "" }));
            }
          }}
        />
        {errors.teamName && (
          <p className="text-red-500 text-sm mb-2">{errors.teamName}</p>
        )}

        <textarea
          placeholder="Enter team description..."
          className="w-full border rounded-lg px-4 py-2 mb-3 h-32 resize-none"
          value={teamDescription}
          onChange={(e) => setTeamDescription(e.target.value)}
        />

        {selectedStaff.length > 0 && (
          <div className="my-3">
            <label className="text-sm text-gray-700">Select Team Leader:</label>
            <select
              value={teamLeader ?? ""}
              onChange={(e) => setTeamLeader(Number(e.target.value))}
              className="w-full border rounded-lg px-3 py-2 mt-1"
            >
              <option value="">-- Select Leader --</option>
              {staffs
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

      {/* Right: Staff Search + List */}
      <div>
        <input
          type="text"
          placeholder="Search staff..."
          className="w-full border rounded-lg px-3 py-2 mb-1"
          value={staffSearch}
          onChange={(e) => setStaffSearch(e.target.value)}
        />
        {errors.staff && (
          <p className="text-red-500 text-sm mb-2">{errors.staff}</p>
        )}

        <div className="max-h-[500px] overflow-y-auto border rounded-lg p-3">
          {filteredStaffs.map((staff) => (
            <label
              key={staff.id}
              className="flex items-center justify-between p-2 border-b cursor-pointer hover:bg-gray-50"
            >
              <div>
                <p className="font-medium text-gray-800">{staff.name}</p>
                <p className="text-sm text-gray-500">{staff.email}</p>
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
      </div>
    </div>
  );
}

export default CreateTeam;
