import { useState, useEffect } from "react";
import { API } from "../api";
import DashboardLayout from "../components/Layout/DashboardLayout";
import { useSearchParams } from "react-router-dom";

export default function AdminDashboard() {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";

  // ✅ FIX 1: Added state for real data instead of hardcoded values
  const [stats, setStats] = useState({ totalFarmers: 0, residueSaved: 0, activeBuyers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Placeholder: In future, call an admin stats API endpoint
    // const res = await API.get("/admin/stats");
    // setStats(res.data);
    // For now, simulating with static data
    setStats({ totalFarmers: 120, residueSaved: 500, activeBuyers: 15 });
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full text-gray-500">Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="p-4">
          <h1 className="text-2xl font-bold text-gray-800">Admin Overview</h1>
          <p className="mt-2 text-gray-600">Manage users, buyers, and system configurations here.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
              <h3 className="text-gray-500">Total Farmers</h3>
              <p className="text-3xl font-bold">{stats.totalFarmers}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
              <h3 className="text-gray-500">Residue Saved</h3>
              <p className="text-3xl font-bold">{stats.residueSaved} Tons</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
              <h3 className="text-gray-500">Active Buyers</h3>
              <p className="text-3xl font-bold">{stats.activeBuyers}</p>
            </div>
          </div>
        </div>
      )}

      {/* SETTINGS TAB */}
      {activeTab === "settings" && (
        <div className="text-center p-10 text-gray-500">
          <h2 className="text-xl font-bold">Admin Settings</h2>
          <p>Coming soon...</p>
        </div>
      )}
    </DashboardLayout>
  );
}
