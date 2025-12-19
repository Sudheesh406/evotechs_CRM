import React, { useEffect, useState } from "react";
import axios from "../instance/Axios";
import { NavLink, useNavigate } from "react-router-dom";
import DefaultLog from "../assets/images/logo1.png";
import {
  Home,
  ClipboardList,
  Briefcase,
  UserPlus,
  Users,
  Shield,
  Hourglass,
  RotateCcw,
  Calendar,
  Phone,
  Boxes,
  CheckSquare,
  MessageSquare,
  FolderKanban,
  Trash2,
  Building,
  Eye,
  Lock,
  Settings,
  LogOut,
  Trash,
  Globe,
  ChevronRight,
  XCircle,
  CircleSlash,
  Receipt,
  Banknote,
  Wallet,
  ReceiptText,
  UserMinus,
  Loader, // For a cleaner loading icon
} from "lucide-react";


import { useSidebar } from "./SidebarContext";
// --- Define the new color theme variables ---
const PRIMARY_BLUE = "#0077D8"; // A vibrant, professional blue
const LIGHT_BG = "#F9FAFB"; // Very light grey/off-white background
const DARK_TEXT = "#1F2937"; // Dark grey for main text
const ACCENT_BG = "#E0F2FF"; // Light blue for hover/submenu active background

