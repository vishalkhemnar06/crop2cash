import { useNavigate, useLocation } from "react-router-dom";
import {
  LogOut, LayoutDashboard, User, Settings, MessageSquare,
  Menu, ScanLine, History, MapPin, Package, Users
} from "lucide-react";
import { useState } from "react";

export default function DashboardLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("fullName");
    navigate("/login");
  };

  const userRole = localStorage.getItem("role");
  const basePath = userRole === "admin" ? "/admin" : "/dashboard";

  const isActive = (tab) => {
    if (!tab) return !location.search;
    return location.search === `?tab=${tab}`;
  };

  const NavBtn = ({ tab, icon, label, farmerOnly = false }) => {
    if (farmerOnly && userRole !== "farmer") return null;
    return (
      <button
        onClick={() => navigate(tab ? `${basePath}?tab=${tab}` : basePath)}
        className={`flex items-center w-full p-3 rounded-lg transition-all duration-150
          ${isActive(tab || "") ? "bg-green-700 shadow-inner" : "hover:bg-green-800"}`}
      >
        <span className="flex-shrink-0">{icon}</span>
        {isSidebarOpen && <span className="ml-3 text-sm font-medium">{label}</span>}
      </button>
    );
  };

  const SectionLabel = ({ label }) => {
    if (!isSidebarOpen || userRole !== "farmer") return null;
    return (
      <div className="pt-3 pb-1">
        <div className="text-green-600 text-xs uppercase font-semibold px-3 tracking-widest">{label}</div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className={`${isSidebarOpen ? "w-64" : "w-20"} bg-green-900 text-white transition-all duration-300 flex flex-col flex-shrink-0`}>
        <div className="p-4 flex items-center justify-between border-b border-green-800 h-16">
          {isSidebarOpen && (
            <div>
              <span className="text-xl font-bold tracking-tight">Crop2Cash</span>
              <div className="text-green-400 text-xs mt-0.5">AI Farm Advisor</div>
            </div>
          )}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1.5 hover:bg-green-800 rounded-lg transition">
            <Menu size={20} />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <NavBtn tab=""        icon={<LayoutDashboard size={20} />} label="Overview" />
          <NavBtn tab="profile" icon={<User size={20} />}            label="Farm Profile"    farmerOnly />
          <NavBtn tab="ai"      icon={<MessageSquare size={20} />}   label="AI Advisor"      farmerOnly />
          <NavBtn tab="residue" icon={<ScanLine size={20} />}        label="Residue Scanner" farmerOnly />

          <SectionLabel label="Marketplace" />
          <NavBtn tab="post"     icon={<Package size={20} />} label="Post Residue" farmerOnly />
          <NavBtn tab="buyers"   icon={<Users size={20} />}   label="Find Buyers"  farmerOnly />
          <NavBtn tab="map"      icon={<MapPin size={20} />}  label="Map View"     farmerOnly />

          <SectionLabel label="Reports" />
          <NavBtn tab="history"  icon={<History size={20} />}  label="Report History" farmerOnly />
          <NavBtn tab="settings" icon={<Settings size={20} />} label="Settings" />
        </nav>

        <div className="p-3 border-t border-green-800">
          <button onClick={handleLogout} className="flex items-center w-full p-3 hover:bg-red-600 rounded-lg transition text-red-200 hover:text-white">
            <LogOut size={20} />
            {isSidebarOpen && <span className="ml-3 text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-8 z-10 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-800">
            {userRole === "admin" ? "Admin Portal" : "Farmer Dashboard"}
          </h2>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500 hidden md:block">
              Hello, <span className="font-semibold text-gray-700">{localStorage.getItem("fullName") || "User"}</span>
            </span>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold border-2 border-green-200">
              {localStorage.getItem("fullName")?.charAt(0)?.toUpperCase() || "U"}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}