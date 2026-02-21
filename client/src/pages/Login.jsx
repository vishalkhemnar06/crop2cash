import { useState } from "react";
import { API } from "../api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate(); // 🔥 for navigation

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/auth/login", {
        phoneNumber,
        password,
      });

      // Save token and role
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      alert("Login Success");

      // 🔥 Navigate based on role
      if (res.data.role === "farmer") {
        navigate("/farmer-dashboard");
      } else if (res.data.role === "admin") {
        navigate("/admin-dashboard");
      }

    } catch (error) {
      alert("Invalid phone number or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-xl shadow-lg w-96 space-y-4"
      >
        <h2 className="text-2xl font-bold text-center">Login</h2>

        <input
          placeholder="Phone Number"
          className="w-full p-2 border rounded"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          Login
        </button>
      </form>
    </div>
  );
}