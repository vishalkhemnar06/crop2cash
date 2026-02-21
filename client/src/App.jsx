import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";

const FarmerDashboard = () => <h1 className="p-10 text-3xl">Farmer Dashboard</h1>;
const AdminDashboard = () => <h1 className="p-10 text-3xl">Admin Dashboard</h1>;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/farmer-dashboard" element={<FarmerDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;