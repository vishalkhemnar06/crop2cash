import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { API } from "../api";
import {
  LayoutDashboard, User, ShoppingBag, Bell, Settings, LogOut,
  Menu, MapPin, Package, Phone, CheckCircle, Edit3, Save, X,
  Loader, TrendingUp, TrendingDown, Leaf, Star, Clock, RefreshCw,
  Eye, MessageSquare, Navigation, AlertCircle, Users, BarChart2,
  Heart, Bookmark, Truck, Route, DollarSign, Award, Activity,
  Plus, Trash2, Minus
} from "lucide-react";

const MATERIAL_TYPES = [
  "Wheat Straw","Rice Husk / Paddy Straw","Sugarcane Bagasse","Cotton Stalks",
  "Maize Stover","Soybean Stalks","Compost","Biochar","Pellets","Briquettes",
  "Animal Feed / Straw Bales","Biogas Feedstock","Vermicompost","Any",
];
const BUSINESS_TYPES = [
  "Dairy Farm","Cattle / Gaushala","Organic Farm","Nursery / Horticulture",
  "Biochar Plant","Pellet Factory","Briquette Unit","Biogas Plant",
  "Paper / Cardboard Factory","Mushroom Farm","Composting Unit",
  "Fertilizer Company","Energy Company","Aggregator / Trader","Other",
];
const VEHICLE_TYPES = ["Mini Truck (1T)","Medium Truck (5T)","Large Truck (10T)","Tractor Trolley","Any"];
const STATUS_COLORS = {
  pending:"bg-yellow-100 text-yellow-700", quoted:"bg-blue-100 text-blue-700",
  confirmed:"bg-teal-100 text-teal-700",   in_transit:"bg-orange-100 text-orange-700",
  delivered:"bg-green-100 text-green-700", cancelled:"bg-red-100 text-red-700",
};

// ── Mini bar chart ────────────────────────────────────────────────
function BarMiniChart({ data, valueKey, labelKey, color="bg-teal-500", unit="" }) {
  const max = Math.max(...data.map(d=>d[valueKey]||0),1);
  return (
    <div className="flex items-end gap-1 h-20">
      {data.map((d,i)=>(
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full relative group">
            <div className={`${color} rounded-t transition-all`} style={{height:`${Math.max(4,(d[valueKey]||0)/max*72)}px`}}/>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-gray-800 text-white text-xs rounded px-1.5 py-0.5 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-10">
              {d[valueKey]!=null?`${unit}${Number(d[valueKey]).toLocaleString("en-IN")}`:"No data"}
            </div>
          </div>
          <span className="text-gray-400 text-xs truncate w-full text-center">{d[labelKey]}</span>
        </div>
      ))}
    </div>
  );
}