const Sidebar = ({ closeSidebar }) => {
  const [openMenus, setOpenMenus] = useState({});
  const [menuItems, setMenuItems] = useState();
  const [company, setCompany] = useState("company");
  const [companyImage, setCompanyImage] = useState();
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState(false);
  const navigate = useNavigate();
    const { refreshSignal } = useSidebar();


  const toggleMenu = (index) => {
    setOpenMenus((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const id = 0;
    const { profileUpdated } = useSidebar();


  // --- Menu Data (Unchanged from previous version, just ensuring it's available) ---
  const staffItems = [
    { title: "Home", icon: Home, path: "/" },
    {
      title: "Sales",
      icon: Briefcase,
      subMenu: [
        { title: "Leads", path: "/operations/leads", icon: UserPlus },
        { title: "Highlights", path: "/operations/deals", icon: ClipboardList },
        { title: "Client", path: "/sales/completed", icon: CheckSquare },
        { title: "Pending", path: "/sales/pendings", icon: Hourglass },
        { title: "Not A Client", path: "/sales/rejected", icon: Trash },
      ],
    },
    {
      title: "Operations",
      icon: ClipboardList,
      subMenu: [
        { title: "Contacts", path: "/operations/contacts", icon: Users },
        { title: "Check list", path: "/operations/personalize", icon: Shield },
        { title: "Pending", path: "/operations/pendings", icon: Hourglass },
        { title: "Rework", path: "/operations/reworks", icon: RotateCcw },
        {
          title: "Completed",
          path: "/operations/staff/completed/task",
          icon: CheckSquare,
        },
      ],
    },
    {
      title: "Activities",
      icon: Calendar,
      subMenu: [
        { title: "Tasks", path: "/activities/tasks", icon: ClipboardList },
        { title: "Meetings", path: "/activities/meetings", icon: Calendar },
        { title: "Calls", path: "/activities/calls", icon: Phone },
        {
          title: "Subtask Removed",
          path: "/activities/tasks/subtask/removed",
          icon: CheckSquare,
        },
      ],
    },
    {
      title: "Rejections",
      icon: XCircle,
      subMenu: [
        {
          title: "Disapproved",
          path: "/rejections/disapproved",
          icon: XCircle,
        },
      ],
    },
    {
      title: "Team",
      icon: Boxes,
      subMenu: [
        { title: "Info", path: "/team/profile", icon: Users },
        { title: "Projects", path: `/team/work/${id}`, icon: FolderKanban },
        { title: "Leads", path: "/team/leads", icon: UserPlus },
        { title: "Contacts", path: "/team/contacts", icon: Phone },
      ],
    },
    {
      title: "Workspace",
      icon: Building,
      subMenu: [
        {
          title: "Attendance",
          path: "/workspace/attendance",
          icon: CheckSquare,
        },
        { title: "Calendar", path: "/workspace/calendar", icon: Calendar },
        { title: "Messages", path: "/workspace/messages", icon: MessageSquare },
        {
          title: "Work Log",
          path: "/workspace/work/assign",
          icon: FolderKanban,
        },
        // { title: "Employee Absence", path: "/workspace/employee-absence", icon: UserMinus },
      ],
    },
    {
      title: "Accounts",
      icon: ReceiptText,
      subMenu: [
        {
          title: "Day Book",
          path: "/accounts/day-book",
          icon: Receipt,
        },
        {
          title: "Income Sheet",
          path: "/accounts/income-sheet",
          icon: Wallet,
        },
      ],
    },
    { title: "Trash", icon: Trash2, path: "/trash" },
  ];

  const adminItems = [
    { title: "Home", icon: Home, path: "/admin" },
    {
      title: "Evo Sales",
      icon: Globe,
      subMenu: [
        { title: "Leads", path: "/global/leads", icon: UserPlus },
        {
          title: "Client",
          path: "/global/completed/leads",
          icon: CheckSquare,
        },
        { title: "Pending", path: "/global/pending/leads", icon: Hourglass },
        { title: "Not A Client", path: "/global/rejected/leads", icon: Trash },
        { title: "Contacts", path: "/global/contacts", icon: Users },
      ],
    },
    {
      title: "My Sales",
      icon: Briefcase,
      subMenu: [
        { title: "Leads", path: "/operations/leads", icon: UserPlus },
        { title: "Client", path: "/sales/completed", icon: CheckSquare },
        {
          title: "Pending",
          path: "/sales/pendings",
          icon: Hourglass,
        },
        { title: "Not A Client", path: "/sales/rejected", icon: Trash },
        { title: "Contacts", path: "/operations/contacts", icon: Users },
      ],
    },
    {
      title: "Operations",
      icon: ClipboardList,
      subMenu: [
        { title: "Highlights", path: "/operations/deals", icon: Briefcase },
        { title: "Assignment", path: "/workspace/todo", icon: ClipboardList },
        { title: "Tasks", path: "/activities/task/port", icon: ClipboardList },

        { title: "Pending", path: "/operations/pending/task", icon: Hourglass },
        {
          title: "Completed",
          path: "/operations/completed",
          icon: CheckSquare,
        },
        { title: "Resolved", path: "/operations/resolved", icon: Eye },
        { title: "Rework", path: "/operations/rework/port", icon: RotateCcw },
      ],
    },
    {
      title: "Activities",
      icon: Calendar,
      subMenu: [
        {
          title: "My Task",
          path: "/activities/task/self",
          icon: CheckSquare,
        },
        { title: "Check list", path: "/operations/personalize", icon: Shield },

        {
          title: "Subtask Removed",
          path: "/activities/tasks/subtask/removed",
          icon: CheckSquare,
        },
      ],
    },
    {
      title: "Rejections",
      icon: XCircle,
      subMenu: [
        {
          title: "Disapproved",
          path: "/admin/rejections/disapproved",
          icon: XCircle,
        },
      ],
    },
    {
      title: "Team",
      icon: Boxes,
      subMenu: [
        { title: "Customise", path: "/team/customise", icon: Settings },
        { title: "Projects", path: `/team/work/${id}`, icon: FolderKanban },
      ],
    },
    {
      title: "Workspace",
      icon: Building,
      subMenu: [
        {
          title: "Attendance",
          path: "/workspace/attendance/view",
          icon: CheckSquare,
        },
        {
          title: "Calendar",
          path: "/workspace/calendar/customise",
          icon: Calendar,
        },
        { title: "Messages", path: "/workspace/messages", icon: MessageSquare },
        {
          title: "Forgot Password",
          path: "/workspace/auth/pin/generator",
          icon: Lock,
        },
        {
          title: "Work Log",
          path: "/workspace/AdminWorklog",
          icon: FolderKanban,
        },
        {
          title: "Work Log Detail",
          path: "/workspace/work/staff/assign",
          icon: FolderKanban,
        },
        {
          title: "Employee Absence",
          path: "/workspace/employee-absence",
          icon: UserMinus,
        },
        {
          title: "Staff pipeline",
          path: "/workspace/home/pipeline",
          icon: UserMinus,
        },
      ],
    },
    {
      title: "Accounts",
      icon: ReceiptText,
      subMenu: [
        {
          title: "Day Book",
          path: "/accounts/day-book",
          icon: Receipt,
        },
        {
          title: "Income Sheet",
          path: "/accounts/income-sheet",
          icon: Wallet,
        },
      ],
    },
    { title: "Trash", icon: Trash2, path: "/trash" },
    { title: "Settings", path: "/settings", icon: Settings },
  ];
  // --- End of Menu Data ---

  useEffect(() => {
    async function initRole() {
      try {
        let acess = null;
        const { data } = await axios.get("/auth/role");

        setCompany(data?.data?.company);
        setCompanyImage(data?.data?.companyImage);

        if (data?.data?.role) {
          acess = data.data.role;
        }

        if (data?.data?.value) {
          setView(true);
        }

        setLoading(false);

        // Assign menu items
        if (acess === "admin") {
          setMenuItems(adminItems);
        } else {
          // Staff logic
          let updated = staffItems;

          // If staff does NOT have "view" permission → remove Accounts
          if (!data?.data?.value) {
            updated = staffItems.filter((item) => item.title !== "Accounts");
          }

          setMenuItems(updated);
        }
      } catch (err) {
        console.error("Error initializing role:", err);
      }
    }

    initRole();
  }, [refreshSignal]);

  const handleLogout = async () => {
    try {
      const response = await axios.patch("/auth/logout");
      if (response) {
        navigate("/login");
      }
    } catch (error) {
      console.log("error found in logout", error);
    }
  };

  if (loading) {
    // Elegant loading state with new color
    return (
      <div
        className="flex items-center justify-center h-screen w-64"
        style={{ backgroundColor: LIGHT_BG }}
      >
        <Loader
          className="animate-spin h-6 w-6"
          style={{ color: PRIMARY_BLUE }}
        />
      </div>
    );
  }

  return (
    <div
      className="flex flex-col justify-between h-screen w-64 shadow-2xl transition-all duration-300"
      style={{ backgroundColor: LIGHT_BG, color: DARK_TEXT }}
    >
      {/* Top + Menu Scrollable */}
      <div className="flex flex-col overflow-y-auto flex-1 custom-scrollbar">
        {/* Logo */}
        <div className="pt-6 pb-6 pl-3 border-b border-gray-200 bg-white sticky top-0 z-20 flex items-center gap-4">
          {/* Company Logo */}
          <div
            className="w-24 h-24 rounded-full border-2 flex items-center justify-center overflow-hidden shadow-sm"
            style={{ borderColor: PRIMARY_BLUE }}
          >
            <img
              src={
                companyImage?.imagePath
                  ? `${import.meta.env.VITE_BACKEND_URL}/images/${
                      companyImage.imagePath
                    }`
                  : DefaultLog
              }
              alt="Company Logo"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Company Info */}
          <div>
            <h1
              className="text-lg font-black tracking-widest leading-none"
              style={{ color: PRIMARY_BLUE }}
            >
              {company?.companyName || "Company Name"}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Customer Relationship Management
            </p>
          </div>
        </div>

        {/* Menu */}
        <div className="flex flex-col overflow-y-auto flex-1 custom-scrollbar">
          <nav className="space-y-1.5 p-4">
            {menuItems?.map((item, i) => {
              const Icon = item.icon;
              const hasSubMenu = !!item.subMenu;

              const baseClass = `flex items-center gap-3 px-4 py-3 rounded-lg font-medium tracking-wide transition-all duration-300`;
              const activeClass = ` text-white shadow-lg shadow-blue-500/50`;
              const inactiveHoverClass = ` hover:bg-gray-100 hover:text-gray-800`;
              const subMenuActiveClass = ` font-semibold`;
              const subMenuInactiveHoverClass = ` hover:bg-gray-100`;

              if (!hasSubMenu) {
                return (
                  <NavLink
                    key={i}
                    to={item.path}
                    onClick={closeSidebar}
                    className={({ isActive }) =>
                      `${baseClass} ${
                        isActive ? activeClass : inactiveHoverClass
                      }`
                    }
                    style={({ isActive }) => ({
                      backgroundColor: isActive ? PRIMARY_BLUE : "transparent",
                      color: isActive ? "white" : DARK_TEXT,
                    })}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span>{item.title}</span>
                  </NavLink>
                );
              }

              // Menu with Sub-menu
              return (
                <div key={i}>
                  <div
                    onClick={() => toggleMenu(i)}
                    className={`${baseClass} cursor-pointer 
                    ${openMenus[i] ? "bg-gray-100" : inactiveHoverClass}`}
                    style={{
                      color: openMenus[i] ? PRIMARY_BLUE : DARK_TEXT,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span>{item.title}</span>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 transform transition-transform duration-300 flex-shrink-0 ${
                        openMenus[i] ? "rotate-90" : "text-gray-400"
                      }`}
                      style={{
                        color: openMenus[i] ? PRIMARY_BLUE : "currentColor",
                      }}
                    />
                  </div>

                  {/* Sub Menu Container */}
                  {openMenus[i] && (
                    <div className="ml-5 mt-1 space-y-0.5 border-l-2 border-gray-300/50 pl-3 transition-all duration-300 ease-out">
                      {item.subMenu.map((sub, idx) => {
                        const SubIcon = sub.icon;
                        return (
                          <NavLink
                            key={idx}
                            to={sub.path}
                            onClick={closeSidebar}
                            className={({ isActive }) =>
                              `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-300
                              ${
                                isActive
                                  ? subMenuActiveClass
                                  : subMenuInactiveHoverClass
                              }`
                            }
                            style={({ isActive }) => ({
                              backgroundColor: isActive
                                ? ACCENT_BG
                                : "transparent",
                              color: isActive ? PRIMARY_BLUE : DARK_TEXT,
                            })}
                          >
                            <SubIcon className="w-3.5 h-3.5 flex-shrink-0" />
                            {sub.title}
                          </NavLink>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </div>

      {/* --- Logout Button --- */}
      <div className="space-y-2 p-4 border-t border-gray-200">
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-lg bg-red-500/10 text-red-600 hover:bg-red-500/20 cursor-pointer transition-all duration-300 font-medium"
          onClick={() => handleLogout()}
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
