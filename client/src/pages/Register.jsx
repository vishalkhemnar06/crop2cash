import { useState, useRef } from "react";
import { API } from "../api";
import { useNavigate, Link } from "react-router-dom";
import { MapPin, Loader, User, ShoppingBag, Navigation, AlertCircle, CheckCircle, ArrowRight, Shield, Leaf, Truck } from "lucide-react";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    role: "farmer",
    fullName: "", phoneNumber: "", password: "", confirmPassword: "",
    state: "", district: "", taluka: "", localAddress: "",
    pincode: "", lat: "", lng: "",
  });
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsStatus, setGpsStatus] = useState(null); // null | "success" | "error"
  const [gpsMsg, setGpsMsg] = useState("");
  const [useGPS, setUseGPS] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // ── GPS Location ─────────────────────────────────────────────────
  const requestLocation = () => {
    if (!navigator.geolocation) {
      setGpsStatus("error");
      setGpsMsg("GPS not supported by this browser.");
      return;
    }
    setGpsLoading(true);
    setGpsStatus(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          // Reverse geocode using nominatim (free, no key needed)
          const resp = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await resp.json();
          const addr = data.address || {};

          setForm((prev) => ({
            ...prev,
            lat: latitude.toFixed(6),
            lng: longitude.toFixed(6),
            pincode:      addr.postcode     || "",
            state:        addr.state        || "",
            district:     addr.county || addr.district || addr.city_district || addr.city || "",
            taluka:       addr.suburb || addr.town || addr.village || addr.municipality || "",
            localAddress: data.display_name || "",
          }));
          setUseGPS(true);
          setGpsStatus("success");
          setGpsMsg(`Location detected: ${addr.county || addr.city || ""}, ${addr.state || ""} — Pincode: ${addr.postcode || "N/A"}`);
        } catch {
          // If reverse geocode fails, at least save coordinates
          setForm((prev) => ({ ...prev, lat: latitude.toFixed(6), lng: longitude.toFixed(6) }));
          setGpsStatus("success");
          setGpsMsg(`GPS coordinates captured (${latitude.toFixed(4)}, ${longitude.toFixed(4)}). Please fill address manually.`);
        }
        setGpsLoading(false);
      },
      (err) => {
        setGpsLoading(false);
        setGpsStatus("error");
        setGpsMsg(
          err.code === 1 ? "Location permission denied. Please fill address manually."
          : err.code === 2 ? "Location unavailable. Please fill address manually."
          : "GPS timeout. Please fill address manually."
        );
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const clearGPS = () => {
    setUseGPS(false);
    setGpsStatus(null);
    setGpsMsg("");
    setForm((prev) => ({ ...prev, lat: "", lng: "", pincode: "", state: "", district: "", taluka: "", localAddress: "" }));
  };

  // ── Submit ────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return alert("Passwords do not match");
    if (form.password.length < 6) return alert("Password must be at least 6 characters");
    if (!form.state || !form.district) return alert("State and District are required");

    setLoading(true);
    try {
      const res = await API.post("/auth/register", {
        fullName:      form.fullName,
        phoneNumber:   form.phoneNumber,
        password:      form.password,
        confirmPassword: form.confirmPassword,
        role:          form.role,
        state:         form.state,
        district:      form.district,
        taluka:        form.taluka,
        localAddress:  form.localAddress,
        pincode:       form.pincode,
        lat:           form.lat || null,
        lng:           form.lng || null,
      });
      alert(res.data.message || "Registered successfully!");
      navigate("/login");
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-10 xl:p-16 overflow-y-auto">
        <div className="w-full max-w-xl">
          {/* Logo */}
          <div className="mb-8">
            {/* Replace this with your actual logo */}
           <div className="flex items-center gap-3">
  <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-lg shadow-green-200">
    <img
      src={"logo.jpeg"}
      alt="Crop2Cash Logo"
      className="w-full h-full object-cover"
    />
  </div>

  <div>
    <h1 className="text-3xl font-bold bg-gradient-to-r from-green-700 to-green-600 bg-clip-text text-transparent">
      Crop2Cash
    </h1>
    <p className="text-sm text-gray-500">
      AI-powered agri marketplace
    </p>
  </div>
</div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
            <p className="text-gray-600">Join thousands of farmers and buyers on Crop2Cash</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">
                I want to <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { 
                    value: "farmer", 
                    label: "Farmer", 
                    icon: <User className="w-5 h-5" />, 
                    desc: "Sell crop residue",
                    gradient: "from-green-500 to-emerald-500"
                  },
                  { 
                    value: "buyer", 
                    label: "Buyer", 
                    icon: <ShoppingBag className="w-5 h-5" />, 
                    desc: "Buy crop residue",
                    gradient: "from-blue-500 to-cyan-500"
                  },
                ].map(({ value, label, icon, desc, gradient }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm({ ...form, role: value })}
                    className={`
                      relative group overflow-hidden p-5 rounded-2xl transition-all duration-300
                      ${form.role === value
                        ? `bg-gradient-to-br ${gradient} text-white shadow-xl scale-105 border-2 border-white`
                        : "bg-gray-50 text-gray-700 hover:shadow-lg border-2 border-gray-100 hover:border-green-200"}
                    `}
                  >
                    <div className={`absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ${form.role === value ? 'hidden' : ''}`} />
                    <div className="relative z-10 flex flex-col items-center text-center">
                      <div className={`
                        mb-2 p-2 rounded-xl transition-all duration-300
                        ${form.role === value 
                          ? 'bg-white/20' 
                          : 'bg-gray-200 text-gray-600 group-hover:bg-green-100 group-hover:text-green-600'}
                      `}>
                        {icon}
                      </div>
                      <span className="font-bold text-sm mb-1">{label}</span>
                      <span className={`text-xs ${form.role === value ? 'text-white/90' : 'text-gray-500'}`}>{desc}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Personal Info */}
            <div className="space-y-4">
              <div className="relative">
                <input 
                  name="fullName" 
                  placeholder="Full Name *" 
                  value={form.fullName} 
                  onChange={handleChange} 
                  required 
                  className="w-full p-4 pl-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all bg-gray-50/50"
                />
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              
              <div className="relative">
                <input 
                  name="phoneNumber" 
                  placeholder="Mobile Number (10 digits) *" 
                  pattern="\d{10}" 
                  title="Enter a valid 10-digit number" 
                  value={form.phoneNumber} 
                  onChange={handleChange} 
                  required 
                  className="w-full p-4 pl-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all bg-gray-50/50"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">+91</span>
              </div>
              
              <div className="relative">
                <input 
                  type="password" 
                  name="password" 
                  placeholder="Password (min 6 characters) *" 
                  minLength={6} 
                  value={form.password} 
                  onChange={handleChange} 
                  required 
                  className="w-full p-4 pl-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all bg-gray-50/50"
                />
                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              
              <div className="relative">
                <input 
                  type="password" 
                  name="confirmPassword" 
                  placeholder="Confirm Password *" 
                  minLength={6} 
                  value={form.confirmPassword} 
                  onChange={handleChange} 
                  required 
                  className="w-full p-4 pl-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all bg-gray-50/50"
                />
                <CheckCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Location Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-700">Location <span className="text-red-400">*</span></label>
                {useGPS && (
                  <button type="button" onClick={clearGPS} className="text-xs text-red-500 hover:text-red-700 font-medium px-3 py-1 bg-red-50 rounded-full">
                    Clear GPS
                  </button>
                )}
              </div>

              {/* GPS Button */}
              <button
                type="button"
                onClick={requestLocation}
                disabled={gpsLoading}
                className={`
                  w-full flex items-center justify-center gap-3 p-4 rounded-xl border-2 font-semibold text-sm transition-all
                  ${gpsStatus === "success"
                    ? "border-green-400 bg-green-50 text-green-700"
                    : gpsStatus === "error"
                    ? "border-red-300 bg-red-50 text-red-600"
                    : "border-dashed border-green-400 bg-green-50 text-green-700 hover:bg-green-100 hover:border-green-500"}
                `}
              >
                {gpsLoading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Detecting your location...</span>
                  </>
                ) : gpsStatus === "success" ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>📍 Location Detected Successfully</span>
                  </>
                ) : (
                  <>
                    <Navigation className="w-5 h-5" />
                    <span>📍 Use My Live Location (Optional)</span>
                  </>
                )}
              </button>

              {/* GPS Status Message */}
              {gpsMsg && (
                <div className={`
                  flex items-start gap-3 text-sm rounded-xl p-4
                  ${gpsStatus === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-600 border border-red-200"}
                `}>
                  {gpsStatus === "success" ? (
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  )}
                  <span>{gpsMsg}</span>
                </div>
              )}

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-4 bg-white text-gray-500">or fill manually</span>
                </div>
              </div>

              {/* Manual address fields */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    name="state" 
                    placeholder="State *" 
                    value={form.state} 
                    onChange={handleChange} 
                    required 
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all bg-gray-50/50"
                  />
                  <input 
                    name="district" 
                    placeholder="District *" 
                    value={form.district} 
                    onChange={handleChange} 
                    required 
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all bg-gray-50/50"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    name="taluka" 
                    placeholder="Taluka / Tehsil" 
                    value={form.taluka} 
                    onChange={handleChange} 
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all bg-gray-50/50"
                  />
                  <input 
                    name="pincode" 
                    placeholder="Pincode" 
                    value={form.pincode} 
                    onChange={handleChange} 
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all bg-gray-50/50"
                    maxLength={6} 
                  />
                </div>
                
                <input 
                  name="localAddress" 
                  placeholder="Local Address / Landmark" 
                  value={form.localAddress} 
                  onChange={handleChange} 
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all bg-gray-50/50"
                />

                {/* Show lat/lng if GPS captured */}
                {form.lat && form.lng && (
                  <div className="flex gap-3">
                    <input 
                      readOnly 
                      value={`Lat: ${form.lat}`} 
                      className="flex-1 p-3 border border-gray-200 rounded-lg bg-gray-100 text-xs text-gray-600 font-mono"
                    />
                    <input 
                      readOnly 
                      value={`Lng: ${form.lng}`} 
                      className="flex-1 p-3 border border-gray-200 rounded-lg bg-gray-100 text-xs text-gray-600 font-mono"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white p-4 rounded-xl font-bold hover:from-green-700 hover:to-green-600 transition-all disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-base shadow-lg shadow-green-200 group"
            >
              <span className="flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Register as {form.role === "buyer" ? "Buyer" : "Farmer"}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>

            {/* Login Link */}
            <p className="text-center text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="text-green-600 font-bold hover:text-green-700 hover:underline">
                Login here
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Right Side - Image/Illustration */}
      <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-green-50 via-white to-green-50 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-green-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-green-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>

        {/* Main Content */}
        <div className="relative h-full flex flex-col items-center justify-center p-16">
          {/* Image Container */}
          <div className="relative mb-12">
            {/* Decorative Elements */}
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-green-200 rounded-full opacity-60 animate-pulse"></div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-green-300 rounded-full opacity-40 animate-pulse animation-delay-1000"></div>
            
            {/* Main Image */}
            <div className="relative z-10">
              {/* Replace this div with your actual image */}
              <div className="w-[500px] h-[500px] rounded-3xl overflow-hidden shadow-2xl shadow-green-200/50 border-8 border-white">
                <img 
                  src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80" 
                  alt="Farmer in field" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div className="text-center max-w-md">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Join the <span className="text-green-600">Agricultural Revolution</span>
            </h3>
            <p className="text-gray-600 mb-8">
              Connect with farmers and buyers directly. Get fair prices for your produce with AI-powered marketplace.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                <div className="text-2xl font-bold text-green-600">10k+</div>
                <div className="text-xs text-gray-600">Farmers</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                <div className="text-2xl font-bold text-green-600">5k+</div>
                <div className="text-xs text-gray-600">Buyers</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                <div className="text-2xl font-bold text-green-600">50+</div>
                <div className="text-xs text-gray-600">Districts</div>
              </div>
            </div>

            {/* Features */}
            <div className="mt-8 flex items-center justify-center gap-6">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield className="w-4 h-4 text-green-600" />
                <span>Secure</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Truck className="w-4 h-4 text-green-600" />
                <span>Fast Delivery</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Leaf className="w-4 h-4 text-green-600" />
                <span>Sustainable</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}