// ── Layout ────────────────────────────────────────────────────────
function BuyerLayout({ children, activeTab }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);
  const logout = () => { ["token","role","fullName"].forEach(k=>localStorage.removeItem(k)); navigate("/login"); };
  const navItems = [
    {tab:"",         icon:<LayoutDashboard size={20}/>, label:"Overview"},
    {tab:"profile",  icon:<User size={20}/>,            label:"My Profile"},
    {tab:"listings", icon:<ShoppingBag size={20}/>,     label:"Farmer Listings"},
    {tab:"favorites",icon:<Heart size={20}/>,           label:"Saved & Favorites"},
    {tab:"analytics",icon:<BarChart2 size={20}/>,       label:"Analytics"},
    {tab:"trends",   icon:<TrendingUp size={20}/>,      label:"Price Trends"},
    {tab:"logistics",icon:<Truck size={20}/>,           label:"Logistics"},
    {tab:"requests", icon:<Bell size={20}/>,            label:"My Requests"},
    {tab:"map",      icon:<MapPin size={20}/>,          label:"Map & Farmers"},
    {tab:"settings", icon:<Settings size={20}/>,        label:"Settings"},
  ];
  return (
    <div className="flex h-screen bg-gray-100">
      <aside className={`${open?"w-64":"w-20"} bg-teal-900 text-white transition-all duration-300 flex flex-col flex-shrink-0`}>
        <div className="p-4 flex items-center justify-between border-b border-teal-800 h-16">
          {open&&<div><span className="text-xl font-bold">Crop2Cash</span><div className="text-teal-400 text-xs mt-0.5">Buyer Portal</div></div>}
          <button onClick={()=>setOpen(!open)} className="p-1.5 hover:bg-teal-800 rounded-lg"><Menu size={20}/></button>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({tab,icon,label})=>(
            <button key={tab} onClick={()=>navigate(tab?`/buyer-dashboard?tab=${tab}`:"/buyer-dashboard")}
              className={`flex items-center w-full p-3 rounded-lg text-sm font-medium transition-all ${activeTab===(tab||"")?"bg-teal-700 shadow-inner":"hover:bg-teal-800"}`}>
              <span className="flex-shrink-0">{icon}</span>{open&&<span className="ml-3">{label}</span>}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-teal-800">
          <button onClick={logout} className="flex items-center w-full p-3 hover:bg-red-600 rounded-lg text-red-200 hover:text-white text-sm">
            <LogOut size={20}/>{open&&<span className="ml-3">Logout</span>}
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-8 z-10 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-800">Buyer Dashboard</h2>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500 hidden md:block">Hello, <span className="font-semibold text-gray-700">{localStorage.getItem("fullName")||"Buyer"}</span></span>
            <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold border-2 border-teal-200">{localStorage.getItem("fullName")?.charAt(0)?.toUpperCase()||"B"}</div>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">{children}</main>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────
export default function BuyerDashboard() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeTab = searchParams.get("tab")||"";

  const [user,setUser]=[useState(null)[0],useState(null)[1]];

  // Use single useState calls properly
  const [state, setState] = useState({
    user:null, buyerProfile:null, loading:true, error:null, saving:false, isEditing:false,
    listings:[], listingsLoading:false, listingFilter:"All", interestMsg:{}, showInterestForm:null,
    requests:[], requestsLoading:false,
    nearbyFarmers:[], nearbyFarmersLoading:false,
    favorites:[], favIds:{farmerIds:[],postIds:[]}, favLoading:false, favNotes:{},
    analytics:null, analyticsLoading:false,
    deals:[], showDealForm:false, dealSaving:false,
    dealForm:{cropType:"",residueType:"",quantity:"",pricePerTon:"",status:"confirmed",dealDate:new Date().toISOString().split("T")[0],deliveryDate:"",pickupLocation:"",deliveryLocation:"",transportMode:"",transportCost:"",notes:""},
    trends:null, trendsLoading:false, trendCrop:"All",
    logistics:[], logLoading:false, showLogForm:false, logEstimate:null, logEstimating:false, logSaving:false,
    logForm:{pickupAddress:"",pickupLat:"",pickupLng:"",deliveryAddress:"",deliveryLat:"",deliveryLng:"",cargoType:"",quantityTon:"",vehicleType:"Any",pickupDate:"",deliveryDate:"",notes:""},
    profileForm:{businessName:"",businessType:"",contactPerson:"",materialTypes:[],pricePerTon:"",minQuantity:"1",maxQuantity:"",maxDistanceKm:"50",pickupAvailable:false,paymentTerms:"",workingDays:"Mon-Sat",description:"",isActive:true},
  });

  const s = state;
  const upd = (patch) => setState(prev=>({...prev,...patch}));

  useEffect(()=>{ fetchCore(); },[]);
  useEffect(()=>{
    if(activeTab==="listings")  fetchListings();
    if(activeTab==="requests")  fetchRequests();
    if(activeTab==="map")       fetchNearbyFarmers();
    if(activeTab==="favorites") fetchFavorites();
    if(activeTab==="analytics") { fetchAnalytics(); fetchDeals(); }
    if(activeTab==="trends")    fetchTrends(s.trendCrop);
    if(activeTab==="logistics") fetchLogistics();
  },[activeTab]);

  const fetchCore = async () => {
    try {
      const res = await API.get("/buyer/profile/me");
      const u=res.data.user, bp=res.data.buyerProfile||{};
      const pf = {
        businessName:bp.businessName||"",businessType:bp.businessType||"",contactPerson:bp.contactPerson||"",
        materialTypes:Array.isArray(bp.materialTypes)?bp.materialTypes:[],pricePerTon:bp.pricePerTon||"",
        minQuantity:bp.minQuantity||"1",maxQuantity:bp.maxQuantity||"",maxDistanceKm:bp.maxDistanceKm||"50",
        pickupAvailable:bp.pickupAvailable||false,paymentTerms:bp.paymentTerms||"",
        workingDays:bp.workingDays||"Mon-Sat",description:bp.description||"",
        isActive:bp.isActive!==undefined?bp.isActive:true,
      };
      let favIds={farmerIds:[],postIds:[]};
      try { const fr=await API.get("/buyer-ext/favorites/ids"); favIds=fr.data; } catch{}
      upd({user:u,buyerProfile:bp,profileForm:pf,favIds,loading:false,error:null});
    } catch(err) { upd({loading:false,error:"Failed to load profile. Please refresh."}); }
  };

  const fetchListings = async () => {
    upd({listingsLoading:true});
    try {
      const u=s.user; const params={};
      if(u?.location?.lat){params.lat=u.location.lat;params.lng=u.location.lng;params.radius=s.profileForm.maxDistanceKm||200;}
      const r=await API.get("/buyer/posts/all",{params});
      upd({listings:r.data,listingsLoading:false});
    } catch{upd({listings:[],listingsLoading:false});}
  };

  const fetchRequests = async () => {
    upd({requestsLoading:true});
    try{const r=await API.get("/buyer/requests");upd({requests:r.data,requestsLoading:false});}
    catch{upd({requests:[],requestsLoading:false});}
  };

  const fetchNearbyFarmers = async () => {
    upd({nearbyFarmersLoading:true});
    try{
      const params={radius:200};
      const u=s.user;
      if(u?.location?.lat){params.lat=u.location.lat;params.lng=u.location.lng;}
      const r=await API.get("/buyer/nearby-farmers",{params});
      upd({nearbyFarmers:r.data,nearbyFarmersLoading:false});
    }catch{upd({nearbyFarmers:[],nearbyFarmersLoading:false});}
  };

  const fetchFavorites = async () => {
    upd({favLoading:true});
    try{const r=await API.get("/buyer-ext/favorites");upd({favorites:r.data,favLoading:false});}
    catch{upd({favorites:[],favLoading:false});}
  };

  const toggleFavFarmer = async (farmerId) => {
    try{
      const r=await API.post(`/buyer-ext/favorites/farmer/${farmerId}`);
      upd({favIds:{...s.favIds,farmerIds:r.data.saved?[...s.favIds.farmerIds,String(farmerId)]:s.favIds.farmerIds.filter(id=>id!==String(farmerId))}});
      if(activeTab==="favorites")fetchFavorites();
    }catch(err){alert(err.response?.data?.message||"Error");}
  };

  const toggleFavPost = async (postId) => {
    try {
      // ✅ FIX: Added {} as the second argument
      const r = await API.post(`/buyer-ext/favorites/post/${postId}`, {}); 
      
      upd({
        favIds: {
          ...s.favIds,
          postIds: r.data.saved 
            ? [...s.favIds.postIds, String(postId)] 
            : s.favIds.postIds.filter(id => id !== String(postId))
        }
      });
      
      if (activeTab === "favorites") fetchFavorites();
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  const updateFavNote = async (id) => {
    try {
      await API.put(`/buyer-ext/favorites/${id}/note`, { note: s.favNotes[id] || "" });
      fetchFavorites();
    } catch {}
  };
  const fetchAnalytics = async () => {
    upd({analyticsLoading:true});
    try{const r=await API.get("/buyer-ext/analytics");upd({analytics:r.data,analyticsLoading:false});}
    catch{upd({analytics:null,analyticsLoading:false});}
  };

  const fetchDeals = async () => {
    try{const r=await API.get("/buyer-ext/deals");upd({deals:r.data});}catch{upd({deals:[]});}
  };

  const createDeal = async () => {
    if(!s.dealForm.cropType||!s.dealForm.quantity||!s.dealForm.pricePerTon)return alert("Crop type, quantity and price required");
    upd({dealSaving:true});
    try{
      await API.post("/buyer-ext/deals",s.dealForm);
      upd({showDealForm:false,dealSaving:false,dealForm:{cropType:"",residueType:"",quantity:"",pricePerTon:"",status:"confirmed",dealDate:new Date().toISOString().split("T")[0],deliveryDate:"",pickupLocation:"",deliveryLocation:"",transportMode:"",transportCost:"",notes:""}});
      fetchDeals();fetchAnalytics();alert("Deal logged!");
    }catch(err){upd({dealSaving:false});alert(err.response?.data?.message||"Error");}
  };

  const deleteDeal = async (id) => {
    if(!confirm("Remove this deal?"))return;
    try{await API.delete(`/buyer-ext/deals/${id}`);fetchDeals();fetchAnalytics();}catch{}
  };

  const fetchTrends = async (crop="All") => {
    upd({trendsLoading:true,trendCrop:crop});
    try{const r=await API.get("/buyer-ext/analytics/price-trends",{params:{cropType:crop}});upd({trends:r.data,trendsLoading:false});}
    catch{upd({trends:null,trendsLoading:false});}
  };

  const fetchLogistics = async () => {
    upd({logLoading:true});
    try{const r=await API.get("/buyer-ext/logistics");upd({logistics:r.data,logLoading:false});}
    catch{upd({logistics:[],logLoading:false});}
  };

  const getLogEstimate = async () => {
    const lf=s.logForm;
    if(!lf.pickupLat||!lf.pickupLng||!lf.deliveryLat||!lf.deliveryLng||!lf.quantityTon)
      return alert("Enter GPS coordinates for pickup & delivery, plus quantity.");
    upd({logEstimating:true});
    try{
      const r=await API.get("/buyer-ext/logistics/estimate",{params:{pickupLat:lf.pickupLat,pickupLng:lf.pickupLng,deliveryLat:lf.deliveryLat,deliveryLng:lf.deliveryLng,quantityTon:lf.quantityTon,vehicleType:lf.vehicleType}});
      upd({logEstimate:r.data,logEstimating:false});
    }catch{upd({logEstimating:false});alert("Estimation failed");}
  };

  const useMyGPS = (field) => {
    if(!navigator.geolocation)return alert("GPS not supported");
    navigator.geolocation.getCurrentPosition(pos=>{
      const{latitude:lat,longitude:lng}=pos.coords;
      const lf=s.logForm;
      if(field==="pickup")upd({logForm:{...lf,pickupLat:lat.toFixed(6),pickupLng:lng.toFixed(6)}});
      else upd({logForm:{...lf,deliveryLat:lat.toFixed(6),deliveryLng:lng.toFixed(6)}});
    });
  };

  const useProfileLocationForDelivery = () => {
    const u=s.user;
    if(!u?.location?.lat)return alert("No GPS on your profile");
    upd({logForm:{...s.logForm,deliveryLat:String(u.location.lat),deliveryLng:String(u.location.lng),deliveryAddress:`${u.location.district||""}, ${u.location.state||""}`}});
  };

  const createLogReq = async () => {
    const lf=s.logForm;
    if(!lf.pickupAddress||!lf.deliveryAddress||!lf.quantityTon)return alert("Pickup address, delivery address, and quantity required");
    upd({logSaving:true});
    try{
      await API.post("/buyer-ext/logistics",lf);
      upd({showLogForm:false,logEstimate:null,logSaving:false,logForm:{pickupAddress:"",pickupLat:"",pickupLng:"",deliveryAddress:"",deliveryLat:"",deliveryLng:"",cargoType:"",quantityTon:"",vehicleType:"Any",pickupDate:"",deliveryDate:"",notes:""}});
      fetchLogistics();alert("Transport request submitted! Trucker assigned.");
    }catch(err){upd({logSaving:false});alert(err.response?.data?.message||"Error");}
  };

  const deleteLogReq = async (id) => {
    if(!confirm("Cancel this request?"))return;
    try{await API.delete(`/buyer-ext/logistics/${id}`);fetchLogistics();}catch{}
  };

  const saveProfile = async () => {
    upd({saving:true});
    try{
      const pf=s.profileForm;
      const payload={...pf,pricePerTon:pf.pricePerTon?parseFloat(pf.pricePerTon):null,minQuantity:pf.minQuantity?parseFloat(pf.minQuantity):1,maxQuantity:pf.maxQuantity?parseFloat(pf.maxQuantity):null,maxDistanceKm:pf.maxDistanceKm?parseFloat(pf.maxDistanceKm):50};
      const res=await API.put("/buyer/profile/update",payload);
      upd({buyerProfile:res.data,isEditing:false,saving:false});alert("Profile updated!");
    }catch(err){upd({saving:false});alert(err.response?.data?.message||"Failed");}
  };

  const toggleMaterial = (m) => {
    const cur=s.profileForm.materialTypes||[];
    upd({profileForm:{...s.profileForm,materialTypes:cur.includes(m)?cur.filter(x=>x!==m):[...cur,m]}});
  };

  const sendInterest = async (postId) => {
    try{
      await API.post(`/posts/${postId}/interest`,{message:s.interestMsg[postId]||""});
      upd({showInterestForm:null});fetchListings();alert("Interest registered!");
    }catch(err){alert(err.response?.data?.message||"Failed");}
  };

  const filteredListings = s.listings.filter(l=>s.listingFilter==="All"||(l.residueType||l.cropType)?.toLowerCase().includes(s.listingFilter.toLowerCase()));

  if(s.loading) return <div className="h-screen flex items-center justify-center"><Loader className="animate-spin mr-3 text-teal-600" size={28}/><span className="text-gray-600">Loading...</span></div>;
  if(s.error)   return <div className="h-screen flex items-center justify-center flex-col gap-4"><p className="text-red-500">{s.error}</p><button onClick={fetchCore} className="bg-teal-600 text-white px-6 py-2 rounded-lg">Retry</button></div>;

  const profileComplete=s.buyerProfile?.businessName&&s.buyerProfile?.materialTypes?.length>0;
  const pf=s.profileForm;
  const lf=s.logForm;
  const df=s.dealForm;

  return (
    <BuyerLayout activeTab={activeTab}>
{/* ══════════════════ OVERVIEW ══════════════════════════════════ */}
{activeTab===""&&(
<div className="space-y-6">
  <div className="bg-gradient-to-r from-teal-700 to-teal-500 rounded-2xl p-6 text-white shadow-lg">
    <h2 className="text-3xl font-bold mb-1">Welcome, {s.user?.fullName?.split(" ")[0]||"Buyer"} 👋</h2>
    <p className="flex items-center gap-3 opacity-90 mt-2 text-sm flex-wrap">
      <span className="flex items-center gap-1"><MapPin size={15}/>{s.user?.location?.district||"—"}, {s.user?.location?.state||"—"}</span>
      {s.user?.location?.pincode&&<span>· Pincode: {s.user.location.pincode}</span>}
      {s.buyerProfile?.businessName&&<span>· {s.buyerProfile.businessName}</span>}
    </p>
  </div>
  {!profileComplete&&(
    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
      <AlertCircle size={20} className="text-yellow-600 flex-shrink-0"/>
      <div className="flex-1"><p className="font-semibold text-yellow-800">Complete Your Buyer Profile</p><p className="text-yellow-700 text-sm">Add materials, pricing and business info.</p></div>
      <button onClick={()=>navigate("/buyer-dashboard?tab=profile")} className="bg-yellow-500 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-yellow-600">Complete</button>
    </div>
  )}
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {[
      {label:"Materials Buying",value:s.buyerProfile?.materialTypes?.length||0,sub:(s.buyerProfile?.materialTypes||[]).slice(0,2).join(", ")||"Not set",c:"text-teal-700",bg:"bg-teal-50"},
      {label:"Offer Price",value:s.buyerProfile?.pricePerTon?`Rs ${Number(s.buyerProfile.pricePerTon).toLocaleString("en-IN")}/T`:"Not set",c:"text-green-700",bg:"bg-green-50"},
      {label:"Coverage Radius",value:s.buyerProfile?.maxDistanceKm?`${s.buyerProfile.maxDistanceKm} km`:"—",sub:s.buyerProfile?.pickupAvailable?"Pickup available":"No pickup",c:"text-blue-700",bg:"bg-blue-50"},
      {label:"Saved Leads",value:(s.favIds.farmerIds?.length||0)+(s.favIds.postIds?.length||0),sub:`${s.favIds.farmerIds?.length||0} farmers · ${s.favIds.postIds?.length||0} posts`,c:"text-purple-700",bg:"bg-purple-50"},
    ].map(({label,value,sub,c,bg})=>(
      <div key={label} className={`${bg} p-5 rounded-xl border border-gray-100 shadow-sm`}>
        <p className="text-gray-500 text-xs font-bold uppercase">{label}</p>
        <p className={`text-xl font-bold mt-1 ${c}`}>{value}</p>
        {sub&&<p className="text-xs text-gray-400 mt-0.5 truncate">{sub}</p>}
      </div>
    ))}
  </div>
  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
    {[
      {tab:"listings", icon:<ShoppingBag size={20} className="text-green-700"/>, bg:"bg-green-100", title:"Browse Listings",desc:"Active crop residue from farmers near you."},
      {tab:"favorites",icon:<Heart size={20} className="text-red-600"/>,        bg:"bg-red-100",   title:"Saved & Favorites",desc:"Your saved farmers and bookmarked posts."},
      {tab:"analytics",icon:<BarChart2 size={20} className="text-blue-700"/>,   bg:"bg-blue-100",  title:"My Analytics",desc:"Deals, avg price paid, and CO₂ saved."},
      {tab:"trends",   icon:<TrendingUp size={20} className="text-teal-700"/>,  bg:"bg-teal-100",  title:"Price Trends",desc:"6-month price history from real listings."},
      {tab:"logistics",icon:<Truck size={20} className="text-orange-600"/>,     bg:"bg-orange-100",title:"Logistics",desc:"Book transport with route & cost estimate."},
      {tab:"map",      icon:<MapPin size={20} className="text-purple-700"/>,    bg:"bg-purple-100",title:"Map & Farmers",desc:"Nearby farmers with active listings."},
    ].map(({tab,icon,bg,title,desc})=>(
      <div key={tab} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm cursor-pointer hover:shadow-md transition" onClick={()=>navigate(`/buyer-dashboard?tab=${tab}`)}>
        <div className="flex items-center gap-3 mb-2"><div className={`${bg} p-2 rounded-lg`}>{icon}</div><h3 className="font-bold text-gray-800">{title}</h3></div>
        <p className="text-gray-500 text-sm">{desc}</p>
      </div>
    ))}
  </div>
</div>
)}

{/* ══════════════════ PROFILE ═══════════════════════════════════ */}
{activeTab==="profile"&&(
<div className="max-w-2xl mx-auto">
  <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold text-gray-800">My Buyer Profile</h2>
      {!s.isEditing&&<button onClick={()=>upd({isEditing:true})} className="flex items-center gap-2 text-teal-600 border border-teal-200 px-4 py-2 rounded-lg hover:bg-teal-50 font-medium"><Edit3 size={16}/>Edit</button>}
    </div>
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        {[{k:"businessName",l:"Business Name",p:"e.g. Sharma Dairy Farm"},{k:"contactPerson",l:"Contact Person",p:"Contact name"}].map(({k,l,p})=>(
          <div key={k}><label className="text-sm font-semibold text-gray-700 block mb-1">{l}</label>
          <input disabled={!s.isEditing} value={pf[k]} onChange={e=>upd({profileForm:{...pf,[k]:e.target.value}})} placeholder={p} className="w-full p-3 border rounded-lg bg-gray-50 disabled:opacity-60 text-sm"/></div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="text-sm font-semibold text-gray-700 block mb-1">Business Type</label>
        <select disabled={!s.isEditing} value={pf.businessType} onChange={e=>upd({profileForm:{...pf,businessType:e.target.value}})} className="w-full p-3 border rounded-lg bg-gray-50 disabled:opacity-60 text-sm">
          <option value="">-- Select --</option>{BUSINESS_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
        </select></div>
        <div><label className="text-sm font-semibold text-gray-700 block mb-1">Working Days</label>
        <input disabled={!s.isEditing} value={pf.workingDays} onChange={e=>upd({profileForm:{...pf,workingDays:e.target.value}})} placeholder="Mon-Sat" className="w-full p-3 border rounded-lg bg-gray-50 disabled:opacity-60 text-sm"/></div>
      </div>
      <div><label className="text-sm font-semibold text-gray-700 block mb-2">Materials I Buy</label>
      <div className="grid grid-cols-2 gap-2">
        {MATERIAL_TYPES.map(m=>(
          <label key={m} className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition text-sm ${pf.materialTypes?.includes(m)?"bg-teal-50 border-teal-400 text-teal-800":"bg-gray-50 border-gray-200 text-gray-700"} ${!s.isEditing?"pointer-events-none opacity-60":""}`}>
            <input type="checkbox" checked={pf.materialTypes?.includes(m)||false} onChange={()=>s.isEditing&&toggleMaterial(m)} className="accent-teal-600"/><span className="text-xs">{m}</span>
          </label>
        ))}
      </div></div>
      <div className="grid grid-cols-3 gap-4">
        {[{k:"pricePerTon",l:"Price (Rs/ton)",p:"e.g. 2500"},{k:"minQuantity",l:"Min Qty (tons)",p:"e.g. 5"},{k:"maxDistanceKm",l:"Max Distance (km)",p:"e.g. 50"}].map(({k,l,p})=>(
          <div key={k}><label className="text-sm font-semibold text-gray-700 block mb-1">{l}</label>
          <input type="number" disabled={!s.isEditing} value={pf[k]} onChange={e=>upd({profileForm:{...pf,[k]:e.target.value}})} placeholder={p} className="w-full p-3 border rounded-lg bg-gray-50 disabled:opacity-60 text-sm"/></div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="text-sm font-semibold text-gray-700 block mb-1">Payment Terms</label>
        <input disabled={!s.isEditing} value={pf.paymentTerms} onChange={e=>upd({profileForm:{...pf,paymentTerms:e.target.value}})} placeholder="e.g. Cash on delivery" className="w-full p-3 border rounded-lg bg-gray-50 disabled:opacity-60 text-sm"/></div>
        <div><label className="text-sm font-semibold text-gray-700 block mb-1">Pickup Facility</label>
        <select disabled={!s.isEditing} value={pf.pickupAvailable?"yes":"no"} onChange={e=>upd({profileForm:{...pf,pickupAvailable:e.target.value==="yes"}})} className="w-full p-3 border rounded-lg bg-gray-50 disabled:opacity-60 text-sm">
          <option value="no">No — farmer must deliver</option><option value="yes">Yes — we pick up</option>
        </select></div>
      </div>
      <div><label className="text-sm font-semibold text-gray-700 block mb-1">Description</label>
      <textarea disabled={!s.isEditing} rows={3} value={pf.description} onChange={e=>upd({profileForm:{...pf,description:e.target.value}})} placeholder="Tell farmers about your requirements..." className="w-full p-3 border rounded-lg bg-gray-50 disabled:opacity-60 text-sm resize-none"/></div>
      <div className="flex items-center gap-3">
        <input type="checkbox" id="isActive" disabled={!s.isEditing} checked={pf.isActive} onChange={e=>upd({profileForm:{...pf,isActive:e.target.checked}})} className="accent-teal-600 w-4 h-4"/>
        <label htmlFor="isActive" className="text-sm font-semibold text-gray-700">Profile Active (visible to farmers)</label>
      </div>
    </div>
    {s.isEditing&&(
      <div className="mt-8 flex space-x-4">
        <button onClick={saveProfile} disabled={s.saving} className="flex-1 bg-teal-600 text-white py-3 rounded-lg font-bold hover:bg-teal-700 flex justify-center items-center gap-2 disabled:opacity-60">
          {s.saving?<><Loader size={18} className="animate-spin"/>Saving...</>:<><Save size={18}/>Save Changes</>}
        </button>
        <button onClick={()=>upd({isEditing:false})} className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-bold hover:bg-gray-300">Cancel</button>
      </div>
    )}
  </div>
</div>
)}

{/* ══════════════════ LISTINGS ══════════════════════════════════ */}
{activeTab==="listings"&&(
<div className="space-y-5">
  <div className="flex items-center justify-between flex-wrap gap-3">
    <div><h2 className="text-2xl font-bold text-gray-800">Farmer Listings</h2><p className="text-sm text-gray-500 mt-1">Browse residue · ⭐ save farmers · 🔖 save posts</p></div>
    <button onClick={fetchListings} className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-50"><RefreshCw size={15}/>Refresh</button>
  </div>
  <div className="bg-white p-4 rounded-xl border border-gray-100 flex gap-2 flex-wrap">
    {["All","Wheat","Rice","Compost","Biochar","Pellets","Cotton","Sugarcane"].map(f=>(
      <button key={f} onClick={()=>upd({listingFilter:f})} className={`text-xs px-3 py-1.5 rounded-full font-semibold border transition ${s.listingFilter===f?"bg-teal-600 text-white border-teal-600":"bg-white text-gray-600 border-gray-300 hover:border-teal-400"}`}>{f}</button>
    ))}
  </div>
  {s.listingsLoading?<div className="flex items-center justify-center py-20"><Loader className="animate-spin text-teal-600" size={28}/></div>:
  filteredListings.length===0?<div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300"><Package size={48} className="mx-auto text-gray-300 mb-3"/><h3 className="font-medium text-gray-600">No listings found</h3></div>:
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {filteredListings.map((post,i)=>{
      const isFavPost=s.favIds.postIds?.includes(String(post._id));
      const isFavFarmer=s.favIds.farmerIds?.includes(String(post.farmerId?._id||post.farmerId));
      return (
        <div key={post._id||i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-500 p-4 text-white">
            <div className="flex justify-between items-start">
              <div><h3 className="font-bold text-lg">{post.cropType}</h3><p className="text-green-100 text-sm">{post.residueType||"Crop Residue"}</p></div>
              <div className="flex items-center gap-2">
                {post.distanceKm!=null&&<span className="bg-white bg-opacity-20 text-xs font-bold px-2 py-1 rounded-full">{post.distanceKm} km</span>}
                <button onClick={()=>toggleFavPost(post._id)} className={`p-1.5 rounded-full transition ${isFavPost?"bg-yellow-400 text-yellow-900":"bg-white bg-opacity-20 text-white hover:bg-yellow-400 hover:text-yellow-900"}`}>
                  <Bookmark size={14} fill={isFavPost?"currentColor":"none"}/>
                </button>
              </div>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-1 text-xs text-gray-500"><MapPin size={12}/>{post.location?.district||"—"}, {post.location?.state||"—"}{post.location?.pincode&&` · ${post.location.pincode}`}</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-green-50 rounded-lg p-2"><p className="text-gray-400">Quantity</p><p className="font-bold text-green-700">{post.estimatedQuantity} tons</p></div>
              <div className="bg-yellow-50 rounded-lg p-2"><p className="text-gray-400">Asking Price</p><p className="font-bold text-yellow-700">{post.pricePerTon?`Rs ${Number(post.pricePerTon).toLocaleString("en-IN")}/T`:"Negotiable"}</p></div>
            </div>
            {post.bestMethod&&(
              <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-xs">
                <p className="font-semibold text-green-800 mb-1">📊 AI Analysis</p>
                <div className="grid grid-cols-2 gap-1">
                  {post.bestMethod&&<div><span className="text-gray-400">Method:</span><span className="font-semibold ml-1">{post.bestMethod}</span></div>}
                  {post.estimatedProfit&&<div><span className="text-gray-400">Profit:</span><span className="font-semibold ml-1">{post.estimatedProfit}</span></div>}
                </div>
              </div>
            )}
            <div className="flex items-center justify-between">
              <button onClick={()=>toggleFavFarmer(post.farmerId?._id||post.farmerId)} className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full border font-semibold transition ${isFavFarmer?"border-pink-400 text-pink-700 bg-pink-50":"border-gray-300 text-gray-500 hover:border-pink-300"}`}>
                <Star size={11} fill={isFavFarmer?"currentColor":"none"}/>{isFavFarmer?"Farmer Saved":"Save Farmer"}
              </button>
              {post.interestedBuyers?.length>0&&<p className="text-xs text-teal-600 font-semibold">🔔 {post.interestedBuyers.length} interested</p>}
            </div>
            {s.showInterestForm===post._id?(
              <div className="space-y-2">
                <textarea rows={2} placeholder="Optional message..." className="w-full p-2 border rounded-lg text-sm resize-none" value={s.interestMsg[post._id]||""} onChange={e=>upd({interestMsg:{...s.interestMsg,[post._id]:e.target.value}})}/>
                <div className="flex gap-2">
                  <button onClick={()=>sendInterest(post._id)} className="flex-1 bg-teal-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-teal-700">Send</button>
                  <button onClick={()=>upd({showInterestForm:null})} className="px-3 py-2 text-gray-500 border rounded-lg text-sm hover:bg-gray-50"><X size={14}/></button>
                </div>
              </div>
            ):(
              <div className="flex gap-2">
                <button onClick={()=>upd({showInterestForm:post._id})} className="flex-1 bg-teal-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-teal-700 flex items-center justify-center gap-1"><MessageSquare size={14}/>Show Interest</button>
                {(post.contactPhone||post.farmerId?.phoneNumber)&&<a href={`tel:${post.contactPhone||post.farmerId?.phoneNumber}`} className="flex items-center gap-1 border border-green-500 text-green-700 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-green-50"><Phone size={14}/>Call</a>}
              </div>
            )}
          </div>
        </div>
      );
    })}
  </div>}
</div>
)}

{/* ══════════════════ SAVED & FAVORITES ════════════════════════ */}
{activeTab==="favorites"&&(
<div className="space-y-6">
  <div className="flex items-center justify-between">
    <div><h2 className="text-2xl font-bold text-gray-800">Saved & Favorites</h2><p className="text-sm text-gray-500 mt-1">Your lead book — saved farmers and interesting posts</p></div>
    <button onClick={fetchFavorites} className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-50"><RefreshCw size={15}/>Refresh</button>
  </div>
  <div className="grid grid-cols-2 gap-4">
    <div className="bg-pink-50 border border-pink-100 rounded-xl p-5 flex items-center gap-4">
      <div className="bg-pink-100 p-3 rounded-xl"><Star size={24} className="text-pink-600"/></div>
      <div><p className="text-xs font-bold text-gray-500 uppercase">Saved Farmers</p><p className="text-3xl font-bold text-pink-700">{s.favIds.farmerIds?.length||0}</p></div>
    </div>
    <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-5 flex items-center gap-4">
      <div className="bg-yellow-100 p-3 rounded-xl"><Bookmark size={24} className="text-yellow-600"/></div>
      <div><p className="text-xs font-bold text-gray-500 uppercase">Saved Posts</p><p className="text-3xl font-bold text-yellow-700">{s.favIds.postIds?.length||0}</p></div>
    </div>
  </div>
  {s.favLoading?<div className="flex items-center justify-center py-20"><Loader className="animate-spin text-teal-600" size={28}/></div>:
  s.favorites.length===0?
  <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
    <Heart size={48} className="mx-auto text-gray-300 mb-3"/><h3 className="font-medium text-gray-600">No favorites yet</h3>
    <p className="text-gray-400 text-sm mt-1">In Farmer Listings, tap ⭐ to save farmers and 🔖 to bookmark posts.</p>
    <button onClick={()=>navigate("/buyer-dashboard?tab=listings")} className="mt-4 bg-teal-600 text-white px-6 py-2 rounded-lg font-bold">Browse Listings</button>
  </div>:
  <>
    {s.favorites.filter(f=>f.type==="farmer").length>0&&(
      <div>
        <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2"><Star size={18} className="text-pink-500"/>Saved Farmers ({s.favorites.filter(f=>f.type==="farmer").length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {s.favorites.filter(f=>f.type==="farmer").map(fav=>(
            <div key={fav._id} className="bg-white rounded-xl shadow-sm border border-pink-100 p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-gray-800">{fav.farmer?.fullName||"Unknown Farmer"}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><MapPin size={11}/>{fav.farmer?.location?.district||"—"}, {fav.farmer?.location?.state||"—"}{fav.farmer?.location?.pincode&&` · ${fav.farmer.location.pincode}`}</p>
                </div>
                <button onClick={()=>toggleFavFarmer(fav.farmerId)} className="p-1.5 hover:bg-red-50 rounded-full text-red-400 hover:text-red-600"><X size={14}/></button>
              </div>
              {fav.farmer?.phoneNumber&&<a href={`tel:${fav.farmer.phoneNumber}`} className="flex items-center gap-2 text-xs text-teal-700 font-semibold bg-teal-50 rounded-lg px-3 py-2 mb-3 hover:bg-teal-100"><Phone size={13}/>{fav.farmer.phoneNumber}</a>}
              <div className="flex gap-2">
                <input value={s.favNotes[fav._id]!==undefined?s.favNotes[fav._id]:(fav.note||"")} onChange={e=>upd({favNotes:{...s.favNotes,[fav._id]:e.target.value}})} placeholder="Add a note..." className="flex-1 text-xs border rounded-lg px-2 py-1.5 bg-gray-50"/>
                <button onClick={()=>updateFavNote(fav._id)} className="text-xs bg-teal-600 text-white px-2 rounded-lg font-bold hover:bg-teal-700">Save</button>
              </div>
              <p className="text-xs text-gray-400 mt-2">Saved {new Date(fav.createdAt).toLocaleDateString("en-IN")}</p>
            </div>
          ))}
        </div>
      </div>
    )}
    {s.favorites.filter(f=>f.type==="post").length>0&&(
      <div>
        <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2"><Bookmark size={18} className="text-yellow-500"/>Saved Posts ({s.favorites.filter(f=>f.type==="post").length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {s.favorites.filter(f=>f.type==="post").map(fav=>(
            <div key={fav._id} className="bg-white rounded-xl shadow-sm border border-yellow-100 p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-gray-800">{fav.post?.cropType||"Unknown"}{fav.post?.residueType&&<span className="text-gray-500 font-normal"> — {fav.post.residueType}</span>}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{fav.post?.estimatedQuantity}T · {fav.post?.location?.district||"—"}</p>
                </div>
                <button onClick={()=>toggleFavPost(fav.postId)} className="p-1.5 hover:bg-red-50 rounded-full text-red-400 hover:text-red-600"><X size={14}/></button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                <div className="bg-green-50 rounded p-2"><span className="text-gray-400">Qty:</span><span className="font-bold ml-1 text-green-700">{fav.post?.estimatedQuantity}T</span></div>
                <div className="bg-yellow-50 rounded p-2"><span className="text-gray-400">Price:</span><span className="font-bold ml-1 text-yellow-700">{fav.post?.pricePerTon?`Rs ${Number(fav.post.pricePerTon).toLocaleString("en-IN")}/T`:"Negotiable"}</span></div>
              </div>
              {fav.post?.farmerId&&<a href={`tel:${fav.post.farmerId.phoneNumber}`} className="flex items-center gap-2 text-xs text-green-700 font-semibold bg-green-50 rounded-lg px-3 py-2 mb-3 hover:bg-green-100"><Phone size={13}/>Call: {fav.post.farmerId.fullName} · {fav.post.farmerId.phoneNumber}</a>}
              <div className="flex gap-2">
                <input value={s.favNotes[fav._id]!==undefined?s.favNotes[fav._id]:(fav.note||"")} onChange={e=>upd({favNotes:{...s.favNotes,[fav._id]:e.target.value}})} placeholder="Add a note..." className="flex-1 text-xs border rounded-lg px-2 py-1.5 bg-gray-50"/>
                <button onClick={()=>updateFavNote(fav._id)} className="text-xs bg-teal-600 text-white px-2 rounded-lg font-bold hover:bg-teal-700">Save</button>
              </div>
              <p className="text-xs text-gray-400 mt-2">Saved {new Date(fav.createdAt).toLocaleDateString("en-IN")}</p>
            </div>
          ))}
        </div>
      </div>
    )}
  </>}
</div>
)}

