import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { API } from "../api";
import DashboardLayout from "../components/Layout/DashboardLayout";
import { Activity, Leaf, TrendingUp, Edit3, Loader, MapPin, Save } from "lucide-react";

export default function FarmerDashboard() {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";

  const [user, setUser] = useState(null);
  const [farmProfile, setFarmProfile] = useState({});
  const [aiData, setAiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  // ✅ FIX 1: Added error state for better UX
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      const res = await API.get("/profile/me");
      setUser(res.data.user);
      setFarmProfile(res.data.farmProfile || {});
    } catch (error) {
      console.error("Error fetching data", error);
      setError("Failed to load dashboard. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    setFarmProfile({ ...farmProfile, [e.target.name]: e.target.value });
  };

  const saveProfile = async () => {
    try {
      await API.put("/profile/farm", farmProfile);
      setIsEditing(false);
      alert("Farm profile updated!");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update profile");
    }
  };

  const calculateAI = async () => {
    // ✅ FIX 2: Guard — don't call AI if user data isn't loaded
    if (!user) {
      alert("User data not loaded yet. Please wait.");
      return;
    }

    setAiLoading(true);
    setAiData(null);
    try {
      // ✅ FIX 3: Safe optional chaining on user fields
      const location = `${user?.district || "Unknown"}, ${user?.state || "Unknown"}`;

      const res = await API.post("/ai/analyze", {
        farmProfile,
        location,
      });

      setAiData(res.data);
    } catch (error) {
      console.error("AI Error:", error);
      // ✅ FIX 4: Show meaningful error from backend instead of generic message
      alert(error.response?.data?.message || "AI Analysis failed. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader className="animate-spin mr-3 text-green-600" size={28} />
        <span className="text-gray-600 text-lg">Loading Dashboard...</span>
      </div>
    );
  }

  // ✅ FIX 5: Show error state
  if (error) {
    return (
      <div className="h-screen flex items-center justify-center flex-col gap-4">
        <p className="text-red-500 text-lg">{error}</p>
        <button onClick={fetchDashboardData} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
          Retry
        </button>
      </div>
    );
  }

  return (
    <DashboardLayout>
      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-2xl p-6 text-white shadow-lg flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold mb-1">
                Welcome back, {user?.fullName?.split(" ")[0] || "Farmer"} 👋
              </h2>
              <p className="flex items-center opacity-90 mt-2">
                <MapPin size={18} className="mr-1" />
                {user?.district || "—"}, {user?.state || "—"} |
                <Leaf size={18} className="ml-3 mr-1" />
                Crop: {farmProfile?.cropType || "Not set"}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-gray-500 text-sm font-bold uppercase">Land Area</h3>
              <p className="text-3xl font-bold text-gray-800 mt-2">{farmProfile.landArea || 0} Acres</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-gray-500 text-sm font-bold uppercase">Active Season</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">{farmProfile.season || "Not set"}</p>
            </div>
          </div>
        </div>
      )}

      {/* PROFILE TAB */}
      {activeTab === "profile" && (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">My Farm Profile</h2>
            {!isEditing && (
              <button onClick={() => setIsEditing(true)} className="text-green-600 hover:bg-green-50 p-2 rounded flex items-center">
                <Edit3 size={18} className="mr-2" /> Edit
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Crop Type</label>
              <input disabled={!isEditing} name="cropType" value={farmProfile.cropType || ""} onChange={handleProfileChange} className="w-full p-3 border rounded-lg bg-gray-50 disabled:opacity-60" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Land Area (Acres)</label>
              <input disabled={!isEditing} type="number" min="0" name="landArea" value={farmProfile.landArea || ""} onChange={handleProfileChange} className="w-full p-3 border rounded-lg bg-gray-50 disabled:opacity-60" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Soil Type</label>
              <input disabled={!isEditing} name="soilType" value={farmProfile.soilType || ""} onChange={handleProfileChange} className="w-full p-3 border rounded-lg bg-gray-50 disabled:opacity-60" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Equipment</label>
              <input disabled={!isEditing} name="equipment" value={farmProfile.equipment || ""} onChange={handleProfileChange} className="w-full p-3 border rounded-lg bg-gray-50 disabled:opacity-60" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Season</label>
              <input disabled={!isEditing} name="season" value={farmProfile.season || ""} onChange={handleProfileChange} className="w-full p-3 border rounded-lg bg-gray-50 disabled:opacity-60" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget Range</label>
              <select disabled={!isEditing} name="budgetRange" value={farmProfile.budgetRange || ""} onChange={handleProfileChange} className="w-full p-3 border rounded-lg bg-gray-50 disabled:opacity-60">
                <option value="">Select Budget</option>
                <option value="Low">Low (&lt; ₹10k)</option>
                <option value="Medium">Medium (₹10k - ₹50k)</option>
                <option value="High">High (&gt; ₹50k)</option>
              </select>
            </div>
          </div>
          {isEditing && (
            <div className="mt-8 flex space-x-4">
              <button onClick={saveProfile} className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 flex justify-center items-center">
                <Save className="mr-2" size={20} /> Save Changes
              </button>
              <button onClick={() => setIsEditing(false)} className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-bold hover:bg-gray-300">
                Cancel
              </button>
            </div>
          )}
        </div>
      )}

      {/* AI ADVISOR TAB */}
      {activeTab === "ai" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">AI Crop & Residue Advisor</h2>
            <button
              onClick={calculateAI}
              disabled={aiLoading}
              className="bg-yellow-500 text-white font-bold px-6 py-3 rounded-xl shadow-md hover:bg-yellow-600 flex items-center transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {aiLoading ? (
                <><Loader className="animate-spin mr-2" /> Analyzing...</>
              ) : (
                <><Activity className="mr-2" /> Generate New Report</>
              )}
            </button>
          </div>

          {!aiData ? (
            <div className="bg-white p-12 rounded-2xl shadow-sm border border-dashed border-gray-300 text-center">
              <Activity size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-medium text-gray-600">No Analysis Yet</h3>
              <p className="text-gray-500">Click the button above to generate AI recommendations.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-2 bg-blue-50 border border-blue-100 p-6 rounded-2xl">
                  <h3 className="text-lg font-bold text-blue-900 mb-2">🧠 Best Method: {aiData.bestMethod}</h3>
                  <p className="text-blue-800 mb-4">"{aiData.aiReason}"</p>
                  <div className="flex gap-4">
                    <span className="bg-white px-3 py-1 rounded text-green-700 font-bold border border-green-200">
                      Profit: {aiData.profitEstimation}
                    </span>
                    <span className="bg-white px-3 py-1 rounded text-red-700 font-bold border border-red-200">
                      Risk: {aiData.riskLevel}
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-yellow-500">
                    <p className="text-xs text-gray-500 uppercase">Est. Residue</p>
                    <p className="text-xl font-bold">{aiData.estimatedResidue} Tons</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-green-500">
                    <p className="text-xs text-gray-500 uppercase">Potential Value</p>
                    <p className="text-xl font-bold text-green-600">{aiData.biomassValue}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold mb-4 flex items-center">
                  <TrendingUp className="mr-2" size={20} /> Profit Analysis
                </h3>
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 text-sm">
                      <th className="p-3">Method</th>
                      <th className="p-3">Cost</th>
                      <th className="p-3">Income</th>
                      <th className="p-3">Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* ✅ FIX 6: Safe optional chaining on roiTable */}
                    {aiData.roiTable?.map((row, i) => (
                      <tr key={i} className="border-b border-gray-50">
                        <td className="p-3 font-medium">{row.method}</td>
                        <td className="p-3 text-red-500">{row.cost}</td>
                        <td className="p-3 text-green-600">{row.income}</td>
                        <td className="p-3 font-bold">{row.profit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ✅ FIX 7: Display impact section which was missing in original UI */}
              {aiData.impact && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-green-50 p-5 rounded-2xl border border-green-100 text-center">
                    <p className="text-xs text-gray-500 uppercase mb-1">CO₂ Reduced</p>
                    <p className="text-2xl font-bold text-green-700">{aiData.impact.co2Reduced} Tons</p>
                  </div>
                  <div className="bg-yellow-50 p-5 rounded-2xl border border-yellow-100 text-center">
                    <p className="text-xs text-gray-500 uppercase mb-1">Burning Prevented</p>
                    <p className="text-2xl font-bold text-yellow-700">{aiData.impact.burningPrevented} Tons</p>
                  </div>
                  <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 text-center">
                    <p className="text-xs text-gray-500 uppercase mb-1">Air Quality Impact</p>
                    <p className="text-2xl font-bold text-blue-700">{aiData.impact.airQuality}</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* SETTINGS TAB */}
      {activeTab === "settings" && (
        <div className="text-center p-10 text-gray-500">
          <h2 className="text-xl font-bold">Settings</h2>
          <p>Coming soon...</p>
        </div>
      )}
    </DashboardLayout>
  );
}
