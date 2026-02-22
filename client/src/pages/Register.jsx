import { useState, useRef } from "react";
import { API } from "../api";
import { useNavigate, Link } from "react-router-dom";
import { MapPin, Loader, User, ShoppingBag, Navigation, AlertCircle, CheckCircle } from "lucide-react";

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

  const inputCls = "w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-sm";

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-3xl font-extrabold text-green-800 tracking-tight">🌾 Crop2Cash</div>
          <p className="text-gray-500 text-sm mt-1">AI-powered agri marketplace</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-5">
          <h2 className="text-2xl font-bold text-gray-800">Create Account</h2>

          {/* ── Role Selection ── */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Who are you? <span className="text-red-400">*</span></label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "farmer", label: "Farmer", icon: <User size={20} />, desc: "Sell crop residue" },
                { value: "buyer", label: "Buyer", icon: <ShoppingBag size={20} />, desc: "Buy crop residue" },
              ].map(({ value, label, icon, desc }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm({ ...form, role: value })}
                  className={`flex flex-col items-center p-4 rounded-xl border-2 transition font-semibold
                    ${form.role === value
                      ? "border-green-500 bg-green-50 text-green-800 shadow-sm"
                      : "border-gray-200 bg-gray-50 text-gray-600 hover:border-green-300"}`}
                >
                  <span className={`mb-1 ${form.role === value ? "text-green-600" : "text-gray-400"}`}>{icon}</span>
                  <span className="text-sm font-bold">{label}</span>
                  <span className="text-xs text-gray-400 font-normal">{desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Personal Info ── */}
          <div className="space-y-3">
            <input name="fullName" placeholder="Full Name *" value={form.fullName} onChange={handleChange} required className={inputCls} />
            <input name="phoneNumber" placeholder="Mobile Number (10 digits) *" pattern="\d{10}" title="Enter a valid 10-digit number" value={form.phoneNumber} onChange={handleChange} required className={inputCls} />
            <input type="password" name="password" placeholder="Password (min 6 characters) *" minLength={6} value={form.password} onChange={handleChange} required className={inputCls} />
            <input type="password" name="confirmPassword" placeholder="Confirm Password *" minLength={6} value={form.confirmPassword} onChange={handleChange} required className={inputCls} />
          </div>

          {/* ── Location Section ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-gray-700">Location <span className="text-red-400">*</span></label>
              {useGPS && (
                <button type="button" onClick={clearGPS} className="text-xs text-red-500 hover:text-red-700 underline">Clear GPS</button>
              )}
            </div>

            {/* GPS Button */}
            <button
              type="button"
              onClick={requestLocation}
              disabled={gpsLoading}
              className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border-2 font-semibold text-sm transition mb-3
                ${gpsStatus === "success"
                  ? "border-green-400 bg-green-50 text-green-700"
                  : gpsStatus === "error"
                  ? "border-red-300 bg-red-50 text-red-600"
                  : "border-dashed border-green-400 bg-green-50 text-green-700 hover:bg-green-100"}`}
            >
              {gpsLoading
                ? <><Loader size={16} className="animate-spin" /> Detecting location...</>
                : gpsStatus === "success"
                ? <><CheckCircle size={16} /> Location Detected</>
                : <><Navigation size={16} /> 📍 Use My Live Location (Optional)</>}
            </button>

            {/* GPS Status Message */}
            {gpsMsg && (
              <div className={`flex items-start gap-2 text-xs rounded-lg p-3 mb-3 ${gpsStatus === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                {gpsStatus === "success" ? <CheckCircle size={14} className="mt-0.5 flex-shrink-0" /> : <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />}
                {gpsMsg}
              </div>
            )}

            <div className="text-xs text-center text-gray-400 mb-3">— or fill manually —</div>

            {/* Manual address fields */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input name="state" placeholder="State *" value={form.state} onChange={handleChange} required className={inputCls} />
                <input name="district" placeholder="District *" value={form.district} onChange={handleChange} required className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input name="taluka" placeholder="Taluka / Tehsil" value={form.taluka} onChange={handleChange} className={inputCls} />
                <input name="pincode" placeholder="Pincode" value={form.pincode} onChange={handleChange} className={inputCls} maxLength={6} />
              </div>
              <input name="localAddress" placeholder="Local Address" value={form.localAddress} onChange={handleChange} className={inputCls} />

              {/* Show lat/lng if GPS captured */}
              {form.lat && form.lng && (
                <div className="flex gap-2">
                  <input readOnly value={`Lat: ${form.lat}`} className="flex-1 p-2 border border-gray-200 rounded-lg bg-gray-50 text-xs text-gray-500" />
                  <input readOnly value={`Lng: ${form.lng}`} className="flex-1 p-2 border border-gray-200 rounded-lg bg-gray-50 text-xs text-gray-500" />
                </div>
              )}
            </div>
          </div>

          {/* ── Submit ── */}
          <button type="submit" disabled={loading}
            className="w-full bg-green-600 text-white p-3.5 rounded-xl font-bold hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed text-base">
            {loading ? "Creating Account..." : `Register as ${form.role === "buyer" ? "Buyer" : "Farmer"}`}
          </button>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-green-600 font-bold hover:underline">Login here</Link>
          </p>
        </form>
      </div>
    </div>
  );
}