{/* ══════════════════ ANALYTICS ════════════════════════════════ */}
{activeTab==="analytics"&&(
<div className="space-y-6">
  <div className="flex items-center justify-between flex-wrap gap-3">
    <div><h2 className="text-2xl font-bold text-gray-800">Buyer Analytics</h2><p className="text-sm text-gray-500 mt-1">Real data from your logged deals</p></div>
    <button onClick={()=>{fetchAnalytics();fetchDeals();}} className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-50"><RefreshCw size={15}/>Refresh</button>
  </div>
  {s.analyticsLoading?<div className="flex items-center justify-center py-20"><Loader className="animate-spin text-teal-600" size={28}/></div>:(
  <>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        {label:"Deals Done",value:s.analytics?.totalDeals||0,icon:<Award size={22}/>,c:"text-teal-700",bg:"bg-teal-50 border-teal-100",sub:"completed/confirmed"},
        {label:"Total Bought",value:s.analytics?.totalTons?`${s.analytics.totalTons}T`:"0T",icon:<Package size={22}/>,c:"text-green-700",bg:"bg-green-50 border-green-100",sub:"tons of residue"},
        {label:"Avg Price Paid",value:s.analytics?.avgPrice?`Rs ${s.analytics.avgPrice.toLocaleString("en-IN")}/T`:"—",icon:<DollarSign size={22}/>,c:"text-blue-700",bg:"bg-blue-50 border-blue-100",sub:"per ton"},
        {label:"CO₂ Saved",value:s.analytics?.co2SavedTon?`${s.analytics.co2SavedTon}T`:"0T",icon:<Leaf size={22}/>,c:"text-emerald-700",bg:"bg-emerald-50 border-emerald-100",sub:"vs. burning"},
      ].map(({label,value,icon,c,bg,sub})=>(
        <div key={label} className={`${bg} border rounded-xl p-5 shadow-sm`}>
          <div className={`${c} mb-2`}>{icon}</div>
          <p className="text-gray-500 text-xs font-bold uppercase">{label}</p>
          <p className={`text-2xl font-bold mt-1 ${c}`}>{value}</p>
          <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
        </div>
      ))}
    </div>
    {s.analytics?.monthlyTrend&&(
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><Activity size={18}/>Monthly Deal Activity — Last 6 Months</h3>
        <div className="grid grid-cols-2 gap-6">
          <div><p className="text-xs text-gray-500 mb-2 font-semibold">Deals per Month</p><BarMiniChart data={s.analytics.monthlyTrend} valueKey="deals" labelKey="label" color="bg-teal-500"/></div>
          <div><p className="text-xs text-gray-500 mb-2 font-semibold">Avg Price Paid (Rs/T)</p><BarMiniChart data={s.analytics.monthlyTrend.map(m=>({...m,avgPrice:m.avgPrice||0}))} valueKey="avgPrice" labelKey="label" color="bg-blue-400" unit="Rs "/></div>
        </div>
      </div>
    )}
    {s.analytics?.cropBreakdown&&Object.keys(s.analytics.cropBreakdown).length>0&&(
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><BarChart2 size={18}/>Purchases by Crop Type</h3>
        <div className="space-y-3">
          {Object.entries(s.analytics.cropBreakdown).sort((a,b)=>b[1].tons-a[1].tons).map(([crop,data])=>{
            const maxT=Math.max(...Object.values(s.analytics.cropBreakdown).map(d=>d.tons),1);
            return (
              <div key={crop}>
                <div className="flex justify-between text-sm mb-1"><span className="font-semibold text-gray-700">{crop}</span><span className="text-gray-400">{data.deals} deals · {data.tons}T · Rs {data.spent.toLocaleString("en-IN")}</span></div>
                <div className="bg-gray-100 rounded-full h-2.5"><div className="bg-teal-500 h-2.5 rounded-full" style={{width:`${(data.tons/maxT)*100}%`}}/></div>
              </div>
            );
          })}
        </div>
      </div>
    )}
    {(s.analytics?.totalTons||0)>0&&(
      <div className="bg-gradient-to-r from-emerald-600 to-green-500 rounded-2xl p-6 text-white">
        <h3 className="font-bold text-xl mb-1 flex items-center gap-2"><Leaf size={20}/>Your Environmental Impact</h3>
        <p className="opacity-90 text-sm mb-4">By buying residue instead of letting farmers burn it:</p>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-white bg-opacity-15 rounded-xl p-4"><p className="text-3xl font-bold">{s.analytics.co2SavedTon||0}T</p><p className="text-xs opacity-80 mt-1">CO₂ Saved</p></div>
          <div className="bg-white bg-opacity-15 rounded-xl p-4"><p className="text-3xl font-bold">{s.analytics.totalTons||0}T</p><p className="text-xs opacity-80 mt-1">Residue Diverted from Burning</p></div>
          <div className="bg-white bg-opacity-15 rounded-xl p-4"><p className="text-3xl font-bold">{s.analytics.totalDeals||0}</p><p className="text-xs opacity-80 mt-1">Farmers Supported</p></div>
        </div>
      </div>
    )}
  </>)}
  {/* Log a deal */}
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-bold text-gray-700 flex items-center gap-2"><Plus size={18}/>Log a Deal</h3>
      <button onClick={()=>upd({showDealForm:!s.showDealForm})} className="text-sm text-teal-600 font-semibold border border-teal-200 px-3 py-1.5 rounded-lg hover:bg-teal-50">{s.showDealForm?"Cancel":"+ Add Deal"}</button>
    </div>
    {s.showDealForm&&(
      <div className="space-y-4 border-t border-gray-100 pt-4">
        <div className="grid grid-cols-2 gap-3">
          {[{k:"cropType",l:"Crop Type *",p:"e.g. Wheat"},{k:"residueType",l:"Residue Type",p:"e.g. Wheat Straw"},{k:"quantity",l:"Quantity (tons) *",p:"e.g. 10",type:"number"},{k:"pricePerTon",l:"Price/ton (Rs) *",p:"e.g. 2500",type:"number"},{k:"pickupLocation",l:"Pickup Location",p:"Village/District"},{k:"deliveryLocation",l:"Delivery Location",p:"Your location"}].map(({k,l,p,type})=>(
            <div key={k}><label className="text-xs font-semibold text-gray-600 block mb-1">{l}</label>
            <input type={type||"text"} value={df[k]} onChange={e=>upd({dealForm:{...df,[k]:e.target.value}})} placeholder={p} className="w-full p-2.5 border rounded-lg text-sm"/></div>
          ))}
          <div><label className="text-xs font-semibold text-gray-600 block mb-1">Deal Date</label><input type="date" value={df.dealDate} onChange={e=>upd({dealForm:{...df,dealDate:e.target.value}})} className="w-full p-2.5 border rounded-lg text-sm"/></div>
          <div><label className="text-xs font-semibold text-gray-600 block mb-1">Status</label>
          <select value={df.status} onChange={e=>upd({dealForm:{...df,status:e.target.value}})} className="w-full p-2.5 border rounded-lg text-sm">
            {["negotiating","confirmed","completed","cancelled"].map(s2=><option key={s2} value={s2}>{s2}</option>)}
          </select></div>
        </div>
        <input value={df.notes} onChange={e=>upd({dealForm:{...df,notes:e.target.value}})} placeholder="Notes..." className="w-full p-2.5 border rounded-lg text-sm"/>
        {df.quantity&&df.pricePerTon&&<div className="bg-teal-50 rounded-lg p-3 text-sm font-semibold text-teal-800">💰 Value: Rs {(parseFloat(df.quantity||0)*parseFloat(df.pricePerTon||0)).toLocaleString("en-IN")} · 🌿 CO₂ Saved: ~{Math.round(parseFloat(df.quantity||0)*1.5*10)/10}T</div>}
        <button onClick={createDeal} disabled={s.dealSaving} className="w-full bg-teal-600 text-white py-3 rounded-lg font-bold hover:bg-teal-700 disabled:opacity-60 flex justify-center items-center gap-2">
          {s.dealSaving?<><Loader size={16} className="animate-spin"/>Logging...</>:<><Plus size={16}/>Log This Deal</>}
        </button>
      </div>
    )}
    {s.deals.length>0&&(
      <div className="mt-4 space-y-2">
        <p className="text-xs font-bold text-gray-500 uppercase">Recent Deals</p>
        {s.deals.slice(0,5).map(d=>(
          <div key={d._id} className="flex items-center justify-between bg-gray-50 rounded-xl p-3 text-sm">
            <div><span className="font-semibold">{d.cropType}</span><span className="text-gray-400 ml-2">{d.quantity}T · Rs {Number(d.pricePerTon).toLocaleString("en-IN")}/T</span><span className={`ml-2 text-xs px-2 py-0.5 rounded-full font-bold ${d.status==="completed"?"bg-green-100 text-green-700":"bg-blue-100 text-blue-700"}`}>{d.status}</span></div>
            <div className="flex items-center gap-2"><span className="text-xs text-gray-400">{new Date(d.dealDate).toLocaleDateString("en-IN")}</span><button onClick={()=>deleteDeal(d._id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={13}/></button></div>
          </div>
        ))}
      </div>
    )}
  </div>
</div>
)}

