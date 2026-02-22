import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { API } from "../api";
import DashboardLayout from "../components/Layout/DashboardLayout";
import { downloadCSV, downloadPDF } from "../utils/reportUtils";
import {
  Activity, Leaf, TrendingUp, Edit3, Loader, MapPin,
  Save, Camera, X, Upload, ImageIcon, CheckCircle,
  Zap, BarChart2, Flame, ScanLine, History,
  Download, Trash2, FileText, FileSpreadsheet,
  AlertTriangle, Bug, Sprout, RefreshCw, ChevronDown,
  ChevronUp, Star, Award, Clock, Users, Navigation,
  Info, Eye, Package, Phone, MessageSquare, Plus,
  Bell, Filter, Building2, ShieldCheck, TrendingDown,
  Calendar, ArrowRight, Layers, Target, BarChart,
  Zap as ZapIcon
} from "lucide-react";

// ─── Static Option Lists ───────────────────────────────────────────
const CROP_OPTIONS = [
  "Wheat", "Rice / Paddy", "Maize / Corn", "Sugarcane", "Cotton",
  "Soybean", "Groundnut", "Mustard / Rapeseed", "Sunflower", "Chickpea (Chana)",
  "Pigeon Pea (Tur/Arhar)", "Lentil (Masoor)", "Green Gram (Moong)", "Black Gram (Urad)",
  "Barley", "Sorghum (Jowar)", "Pearl Millet (Bajra)", "Finger Millet (Ragi)",
  "Turmeric", "Onion", "Other",
];
const SOIL_OPTIONS = [
  "Alluvial Soil", "Black Cotton Soil (Regur)", "Red & Yellow Soil",
  "Laterite Soil", "Arid / Desert Soil", "Saline & Alkaline Soil",
  "Peaty & Marshy Soil", "Forest / Mountain Soil", "Clay Soil",
  "Sandy Soil", "Loamy Soil", "Silty Soil",
];
const IRRIGATION_OPTIONS = [
  "Rainfed (No Irrigation)", "Canal Irrigation", "Drip Irrigation",
  "Sprinkler Irrigation", "Borewell / Tubewell", "Tank / Pond Irrigation",
  "River Lift Irrigation", "Check Dam / Farm Pond",
];
const EQUIPMENT_OPTIONS = [
  "Tractor", "Power Tiller", "Rotavator", "Disc Harrow", "Cultivator",
  "Seed Drill", "Thresher", "Combine Harvester", "Baler / Straw Baler",
  "Reaper / Crop Cutter", "Sprayer (Manual)", "Sprayer (Power)", "Pump Set",
  "Chaff Cutter", "Plough (Bullock Drawn)",
];
const SEASON_OPTIONS = [
  "Kharif (June – October)", "Rabi (November – April)", "Zaid / Summer (March – June)",
  "Whole Year (Perennial)",
];
const BUDGET_OPTIONS = [
  "Low (< Rs 10,000)", "Medium (Rs 10,000 – Rs 50,000)",
  "High (Rs 50,000 – Rs 1,00,000)", "Very High (> Rs 1,00,000)", "Custom",
];

const CATEGORY_COLORS = {
  "Thermal/Energy": { bg: "bg-orange-100", text: "text-orange-700", dot: "bg-orange-500" },
  "Agricultural":   { bg: "bg-green-100",  text: "text-green-700",  dot: "bg-green-500"  },
  "Commercial":     { bg: "bg-blue-100",   text: "text-blue-700",   dot: "bg-blue-500"   },
  "Advanced":       { bg: "bg-purple-100", text: "text-purple-700", dot: "bg-purple-500" },
};

// ─── DEMAND HEAT MAP DATA (dynamic based on location & crop) ─────
const DEMAND_DATA = {
  "Wheat": [
    { location: "Ludhiana", material: "Wheat Straw", demand: "Very High", color: "bg-red-500", buyers: 12 },
    { location: "Amritsar", material: "Wheat Straw", demand: "High",      color: "bg-orange-500", buyers: 8 },
    { location: "Patiala",  material: "Biochar",     demand: "High",      color: "bg-orange-400", buyers: 5 },
    { location: "Rohtak",   material: "Compost",     demand: "Medium",    color: "bg-yellow-500", buyers: 4 },
    { location: "Karnal",   material: "Pellets",     demand: "Medium",    color: "bg-yellow-400", buyers: 3 },
  ],
  "Rice / Paddy": [
    { location: "Patna",    material: "Rice Husk",   demand: "Very High", color: "bg-red-500",    buyers: 14 },
    { location: "Muzaffarpur", material: "Paddy Straw", demand: "High",   color: "bg-orange-500", buyers: 9 },
    { location: "Kolkata",  material: "Biogas Feedstock", demand: "High", color: "bg-orange-400", buyers: 6 },
    { location: "Cuttack",  material: "Animal Feed", demand: "Medium",    color: "bg-yellow-500", buyers: 5 },
  ],
  "Sugarcane": [
    { location: "Pune",     material: "Bagasse",     demand: "Very High", color: "bg-red-500",    buyers: 16 },
    { location: "Satara",   material: "Compost",     demand: "High",      color: "bg-orange-500", buyers: 7 },
    { location: "Nashik",   material: "Bioethanol Feedstock", demand: "High", color: "bg-orange-400", buyers: 5 },
    { location: "Kolhapur", material: "Animal Feed", demand: "Medium",    color: "bg-yellow-500", buyers: 4 },
  ],
  "Cotton": [
    { location: "Nagpur",   material: "Cotton Stalks", demand: "High",    color: "bg-orange-500", buyers: 8 },
    { location: "Aurangabad", material: "Biochar",     demand: "Medium",  color: "bg-yellow-500", buyers: 5 },
    { location: "Wardha",   material: "Compost",     demand: "Medium",    color: "bg-yellow-400", buyers: 4 },
  ],
  "default": [
    { location: "Pune",     material: "Compost",     demand: "High",      color: "bg-orange-500", buyers: 7 },
    { location: "Satara",   material: "Straw",       demand: "High",      color: "bg-orange-400", buyers: 5 },
    { location: "Nashik",   material: "Biochar",     demand: "Medium",    color: "bg-yellow-500", buyers: 4 },
    { location: "Kolhapur", material: "Pellets",     demand: "Medium",    color: "bg-yellow-400", buyers: 3 },
    { location: "Sangli",   material: "Animal Feed", demand: "Low",       color: "bg-green-400",  buyers: 2 },
  ],
};

// ─── History helpers ────────────────────────────────────────────────
const HISTORY_KEY = "crop2cash_report_history";
const getHistory = () => {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); }
  catch { return []; }
};
const saveHistory = (list) => localStorage.setItem(HISTORY_KEY, JSON.stringify(list));

// ─── HELPER: compute Performance Score from latest data ──────────
function computePerformanceScore(farmProfile, aiData, myPosts, buyers) {
  if (!farmProfile || !aiData) return null;

  const bestROI = aiData?.roiTable?.[0]?.roi || 0;
  const residue = parseFloat(aiData?.estimatedResidue) || 0;
  const landArea = parseFloat(farmProfile?.landArea) || 0;
  const activePosts = myPosts.filter(p => p.status === "active").length;
  const soldPosts   = myPosts.filter(p => p.status === "sold").length;

  // Efficiency: based on ROI vs land
  const efficiencyRaw = Math.min(100, Math.round(Math.min(bestROI / 10, 10) * 10));

  // Profitability
  const profitNum = parseFloat(String(aiData.profitEstimation || "").replace(/[^0-9.]/g, "")) || 0;
  const profitScore = profitNum > 50000 ? "Very High" : profitNum > 25000 ? "High" : profitNum > 10000 ? "Medium" : "Low";

  // Sustainability
  const hasGoodMethod = ["Composting", "Biochar", "Pellets", "Direct Soil Incorporation"].some(
    m => aiData.bestMethod?.includes(m)
  );
  const sustainabilityScore = hasGoodMethod ? (residue > 5 ? "Excellent" : "Good") : "Fair";

  // Market access
  const marketScore = buyers.length > 5 ? "Strong" : buyers.length > 2 ? "Moderate" : buyers.length > 0 ? "Limited" : "Building";

  // Overall score 0-100
  const overall = Math.min(100, Math.round(
    (efficiencyRaw * 0.35) +
    (profitNum > 25000 ? 30 : profitNum > 10000 ? 20 : 10) +
    (hasGoodMethod ? 20 : 10) +
    (buyers.length > 3 ? 15 : buyers.length > 0 ? 10 : 5)
  ));

  return { overall, efficiencyRaw, profitScore, sustainabilityScore, marketScore };
}

// ─── HELPER: compute Risk Indicators ────────────────────────────
function computeRisk(farmProfile, aiData, buyers) {
  const crop = farmProfile?.cropType || "";
  const season = farmProfile?.season || "";
  const method = aiData?.bestMethod || "";
  const residue = parseFloat(aiData?.estimatedResidue) || 0;

  // Market risk: low if many buyers, high if none
  const marketRisk = buyers.length >= 5 ? "Low" : buyers.length >= 2 ? "Medium" : "High";
  const marketRiskReason = buyers.length >= 5
    ? `${buyers.length} buyers available nearby`
    : buyers.length >= 2
    ? "Limited buyer availability"
    : "Very few registered buyers nearby";

  // Weather risk: Kharif = medium (monsoon), Rabi = low
  const isKharif = season.includes("Kharif");
  const weatherRisk = isKharif ? "Medium" : "Low";
  const weatherRiskReason = isKharif
    ? "Kharif season — monsoon variability can affect residue quality"
    : "Rabi/dry season — stable conditions for residue collection";

  // Storage risk: high if perishable method or large quantity without buyers
  const isPerishable = ["Compost", "Biogas"].some(m => method.includes(m));
  const storageRisk = residue > 10 && buyers.length < 3 ? "High"
    : isPerishable ? "Medium"
    : "Low";
  const storageRiskReason = storageRisk === "High"
    ? "Large quantity with limited buyer interest — storage cost may add up"
    : storageRisk === "Medium"
    ? "Composted/biogas residue can degrade if not processed quickly"
    : "Good demand and manageable quantity";

  return {
    marketRisk, marketRiskReason,
    weatherRisk, weatherRiskReason,
    storageRisk, storageRiskReason,
  };
}

