import { useNavigate, useLocation } from "react-router-dom";
import { LogOut, LayoutDashboard, User, Settings, MessageSquare, Menu } from "lucide-react";
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

  // ✅ FIX 1: Corrected isActive logic — exact match on query param
  const isActive = (tab) => {
    if (!tab) return !location.search; // active only when no query params at all
    return location.search === `?tab=${tab}`;
  };

  // ✅ FIX 2: Base path is role-aware so admin nav works correctly
  const basePath = userRole === "admin" ? "/admin" : "/dashboard";

  return (
    <div className="flex h-screen bg-gray-100">

      {/* SIDEBAR */}
      <aside className={`${isSidebarOpen ? "w-64" : "w-20"} bg-green-900 text-white transition-all duration-300 flex flex-col`}>
        <div className="p-6 flex items-center justify-between border-b border-green-800">
          {isSidebarOpen && <span className="text-xl font-bold">Crop2Cash</span>}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-green-800 rounded">
            <Menu size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {/* 1. Overview */}
          <button
            onClick={() => navigate(basePath)}
            className={`flex items-center w-full p-3 rounded-lg transition ${isActive("") ? "bg-green-700" : "hover:bg-green-800"}`}
          >
            <LayoutDashboard size={20} />
            {isSidebarOpen && <span className="ml-3">Overview</span>}
          </button>

          {/* 2. Farm Profile — Farmer only */}
          {userRole === "farmer" && (
            <button
              onClick={() => navigate("/dashboard?tab=profile")}
              className={`flex items-center w-full p-3 rounded-lg transition ${isActive("profile") ? "bg-green-700" : "hover:bg-green-800"}`}
            >
              <User size={20} />
              {isSidebarOpen && <span className="ml-3">Farm Profile</span>}
            </button>
          )}

          {/* 3. AI Advisor — ✅ FIX: uses basePath so it works for both roles */}
          {userRole === "farmer" && (
            <button
              onClick={() => navigate(`${basePath}?tab=ai`)}
              className={`flex items-center w-full p-3 rounded-lg transition ${isActive("ai") ? "bg-green-700" : "hover:bg-green-800"}`}
            >
              <MessageSquare size={20} />
              {isSidebarOpen && <span className="ml-3">AI Advisor</span>}
            </button>
          )}

          {/* 4. Settings — ✅ FIX: uses basePath */}
          <button
            onClick={() => navigate(`${basePath}?tab=settings`)}
            className={`flex items-center w-full p-3 rounded-lg transition ${isActive("settings") ? "bg-green-700" : "hover:bg-green-800"}`}
          >
            <Settings size={20} />
            {isSidebarOpen && <span className="ml-3">Settings</span>}
          </button>
        </nav>

        <div className="p-4 border-t border-green-800">
          <button
            onClick={handleLogout}
            className="flex items-center w-full p-3 hover:bg-red-600 rounded-lg transition text-red-100 hover:text-white"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-8 z-10">
          <h2 className="text-xl font-semibold text-gray-800">
            {userRole === "admin" ? "Admin Portal" : "Farmer Dashboard"}
          </h2>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Hello, {localStorage.getItem("fullName") || "User"}
            </span>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold border border-green-200">
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