{/* ══════════════════ PRICE TRENDS ══════════════════════════════ */}
{activeTab==="trends"&&(
<div className="space-y-6">
  <div className="flex items-center justify-between flex-wrap gap-3">
    <div><h2 className="text-2xl font-bold text-gray-800">Price History & Trends</h2><p className="text-sm text-gray-500 mt-1">6-month market prices from real farmer listings</p></div>
    <button onClick={()=>fetchTrends(s.trendCrop)} className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-50"><RefreshCw size={15}/>Refresh</button>
  </div>
  <div className="bg-white p-4 rounded-xl border border-gray-100 flex gap-2 flex-wrap">
    {["All","Wheat","Rice","Sugarcane","Cotton","Maize"].map(c=>(
      <button key={c} onClick={()=>fetchTrends(c)} className={`text-xs px-3 py-1.5 rounded-full font-semibold border transition ${s.trendCrop===c?"bg-teal-600 text-white border-teal-600":"bg-white text-gray-600 border-gray-300 hover:border-teal-400"}`}>{c}</button>
    ))}
  </div>
  {s.trendsLoading?<div className="flex items-center justify-center py-20"><Loader className="animate-spin text-teal-600" size={28}/></div>:
  !s.trends?<div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300"><BarChart2 size={48} className="mx-auto text-gray-300 mb-3"/><p className="text-gray-500">No price data yet. Will populate as farmers create listings.</p></div>:(
  <>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        {label:"Current Avg",value:s.trends.currentAvg?`Rs ${s.trends.currentAvg.toLocaleString("en-IN")}/T`:"Insufficient data",c:s.trends.priceLevel==="High"?"text-red-600":s.trends.priceLevel==="Low"?"text-green-600":"text-blue-600",bg:s.trends.priceLevel==="High"?"bg-red-50 border-red-100":s.trends.priceLevel==="Low"?"bg-green-50 border-green-100":"bg-blue-50 border-blue-100"},
        {label:"6-Month Avg",value:s.trends.sixMonthAvg?`Rs ${s.trends.sixMonthAvg.toLocaleString("en-IN")}/T`:"—",c:"text-teal-700",bg:"bg-teal-50 border-teal-100"},
        {label:"Price Level",value:s.trends.priceLevel||"Normal",c:s.trends.priceLevel==="High"?"text-red-600":s.trends.priceLevel==="Low"?"text-green-600":"text-blue-700",bg:"bg-gray-50 border-gray-100"},
        {label:"Trend",value:s.trends.trend==="rising"?"📈 Rising":s.trends.trend==="falling"?"📉 Falling":"➡️ Stable",c:"text-gray-800",bg:"bg-gray-50 border-gray-100"},
      ].map(({label,value,c,bg})=>(
        <div key={label} className={`${bg} border rounded-xl p-4 shadow-sm`}><p className="text-xs font-bold text-gray-500 uppercase">{label}</p><p className={`text-lg font-bold mt-1 ${c}`}>{value}</p></div>
      ))}
    </div>
    {s.trends.currentAvg&&s.trends.sixMonthAvg&&(
      <div className={`rounded-xl p-4 flex items-start gap-3 ${s.trends.priceLevel==="High"?"bg-red-50 border border-red-200":s.trends.priceLevel==="Low"?"bg-green-50 border border-green-200":"bg-blue-50 border border-blue-200"}`}>
        {s.trends.priceLevel==="High"?<TrendingUp size={20} className="text-red-600 flex-shrink-0 mt-0.5"/>:s.trends.priceLevel==="Low"?<TrendingDown size={20} className="text-green-600 flex-shrink-0 mt-0.5"/>:<Minus size={20} className="text-blue-600 flex-shrink-0 mt-0.5"/>}
        <div>
          <p className="font-bold text-gray-800">{s.trends.priceLevel==="High"?"Prices above 6-month average":s.trends.priceLevel==="Low"?"Prices below average — good time to buy":"Prices near 6-month average"}</p>
          <p className="text-sm text-gray-600 mt-0.5">6-month avg: Rs {s.trends.sixMonthAvg?.toLocaleString("en-IN")}/T · Current: Rs {s.trends.currentAvg?.toLocaleString("en-IN")}/T · Trend: {s.trends.trend} · Based on {s.trends.totalPostsAnalyzed} listings</p>
        </div>
      </div>
    )}
    {s.trends.months&&(
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-700 mb-5 flex items-center gap-2"><BarChart2 size={18}/>Monthly Avg Price (Rs/ton) — Last 6 Months</h3>
        <BarMiniChart data={s.trends.months.map(m=>({...m,avgPrice:m.avgPrice||0}))} valueKey="avgPrice" labelKey="label" color="bg-teal-500" unit="Rs "/>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-xs font-bold text-gray-500 border-b"><th className="text-left py-2">Month</th><th className="text-right py-2">Avg</th><th className="text-right py-2">Min</th><th className="text-right py-2">Max</th><th className="text-right py-2">Listings</th></tr></thead>
            <tbody>{s.trends.months.map(m=>(
              <tr key={m.label} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-2 font-semibold text-gray-700">{m.label}</td>
                <td className="py-2 text-right font-bold text-teal-700">{m.avgPrice?`Rs ${m.avgPrice.toLocaleString("en-IN")}`:"—"}</td>
                <td className="py-2 text-right text-green-600">{m.minPrice?`Rs ${m.minPrice.toLocaleString("en-IN")}`:"—"}</td>
                <td className="py-2 text-right text-red-500">{m.maxPrice?`Rs ${m.maxPrice.toLocaleString("en-IN")}`:"—"}</td>
                <td className="py-2 text-right text-gray-400">{m.postCount}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    )}
    {s.trends.cropSummary?.length>0&&(
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2"><Package size={18}/>Price by Crop Type</h3>
        <div className="space-y-3">
          {s.trends.cropSummary.map(item=>{
            const maxP=Math.max(...s.trends.cropSummary.map(x=>x.avgPrice||0),1);
            return (
              <div key={item.crop} className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-700 w-32 truncate">{item.crop}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2.5"><div className="bg-teal-500 h-2.5 rounded-full" style={{width:`${((item.avgPrice||0)/maxP)*100}%`}}/></div>
                <span className="text-sm font-bold text-teal-700 w-28 text-right">{item.avgPrice?`Rs ${item.avgPrice.toLocaleString("en-IN")}/T`:"—"}</span>
                <span className="text-xs text-gray-400 w-16 text-right">{item.count} listings</span>
              </div>
            );
          })}
        </div>
      </div>
    )}
  </>)}
</div>
)}

