import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { LanguageProvider } from "./context/LanguageContext";

import LanguageSelector from "./components/LanguageSelector";
import Login            from "./pages/Login";
import Register         from "./pages/Register";
import Home             from "./pages/HomePage";
import FarmerDashboard  from "./pages/FarmerDashboard";
import AdminDashboard   from "./pages/AdminDashboard";
import BuyerDashboard   from "./pages/BuyerDashboard";

// ── Smart redirect based on role ─────────────────────────────────
function getRolePath(role) {
  if (role === "admin")  return "/admin";
  if (role === "buyer")  return "/buyer-dashboard";
  return "/dashboard";
}

// ── Protected Route ───────────────────────────────────────────────
const ProtectedRoute = ({ children, allowedRole }) => {
  const token    = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  if (!token) return <Navigate to="/login" replace />;

  if (allowedRole && userRole !== allowedRole) {
    return <Navigate to={getRolePath(userRole)} replace />;
  }

  return children;
};

// ── Google Translate Script Injector ─────────────────────────────
function GoogleTranslateScript() {
  useEffect(() => {
    if (document.getElementById("google-translate-script")) return;

    window.googleTranslateElementInit = function () {
      new window.google.translate.TranslateElement(
        { pageLanguage: "en", autoDisplay: false },
        "google_translate_element"
      );
    };

    const script     = document.createElement("script");
    script.id        = "google-translate-script";
    script.src       = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async     = true;
    document.body.appendChild(script);
  }, []);

  return <div id="google_translate_element" style={{ display: "none" }} />;
}

// ── Root Export ───────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <GoogleTranslateScript />
        <Routes>

          {/* ✅ NEW: Root always lands on language selector */}
          <Route path="/"                element={<Navigate to="/select-language" replace />} />

          {/* ✅ NEW: Language selector page — shown every time site opens */}
          <Route path="/select-language" element={<LanguageSelector />} />

          {/* ✅ NEW: Home page — navigated to after language is selected */}
          <Route path="/home"            element={<Home />} />

          {/* ── Your existing public routes (unchanged) ── */}
          <Route path="/login"           element={<Login />} />
          <Route path="/register"        element={<Register />} />

          {/* ── Your existing protected routes (unchanged) ── */}

          {/* Farmer */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRole="farmer">
                <FarmerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Buyer */}
          <Route
            path="/buyer-dashboard"
            element={
              <ProtectedRoute allowedRole="buyer">
                <BuyerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* ✅ Catch-all → back to language selector */}
          <Route path="*" element={<Navigate to="/select-language" replace />} />

        </Routes>
      </LanguageProvider>
    </BrowserRouter>
  );
}