// ──────────────────────────────────────────────────────────────────
export default function FarmerDashboard() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeTab = searchParams.get("tab") || "overview";

  const [user, setUser] = useState(null);
  const [farmProfile, setFarmProfile] = useState({
    cropType: "", customCropType: "", landArea: "",
    soilType: "", irrigationType: "", equipment: [],
    customEquipment: "", season: "", budgetRange: "", customBudget: "",
  });
  const [aiData, setAiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);

  // Image residue state
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageResult, setImageResult] = useState(null);
  const fileInputRef = useRef(null);

  // History state
  const [history, setHistory] = useState(getHistory());
  const [expandedHistoryId, setExpandedHistoryId] = useState(null);
  const [historyFilter, setHistoryFilter] = useState("all");

  // AI tab UI state
  const [selectedMethodIdx, setSelectedMethodIdx] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Post Residue state
  const [myPosts, setMyPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);
  const [postStatusFilter, setPostStatusFilter] = useState("all");
  const [editingPost, setEditingPost] = useState(null); // post being edited
  const [postForm, setPostForm] = useState({
    cropType: "", residueType: "", estimatedQuantity: "", pricePerTon: "",
    season: "", contactMessage: "",
    // AI auto-fill fields
    bestMethod: "", estimatedProfit: "", roiPercent: "", biomassValue: "",
  });
  const [postSaving, setPostSaving] = useState(false);
  const [postFormSource, setPostFormSource] = useState("manual"); // "manual" | "history"

  // Buyers state
  const [buyers, setBuyers] = useState([]);
  const [buyersLoading, setBuyersLoading] = useState(false);
  const [buyerMaterialFilter, setBuyerMaterialFilter] = useState("All");

  // Map state
  const [mapBuyers, setMapBuyers] = useState([]);
  const [mapBuyersLoading, setMapBuyersLoading] = useState(false);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      const res = await API.get("/profile/me");
      setUser(res.data.user);
      const p = res.data.farmProfile || {};
      setFarmProfile({
        cropType: p.cropType || "", customCropType: p.customCropType || "",
        landArea: p.landArea || "", soilType: p.soilType || "",
        irrigationType: p.irrigationType || "",
        equipment: Array.isArray(p.equipment) ? p.equipment : [],
        customEquipment: p.customEquipment || "", season: p.season || "",
        budgetRange: p.budgetRange || "", customBudget: p.customBudget || "",
      });
    } catch (err) {
      setError("Failed to load dashboard. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFarmProfile({ ...farmProfile, [e.target.name]: e.target.value });

  const toggleEquipment = (item) => {
    const current = farmProfile.equipment || [];
    const updated = current.includes(item)
      ? current.filter((e) => e !== item)
      : [...current, item];
    setFarmProfile({ ...farmProfile, equipment: updated });
  };

  const saveProfile = async () => {
    if (!farmProfile.landArea || Number(farmProfile.landArea) < 0.1) {
      alert("Land area must be at least 0.1 acres."); return;
    }
    try {
      await API.put("/profile/farm", {
        ...farmProfile,
        landArea: Number(farmProfile.landArea),
        customBudget: farmProfile.customBudget ? Number(farmProfile.customBudget) : null,
      });
      setIsEditing(false);
      alert("Farm profile updated!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update profile");
    }
  };

  const calculateAI = async (profileOverride = null) => {
    const profileToUse = profileOverride || farmProfile;
    if (!user) { alert("User data not loaded yet."); return; }
    setAiLoading(true);
    setAiData(null);
    setSelectedMethodIdx(0);
    try {
      const location = `${user?.location?.district || user?.district || "Unknown"}, ${user?.location?.state || user?.state || "Unknown"}`;
      const res = await API.post("/ai/analyze", { farmProfile: profileToUse, location });
      const resultData = res.data;
      setAiData(resultData);

      const cropName = profileToUse.cropType === "Other"
        ? (profileToUse.customCropType || "Unknown")
        : (profileToUse.cropType || "Unknown");
      const newEntry = {
        id: `report_${Date.now()}`,
        createdAt: new Date().toISOString(),
        cropName,
        location,
        farmProfile: { ...profileToUse },
        aiData: resultData,
      };
      const updatedHistory = [newEntry, ...getHistory()].slice(0, 50);
      saveHistory(updatedHistory);
      setHistory(updatedHistory);

      navigate("/dashboard?tab=ai");
    } catch (err) {
      alert(err.response?.data?.message || "AI Analysis failed. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  // ── Post Residue functions ────────────────────────────────────────
  const fetchMyPosts = async () => {
    setPostsLoading(true);
    try {
      const res = await API.get("/posts/mine");
      setMyPosts(res.data);
    } catch { setMyPosts([]); } finally { setPostsLoading(false); }
  };

  // Pre-fill post form from a history report entry
  const prefillPostFromHistory = (entry) => {
    const ai = entry.aiData || {};
    const fp = entry.farmProfile || {};
    const cropName = fp.cropType === "Other" ? (fp.customCropType || "") : (fp.cropType || "");

    setPostForm({
      cropType:          cropName,
      residueType:       ai.estimatedResidue ? `${cropName} Residue` : "",
      estimatedQuantity: ai.estimatedResidue || "",
      pricePerTon:       "",
      season:            fp.season || "",
      contactMessage:    `Best method: ${ai.bestMethod || "—"} | ROI: ${ai.roiTable?.[0]?.roi || "—"}%`,
      bestMethod:        ai.bestMethod      || "",
      estimatedProfit:   ai.profitEstimation || "",
      roiPercent:        ai.roiTable?.[0]?.roi || "",
      biomassValue:      ai.biomassValue    || "",
    });
    setPostFormSource("history");
    setShowPostForm(true);
    navigate("/dashboard?tab=post");
  };

  const createPost = async () => {
    if (!postForm.cropType || !postForm.estimatedQuantity) {
      alert("Crop type and quantity are required."); return;
    }
    setPostSaving(true);
    try {
      const payload = {
        ...postForm,
        estimatedQuantity: parseFloat(postForm.estimatedQuantity),
        pricePerTon: postForm.pricePerTon ? parseFloat(postForm.pricePerTon) : null,
        roiPercent: postForm.roiPercent ? parseFloat(postForm.roiPercent) : null,
        // Fallback: auto-attach live aiData if no history data used
        bestMethod:      postForm.bestMethod      || aiData?.bestMethod      || "",
        estimatedProfit: postForm.estimatedProfit || aiData?.profitEstimation || "",
        biomassValue:    postForm.biomassValue    || aiData?.biomassValue     || "",
      };
      if (editingPost) {
        await API.put(`/posts/${editingPost._id}`, payload);
        alert("Listing updated!");
        setEditingPost(null);
      } else {
        await API.post("/posts/create", payload);
        alert("Residue post published! Buyers can now see your listing.");
      }
      setShowPostForm(false);
      setPostFormSource("manual");
      setPostForm({ cropType: "", residueType: "", estimatedQuantity: "", pricePerTon: "", season: "", contactMessage: "", bestMethod: "", estimatedProfit: "", roiPercent: "", biomassValue: "" });
      fetchMyPosts();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create post");
    } finally { setPostSaving(false); }
  };

  const startEditPost = (post) => {
    setEditingPost(post);
    setPostForm({
      cropType:          post.cropType          || "",
      residueType:       post.residueType       || "",
      estimatedQuantity: post.estimatedQuantity || "",
      pricePerTon:       post.pricePerTon       || "",
      season:            post.season            || "",
      contactMessage:    post.contactMessage    || "",
      bestMethod:        post.bestMethod        || "",
      estimatedProfit:   post.estimatedProfit   || "",
      roiPercent:        post.roiPercent        || "",
      biomassValue:      post.biomassValue      || "",
    });
    setPostFormSource("manual");
    setShowPostForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deletePost = async (id) => {
    if (!window.confirm("Delete this post?")) return;
    try { await API.delete(`/posts/${id}`); fetchMyPosts(); }
    catch (err) { alert(err.response?.data?.message || "Failed to delete post"); }
  };

  const updatePostStatus = async (id, status) => {
    try { await API.put(`/posts/${id}`, { status }); fetchMyPosts(); }
    catch (err) { alert("Failed to update status"); }
  };

  // ── Buyer functions ───────────────────────────────────────────────
  const fetchBuyers = useCallback(async () => {
    setBuyersLoading(true);
    try {
      const params = { radius: 200 };
      if (user?.location?.lat) { params.lat = user.location.lat; params.lng = user.location.lng; }
      if (buyerMaterialFilter !== "All") params.materialType = buyerMaterialFilter;
      const res = await API.get("/buyer/all", { params });
      setBuyers(res.data);
    } catch { setBuyers([]); } finally { setBuyersLoading(false); }
  }, [user, buyerMaterialFilter]);

  const fetchMapBuyers = useCallback(async () => {
    setMapBuyersLoading(true);
    try {
      const params = { radius: 200 };
      if (user?.location?.lat) { params.lat = user.location.lat; params.lng = user.location.lng; }
      const res = await API.get("/buyer/all", { params });
      setMapBuyers(res.data);
    } catch { setMapBuyers([]); } finally { setMapBuyersLoading(false); }
  }, [user]);

  // Load data when tab changes
  useEffect(() => {
    if (activeTab === "post") fetchMyPosts();
    if (activeTab === "buyers") fetchBuyers();
    if (activeTab === "map") fetchMapBuyers();
    if (activeTab === "overview") { fetchBuyers(); fetchMyPosts(); }
  }, [activeTab]);

  // Load a history report into AI tab
  const loadHistoryReport = (entry) => {
    setAiData(entry.aiData);
    setSelectedMethodIdx(0);
    navigate("/dashboard?tab=ai");
  };

  const regenerateFromHistory = (entry) => {
    setFarmProfile(entry.farmProfile);
    navigate("/dashboard?tab=profile");
    setTimeout(() => alert("Farm profile loaded from history. Edit any fields, then go to AI Advisor."), 200);
  };

  const deleteHistoryEntry = (id) => {
    if (!window.confirm("Delete this report from history?")) return;
    const updated = history.filter((h) => h.id !== id);
    saveHistory(updated); setHistory(updated);
  };

  const clearAllHistory = () => {
    if (!window.confirm("Delete ALL report history?")) return;
    saveHistory([]); setHistory([]);
  };

  // Image handlers
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const combined = [...selectedImages, ...files].slice(0, 5);
    setSelectedImages(combined);
    setImagePreviews(combined.map((f) => URL.createObjectURL(f)));
  };
  const removeImage = (index) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
    setImageResult(null);
  };
  const handleEstimateResidue = async () => {
    if (!selectedImages.length) { alert("Please upload at least one field image."); return; }
    setImageLoading(true); setImageResult(null);
    try {
      const formData = new FormData();
      selectedImages.forEach((f) => formData.append("images", f));
      const res = await API.post("/ai/estimate-residue", formData, { headers: { "Content-Type": "multipart/form-data" } });
      setImageResult(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Image analysis failed.");
    } finally { setImageLoading(false); }
  };
  const resetResidueScanner = () => {
    setSelectedImages([]); setImagePreviews([]); setImageResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const confidenceBg = (c) =>
    c === "High" ? "bg-green-100 text-green-700" : c === "Medium" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700";

  const displayCrop = farmProfile.cropType === "Other"
    ? (farmProfile.customCropType || "Other")
    : (farmProfile.cropType || "Not set");
  const displayBudget = farmProfile.budgetRange === "Custom"
    ? (farmProfile.customBudget ? `Rs ${Number(farmProfile.customBudget).toLocaleString("en-IN")}` : "Custom")
    : (farmProfile.budgetRange || "Not set");

  const filteredROI = (aiData?.roiTable || []).filter(row =>
    categoryFilter === "All" || row.category === categoryFilter
  );
  const categories = ["All", ...new Set((aiData?.roiTable || []).map(r => r.category).filter(Boolean))];

  // Filtered posts by status
  const filteredPosts = myPosts.filter(p => postStatusFilter === "all" || p.status === postStatusFilter);

  // Performance score and risk (computed on demand)
  const perfScore = computePerformanceScore(farmProfile, aiData, myPosts, buyers);
  const riskData  = computeRisk(farmProfile, aiData, buyers);

  // Overview stats
  const latestReport = history[0];
  const activePosts  = myPosts.filter(p => p.status === "active").length;
  const soldPosts    = myPosts.filter(p => p.status === "sold").length;

  // Demand heat map data
  const demandData = DEMAND_DATA[displayCrop] || DEMAND_DATA["default"];

  const riskColor = (r) =>
    r === "Low" ? "text-green-600 bg-green-50 border-green-200"
    : r === "Medium" ? "text-yellow-700 bg-yellow-50 border-yellow-200"
    : "text-red-600 bg-red-50 border-red-200";

  const riskDot = (r) =>
    r === "Low" ? "bg-green-500" : r === "Medium" ? "bg-yellow-500" : "bg-red-500";

  const scoreColor = (s) => s >= 80 ? "text-green-700" : s >= 60 ? "text-yellow-700" : "text-red-700";
  const scoreBg    = (s) => s >= 80 ? "bg-green-500"  : s >= 60 ? "bg-yellow-500"  : "bg-red-500";

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <Loader className="animate-spin mr-3 text-green-600" size={28} />
      <span className="text-gray-600 text-lg">Loading Dashboard...</span>
    </div>
  );
  if (error) return (
    <div className="h-screen flex items-center justify-center flex-col gap-4">
      <p className="text-red-500 text-lg">{error}</p>
      <button onClick={fetchDashboardData} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">Retry</button>
    </div>
  );

  return (
    <DashboardLayout>

      {/* ═══════════════════════════════════════════════════════════
          OVERVIEW TAB
      ═══════════════════════════════════════════════════════════ */}
      {activeTab === "overview" && (
        <div className="space-y-6">

          {/* Welcome banner */}
          <div className="bg-gradient-to-r from-green-700 to-green-500 rounded-2xl p-6 text-white shadow-lg">
            <h2 className="text-3xl font-bold mb-1">Welcome back, {user?.fullName?.split(" ")[0] || "Farmer"} 👋</h2>
            <p className="flex items-center flex-wrap gap-2 opacity-90 mt-2 text-sm">
              <span className="flex items-center"><MapPin size={16} className="mr-1" />
                {user?.location?.district || user?.district || "—"}, {user?.location?.state || user?.state || "—"}
              </span>
              <span>|</span>
              <span className="flex items-center"><Leaf size={16} className="mr-1" />Crop: {displayCrop}</span>
              {history.length > 0 && (<><span>|</span><span className="flex items-center"><History size={16} className="mr-1" />{history.length} Reports</span></>)}
            </p>
          </div>

          {/* ── RESIDUE MANAGEMENT OVERVIEW PANEL ── */}
          <div className="bg-gradient-to-br from-green-900 to-green-700 rounded-2xl p-6 text-white shadow-lg">
            <h3 className="text-lg font-bold text-green-200 mb-4 flex items-center gap-2">
              <Layers size={20} /> Residue Management Overview — This Season
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  label: "Total Residue",
                  value: latestReport?.aiData?.estimatedResidue
                    ? `${latestReport.aiData.estimatedResidue} Tons`
                    : farmProfile.landArea ? `~${(parseFloat(farmProfile.landArea) * 1.5).toFixed(1)} Tons (est.)` : "—",
                  sub: "estimated this season",
                  icon: <Leaf size={18} />,
                  color: "bg-green-800 border-green-600",
                },
                {
                  label: "Best Method",
                  value: latestReport?.aiData?.bestMethod || "Run AI Analysis",
                  sub: "AI recommended",
                  icon: <Star size={18} />,
                  color: "bg-yellow-800 border-yellow-600",
                },
                {
                  label: "Expected Profit",
                  value: latestReport?.aiData?.profitEstimation || "—",
                  sub: "from best method",
                  icon: <TrendingUp size={18} />,
                  color: "bg-blue-800 border-blue-600",
                },
                {
                  label: "Nearby Buyers",
                  value: buyers.length > 0 ? `${buyers.length} Found` : "Loading...",
                  sub: "registered & active",
                  icon: <Users size={18} />,
                  color: "bg-teal-800 border-teal-600",
                },
              ].map(({ label, value, sub, icon, color }) => (
                <div key={label} className={`${color} border rounded-xl p-4`}>
                  <div className="flex items-center gap-2 text-green-300 mb-2">{icon}<span className="text-xs uppercase font-semibold">{label}</span></div>
                  <p className="text-xl font-extrabold text-white leading-tight">{value}</p>
                  <p className="text-green-300 text-xs mt-1">{sub}</p>
                </div>
              ))}
            </div>
            {!latestReport && (
              <div className="mt-4 bg-green-800 rounded-xl p-3 text-green-200 text-sm flex items-center justify-between">
                <span>No AI report yet — generate one to see full residue analysis</span>
                <button onClick={() => navigate("/dashboard?tab=ai")} className="bg-yellow-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-yellow-600">
                  Generate Now →
                </button>
              </div>
            )}
          </div>

          {/* ── FARM STATS ROW ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-gray-500 text-xs font-bold uppercase">Land Area</h3>
              <p className="text-3xl font-bold text-gray-800 mt-2">{farmProfile.landArea || "—"} Acres</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-gray-500 text-xs font-bold uppercase">Season</h3>
              <p className="text-xl font-bold text-green-600 mt-2">{farmProfile.season || "Not set"}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-gray-500 text-xs font-bold uppercase">Budget</h3>
              <p className="text-xl font-bold text-blue-600 mt-2">{displayBudget}</p>
            </div>
          </div>

          {/* ── POST STATS ROW ── */}
          {myPosts.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Active Posts", count: myPosts.filter(p => p.status === "active").length, color: "border-green-500 text-green-700 bg-green-50", onClick: () => { navigate("/dashboard?tab=post"); setPostStatusFilter("active"); } },
                { label: "Sold Posts",   count: myPosts.filter(p => p.status === "sold").length,   color: "border-blue-500 text-blue-700 bg-blue-50",   onClick: () => { navigate("/dashboard?tab=post"); setPostStatusFilter("sold"); } },
                { label: "Expired",      count: myPosts.filter(p => p.status === "expired").length,color: "border-gray-400 text-gray-600 bg-gray-50",   onClick: () => { navigate("/dashboard?tab=post"); setPostStatusFilter("expired"); } },
              ].map(({ label, count, color, onClick }) => (
                <button key={label} onClick={onClick} className={`bg-white p-4 rounded-xl border-l-4 ${color} shadow-sm hover:shadow-md transition text-left`}>
                  <p className="text-xs font-bold uppercase text-gray-500">{label}</p>
                  <p className="text-3xl font-extrabold mt-1">{count}</p>
                </button>
              ))}
            </div>
          )}

          {/* ── PERFORMANCE SCORE ── */}
          {perfScore && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                <Award size={20} className="text-yellow-500" /> Farmer Performance Score
              </h3>
              <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Score circle */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className={`w-28 h-28 rounded-full border-8 flex items-center justify-center shadow-lg ${perfScore.overall >= 80 ? "border-green-400 bg-green-50" : perfScore.overall >= 60 ? "border-yellow-400 bg-yellow-50" : "border-red-400 bg-red-50"}`}>
                    <div className="text-center">
                      <p className={`text-3xl font-extrabold ${scoreColor(perfScore.overall)}`}>{perfScore.overall}</p>
                      <p className="text-gray-500 text-xs">/100</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-gray-700 mt-2">Overall Score</p>
                </div>
                {/* Score breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                  {[
                    { label: "Efficiency Score",  value: `${perfScore.efficiencyRaw}/100`, bar: perfScore.efficiencyRaw, barColor: "bg-green-500", icon: <ZapIcon size={14} className="text-green-600" /> },
                    { label: "Profitability",      value: perfScore.profitScore,            bar: perfScore.profitScore === "Very High" ? 95 : perfScore.profitScore === "High" ? 75 : perfScore.profitScore === "Medium" ? 50 : 30, barColor: "bg-blue-500",   icon: <TrendingUp size={14} className="text-blue-600" /> },
                    { label: "Sustainability",     value: perfScore.sustainabilityScore,    bar: perfScore.sustainabilityScore === "Excellent" ? 95 : perfScore.sustainabilityScore === "Good" ? 70 : 45, barColor: "bg-teal-500", icon: <Leaf size={14} className="text-teal-600" /> },
                    { label: "Market Access",      value: perfScore.marketScore,            bar: perfScore.marketScore === "Strong" ? 90 : perfScore.marketScore === "Moderate" ? 65 : perfScore.marketScore === "Limited" ? 40 : 20, barColor: "bg-purple-500", icon: <Users size={14} className="text-purple-600" /> },
                  ].map(({ label, value, bar, barColor, icon }) => (
                    <div key={label} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">{icon}{label}</span>
                        <span className="text-sm font-bold text-gray-800">{value}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className={`${barColor} h-2 rounded-full transition-all duration-700`} style={{ width: `${typeof bar === "number" ? bar : 50}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── RISK INDICATORS ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <ShieldCheck size={20} className="text-blue-600" /> Risk Indicators
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "Market Risk",  risk: riskData.marketRisk,  reason: riskData.marketRiskReason,  icon: <BarChart size={16} /> },
                { label: "Weather Risk", risk: riskData.weatherRisk, reason: riskData.weatherRiskReason, icon: <AlertTriangle size={16} /> },
                { label: "Storage Risk", risk: riskData.storageRisk, reason: riskData.storageRiskReason, icon: <Layers size={16} /> },
              ].map(({ label, risk, reason, icon }) => (
                <div key={label} className={`rounded-xl p-4 border ${riskColor(risk)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-2 font-semibold text-sm">{icon}{label}</span>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${riskDot(risk)}`} />
                      <span className="font-bold text-sm">{risk}</span>
                    </div>
                  </div>
                  <p className="text-xs opacity-80 leading-relaxed">{reason}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── DEMAND HEAT MAP ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2">
              <Target size={20} className="text-red-500" /> Demand Heat Map
            </h3>
            <p className="text-xs text-gray-500 mb-4">High-demand areas for {displayCrop !== "Not set" ? displayCrop : "your residue"} — updated based on registered buyers</p>
            <div className="space-y-3">
              {demandData.map((d, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${d.color}`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-gray-800">{d.location}</span>
                      <span className="text-xs font-bold text-gray-500">{d.buyers} buyers · {d.demand}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div className={`h-2 rounded-full ${d.color}`}
                          style={{ width: d.demand === "Very High" ? "95%" : d.demand === "High" ? "75%" : d.demand === "Medium" ? "50%" : "25%" }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-28 flex-shrink-0">{d.material}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-4">💡 These locations have active buyers looking for {displayCrop !== "Not set" ? displayCrop.toLowerCase() : "crop"} residue. Post your listing to connect.</p>
          </div>

          {/* ── RESIDUE-TO-CASH TIMELINE ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
              <Calendar size={20} className="text-green-600" /> Residue-to-Cash Timeline
            </h3>
            <div className="relative">
              {/* Line */}
              <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gradient-to-b from-green-500 via-blue-500 to-green-600 hidden md:block" />
              <div className="space-y-4">
                {[
                  { day: "Day 0",  title: "Harvest",           desc: "Crop harvested · residue left in field",          icon: "🌾", color: "bg-green-500", status: "start" },
                  { day: "Day 1",  title: "Scan & Estimate",   desc: "Upload field photos · AI estimates residue tons",  icon: "📸", color: "bg-blue-500",  status: "" },
                  { day: "Day 2",  title: "Get ROI Report",    desc: "Generate AI report · get best method & profit",    icon: "🤖", color: "bg-purple-500",status: "" },
                  { day: "Day 3",  title: "Post Listing",      desc: "Publish residue post · buyers get notified",       icon: "📢", color: "bg-yellow-500",status: "" },
                  { day: "Day 5",  title: "Process Residue",   desc: "Baling / composting / biochar per best method",    icon: "⚙️", color: "bg-orange-500",status: "" },
                  { day: "Day 10", title: "Buyer Contact",     desc: "Interested buyers call · negotiate price",         icon: "📞", color: "bg-teal-500",  status: "" },
                  { day: "Day 15", title: "Sell",              desc: "Handover residue · document the transaction",      icon: "🤝", color: "bg-green-600", status: "" },
                  { day: "Day 20", title: "Payment Received",  desc: "Cash received in hand or bank transfer ✅",        icon: "💰", color: "bg-green-700", status: "end" },
                ].map(({ day, title, desc, icon, color, status }, i) => (
                  <div key={i} className="flex items-start gap-4 relative">
                    <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center text-lg flex-shrink-0 shadow-md z-10`}>
                      {icon}
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-green-200 hover:bg-green-50 transition">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-gray-800">{title}</span>
                        <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{day}</span>
                      </div>
                      <p className="text-sm text-gray-500">{desc}</p>
                    </div>
                    {i < 7 && <ArrowRight size={16} className="absolute right-0 top-3 text-gray-300 hidden md:block" />}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Equipment tags */}
          {farmProfile.equipment?.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-gray-500 text-xs font-bold uppercase mb-3">Available Equipment</h3>
              <div className="flex flex-wrap gap-2">
                {farmProfile.equipment.map((eq) => (
                  <span key={eq} className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full font-medium">{eq}</span>
                ))}
                {farmProfile.customEquipment && (
                  <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full font-medium">{farmProfile.customEquipment}</span>
                )}
              </div>
            </div>
          )}

          {/* Quick action */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 flex items-center justify-between">
            <div>
              <p className="font-bold text-yellow-800">Ready to get AI recommendations?</p>
              <p className="text-yellow-700 text-sm mt-1">Analyze your crop residue and get a full ROI comparison of 8+ alternatives to burning.</p>
            </div>
            <button onClick={() => navigate("/dashboard?tab=ai")}
              className="bg-yellow-500 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-yellow-600 transition flex items-center gap-2 flex-shrink-0 ml-4">
              <Activity size={18} /> Go to AI Advisor
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          PROFILE TAB (unchanged from your current version)
      ═══════════════════════════════════════════════════════════ */}
      {activeTab === "profile" && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">My Farm Profile</h2>
              {!isEditing && (
                <button onClick={() => setIsEditing(true)} className="text-green-600 hover:bg-green-50 px-4 py-2 rounded-lg flex items-center font-medium border border-green-200">
                  <Edit3 size={16} className="mr-2" /> Edit Profile
                </button>
              )}
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Crop Type <span className="text-red-400">*</span></label>
                <select disabled={!isEditing} name="cropType" value={farmProfile.cropType} onChange={handleChange} className="w-full p-3 border rounded-lg bg-gray-50 disabled:opacity-60">
                  <option value="">-- Select Crop --</option>
                  {CROP_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                {farmProfile.cropType === "Other" && (
                  <input disabled={!isEditing} name="customCropType" placeholder="Enter your crop name" value={farmProfile.customCropType} onChange={handleChange} className="w-full p-3 border rounded-lg bg-gray-50 mt-2 disabled:opacity-60" />
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Land Area (Acres) <span className="text-red-400">*</span> <span className="text-gray-400 font-normal ml-1">(min 0.1)</span></label>
                <input disabled={!isEditing} type="number" step="0.1" min="0.1" name="landArea" value={farmProfile.landArea} onChange={handleChange} placeholder="e.g. 2.5" className="w-full p-3 border rounded-lg bg-gray-50 disabled:opacity-60" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Soil Type</label>
                <select disabled={!isEditing} name="soilType" value={farmProfile.soilType} onChange={handleChange} className="w-full p-3 border rounded-lg bg-gray-50 disabled:opacity-60">
                  <option value="">-- Select Soil Type --</option>
                  {SOIL_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Irrigation Type</label>
                <select disabled={!isEditing} name="irrigationType" value={farmProfile.irrigationType} onChange={handleChange} className="w-full p-3 border rounded-lg bg-gray-50 disabled:opacity-60">
                  <option value="">-- Select Irrigation Type --</option>
                  {IRRIGATION_OPTIONS.map((i) => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Crop Season</label>
                <select disabled={!isEditing} name="season" value={farmProfile.season} onChange={handleChange} className="w-full p-3 border rounded-lg bg-gray-50 disabled:opacity-60">
                  <option value="">-- Select Season --</option>
                  {SEASON_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Available Equipment <span className="text-gray-400 font-normal ml-1">(select all that apply)</span></label>
                <div className="grid grid-cols-2 gap-2">
                  {EQUIPMENT_OPTIONS.map((eq) => (
                    <label key={eq} className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition ${farmProfile.equipment?.includes(eq) ? "bg-green-50 border-green-400 text-green-800" : "bg-gray-50 border-gray-200 text-gray-700"} ${!isEditing ? "pointer-events-none opacity-60" : "hover:border-green-300"}`}>
                      <input type="checkbox" checked={farmProfile.equipment?.includes(eq) || false} onChange={() => isEditing && toggleEquipment(eq)} className="accent-green-600" readOnly={!isEditing} />
                      <span className="text-sm">{eq}</span>
                    </label>
                  ))}
                </div>
                <div className="mt-3">
                  <label className="block text-xs text-gray-500 mb-1">Other equipment</label>
                  <input disabled={!isEditing} name="customEquipment" value={farmProfile.customEquipment} onChange={handleChange} placeholder="e.g. Zero Till Drill..." className="w-full p-3 border rounded-lg bg-gray-50 disabled:opacity-60 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Budget Range</label>
                <select disabled={!isEditing} name="budgetRange" value={farmProfile.budgetRange} onChange={handleChange} className="w-full p-3 border rounded-lg bg-gray-50 disabled:opacity-60">
                  <option value="">-- Select Budget Range --</option>
                  {BUDGET_OPTIONS.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
                {farmProfile.budgetRange === "Custom" && (
                  <div className="mt-2 relative">
                    <span className="absolute left-3 top-3.5 text-gray-500 font-medium">Rs</span>
                    <input disabled={!isEditing} type="number" name="customBudget" value={farmProfile.customBudget} onChange={handleChange} placeholder="Enter your budget amount" className="w-full p-3 pl-10 border rounded-lg bg-gray-50 disabled:opacity-60" />
                  </div>
                )}
              </div>
            </div>
            {isEditing && (
              <div className="mt-8 flex space-x-4">
                <button onClick={saveProfile} className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 flex justify-center items-center">
                  <Save className="mr-2" size={20} /> Save Changes
                </button>
                <button onClick={() => setIsEditing(false)} className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-bold hover:bg-gray-300">Cancel</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          AI ADVISOR TAB
      ═══════════════════════════════════════════════════════════ */}
      {activeTab === "ai" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">AI Residue & ROI Advisor</h2>
              <p className="text-sm text-gray-500 mt-1">Full ROI analysis — profit, payback period & investment efficiency</p>
            </div>
            <button onClick={() => calculateAI()} disabled={aiLoading}
              className="bg-yellow-500 text-white font-bold px-6 py-3 rounded-xl shadow-md hover:bg-yellow-600 flex items-center transition disabled:opacity-60 disabled:cursor-not-allowed">
              {aiLoading ? <><Loader className="animate-spin mr-2" /> Analyzing...</> : <><Activity className="mr-2" /> Generate ROI Report</>}
            </button>
          </div>

          {!aiData ? (
            <div className="bg-white p-12 rounded-2xl shadow-sm border border-dashed border-gray-300 text-center">
              <BarChart2 size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-medium text-gray-600">No Analysis Yet</h3>
              <p className="text-gray-500 text-sm mt-1">Fill your Farm Profile first, then click "Generate ROI Report".</p>
            </div>
          ) : (
            <>
              {/* Hero banner */}
              <div className="bg-gradient-to-r from-green-700 to-green-500 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <p className="text-green-200 text-sm font-semibold uppercase tracking-wide mb-1">🏆 AI Recommended Method</p>
                    <h3 className="text-3xl font-bold mb-2">{aiData.bestMethod}</h3>
                    <p className="text-green-100 italic text-sm max-w-lg">"{aiData.aiReason}"</p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-200 text-xs uppercase">Best ROI</p>
                    <p className="text-4xl font-extrabold">{aiData.roiTable?.[0]?.roi}%</p>
                    <p className="text-green-200 text-xs">return on investment</p>
                  </div>
                </div>
              </div>

              {/* Key metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Max Profit",  value: aiData.profitEstimation,           sub: `from ${aiData.bestMethod}`, color: "border-green-500", textColor: "text-green-700" },
                  { label: "Break-Even",  value: `${aiData.breakEvenMonths} mo.`,   sub: "payback period",            color: "border-blue-500",  textColor: "text-blue-700"  },
                  { label: "Efficiency",  value: `Rs ${aiData.investmentEfficiency}x`, sub: "per Re 1 invested",      color: "border-purple-500",textColor: "text-purple-700"},
                  { label: "Est. Residue",value: `${aiData.estimatedResidue} T`,    sub: `biomass: ${aiData.biomassValue}`, color: "border-yellow-500", textColor: "text-yellow-700" },
                ].map(({ label, value, sub, color, textColor }) => (
                  <div key={label} className={`bg-white p-5 rounded-xl shadow-sm border-l-4 ${color}`}>
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">{label}</p>
                    <p className={`text-2xl font-extrabold ${textColor}`}>{value}</p>
                    <p className="text-xs text-gray-400 mt-1">{sub}</p>
                  </div>
                ))}
              </div>

              {/* Vs burning */}
              <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-center gap-5">
                <div className="bg-red-100 rounded-full p-3 flex-shrink-0"><Flame size={28} className="text-red-600" /></div>
                <div className="flex-1">
                  <p className="font-bold text-red-800 text-base">Cost of Burning = Rs 0 income + Soil Damage + Legal Risk + AQI damage</p>
                  <p className="text-red-600 text-sm mt-1">By choosing <strong>{aiData.bestMethod}</strong> instead of burning, you save <strong>{aiData.summary?.savingsVsBurning || aiData.profitEstimation}</strong> and avoid ₹15,000+ fines.</p>
                </div>
                <div className="text-right hidden md:block flex-shrink-0">
                  <p className="text-xs text-gray-500 uppercase">Risk Level</p>
                  <p className={`text-xl font-bold ${aiData.riskLevel === "Low" ? "text-green-600" : aiData.riskLevel === "Medium" ? "text-yellow-600" : "text-red-600"}`}>{aiData.riskLevel}</p>
                </div>
              </div>

              {/* ROI Table */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                  <div>
                    <h3 className="text-lg font-bold flex items-center gap-2"><TrendingUp className="text-green-600" size={20} /> Full ROI Comparison Table</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Sorted by ROI% · {aiData.roiTable?.length || 0} methods analyzed</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(cat => (
                      <button key={cat} onClick={() => setCategoryFilter(cat)}
                        className={`text-xs px-3 py-1.5 rounded-full font-semibold border transition ${categoryFilter === cat ? "bg-green-600 text-white border-green-600" : "bg-white text-gray-600 border-gray-300 hover:border-green-400"}`}>
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-gray-600 text-xs uppercase">
                        <th className="p-3">Rank</th><th className="p-3">Method</th><th className="p-3">Category</th>
                        <th className="p-3">Cost</th><th className="p-3">Income</th><th className="p-3">Profit</th>
                        <th className="p-3 text-green-700">ROI %</th><th className="p-3">Payback</th>
                        <th className="p-3">Efficiency</th><th className="p-3">Feasibility</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredROI.map((row, i) => {
                        const catStyle = CATEGORY_COLORS[row.category] || { bg: "bg-gray-100", text: "text-gray-600" };
                        return (
                          <tr key={i} className={`border-b transition cursor-pointer ${selectedMethodIdx === i ? "bg-blue-50 ring-1 ring-blue-200" : row.rank === 1 ? "bg-green-50" : "hover:bg-gray-50"}`}
                            onClick={() => setSelectedMethodIdx(i)}>
                            <td className="p-3">
                              {row.rank === 1 ? <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">🥇 #1</span>
                              : row.rank === 2 ? <span className="bg-gray-400 text-white text-xs px-2 py-0.5 rounded-full">🥈 #2</span>
                              : row.rank === 3 ? <span className="bg-yellow-600 text-white text-xs px-2 py-0.5 rounded-full">🥉 #3</span>
                              : <span className="text-gray-400 font-medium">#{row.rank}</span>}
                            </td>
                            <td className="p-3 font-medium">{row.method}</td>
                            <td className="p-3"><span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${catStyle.bg} ${catStyle.text}`}>{row.category || "—"}</span></td>
                            <td className="p-3 text-red-500">Rs {Number(row.cost).toLocaleString("en-IN")}</td>
                            <td className="p-3 text-blue-600">Rs {Number(row.income).toLocaleString("en-IN")}</td>
                            <td className="p-3 text-green-700 font-bold">Rs {Number(row.profit).toLocaleString("en-IN")}</td>
                            <td className="p-3"><span className={`font-extrabold text-base ${i === 0 ? "text-green-700" : "text-gray-700"}`}>{row.roi}%</span></td>
                            <td className="p-3 text-gray-600">{row.paybackMonths} mo.</td>
                            <td className="p-3"><span className="text-purple-700 font-semibold">Rs {row.efficiency}x</span></td>
                            <td className="p-3">
                              <span className={`text-xs px-2 py-1 rounded-full font-semibold ${row.feasibility === "High" ? "bg-green-100 text-green-700" : row.feasibility === "Medium" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                                {row.feasibility}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 bg-gray-50 rounded-xl p-4 text-xs text-gray-500 flex flex-wrap gap-6">
                  <span><strong className="text-gray-700">ROI %</strong> = (Profit ÷ Cost) × 100</span>
                  <span><strong className="text-gray-700">Payback</strong> = months to recover investment</span>
                  <span><strong className="text-gray-700">Efficiency</strong> = Rs earned per Rs 1 invested</span>
                </div>
              </div>

              {/* Environmental impact */}
              {aiData.impact && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Leaf className="text-green-600" size={20} /> Environmental Impact</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "CO₂ Reduced",       value: aiData.impact.co2Reduced,       unit: "Tons",    bg: "bg-green-50",  border: "border-green-100",  color: "text-green-700"  },
                      { label: "Burning Prevented",  value: aiData.impact.burningPrevented, unit: "Tons",    bg: "bg-orange-50", border: "border-orange-100", color: "text-orange-700" },
                      { label: "Air Quality",        value: aiData.impact.airQuality,       unit: "Impact",  bg: "bg-blue-50",   border: "border-blue-100",   color: "text-blue-700"   },
                      { label: "Households Helped",  value: aiData.impact.householdsHelped || "—", unit: "cleaner air", bg: "bg-purple-50", border: "border-purple-100", color: "text-purple-700" },
                    ].map(({ label, value, unit, bg, border, color }) => (
                      <div key={label} className={`${bg} p-4 rounded-xl border ${border} text-center`}>
                        <p className="text-xs text-gray-500 uppercase mb-1">{label}</p>
                        <p className={`text-2xl font-bold ${color}`}>{value}</p>
                        <p className="text-xs text-gray-400">{unit}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Summary strip */}
              {aiData.summary && (
                <div className="bg-gray-900 text-white rounded-2xl p-5 flex flex-wrap gap-6 justify-between items-center">
                  {[
                    { label: "Alternatives Found", value: aiData.summary.totalAlternatives, color: "text-white" },
                    { label: "Best ROI",           value: `${aiData.summary.bestROI}%`,     color: "text-green-400" },
                    { label: "Savings vs Burning", value: aiData.summary.savingsVsBurning,  color: "text-yellow-400" },
                    { label: "Worst Option",        value: aiData.summary.worstOption || "Burning", color: "text-red-400" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="text-center">
                      <p className="text-gray-400 text-xs uppercase">{label}</p>
                      <p className={`text-2xl font-bold ${color}`}>{value}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          RESIDUE SCANNER TAB
      ═══════════════════════════════════════════════════════════ */}
      {activeTab === "residue" && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-teal-600 to-green-500 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-4">
              <div className="bg-white bg-opacity-20 rounded-xl p-3"><ScanLine size={32} /></div>
              <div>
                <h2 className="text-2xl font-bold">Visual Residue Scanner</h2>
                <p className="text-teal-100 text-sm mt-1">Upload post-harvest field photos · AI analyzes residue quantity & market value</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2"><Camera size={20} className="text-teal-600" /> Upload Field Images</h3>
              {(selectedImages.length > 0 || imageResult) && (
                <button onClick={resetResidueScanner} className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition">
                  <X size={14} /> Reset
                </button>
              )}
            </div>
            <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center cursor-pointer hover:border-teal-400 hover:bg-teal-50 transition group">
              <div className="bg-gray-100 group-hover:bg-teal-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 transition">
                <Upload size={28} className="text-gray-400 group-hover:text-teal-600 transition" />
              </div>
              <p className="text-gray-600 font-semibold">Click to upload field images</p>
              <p className="text-gray-400 text-sm mt-1">JPEG, PNG, WEBP · Max 10MB each · Up to 5 images</p>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={handleImageSelect} />
            </div>

            {imagePreviews.length > 0 && (
              <div className="mt-6">
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {imagePreviews.map((preview, i) => (
                    <div key={i} className="relative rounded-xl overflow-hidden border border-gray-200 group shadow-sm">
                      <img src={preview} alt={`Field ${i + 1}`} className="w-full h-28 object-cover" />
                      <button onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"><X size={14} /></button>
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-40 text-white text-xs text-center py-1">Image {i + 1}</div>
                    </div>
                  ))}
                  {imagePreviews.length < 5 && (
                    <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-300 rounded-xl h-28 flex flex-col items-center justify-center cursor-pointer hover:border-teal-400 hover:bg-teal-50 transition">
                      <ImageIcon size={22} className="text-gray-400 mb-1" /><span className="text-xs text-gray-400">Add more</span>
                    </div>
                  )}
                </div>
                <button onClick={handleEstimateResidue} disabled={imageLoading}
                  className="mt-5 w-full bg-teal-600 text-white py-3 rounded-xl font-bold hover:bg-teal-700 flex items-center justify-center gap-2 transition disabled:opacity-60">
                  {imageLoading ? <><Loader className="animate-spin" size={20} /> Analyzing Images...</> : <><Camera size={20} /> Estimate Residue from Images</>}
                </button>
              </div>
            )}

            {imageResult && (
              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-2 text-green-700 font-bold text-lg"><CheckCircle size={22} /> Analysis Complete</div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Estimated Residue", value: `${imageResult.estimatedResidueTons} Tons`, bg: "bg-green-50 border-green-100", color: "text-green-700" },
                    { label: "Potential Value",   value: imageResult.potentialValue,                 bg: "bg-yellow-50 border-yellow-100",color: "text-yellow-700" },
                    { label: "Residue Coverage",  value: `${imageResult.residueCoveragePercent}%`,   bg: "bg-blue-50 border-blue-100",   color: "text-blue-700"   },
                    { label: "AI Confidence",     value: imageResult.confidence,                     bg: "bg-purple-50 border-purple-100",color: confidenceBg(imageResult.confidence).includes("green") ? "text-green-600" : "text-yellow-600" },
                  ].map(({ label, value, bg, color }) => (
                    <div key={label} className={`${bg} p-4 rounded-xl border`}>
                      <p className="text-xs text-gray-500 uppercase mb-1">{label}</p>
                      <p className={`text-2xl font-bold ${color}`}>{value}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-gray-50 rounded-xl p-5 space-y-3">
                  {[["Residue Type", imageResult.residueType], ["Residue Density", imageResult.residueDensity], ["Field Condition", imageResult.fieldCondition], ["Harvest Quality", imageResult.harvestQuality]].map(([l, v]) => (
                    <div key={l} className="flex justify-between text-sm"><span className="text-gray-500">{l}</span><span className="font-semibold">{v}</span></div>
                  ))}
                </div>
                <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                  <p className="text-xs font-bold text-green-800 uppercase mb-2">💡 Recommended Action</p>
                  <p className="text-green-900 font-medium">{imageResult.recommendedAction}</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                  <p className="text-xs font-bold text-blue-800 uppercase mb-2">🔍 AI Observations</p>
                  <p className="text-blue-900 text-sm">{imageResult.observations}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          HISTORY TAB
      ═══════════════════════════════════════════════════════════ */}
      {activeTab === "history" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Report History</h2>
              <p className="text-sm text-gray-500 mt-1">{history.length} report(s) saved locally</p>
            </div>
            <div className="flex gap-2">
              {["all", ...new Set(history.map(h => h.cropName))].slice(0, 6).map(f => (
                <button key={f} onClick={() => setHistoryFilter(f)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition font-semibold ${historyFilter === f ? "bg-green-600 text-white border-green-600" : "bg-white text-gray-600 border-gray-300 hover:border-green-400"}`}>
                  {f === "all" ? "All" : f}
                </button>
              ))}
              {history.length > 0 && (
                <button onClick={clearAllHistory} className="text-xs px-3 py-1.5 rounded-full border border-red-300 text-red-500 hover:bg-red-50 font-semibold">Clear All</button>
              )}
            </div>
          </div>

          {history.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl shadow-sm border border-dashed border-gray-300 text-center">
              <History size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-medium text-gray-600">No History Yet</h3>
              <button onClick={() => navigate("/dashboard?tab=ai")} className="mt-4 bg-green-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-green-700">Generate First Report</button>
            </div>
          ) : (
            <div className="space-y-4">
              {history.filter(e => historyFilter === "all" || e.cropName === historyFilter).map((entry) => {
                const isExpanded = expandedHistoryId === entry.id;
                const top3 = (entry.aiData?.roiTable || []).slice(0, 3);
                return (
                  <div key={entry.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-5 flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition" onClick={() => setExpandedHistoryId(isExpanded ? null : entry.id)}>
                      <div className="bg-green-100 rounded-xl p-3 flex-shrink-0"><Leaf size={22} className="text-green-700" /></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <p className="font-bold text-gray-800">{entry.cropName}</p>
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">Best: {entry.aiData?.bestMethod}</span>
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">ROI: {entry.aiData?.roiTable?.[0]?.roi}%</span>
                          <span className="text-xs text-gray-400">{entry.farmProfile?.landArea} Acres · {entry.location}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{new Date(entry.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button title="View Report" onClick={() => loadHistoryReport(entry)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"><Eye size={16} /></button>
                        <button title="Regenerate" onClick={() => regenerateFromHistory(entry)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"><RefreshCw size={16} /></button>
                        {/* ─── NEW: Post from History Button ─── */}
                        <button title="Post this residue listing" onClick={() => prefillPostFromHistory(entry)}
                          className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition border border-orange-200" title="Create listing from this report">
                          <Package size={16} />
                        </button>
                        <button title="Download CSV" onClick={() => downloadCSV(entry)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"><FileSpreadsheet size={16} /></button>
                        <button title="Download PDF" onClick={() => downloadPDF(entry)} className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition"><FileText size={16} /></button>
                        <button title="Delete" onClick={() => deleteHistoryEntry(entry.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 size={16} /></button>
                        <span className="text-gray-400 ml-1">{isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</span>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-gray-100 p-5 space-y-4 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {top3.map((row, i) => (
                            <div key={i} className={`rounded-xl p-4 border ${i === 0 ? "bg-green-50 border-green-200" : "bg-white border-gray-200"}`}>
                              <div className="flex items-center gap-2 mb-2">
                                <span>{i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}</span>
                                <span className="font-semibold text-sm">{row.method}</span>
                              </div>
                              <p className="text-xl font-extrabold text-green-700">{row.roi}% ROI</p>
                              <p className="text-xs text-gray-500">Profit: Rs {Number(row.profit).toLocaleString("en-IN")}</p>
                            </div>
                          ))}
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-200">
                          <p className="text-xs font-bold text-gray-500 uppercase mb-3">Farm Profile Used</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            {[["Crop", entry.cropName], ["Land", `${entry.farmProfile?.landArea} Acres`], ["Soil", entry.farmProfile?.soilType || "—"], ["Season", entry.farmProfile?.season || "—"]].map(([l, v]) => (
                              <div key={l}><span className="text-gray-400">{l}:</span> <span className="font-semibold">{v}</span></div>
                            ))}
                          </div>
                        </div>
                        {/* Post from history CTA */}
                        <div className="flex flex-wrap gap-3">
                          <button onClick={() => loadHistoryReport(entry)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition text-sm"><Eye size={16} /> View Full Report</button>
                          <button onClick={() => regenerateFromHistory(entry)} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition text-sm"><RefreshCw size={16} /> Edit & Regenerate</button>
                          <button onClick={() => prefillPostFromHistory(entry)} className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-600 transition text-sm"><Package size={16} /> Post This Residue</button>
                          <button onClick={() => downloadCSV(entry)} className="flex items-center gap-2 border border-green-600 text-green-700 px-4 py-2 rounded-lg font-semibold hover:bg-green-50 transition text-sm"><FileSpreadsheet size={16} /> CSV</button>
                          <button onClick={() => downloadPDF(entry)} className="flex items-center gap-2 border border-purple-600 text-purple-700 px-4 py-2 rounded-lg font-semibold hover:bg-purple-50 transition text-sm"><FileText size={16} /> PDF</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          POST RESIDUE TAB
      ═══════════════════════════════════════════════════════════ */}
      {activeTab === "post" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Package size={24} className="text-green-600" /> Post Your Residue</h2>
              <p className="text-sm text-gray-500 mt-1">List your available crop residue so buyers can find and contact you</p>
            </div>
            <button onClick={() => { setShowPostForm(!showPostForm); setEditingPost(null); setPostFormSource("manual"); setPostForm({ cropType: "", residueType: "", estimatedQuantity: "", pricePerTon: "", season: "", contactMessage: "", bestMethod: "", estimatedProfit: "", roiPercent: "", biomassValue: "" }); }}
              className="bg-green-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-green-700 flex items-center gap-2">
              <Plus size={18} /> New Listing
            </button>
          </div>

          {/* Status filter tabs */}
          <div className="flex gap-2 flex-wrap">
            {[
              { key: "all",     label: "All",     count: myPosts.length },
              { key: "active",  label: "Active",  count: myPosts.filter(p => p.status === "active").length },
              { key: "sold",    label: "Sold",    count: myPosts.filter(p => p.status === "sold").length },
              { key: "expired", label: "Expired", count: myPosts.filter(p => p.status === "expired").length },
            ].map(({ key, label, count }) => (
              <button key={key} onClick={() => setPostStatusFilter(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm border transition ${postStatusFilter === key ? "bg-green-600 text-white border-green-600" : "bg-white text-gray-600 border-gray-300 hover:border-green-400"}`}>
                {label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${postStatusFilter === key ? "bg-white text-green-700" : "bg-gray-100 text-gray-600"}`}>{count}</span>
              </button>
            ))}
          </div>

          {/* Post Form */}
          {showPostForm && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-gray-800">
                  {editingPost ? "✏️ Edit Listing" : "📝 New Residue Listing"}
                </h3>
                {/* Source toggle */}
                <div className="flex gap-2">
                  <button onClick={() => setPostFormSource("manual")}
                    className={`text-xs px-3 py-1.5 rounded-lg font-semibold border transition ${postFormSource === "manual" ? "bg-green-600 text-white border-green-600" : "bg-white text-gray-600 border-gray-300"}`}>
                    Manual Entry
                  </button>
                  <button
                    onClick={() => {
                      if (history.length === 0) { alert("No AI reports in history. Generate an AI report first."); return; }
                      prefillPostFromHistory(history[0]);
                    }}
                    className={`text-xs px-3 py-1.5 rounded-lg font-semibold border transition ${postFormSource === "history" ? "bg-orange-500 text-white border-orange-500" : "bg-white text-orange-600 border-orange-300 hover:bg-orange-50"}`}>
                    🤖 Auto-fill from Latest Report
                  </button>
                </div>
              </div>

              {/* Auto-fill banner */}
              {postFormSource === "history" && (
                <div className="mb-4 bg-orange-50 border border-orange-200 rounded-xl p-3 flex items-center gap-2 text-sm text-orange-800">
                  <CheckCircle size={16} className="text-orange-500 flex-shrink-0" />
                  Auto-filled from your latest AI report — review and edit before publishing.
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Crop Type *</label>
                  <select value={postForm.cropType} onChange={(e) => setPostForm({ ...postForm, cropType: e.target.value })} className="w-full p-3 border rounded-lg text-sm">
                    <option value="">-- Select Crop --</option>
                    {CROP_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Residue Type</label>
                  <input value={postForm.residueType} onChange={(e) => setPostForm({ ...postForm, residueType: e.target.value })} placeholder="e.g. Wheat Straw, Rice Husk..." className="w-full p-3 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Estimated Quantity (tons) *</label>
                  <input  type="number" value={postForm.estimatedQuantity} 
  onChange={(e) => {
    const val = e.target.value;
    // Prevent updating state if value is negative
    if (val < 0) return; 
    setPostForm({ ...postForm, estimatedQuantity: val });
  }} 
  placeholder="e.g. 5" 
  min="0" // HTML validation
  step="0.1" 
  className="w-full p-3 border rounded-lg text-sm" 
/>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Asking Price (Rs/ton) <span className="text-gray-400 font-normal">optional</span></label>
                  <input 
  type="number" 
  value={postForm.pricePerTon} 
  onChange={(e) => {
    const val = e.target.value;
    // Prevent updating state if value is negative
    if (val < 0) return;
    setPostForm({ ...postForm, pricePerTon: val });
  }} 
  placeholder="Leave blank for negotiable" 
  min="0" // HTML validation
  className="w-full p-3 border rounded-lg text-sm" 
/>
</div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Season</label>
                  <select value={postForm.season} onChange={(e) => setPostForm({ ...postForm, season: e.target.value })} className="w-full p-3 border rounded-lg text-sm">
                    <option value="">-- Select Season --</option>
                    {SEASON_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Message to Buyers</label>
                  <input value={postForm.contactMessage} onChange={(e) => setPostForm({ ...postForm, contactMessage: e.target.value })} placeholder="Any additional info for buyers..." className="w-full p-3 border rounded-lg text-sm" />
                </div>
              </div>

              {/* AI Data preview */}
              {(postForm.bestMethod || postForm.roiPercent) && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4 text-sm">
                  <p className="font-semibold text-green-800 mb-2">✅ AI Data attached to this listing:</p>
                  <div className="flex gap-4 flex-wrap text-xs">
                    {postForm.bestMethod      && <span>Best Method: <strong>{postForm.bestMethod}</strong></span>}
                    {postForm.roiPercent      && <span>ROI: <strong>{postForm.roiPercent}%</strong></span>}
                    {postForm.estimatedProfit && <span>Profit: <strong>{postForm.estimatedProfit}</strong></span>}
                    {postForm.biomassValue    && <span>Biomass Value: <strong>{postForm.biomassValue}</strong></span>}
                  </div>
                </div>
              )}

              <div className="mt-5 flex gap-3">
                <button onClick={createPost} disabled={postSaving}
                  className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 disabled:opacity-60 flex items-center justify-center gap-2">
                  {postSaving ? <Loader size={18} className="animate-spin" /> : <Package size={18} />}
                  {editingPost ? "Update Listing" : "Publish Listing"}
                </button>
                <button onClick={() => { setShowPostForm(false); setEditingPost(null); }} className="px-5 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300">Cancel</button>
              </div>
            </div>
          )}

          {/* My Posts List with filter */}
          {postsLoading ? (
            <div className="flex items-center justify-center py-16"><Loader className="animate-spin text-green-600" size={28} /></div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
              <Package size={48} className="mx-auto text-gray-300 mb-3" />
              <h3 className="font-medium text-gray-600">
                {postStatusFilter === "all" ? "No listings yet" : `No ${postStatusFilter} listings`}
              </h3>
              <p className="text-gray-400 text-sm mt-1">
                {postStatusFilter === "all" ? "Post your crop residue to start connecting with buyers." : `No posts with status "${postStatusFilter}".`}
              </p>
              {postStatusFilter === "all" && (
                <button onClick={() => setShowPostForm(true)} className="mt-4 bg-green-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-green-700">Create First Listing</button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map(post => (
                <div key={post._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div>
                      <div className="flex items-center gap-3 flex-wrap mb-1">
                        <h3 className="font-bold text-gray-800 text-lg">{post.cropType}</h3>
                        {post.residueType && <span className="text-sm text-gray-500">— {post.residueType}</span>}
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                          post.status === "active" ? "bg-green-100 text-green-700"
                          : post.status === "sold" ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-600"
                        }`}>{post.status}</span>
                      </div>
                      <p className="text-gray-500 text-sm">{post.estimatedQuantity} tons · {post.pricePerTon ? `Rs ${Number(post.pricePerTon).toLocaleString("en-IN")}/ton` : "Negotiable"} · {post.season || ""}</p>
                    </div>
                    {/* Action buttons */}
                    <div className="flex gap-2 flex-wrap">
                      {post.status === "active" && (
                        <>
                          <button onClick={() => startEditPost(post)} className="text-xs border border-blue-400 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50 font-semibold flex items-center gap-1">
                            <Edit3 size={12} /> Edit
                          </button>
                          <button onClick={() => updatePostStatus(post._id, "sold")} className="text-xs border border-green-400 text-green-600 px-3 py-1.5 rounded-lg hover:bg-green-50 font-semibold">
                            Mark Sold
                          </button>
                          <button onClick={() => updatePostStatus(post._id, "expired")} className="text-xs border border-gray-400 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 font-semibold">
                            Mark Expired
                          </button>
                        </>
                      )}
                      <button onClick={() => deletePost(post._id)} className="text-xs border border-red-300 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 flex items-center gap-1">
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </div>

                  {/* AI data row */}
                  {post.bestMethod && (
                    <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      {[["Best Method", post.bestMethod], ["Profit", post.estimatedProfit || "—"], ["ROI", post.roiPercent ? `${post.roiPercent}%` : "—"], ["Biomass Value", post.biomassValue || "—"]].map(([label, val]) => (
                        <div key={label} className="bg-green-50 rounded-lg p-2">
                          <p className="text-gray-400 uppercase">{label}</p>
                          <p className="font-bold text-green-700 truncate">{val}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Interested buyers */}
                  {post.interestedBuyers?.length > 0 && (
                    <div className="mt-4 border-t pt-4">
                      <p className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <Bell size={14} className="text-yellow-500" /> {post.interestedBuyers.length} Buyer(s) Interested
                      </p>
                      <div className="space-y-2">
                        {post.interestedBuyers.map((b, i) => (
                          <div key={i} className="bg-teal-50 rounded-xl p-3 flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-sm">{b.name}</p>
                              {b.message && <p className="text-xs text-gray-500 mt-0.5">"{b.message}"</p>}
                            </div>
                            <a href={`tel:${b.phone}`} className="flex items-center gap-1 bg-teal-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-teal-700">
                              <Phone size={12} /> {b.phone}
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-3">Posted {new Date(post.createdAt).toLocaleDateString("en-IN")}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          FIND BUYERS TAB
      ═══════════════════════════════════════════════════════════ */}
      {activeTab === "buyers" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Users size={24} className="text-green-600" /> Find Buyers</h2>
              <p className="text-sm text-gray-500 mt-1">Registered buyers near your location · sorted by distance · full contact info</p>
            </div>
            <button onClick={fetchBuyers} className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-50"><RefreshCw size={15} /> Refresh</button>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-100 flex gap-2 flex-wrap">
            {["All", "Wheat Straw", "Rice Husk / Paddy Straw", "Compost", "Biochar", "Pellets", "Animal Feed / Straw Bales", "Any"].map(f => (
              <button key={f} onClick={() => { setBuyerMaterialFilter(f); fetchBuyers(); }}
                className={`text-xs px-3 py-1.5 rounded-full font-semibold border transition ${buyerMaterialFilter === f ? "bg-green-600 text-white border-green-600" : "bg-white text-gray-600 border-gray-300 hover:border-green-400"}`}>
                {f}
              </button>
            ))}
          </div>

          {buyersLoading ? (
            <div className="flex items-center justify-center py-20"><Loader className="animate-spin text-green-600" size={28} /></div>
          ) : buyers.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
              <Users size={48} className="mx-auto text-gray-300 mb-3" />
              <h3 className="font-medium text-gray-600">No buyers found</h3>
              <p className="text-gray-400 text-sm mt-1">No registered buyers in your area yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {buyers.map((b, i) => {
                const bp = b.buyerProfile;
                return (
                  <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-teal-600 to-teal-500 p-4 text-white">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-lg">{bp?.businessName || b.fullName}</h3>
                          <p className="text-teal-100 text-sm">{bp?.businessType || "Buyer"}</p>
                        </div>
                        {b.distanceKm !== null && b.distanceKm !== undefined && (
                          <span className="bg-white bg-opacity-20 text-white text-sm font-bold px-3 py-1 rounded-full">{b.distanceKm} km</span>
                        )}
                      </div>
                    </div>
                    <div className="p-4 space-y-3">
                      {/* Contact info — always visible */}
                      <div className="bg-teal-50 rounded-xl p-3 border border-teal-100">
                        <p className="text-xs font-bold text-teal-800 uppercase mb-2">Contact Details</p>
                        <div className="space-y-1.5 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500">Name:</span>
                            <span className="font-semibold">{bp?.contactPerson || b.fullName}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500">Phone:</span>
                            <a href={`tel:${b.phoneNumber}`} className="font-bold text-teal-700 flex items-center gap-1">
                              <Phone size={13} /> {b.phoneNumber}
                            </a>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-500">Location:</span>
                            <span className="font-semibold text-xs">{b.location?.district || "—"}, {b.location?.state || "—"}{b.location?.pincode ? ` · ${b.location.pincode}` : ""}</span>
                          </div>
                          {bp?.workingDays && (
                            <div className="flex items-center justify-between">
                              <span className="text-gray-500">Works:</span>
                              <span className="font-semibold text-xs">{bp.workingDays}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {bp?.materialTypes?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {bp.materialTypes.map(m => (
                            <span key={m} className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-full font-medium">{m}</span>
                          ))}
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {bp?.pricePerTon && <div className="bg-green-50 rounded-lg p-2"><p className="text-gray-400">Offers</p><p className="font-bold text-green-700">Rs {Number(bp.pricePerTon).toLocaleString("en-IN")}/ton</p></div>}
                        {bp?.minQuantity && <div className="bg-blue-50 rounded-lg p-2"><p className="text-gray-400">Min Qty</p><p className="font-bold text-blue-700">{bp.minQuantity} tons</p></div>}
                        {bp?.maxDistanceKm && <div className="bg-purple-50 rounded-lg p-2"><p className="text-gray-400">Covers</p><p className="font-bold text-purple-700">{bp.maxDistanceKm} km</p></div>}
                        {bp?.paymentTerms && <div className="bg-yellow-50 rounded-lg p-2"><p className="text-gray-400">Payment</p><p className="font-bold text-yellow-700 truncate">{bp.paymentTerms}</p></div>}
                      </div>

                      {bp?.pickupAvailable && (
                        <p className="text-xs text-green-600 font-semibold flex items-center gap-1"><CheckCircle size={12} /> Pickup Available</p>
                      )}

                      <a href={`tel:${b.phoneNumber}`} className="w-full flex items-center justify-center gap-2 bg-teal-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-teal-700">
                        <Phone size={14} /> Call {bp?.contactPerson || b.fullName}
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          MAP TAB — with nearby buyers list + contact info
      ═══════════════════════════════════════════════════════════ */}
      {activeTab === "map" && (
        <div className="space-y-5">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Map View — Nearby Buyers</h2>
            <p className="text-sm text-gray-500 mt-1">Your farm location and registered buyers near you</p>
          </div>

          {/* Map iframe */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {user?.location?.lat && user?.location?.lng ? (
              <>
                <div className="p-4 bg-green-50 border-b border-green-100 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-sm text-green-800">
                    <MapPin size={16} className="text-green-600" />
                    Your GPS Location: {user.location.lat}, {user.location.lng}
                    {user.location.pincode && ` · Pincode: ${user.location.pincode}`}
                  </div>
                  <span className="text-xs bg-green-600 text-white px-3 py-1 rounded-full font-bold">
                    {mapBuyers.length} nearby buyer(s)
                  </span>
                </div>
                <iframe
                  title="Farm Map"
                  width="100%"
                  height="420"
                  style={{ border: 0 }}
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(user.location.lng) - 0.5},${parseFloat(user.location.lat) - 0.5},${parseFloat(user.location.lng) + 0.5},${parseFloat(user.location.lat) + 0.5}&layer=mapnik&marker=${user.location.lat},${user.location.lng}`}
                />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <Navigation size={48} className="mb-4 text-gray-300" />
                <p className="font-medium text-gray-600">GPS Location Not Available</p>
                <p className="text-sm mt-1 text-center max-w-sm">Register with GPS to enable map features.</p>
              </div>
            )}
          </div>

          {/* Nearby Buyers — contact cards */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Users size={20} className="text-teal-600" /> Nearby Registered Buyers
              {mapBuyersLoading && <Loader size={16} className="animate-spin text-gray-400 ml-2" />}
            </h3>

            {mapBuyers.length === 0 && !mapBuyersLoading ? (
              <div className="bg-gray-50 rounded-xl p-8 text-center border border-dashed border-gray-300">
                <Users size={36} className="mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500 font-medium">No registered buyers found nearby</p>
                <p className="text-gray-400 text-sm mt-1">As buyers register on Crop2Cash, they will appear here with full contact details.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mapBuyers.map((b, i) => {
                  const bp = b.buyerProfile;
                  return (
                    <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-bold text-gray-800">{bp?.businessName || b.fullName}</p>
                          <p className="text-xs text-gray-500">{bp?.businessType || "Buyer"}</p>
                        </div>
                        {b.distanceKm !== null && b.distanceKm !== undefined && (
                          <span className="text-xs bg-teal-100 text-teal-700 font-bold px-2 py-1 rounded-full flex-shrink-0">{b.distanceKm} km</span>
                        )}
                      </div>

                      {/* Contact info */}
                      <div className="bg-gray-50 rounded-lg p-3 text-xs space-y-1.5">
                        <div className="flex justify-between"><span className="text-gray-400">Contact:</span><span className="font-semibold">{bp?.contactPerson || b.fullName}</span></div>
                        <div className="flex justify-between"><span className="text-gray-400">Location:</span><span className="font-semibold">{b.location?.district || "—"}, {b.location?.state || "—"}</span></div>
                        {b.location?.pincode && <div className="flex justify-between"><span className="text-gray-400">Pincode:</span><span className="font-semibold">{b.location.pincode}</span></div>}
                        {bp?.pricePerTon && <div className="flex justify-between"><span className="text-gray-400">Offers:</span><span className="font-bold text-green-700">Rs {Number(bp.pricePerTon).toLocaleString("en-IN")}/ton</span></div>}
                      </div>

                      {bp?.materialTypes?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {bp.materialTypes.slice(0, 3).map(m => (
                            <span key={m} className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-full">{m}</span>
                          ))}
                        </div>
                      )}

                      <a href={`tel:${b.phoneNumber}`} className="w-full flex items-center justify-center gap-2 bg-teal-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-teal-700">
                        <Phone size={13} /> {b.phoneNumber}
                      </a>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SETTINGS */}
      {activeTab === "settings" && (
        <div className="text-center p-10 text-gray-500">
          <h2 className="text-xl font-bold">Settings</h2>
          <p>Coming soon...</p>
        </div>
      )}

    </DashboardLayout>
  );
}