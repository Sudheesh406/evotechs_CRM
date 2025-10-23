import { useNavigate } from "react-router-dom";
import axios from "../../../instance/Axios";
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

function CreateTeam() {
  const navigate = useNavigate();
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
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        MySwal.fire({
          icon: "error",
          title: "Failed to fetch teams",
          text: error.response?.data?.message || error.message,
        });
        console.error(error);
      }
    };

    const fetchStaffs = async () => {
      try {
        const { data } = await axios.get("/team/staff/get");
        setStaffs(data.data?.staffList || []);
      } catch (error) {
        MySwal.fire({
          icon: "error",
          title: "Failed to fetch staff",
          text: error.response?.data?.message || error.message,
        });
        console.error(error);
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
      MySwal.fire({
        title: editingTeamId ? "Updating team..." : "Creating team...",
        didOpen: () => MySwal.showLoading(),
        allowOutsideClick: false,
      });

      if (editingTeamId) {
        const hasChanged =
          teamName !== originalTeamData.name ||
          teamDescription !== originalTeamData.description ||
          teamLeader !== originalTeamData.leader ||
          selectedStaff.sort().join(",") !==
            originalTeamData.members.sort().join(",");

        if (!hasChanged) {
          MySwal.close();
          MySwal.fire({
            icon: "info",
            title: "No changes detected",
          });
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
        MySwal.fire({
          icon: "success",
          title: "Team updated successfully!",
        });
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
        MySwal.fire({
          icon: "success",
          title: "Team created successfully!",
        });
      }

      resetForm();
      setIsModalOpen(false);
    } catch (error) {
      MySwal.fire({
        icon: "error",
        title: "Something went wrong",
        text: error.response?.data?.message || error.message,
      });
      console.error(error);
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
    setIsModalOpen(true);
  };

const handleDeleteTeam = async (id) => {
  const result = await MySwal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
  });

  if (result.isConfirmed) {
    try {
      // Show loading
      MySwal.fire({
        title: "Deleting team...",
        didOpen: () => MySwal.showLoading(),
        allowOutsideClick: false,
        showConfirmButton: false, // optional
      });

      // Perform delete
      await axios.delete(`/team/delete/${id}`);
      setTeams((prev) => prev.filter((t) => t.id !== id));

      // Close loading modal first
      MySwal.close();

      // Show success
      MySwal.fire({
        icon: "success",
        title: "Team deleted successfully!",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      MySwal.close(); // make sure loading is closed if error occurs
      MySwal.fire({
        icon: "error",
        title: "Failed to delete team",
        text: error.response?.data?.message || error.message,
      });
      console.error(error);
    }
  }
};


  const resetForm = () => {
    setTeamName("");
    setTeamDescription("");
    setSelectedStaff([]);
    setTeamLeader("");
    setErrors({});
    setEditingTeamId(null);
    setOriginalTeamData(null);
  };

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
      if (selectedTeam) {
        MySwal.fire({
          title: "Loading history...",
          didOpen: () => MySwal.showLoading(),
          allowOutsideClick: false,
        });

        const response = await axios.post("/team/history/post", {
          selectedTeam,
        });

        MySwal.close();
        if (response) navigate(`/team/work/port${selectedTeam.id}`);
      }
    } catch (error) {
      MySwal.fire({
        icon: "error",
        title: "Failed to load history",
        text: error.response?.data?.message || error.message,
      });
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Teams */}
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl font-bold text-gray-800"><span className="text-indigo-600">Teams</span></h2>
          
          <button
            onClick={() => setIsModalOpen(true)}
            className="md:hidden bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:from-blue-600 hover:to-indigo-700 transition"
          >
            + Create Team
          </button>
        </div>

        <input
          type="text"
          placeholder="Search teams..."
          className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={teamSearch}
          onChange={(e) => setTeamSearch(e.target.value)}
        />

        {filteredTeams.length === 0 ? (
          <p className="text-gray-500">No teams found.</p>
        ) : (
          filteredTeams.map((team) => (
            <div
              key={team.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition p-4 flex flex-col gap-2"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-blue-600">
                    {team.name}
                  </h3>
                  {team.description && (
                    <p className="text-gray-600 text-sm mt-1">
                      {team.description}
                    </p>
                  )}
                  {team.leader && (
                    <p className="text-sm text-indigo-700 mt-1">
                      Leader: {staffs.find((s) => s.id === team.leader)?.name}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => handleTeamViewHistory(team)}
                    className="text-sm px-2 py-1 rounded border border-gray-300 hover:bg-gray-50"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleEditTeam(team)}
                    className="text-sm px-2 py-1 rounded border border-gray-300 hover:bg-gray-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTeam(team.id)}
                    className="text-sm px-2 py-1 rounded border border-gray-300 hover:bg-red-50 text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {team.members.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full text-sm"
                  >
                    <span className="w-6 h-6 flex items-center justify-center bg-blue-400 text-white rounded-full">
                      {m.name?.[0]}
                    </span>
                    <span>{m.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Form */}
      <div className="hidden md:block bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          {editingTeamId ? "Edit Team" : "Create New Team"}
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

      {/* Mobile Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-opacity-30 flex items-center justify-center z-50 backdrop-blur-[1px]">
          <div className="bg-white rounded-xl shadow-xl max-h-[90vh] overflow-y-auto p-6 relative animate-fadeIn">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-lg"
              onClick={handleCloseModal}
            >
              ✖
            </button>
            <h2 className="text-2xl font-bold mb-4">
              {editingTeamId ? "Edit Team" : "Create New Team"}
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
    <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
      <div>
        <input
          type="text"
          placeholder="Team name"
          className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={teamName}
          onChange={(e) => {
            setTeamName(e.target.value);
            if (errors.teamName)
              setErrors((prev) => ({ ...prev, teamName: "" }));
          }}
        />
        {errors.teamName && (
          <p className="text-red-500 text-sm mb-2">{errors.teamName}</p>
        )}

        <textarea
          placeholder="Team description..."
          className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-3 h-28 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={teamDescription}
          onChange={(e) => setTeamDescription(e.target.value)}
        />

        {selectedStaff.length > 0 && (
          <div className="mb-3">
            <label className="text-sm text-gray-700">Team Leader</label>
            <select
              value={teamLeader ?? ""}
              onChange={(e) => setTeamLeader(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-400"
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
          className="w-full bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-semibold py-2 rounded-lg hover:from-indigo-600 hover:to-blue-700 transition"
        >
          {editingTeamId ? "Update Team" : "Create Team"}
        </button>
      </div>

      <div>
        <input
          type="text"
          placeholder="Search staff..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={staffSearch}
          onChange={(e) => setStaffSearch(e.target.value)}
        />
        {errors.staff && (
          <p className="text-red-500 text-sm mb-2">{errors.staff}</p>
        )}

        <div className="max-h-[450px] overflow-y-auto border border-gray-200 rounded-lg p-2 space-y-1">
          {filteredStaffs.map((staff) => (
            <label
              key={staff.id}
              className="flex items-center justify-between p-2 rounded hover:bg-indigo-50 cursor-pointer"
            >
              <div>
                <p className="font-medium text-gray-800">{staff.name}</p>
                <p className="text-sm text-gray-500">{staff.email}</p>
              </div>
              <input
                type="checkbox"
                checked={selectedStaff.includes(staff.id)}
                onChange={() => toggleSelect(staff.id)}
                className="w-5 h-5 text-indigo-600 accent-indigo-600"
              />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CreateTeam;
