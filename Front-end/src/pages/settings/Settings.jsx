import React, { useEffect, useState } from "react";
import axios from "../../instance/Axios";
import CompanyForm from "../../components/modals/CompanyModal";
import ImageUploadModal from "../../components/modals/CompanyImageUpload";
import { AnimatePresence, motion } from "framer-motion";
import { useSidebar } from "../../components/SidebarContext";


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
    // Renamed for clarity and added a new state for the image modal
    const [showCompanyModal, setShowCompanyModal] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [companyFullDetails, setCompanyFullDetails] = useState();
    const [companyImage, setCompanyImage] = useState();
    const [refresh, setRefresh] = useState(false);

    const [company, setCompany] = useState(null);
    const [admins, setAdmins] = useState([]);
    const [staff, setStaff] = useState([]);
    const [profileImageUrl, setProfileImageUrl] = useState(null); // State for image URL
    const { triggerSidebarRefresh } = useSidebar();


    const getDetails = async () => {
        try {
            const res = await axios.get("/company/get");

            const apiCompany = res.data?.data?.companyDetails;
            const apiAdmins = res.data?.data?.adminDetails || [];
            const apiStaff = res.data?.data?.staffDetails || [];
            setCompanyImage(res.data?.data?.companyImage);

            setCompanyFullDetails(apiCompany);


            // Smart fallback: if companyName is missing/empty/null, use fake company
            const companyData =
                apiCompany?.companyName && apiCompany.companyName.trim() !== ""
                    ? {
                        name: apiCompany.companyName,
                        email: apiCompany.email || "",
                        phone: apiCompany.phoneNumber || "",
                        alternatePhone: apiCompany.alternatePhone || "",
                        gstNumber: apiCompany.gstNumber || "",
                        panNumber: apiCompany.panNumber || "",
                        address: apiCompany.address || "",
                    }
                    : {
                        name: "Evotechs.in",
                        email: "evo@gmail.com",
                        phone: "+1 555-1234",
                        alternatePhone: "N/A",
                        gstNumber: "N/A",
                        panNumber: "N/A",
                        address: "123 Tech Park, Silicon Valley, CA",
                    };

            setCompany(companyData);

            // Setting profile image URL from companyImage state/API response
            // We will use this one state for display to ensure immediate update
            if (res.data?.data?.companyImage?.imagePath) {
                setProfileImageUrl(`${import.meta.env.VITE_BACKEND_URL}/images/${res.data.data.companyImage.imagePath}`);
            } else {
                setProfileImageUrl(null);
            }

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
                            s.teams && s.teams.length > 0 ? s.teams.join(", ") : "General",
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
                alternatePhone: "N/A",
                gstNumber: "N/A",
                panNumber: "N/A",
                address: "123 Tech Park, Silicon Valley, CA",
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
            setProfileImageUrl(null); // Fallback image URL
        }
    };

    // Function to update state after a successful image upload
    const handleImageSave = (newImageUrl) => {
        setProfileImageUrl(newImageUrl); // Update the main display image immediately
        setShowImageModal(false); // Close the modal
        setRefresh(prev => !prev); // Trigger refresh to fetch other company details if needed
        triggerSidebarRefresh();

    };

    useEffect(() => {
        getDetails();
        triggerSidebarRefresh();
    }, [refresh]);

    const imageFileName = profileImageUrl ? profileImageUrl.split('/').pop() : "";

    if (!company) return <p>Loading...</p>;

    return (
        <div className="bg-gray-50 font-sans antialiased text-gray-800 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
                {/* -------------------- Left Column -------------------- */}
                <aside className="w-full lg:w-80 flex-shrink-0 space-y-6">
                    {/* Company Card */}
                    <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100 max-w-sm mx-auto">
                        <h2 className="text-2xl font-extrabold text-gray-900 mb-5 flex items-center border-b pb-4">
                            Company Profile
                        </h2>
                        <div className="flex flex-col items-center text-center space-y-5 pt-1">
                            {/* Profile Image Circle - Clickable area */}
                            <div
                                className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-4 border-white shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition duration-200 group relative"
                                onClick={() => setShowImageModal(true)} // ✅ Opens the image upload modal
                            >

                                {profileImageUrl ? (
                                    <img src={profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"></path></svg>
                                )}
                                {/* Edit overlay on hover */}
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition duration-200">
                                    Upload
                                </div>
                            </div>

                            {imageFileName && (
                                <p className="text-[10px] text-gray-400 truncate w-full px-2" title={imageFileName}>
                                    {imageFileName}
                                </p>
                            )}

                            {/* Company Name */}
                            <p className="text-xl font-extrabold text-gray-900">
                                {company.name}
                            </p>

                            {/* Contact and Details */}
                            <div className="text-sm text-left w-full space-y-2 pt-2">
                                <p className="flex justify-between items-center border-b pb-1">
                                    <span className="font-semibold text-gray-700">Email:</span>
                                    <span className="text-gray-600 truncate ml-4">
                                        {company.email}
                                    </span>
                                </p>
                                <p className="flex justify-between items-center border-b pb-1">
                                    <span className="font-semibold text-gray-700">Phone:</span>
                                    <span className="text-gray-600">{company.phone}</span>{" "}
                                    {/* Used 'phone' from state */}
                                </p>
                                <p className="flex justify-between items-center border-b pb-1">
                                    <span className="font-semibold text-gray-700">
                                        Alternate Phone:
                                    </span>
                                    <span className="text-gray-600">
                                        {company.alternatePhone}
                                    </span>
                                </p>
                                <p className="flex justify-between items-center border-b pb-1">
                                    <span className="font-semibold text-gray-700">
                                        GST Number:
                                    </span>
                                    <span className="text-gray-600">{company.gstNumber}</span>
                                </p>
                                <p className="flex justify-between items-center border-b pb-1">
                                    <span className="font-semibold text-gray-700">
                                        Pan number:
                                    </span>
                                    <span className="text-gray-600">{company.panNumber}</span>
                                </p>
                                <p className="pt-2">
                                    <span className="font-semibold text-gray-700 block mb-1">
                                        Address:
                                    </span>
                                    <span className="text-gray-600 block leading-relaxed">
                                        {company.address}
                                    </span>
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowCompanyModal(true)} // Renamed state to showCompanyModal
                            className="mt-4 w-full px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition duration-150 shadow-md"
                        >
                            Update Details
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

            {/* Company Form Modal (using showCompanyModal) */}
            <AnimatePresence>
                {showCompanyModal && (
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
                                onClick={() => setShowCompanyModal(false)}
                                className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
                            >
                                ✕
                            </button>
                            <CompanyForm
                                companyDetails={companyFullDetails}
                                setRefresh={setRefresh}
                                refresh={refresh}
                                setShowCompanyModal={setShowCompanyModal}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* -------------------- NEW: Image Upload Modal -------------------- */}
            <AnimatePresence>
                {showImageModal && ( // ✅ New Modal Trigger
                    <motion.div
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                        >
                            <button
                                onClick={() => setShowImageModal(false)}
                                className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
                            >
                                ✕
                            </button>
                            <ImageUploadModal
                                currentImageUrl={profileImageUrl}
                                onSave={handleImageSave} // Passes the function to update the URL
                                onClose={() => setShowImageModal(false)} // Passes the function to close
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Settings;