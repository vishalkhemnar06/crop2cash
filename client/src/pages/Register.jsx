import { useState } from "react";
import { API } from "../api";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate(); // 🔥 navigation hook

  const [role, setRole] = useState("farmer");

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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      return alert("Passwords do not match");
    }

    try {
      const res = await API.post("/auth/register", {
        ...form,
        role,
      });

      alert(res.data.message);

      // ✅ Navigate to login page after success
      navigate("/login");

    } catch (error) {
      alert(error.response?.data?.message || "Registration Failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-lg w-[420px] space-y-4"
      >
        <h2 className="text-2xl font-bold text-center">Register</h2>

        <input
          name="fullName"
          placeholder="Full Name"
          className="w-full p-2 border rounded"
          onChange={handleChange}
          required
        />

        <input
          name="phoneNumber"
          placeholder="Mobile Number"
          className="w-full p-2 border rounded"
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          className="w-full p-2 border rounded"
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          className="w-full p-2 border rounded"
          onChange={handleChange}
          required
        />

        <input
          name="state"
          placeholder="State"
          className="w-full p-2 border rounded"
          onChange={handleChange}
          required
        />

        <input
          name="district"
          placeholder="District"
          className="w-full p-2 border rounded"
          onChange={handleChange}
          required
        />

        <input
          name="taluka"
          placeholder="Taluka"
          className="w-full p-2 border rounded"
          onChange={handleChange}
          required
        />

        <input
          name="localAddress"
          placeholder="Local Address"
          className="w-full p-2 border rounded"
          onChange={handleChange}
          required
        />

        <select
          className="w-full p-2 border rounded"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="farmer">Farmer</option>
          <option value="admin">Admin</option>
        </select>

        <button className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">
          Register
        </button>
      </form>
    </div>
  );
}