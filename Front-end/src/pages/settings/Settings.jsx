import React, { useEffect, useState } from "react";
import axios from "../../instance/Axios";
import CompanyForm from "../../components/modals/CompanyModal";
import { AnimatePresence, motion } from "framer-motion";

const getStatusClasses = (status) => {
  switch (status) {
    case "Active":
      return "bg-green-100 text-green-700 ring-green-500/10";
    case "On Leave":
      return "bg-amber-100 text-amber-700 ring-amber-500/10";
    default:
      return "bg-gray-100 text-gray-700 ring-gray-500/10";
  }
};

const Settings = () => {
  const [showModal, setShowModal] = useState(false);
  const [company, setCompany] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [staff, setStaff] = useState([]);

  const getDetails = async () => {
    try {
      const res = await axios.get("/company/get");
      console.log("API response:", res.data);

      const apiCompany = res.data?.data?.companyDetails;
      const apiAdmins = res.data?.data?.adminDetails || [];
      const apiStaff = res.data?.data?.staffDetails || [];

      // Smart fallback: if companyName is missing/empty/null, use fake company
      const companyData =
        apiCompany?.companyName && apiCompany.companyName.trim() !== ""
          ? {
              name: apiCompany.companyName,
              email: apiCompany.email || "",
              phone: apiCompany.phoneNumber || "",
            }
          : {
              name: "Evotechs.in",
              email: "evo@gmail.com",
              phone: "+1 555-1234",
            };

      setCompany(companyData);

      // Use API data if exists, else fake data
      setAdmins(
        apiAdmins.length
          ? apiAdmins.map((a, idx) => ({
              id: idx,
              name: a.name,
              role: "Admin",
            }))
          : [
              { id: 1, name: "Alice Johnson", role: "CEO" },
              { id: 2, name: "Bob Smith", role: "CTO" },
              { id: 3, name: "Eve Rivas", role: "CFO" },
            ]
      );

      setStaff(
        apiStaff.length
          ? apiStaff.map((s, idx) => ({
              id: idx,
              name: s.name,
              department:
                s.teams && s.teams.length > 0 ? s.teams.join(", ") : "General", // ✅ show team names
              status: "Active",
            }))
          : [
              {
                id: 101,
                name: "Charlie Brown",
                department: "Marketing",
                status: "Active",
              },
              {
                id: 102,
                name: "Diana Prince",
                department: "Development",
                status: "Active",
              },
              {
                id: 103,
                name: "Clark Kent",
                department: "Sales",
                status: "On Leave",
              },
              {
                id: 104,
                name: "Bruce Wayne",
                department: "Design",
                status: "Active",
              },
            ]
      );
    } catch (error) {
      console.log("Error fetching company details:", error);
      // fallback to fake data
      setCompany({
        name: "Evotechs.in",
        email: "evo@gmail.com",
        phone: "+1 555-1234",
      });
      setAdmins([
        { id: 1, name: "Alice Johnson", role: "CEO" },
        { id: 2, name: "Bob Smith", role: "CTO" },
        { id: 3, name: "Eve Rivas", role: "CFO" },
      ]);
      setStaff([
        {
          id: 101,
          name: "Charlie Brown",
          department: "Marketing",
          status: "Active",
        },
        {
          id: 102,
          name: "Diana Prince",
          department: "Development",
          status: "Active",
        },
        {
          id: 103,
          name: "Clark Kent",
          department: "Sales",
          status: "On Leave",
        },
        {
          id: 104,
          name: "Bruce Wayne",
          department: "Design",
          status: "Active",
        },
      ]);
    }
  };

  useEffect(() => {
    getDetails();
  }, []);

  if (!company) return <p>Loading...</p>;

  return (
    <div className="bg-gray-50 font-sans antialiased text-gray-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
        {/* -------------------- Left Column -------------------- */}
        <aside className="w-full lg:w-80 flex-shrink-0 space-y-6">
          {/* Company Card */}
          <div className="bg-white shadow-md rounded-xl p-5 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center border-b pb-3 text-blue-600">
              Company Profile
            </h2>
            <div className="space-y-3 pt-1">
              <p className="text-lg font-bold text-gray-900">{company.name}</p>
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  <span className="font-medium text-gray-800">Email:</span>{" "}
                  {company.email}
                </p>
                <p>
                  <span className="font-medium text-gray-800">Phone:</span>{" "}
                  {company.phoneNumber}
                </p>
                <p>
                  <span className="font-medium text-gray-800">
                    Alternate Phone:
                  </span>{" "}
                  {company.alternatePhone}
                </p>
                <p>
                  <span className="font-medium text-gray-800">GST Number:</span>{" "}
                  {company.gstNumber}
                </p>
                <p>
                  <span className="font-medium text-gray-800">Pan number:</span>{" "}
                  {company.panNumber}
                </p>
                <p>
                  <span className="font-medium text-gray-800">Address:</span>{" "}
                  {company.address}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 w-full px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition duration-150 shadow-md"
            >
              Edit Details
            </button>
          </div>

          {/* Admin List */}
          <div className="bg-white shadow-md rounded-xl p-5 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center border-b pb-3 text-red-600">
              Administrators ({admins.length})
            </h2>
            <div className="space-y-2 pt-1">
              {admins.map((admin) => (
                <div
                  key={admin.id}
                  className="flex items-center p-2 rounded-lg transition duration-200 hover:bg-gray-100 cursor-pointer"
                >
                  <div className="w-10 h-10 bg-red-400 rounded-full flex items-center justify-center text-base font-bold text-white flex-shrink-0 shadow-sm ring-2 ring-red-200">
                    {admin.name.charAt(0)}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {admin.name}
                    </p>
                    <p className="text-xs text-red-500 font-medium">
                      {admin.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* -------------------- Right Column -------------------- */}
        <main className="flex-grow min-w-0">
          <div className="bg-white shadow-md rounded-xl border border-gray-100 overflow-hidden">
            <div className="p-4 flex flex-col sm:flex-row justify-between items-center border-b border-gray-100 space-y-3 sm:space-y-0">
              <h2 className="text-xl font-bold text-gray-800">
                All Employees ({staff.length})
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-white border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {staff.map((member) => (
                    <tr
                      key={member.id}
                      className="hover:bg-gray-50 transition duration-150"
                    >
                      <td className="px-6 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {member.name}
                        </div>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {member.department}
                        </div>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                            member.status
                          )}`}
                        >
                          {member.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Company Form Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-xl w-full max-w-4xl p-6 relative"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
              >
                ✕
              </button>
              <CompanyForm />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Settings;
