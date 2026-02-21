import { useState } from "react";
import { API } from "../api";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    state: "",
    district: "",
    taluka: "",
    localAddress: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      return alert("Passwords do not match");
    }

    // ✅ FIX 1: Minimum password length check on frontend
    if (form.password.length < 6) {
      return alert("Password must be at least 6 characters");
    }

    setLoading(true);

    try {
      const res = await API.post("/auth/register", {
        ...form,
        role: "farmer", // ✅ FIX 2: Always register as farmer — removed admin self-registration (security risk)
      });

      alert(res.data.message);
      navigate("/login");
    } catch (error) {
      alert(error.response?.data?.message || "Registration Failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 py-8">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-lg w-[420px] space-y-4"
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold text-green-800">Create Account</h2>
          <p className="text-gray-500 text-sm">Register as a farmer to get started</p>
        </div>

        <input
          name="fullName"
          placeholder="Full Name"
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          onChange={handleChange}
          required
        />

        <input
          name="phoneNumber"
          placeholder="Mobile Number (10 digits)"
          pattern="\d{10}"
          title="Enter a valid 10-digit mobile number"
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password (min 6 characters)"
          minLength={6}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          minLength={6}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          onChange={handleChange}
          required
        />

        <input
          name="state"
          placeholder="State"
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          onChange={handleChange}
          required
        />

        <input
          name="district"
          placeholder="District"
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          onChange={handleChange}
          required
        />

        <input
          name="taluka"
          placeholder="Taluka"
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          onChange={handleChange}
          required
        />

        <input
          name="localAddress"
          placeholder="Local Address"
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          onChange={handleChange}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white p-3 rounded-lg font-bold hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? "Registering..." : "Register"}
        </button>

        {/* ✅ FIX 3: Added link back to login */}
        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-green-600 font-bold hover:underline">
            Login here
          </Link>
        </p>
      </form>
    </div>
  );
}