{/* ══════════════════ LOGISTICS ══════════════════════════════════ */}
{activeTab==="logistics"&&(
<div className="space-y-6">
  <div className="flex items-center justify-between flex-wrap gap-3">
    <div><h2 className="text-2xl font-bold text-gray-800">Logistics Coordination</h2><p className="text-sm text-gray-500 mt-1">Book transport · get route & cost estimates · track deliveries</p></div>
    <div className="flex gap-2">
      <button onClick={fetchLogistics} className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-50"><RefreshCw size={15}/>Refresh</button>
      <button onClick={()=>{upd({showLogForm:!s.showLogForm,logEstimate:null});}} className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-teal-700"><Plus size={15}/>New Request</button>
    </div>
  </div>
  {s.showLogForm&&(
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-teal-100">
      <h3 className="font-bold text-gray-800 mb-5 flex items-center gap-2"><Truck size={18} className="text-teal-600"/>New Transport Request</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-3">
          <p className="text-sm font-bold text-gray-700 border-b border-gray-100 pb-2">📍 Pickup (Farmer Location)</p>
          <div><label className="text-xs font-semibold text-gray-600 block mb-1">Pickup Address *</label><input value={lf.pickupAddress} onChange={e=>upd({logForm:{...lf,pickupAddress:e.target.value}})} placeholder="Village, District, State" className="w-full p-2.5 border rounded-lg text-sm"/></div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-xs font-semibold text-gray-600 block mb-1">Latitude</label><input value={lf.pickupLat} onChange={e=>upd({logForm:{...lf,pickupLat:e.target.value}})} placeholder="18.5204" className="w-full p-2.5 border rounded-lg text-sm"/></div>
            <div><label className="text-xs font-semibold text-gray-600 block mb-1">Longitude</label><input value={lf.pickupLng} onChange={e=>upd({logForm:{...lf,pickupLng:e.target.value}})} placeholder="73.8567" className="w-full p-2.5 border rounded-lg text-sm"/></div>
          </div>
          <button type="button" onClick={()=>useMyGPS("pickup")} className="text-xs text-blue-600 hover:underline flex items-center gap-1"><Navigation size={12}/>Use Current GPS</button>
        </div>
        <div className="space-y-3">
          <p className="text-sm font-bold text-gray-700 border-b border-gray-100 pb-2">🏭 Delivery (Your Location)</p>
          <div><label className="text-xs font-semibold text-gray-600 block mb-1">Delivery Address *</label><input value={lf.deliveryAddress} onChange={e=>upd({logForm:{...lf,deliveryAddress:e.target.value}})} placeholder="Your business address" className="w-full p-2.5 border rounded-lg text-sm"/></div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-xs font-semibold text-gray-600 block mb-1">Latitude</label><input value={lf.deliveryLat} onChange={e=>upd({logForm:{...lf,deliveryLat:e.target.value}})} placeholder="19.0760" className="w-full p-2.5 border rounded-lg text-sm"/></div>
            <div><label className="text-xs font-semibold text-gray-600 block mb-1">Longitude</label><input value={lf.deliveryLng} onChange={e=>upd({logForm:{...lf,deliveryLng:e.target.value}})} placeholder="72.8777" className="w-full p-2.5 border rounded-lg text-sm"/></div>
          </div>
          <button type="button" onClick={useProfileLocationForDelivery} className="text-xs text-green-600 hover:underline flex items-center gap-1"><MapPin size={12}/>Use My Profile Location</button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
        <div><label className="text-xs font-semibold text-gray-600 block mb-1">Cargo Type</label><input value={lf.cargoType} onChange={e=>upd({logForm:{...lf,cargoType:e.target.value}})} placeholder="e.g. Wheat Straw" className="w-full p-2.5 border rounded-lg text-sm"/></div>
        <div><label className="text-xs font-semibold text-gray-600 block mb-1">Quantity (tons) *</label><input type="number" value={lf.quantityTon} onChange={e=>upd({logForm:{...lf,quantityTon:e.target.value}})} placeholder="e.g. 10" className="w-full p-2.5 border rounded-lg text-sm"/></div>
        <div><label className="text-xs font-semibold text-gray-600 block mb-1">Vehicle Type</label>
        <select value={lf.vehicleType} onChange={e=>upd({logForm:{...lf,vehicleType:e.target.value}})} className="w-full p-2.5 border rounded-lg text-sm">
          {VEHICLE_TYPES.map(v=><option key={v} value={v}>{v}</option>)}
        </select></div>
        <div><label className="text-xs font-semibold text-gray-600 block mb-1">Pickup Date</label><input type="date" value={lf.pickupDate} onChange={e=>upd({logForm:{...lf,pickupDate:e.target.value}})} className="w-full p-2.5 border rounded-lg text-sm"/></div>
      </div>
      <div className="mt-4"><label className="text-xs font-semibold text-gray-600 block mb-1">Notes</label><input value={lf.notes} onChange={e=>upd({logForm:{...lf,notes:e.target.value}})} placeholder="Special requirements..." className="w-full p-2.5 border rounded-lg text-sm"/></div>
      <div className="mt-5 flex gap-3">
        <button onClick={getLogEstimate} disabled={s.logEstimating} className="flex items-center gap-2 border border-teal-500 text-teal-700 px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-teal-50 disabled:opacity-60">
          {s.logEstimating?<><Loader size={15} className="animate-spin"/>Estimating...</>:<><Route size={15}/>Get Cost Estimate</>}
        </button>
        <button onClick={createLogReq} disabled={s.logSaving} className="flex-1 bg-teal-600 text-white py-2.5 rounded-lg font-bold hover:bg-teal-700 disabled:opacity-60 flex justify-center items-center gap-2">
          {s.logSaving?<><Loader size={15} className="animate-spin"/>Submitting...</>:<><Truck size={15}/>Book Transport</>}
        </button>
      </div>
      {s.logEstimate&&(
        <div className="mt-5 bg-blue-50 border border-blue-200 rounded-xl p-5">
          <p className="font-bold text-blue-800 mb-4 flex items-center gap-2"><Route size={16}/>Route & Cost Estimate</p>
          <div className="grid grid-cols-3 gap-4 text-sm mb-4">
            <div className="bg-white rounded-lg p-3"><p className="text-gray-400 text-xs">Distance</p><p className="font-bold text-blue-700 text-lg">{s.logEstimate.distanceKm} km</p></div>
            <div className="bg-white rounded-lg p-3"><p className="text-gray-400 text-xs">Est. Cost</p><p className="font-bold text-green-700 text-lg">Rs {s.logEstimate.estimatedCost?.toLocaleString("en-IN")}</p></div>
            <div className="bg-white rounded-lg p-3"><p className="text-gray-400 text-xs">Est. Time</p><p className="font-bold text-teal-700 text-lg">{s.logEstimate.estimatedHours}h</p></div>
          </div>
          <div className="bg-white rounded-lg p-3 text-xs mb-4">
            <p className="font-bold text-gray-700 mb-2">Cost Breakdown</p>
            <div className="space-y-1">
              <div className="flex justify-between"><span className="text-gray-500">Base charge:</span><span className="font-semibold">Rs {s.logEstimate.breakdown?.base?.toLocaleString("en-IN")}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Distance cost:</span><span className="font-semibold">Rs {s.logEstimate.breakdown?.distanceCost?.toLocaleString("en-IN")}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Loading/unloading:</span><span className="font-semibold">Rs {s.logEstimate.breakdown?.loadingCost?.toLocaleString("en-IN")}</span></div>
              <div className="flex justify-between border-t pt-1 font-bold"><span>Total:</span><span className="text-green-700">Rs {s.logEstimate.estimatedCost?.toLocaleString("en-IN")}</span></div>
            </div>
          </div>
          <p className="text-xs font-bold text-gray-600 mb-2">Compare Vehicles:</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {s.logEstimate.comparison?.map(v=>(
              <div key={v.vehicleType} className={`bg-white border rounded-lg p-2 text-xs text-center ${v.vehicleType===lf.vehicleType?"border-teal-400":""}`}>
                <p className="font-semibold text-gray-700 truncate">{v.vehicleType}</p>
                <p className="font-bold text-teal-700 mt-0.5">Rs {v.estimatedCost?.toLocaleString("en-IN")}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )}
  {s.logLoading?<div className="flex items-center justify-center py-20"><Loader className="animate-spin text-teal-600" size={28}/></div>:
  s.logistics.length===0?
  <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300"><Truck size={48} className="mx-auto text-gray-300 mb-3"/><h3 className="font-medium text-gray-600">No transport requests yet</h3><p className="text-gray-400 text-sm mt-1">Click "New Request" to book transport.</p></div>:
  <div className="space-y-4">
    {s.logistics.map(req=>(
      <div key={req._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
          <div><h3 className="font-bold text-gray-800">{req.cargoType||"Crop Residue"} · {req.quantityTon}T · {req.vehicleType}</h3>
          <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1"><MapPin size={12}/>{req.pickupAddress} → {req.deliveryAddress}</p></div>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-3 py-1 rounded-full font-bold ${STATUS_COLORS[req.status]||"bg-gray-100 text-gray-700"}`}>{req.status.replace("_"," ").toUpperCase()}</span>
            <button onClick={()=>deleteLogReq(req._id)} className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50"><Trash2 size={14}/></button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {req.distanceKm&&<div className="bg-blue-50 rounded-lg p-2.5"><p className="text-gray-400">Distance</p><p className="font-bold text-blue-700">{req.distanceKm} km</p></div>}
          {req.estimatedCost&&<div className="bg-green-50 rounded-lg p-2.5"><p className="text-gray-400">Est. Cost</p><p className="font-bold text-green-700">Rs {req.estimatedCost.toLocaleString("en-IN")}</p></div>}
          {req.estimatedHours&&<div className="bg-yellow-50 rounded-lg p-2.5"><p className="text-gray-400">Est. Time</p><p className="font-bold text-yellow-700">{req.estimatedHours}h</p></div>}
          {req.pickupDate&&<div className="bg-purple-50 rounded-lg p-2.5"><p className="text-gray-400">Pickup Date</p><p className="font-bold text-purple-700">{new Date(req.pickupDate).toLocaleDateString("en-IN")}</p></div>}
        </div>
        {req.truckerName&&(
          <div className="mt-3 bg-teal-50 border border-teal-100 rounded-xl p-3 flex items-center justify-between flex-wrap gap-2">
            <div className="text-sm"><p className="font-bold text-teal-800">🚛 Assigned: {req.truckerName}</p><p className="text-teal-600 text-xs mt-0.5">{req.truckerNote}</p></div>
            <a href={`tel:${req.truckerPhone}`} className="flex items-center gap-1 bg-teal-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-teal-700"><Phone size={12}/>Call: {req.truckerPhone}</a>
          </div>
        )}
        {req.notes&&<p className="text-xs text-gray-400 mt-2">Note: {req.notes}</p>}
      </div>
    ))}
  </div>}
</div>
)}

{/* ══════════════════ REQUESTS ══════════════════════════════════ */}
{activeTab==="requests"&&(
<div className="space-y-5">
  <div className="flex items-center justify-between">
    <div><h2 className="text-2xl font-bold text-gray-800">My Requests</h2><p className="text-sm text-gray-500 mt-1">Posts you've shown interest in — full farmer contact revealed</p></div>
    <button onClick={fetchRequests} className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-50"><RefreshCw size={15}/>Refresh</button>
  </div>
  {s.requestsLoading?<div className="flex items-center justify-center py-20"><Loader className="animate-spin text-teal-600" size={28}/></div>:
  s.requests.length===0?
  <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300"><Bell size={48} className="mx-auto text-gray-300 mb-3"/><h3 className="font-medium text-gray-600">No requests yet</h3><button onClick={()=>navigate("/buyer-dashboard?tab=listings")} className="mt-4 bg-teal-600 text-white px-6 py-2 rounded-lg font-bold">Browse Listings</button></div>:
  <div className="space-y-4">
    {s.requests.map(({post,myInterest})=>(
      <div key={post._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
          <div><h3 className="font-bold text-gray-800 text-lg">{post.cropType} — {post.residueType||"Residue"}</h3><p className="text-gray-500 text-sm">{post.estimatedQuantity} tons · {post.location?.district}, {post.location?.state}</p></div>
          <span className={`text-xs px-3 py-1 rounded-full font-bold ${post.status==="active"?"bg-green-100 text-green-700":"bg-gray-100 text-gray-600"}`}>{post.status}</span>
        </div>
        <div className="bg-teal-50 rounded-xl p-4 border border-teal-100 mb-3">
          <p className="text-xs font-bold text-teal-800 uppercase mb-3">Farmer Contact Details</p>
          <div className="grid grid-cols-2 gap-2 text-sm mb-3">
            <div><span className="text-gray-400">Name:</span><span className="font-bold ml-1">{post.farmerId?.fullName||"—"}</span></div>
            <div className="flex items-center gap-1"><span className="text-gray-400">Phone:</span><a href={`tel:${post.farmerId?.phoneNumber}`} className="font-bold text-teal-700 ml-1 flex items-center gap-1 hover:underline"><Phone size={12}/>{post.farmerId?.phoneNumber||"—"}</a></div>
            <div><span className="text-gray-400">Location:</span><span className="font-semibold ml-1">{post.farmerId?.location?.district||"—"}, {post.farmerId?.location?.state||"—"}</span></div>
            {post.farmerId?.location?.pincode&&<div><span className="text-gray-400">Pincode:</span><span className="font-semibold ml-1">{post.farmerId.location.pincode}</span></div>}
          </div>
          <a href={`tel:${post.farmerId?.phoneNumber||post.contactPhone}`} className="w-full flex items-center justify-center gap-2 bg-teal-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-teal-700"><Phone size={14}/>Call Farmer Now</a>
        </div>
        <p className="text-xs text-gray-400 flex items-center gap-1"><CheckCircle size={12} className="text-green-500"/>Sent {new Date(myInterest?.createdAt).toLocaleDateString("en-IN")}{myInterest?.message&&` · "${myInterest.message}"`}</p>
      </div>
    ))}
  </div>}
</div>
)}

{/* ══════════════════ MAP ══════════════════════════════════════ */}
{activeTab==="map"&&(
<div className="space-y-5">
  <div className="flex items-center justify-between flex-wrap gap-3">
    <div><h2 className="text-2xl font-bold text-gray-800">Map & Nearby Farmers</h2><p className="text-sm text-gray-500 mt-1">Farmers near you with active residue listings</p></div>
    <button onClick={fetchNearbyFarmers} className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-50"><RefreshCw size={15}/>Refresh</button>
  </div>
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
    {s.user?.location?.lat&&s.user?.location?.lng?(
      <>
        <div className="p-4 bg-teal-50 border-b border-teal-100 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-sm text-teal-800"><MapPin size={16} className="text-teal-600"/>Your Location: {s.user.location.lat}, {s.user.location.lng}{s.user.location.pincode&&` · Pincode: ${s.user.location.pincode}`}</div>
          <span className="text-xs bg-teal-600 text-white px-3 py-1 rounded-full font-bold">{s.nearbyFarmers.length} farmers nearby</span>
        </div>
        <iframe title="Buyer Map" width="100%" height="380" style={{border:0}} src={`https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(s.user.location.lng)-0.5},${parseFloat(s.user.location.lat)-0.5},${parseFloat(s.user.location.lng)+0.5},${parseFloat(s.user.location.lat)+0.5}&layer=mapnik&marker=${s.user.location.lat},${s.user.location.lng}`}/>
      </>
    ):(
      <div className="flex flex-col items-center justify-center py-20 text-gray-400"><Navigation size={48} className="mb-4 text-gray-300"/><p className="font-medium text-gray-600">GPS Location Required</p><p className="text-sm mt-1">Register with GPS to see map.</p></div>
    )}
  </div>
  <div>
    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Users size={20} className="text-green-600"/>Nearby Farmers{s.nearbyFarmersLoading&&<Loader size={16} className="animate-spin text-gray-400 ml-2"/>}</h3>
    {s.nearbyFarmers.length===0&&!s.nearbyFarmersLoading?
    <div className="bg-gray-50 rounded-xl p-8 text-center border border-dashed border-gray-300"><Users size={36} className="mx-auto text-gray-300 mb-2"/><p className="text-gray-500">No farmers with active listings nearby</p></div>:
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {s.nearbyFarmers.map((f,i)=>{
        const isSaved=s.favIds.farmerIds?.includes(String(f.farmerId));
        return (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-500 p-4 text-white">
              <div className="flex items-start justify-between">
                <div><p className="font-bold">{f.fullName}</p><p className="text-green-100 text-xs">Active Farmer</p></div>
                <div className="flex items-center gap-2">
                  {f.distanceKm!=null&&<span className="bg-white bg-opacity-20 text-xs font-bold px-2 py-0.5 rounded-full">{f.distanceKm} km</span>}
                  <button onClick={()=>toggleFavFarmer(f.farmerId)} className={`p-1.5 rounded-full transition ${isSaved?"bg-yellow-400 text-yellow-900":"bg-white bg-opacity-20 hover:bg-yellow-400 hover:text-yellow-900"}`}><Star size={13} fill={isSaved?"currentColor":"none"}/></button>
                </div>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div className="bg-green-50 rounded-lg p-3 border border-green-100 text-xs space-y-1.5">
                <p className="font-bold text-green-800 text-xs uppercase mb-1">Contact Info</p>
                <div className="flex justify-between"><span className="text-gray-500">Phone:</span><a href={`tel:${f.phoneNumber}`} className="font-bold text-green-700 flex items-center gap-1 hover:underline"><Phone size={11}/>{f.phoneNumber}</a></div>
                <div className="flex justify-between"><span className="text-gray-500">Location:</span><span className="font-semibold">{f.location?.district||"—"}, {f.location?.state||"—"}</span></div>
                {f.location?.pincode&&<div className="flex justify-between"><span className="text-gray-500">Pincode:</span><span className="font-semibold">{f.location.pincode}</span></div>}
              </div>
              {f.post&&(
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 text-xs space-y-1">
                  <p className="font-bold text-gray-700 uppercase mb-1">Latest Listing</p>
                  <div className="flex justify-between"><span className="text-gray-400">Crop:</span><span className="font-semibold">{f.post.cropType}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Qty:</span><span className="font-bold text-green-700">{f.post.estimatedQuantity}T</span></div>
                  {f.post.pricePerTon&&<div className="flex justify-between"><span className="text-gray-400">Price:</span><span className="font-bold text-yellow-700">Rs {Number(f.post.pricePerTon).toLocaleString("en-IN")}/T</span></div>}
                </div>
              )}
              <a href={`tel:${f.phoneNumber}`} className="w-full flex items-center justify-center gap-1 bg-green-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-green-700"><Phone size={12}/>Call Farmer</a>
            </div>
          </div>
        );
      })}
    </div>}
  </div>
</div>
)}

{/* ══════════════════ SETTINGS ══════════════════════════════════ */}
{activeTab==="settings"&&(
<div className="max-w-lg mx-auto">
  <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
    <Settings size={40} className="mx-auto text-gray-300 mb-4"/>
    <h2 className="text-xl font-bold text-gray-700">Settings</h2>
    <p className="text-gray-400 mt-2 mb-6">Account settings coming soon.</p>
    <div className="bg-gray-50 rounded-xl p-4 text-left text-sm space-y-2">
      {[{k:"Name",v:s.user?.fullName},{k:"Phone",v:s.user?.phoneNumber},{k:"Role",v:s.user?.role},{k:"Location",v:`${s.user?.location?.district||"—"}, ${s.user?.location?.state||"—"}`},{k:"Pincode",v:s.user?.location?.pincode||"—"},{k:"Joined",v:s.user?.createdAt?new Date(s.user.createdAt).toLocaleDateString("en-IN"):"—"}].map(({k,v})=>(
        <div key={k} className="flex justify-between"><span className="text-gray-500">{k}:</span><span className="font-semibold capitalize">{v}</span></div>
      ))}
    </div>
  </div>
</div>
)}

    </BuyerLayout>
  );
}