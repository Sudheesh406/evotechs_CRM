import React, { useEffect, useState } from "react";
import axios from "../instance/Axios";
import { NavLink,useNavigate } from "react-router-dom";
import {
  Home,
  Users,
  FileText,
  ClipboardList,
  Calendar,
  Phone,
  Settings,
  LogOut,
  CheckSquare,
  Shield,
  MessageSquare,
  Building,
  UserPlus,
  Briefcase,
  Boxes,
  RotateCcw,
  Trash2,
  Wrench,
  FolderKanban,
  Hourglass,
  Eye 
} from "lucide-react";
import { s } from "framer-motion/client";
import { use } from "react";

const Sidebar = ({ closeSidebar }) => {
  const [openMenus, setOpenMenus] = useState({});
  const [menuItems, setMenuItems] = useState();
  const navigate = useNavigate()

  const toggleMenu = (index) => {
    setOpenMenus((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

const id = 0

   const staffItems = [
    { title: "Home", icon: Home, path: "/" },
    {
      title: "Sales",
      icon: ClipboardList,
      subMenu: [
        { title: "Leads", path: "/sales/leads", icon: UserPlus },
        { title: "Contacts", path: "/sales/contacts", icon: Users },
        { title: "Personalize", path: "/sales/personalize", icon: Shield },
        { title: "Deals", path: "/sales/deals", icon: Briefcase },
        { title: "Pending", path: "/sales/pendings", icon: Hourglass },
        { title: "Rework", path: "/sales/reworks", icon: RotateCcw },
        { title: "Documents", path: "/sales/documents", icon: FileText },
      ],
    },
    {
      title: "Activities",
      icon: Calendar,
      subMenu: [
        { title: "Tasks", path: "/activities/tasks", icon: ClipboardList },
        { title: "Meetings", path: "/activities/meetings", icon: Calendar },
        { title: "Calls", path: "/activities/calls", icon: Phone },
      ],
    },
    {
      title: "Team",
      icon: Boxes,
      subMenu: [
        { title: "Info", path: "/team/profile", icon: CheckSquare },
        { title: "Projects", path: `/team/work/${id}`, icon: Calendar },
        { title: "Leads", path: "/team/leads", icon: UserPlus },
        { title: "Contacts", path: "/team/contacts", icon: Users },
      ],
    },
    {
      title: "Workspace",
      icon: Users,
      subMenu: [
        { title: "Attendance", path: "/workspace/attendance", icon: CheckSquare },
        { title: "Calendar", path: "/workspace/calendar", icon: Calendar },
        { title: "Messages", path: "/workspace/messages", icon: MessageSquare },
        { title: "Performance", path: "/workspace/work/assign", icon: FolderKanban },

      ],
    },
    { title: "Trash", icon: Trash2, path: "/trash" },
    // { title: "Services", icon: Wrench, path: "/services" },
    // { title: "Projects", icon: FolderKanban, path: "/projects" },
  ];


  //------------------------ Admin Items-------------------------//
  //--------------------------------------------------------------//


  const adminItems = [
    {title: "Home", icon: Home, path: "/admin" },
    {
      title: "Sales",
      icon: ClipboardList,
      subMenu: [
        { title: "Deals", path: "/sales/deals", icon: Briefcase },
        { title: "Pending", path: "/sales/pending/task", icon: Hourglass },
        { title: "Completed", path: "/sales/completed", icon: Building },
        { title: "Resolved", path: "/sales/resolved", icon: Eye  },
        { title: "Rework", path: "/sales/rework/port", icon: RotateCcw  },
        { title: "Documents", path: "/sales/documents", icon: FileText },
      ],
    },
    {
      title: "Activities",
      icon: Calendar,
      subMenu: [
        { title: "Tasks", path: "/activities/task/port", icon: ClipboardList },
      ],
    },
    {
      title: "Team",
      icon: Boxes,
      subMenu: [
        { title: "Customise", path: "/team/customise", icon: CheckSquare },
        { title: "Projects", path: `/team/work/${id}`, icon: Calendar },
        // { title: "Notacess", path: "/team/messages", icon: MessageSquare },
      ],
    },
    {
      title: "Workspace",
      icon: Users,
      subMenu: [
        { title: "Attendance", path: "/workspace/attendance/view", icon: CheckSquare },
        { title: "Calendar", path: "/workspace/calendar/customise", icon: Calendar },
        { title: "Messages", path: "/workspace/message/port", icon: MessageSquare },
        { title: "Assignment", path: "/workspace/todo", icon: FolderKanban },
        { title: "Pinator", path: "/workspace/auth/pin/generator", icon: FolderKanban },
        { title: "Work", path: "/workspace/AdminWorklog", icon: FolderKanban },


      ],
    },
    { title: "Trash", icon: Trash2, path: "/trash" },
    // { title: "Services", icon: Wrench, path: "/services" },
    // { title: "Projects", icon: FolderKanban, path: "/projects" },
  ]

useEffect(() => {
  async function initRole() {
    try {
      let acess = null
        const { data } = await axios.get("/auth/role");
        if (data?.data?.role) {
        acess = data?.data?.role;
        }
      // Set menu
      if (acess === "admin") {
        setMenuItems(adminItems);
      } else {
        setMenuItems(staffItems);
      }
    } catch (err) {
      console.error("Error initializing role:", err);
    }
  }

  initRole();
}, []);

  
const handleLogout = async ()=>{
  try {
    const response = await axios.patch('/auth/logout')
    if(response){
      localStorage.removeItem("CRMsrtRolE");
      navigate('/login')
    }
  } catch (error) {
    console.log('error found in logout',error)
  }
}

  
  return (
    <div className="flex flex-col justify-between h-screen bg-[#1F2A40] text-white w-64 shadow-lg">
      {/* Top + Menu Scrollable */}
      <div className="flex flex-col overflow-y-auto flex-1">
        {/* Logo */}
        <h1 className="text-[#E50914] text-2xl font-extrabold  p-6 tracking-wide">
          CRM Panel
        </h1>

        {/* Menu */}
        <nav className="space-y-2 px-2">
          {menuItems?.map((item, i) => {
            const Icon = item.icon;
            const hasSubMenu = !!item.subMenu;

            if (!hasSubMenu) {
              return (
                <NavLink
                  key={i}
                  to={item.path}
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200
                     ${isActive ? "bg-[#E50914]/20 text-[#E50914]" : "hover:bg-[#2A3A5F] hover:text-[#E50914]"}`
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.title}</span>
                </NavLink>
              );
            }

            return (
              <div key={i}>
                <div
                  onClick={() => toggleMenu(i)}
                  className={`flex items-center justify-between gap-3 px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer
                    ${openMenus[i] ? "bg-[#2A3A5F] text-[#E50914]" : "hover:bg-[#2A3A5F] hover:text-[#E50914]"}`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.title}</span>
                  </div>
                  <span className={`transform transition-transform duration-200 ${openMenus[i] ? "rotate-90" : ""}`}>
                    ▸
                  </span>
                </div>

                {openMenus[i] && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.subMenu.map((sub, idx) => {
                      const SubIcon = sub.icon;
                      return (
                        <NavLink
                          key={idx}
                          to={sub.path}
                          onClick={closeSidebar}
                          className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm transition-all duration-200
                             ${isActive ? "bg-[#E50914]/20 text-[#E50914]" : "hover:bg-[#2A3A5F] hover:text-[#E50914]"}`
                          }
                        >
                          <SubIcon className="w-4 h-4" />
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

      {/* Bottom Settings / Logout */}
      <div className="space-y-2 p-2">
        {/* <div className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-[#2A3A5F] hover:text-[#E50914] cursor-pointer transition-all duration-200">
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </div> */}
        <div className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-[#2A3A5F] hover:text-[#E50914] cursor-pointer transition-all duration-200"
         onClick={()=>handleLogout()}>
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
