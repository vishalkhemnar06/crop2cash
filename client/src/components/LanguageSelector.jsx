import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

export default function LanguageSelector() {
  const { chooseLanguage, LANGUAGES } = useLanguage();
  const navigate = useNavigate();
  const [hovered,  setHovered]  = useState(null);
  const [selected, setSelected] = useState(null);

  function handleSelect(lang) {
    if (selected) return; // block double-click
    setSelected(lang.code);
    setTimeout(() => {
      chooseLanguage(lang, navigate); // ✅ navigates to /home
    }, 450);
  }

  return (
    <div className="lang-selector-root">
      <div className="bg-orbs">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      <div className="content-wrapper">
        <div className="header-section">
          <div className="globe-icon">🌍</div>
          <h1 className="main-title">Choose Your Language</h1>
          <p className="subtitle">
            Select a language to continue — your entire experience will be translated
          </p>
          <div className="title-line" />
        </div>

        <div className="lang-grid">
          {LANGUAGES.map((lang, i) => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang)}
              onMouseEnter={() => setHovered(lang.code)}
              onMouseLeave={() => setHovered(null)}
              disabled={!!selected}
              className={[
                "lang-card",
                hovered === lang.code && !selected ? "hovered"  : "",
                selected === lang.code              ? "selected" : "",
                selected && selected !== lang.code  ? "dimmed"  : "",
              ].join(" ")}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <span className="lang-flag">{lang.flag}</span>
              <span className="lang-native">{lang.native}</span>
              <span className="lang-english">{lang.name}</span>
              {selected === lang.code && <span className="check-icon">✓</span>}
            </button>
          ))}
        </div>

        <div className="footer-note-container">
          <p className="footer-note">
            🔄 You will be asked to select a language every time you open the website
          </p>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&family=Playfair+Display:wght@700&display=swap');

        * { margin:0; padding:0; box-sizing:border-box; }

        .lang-selector-root {
          min-height:100vh;
          background:linear-gradient(135deg,#f0f7f0 0%,#ffffff 50%,#e8f3e8 100%);
          display:flex; align-items:center; justify-content:center;
          position:relative; overflow:hidden;
          font-family:'Outfit',sans-serif; padding:40px 20px;
        }

        .bg-orbs { position:absolute; inset:0; pointer-events:none; }

        .orb {
          position:absolute; border-radius:50%;
          filter:blur(80px); opacity:0.25;
          animation:floatOrb 8s ease-in-out infinite;
        }
        .orb-1 { width:500px;height:500px;background:radial-gradient(circle,#4ade80,transparent);top:-150px;left:-100px;animation-delay:0s; }
        .orb-2 { width:400px;height:400px;background:radial-gradient(circle,#22c55e,transparent);bottom:-100px;right:-100px;animation-delay:-3s; }
        .orb-3 { width:300px;height:300px;background:radial-gradient(circle,#86efac,transparent);top:50%;left:50%;transform:translate(-50%,-50%);animation-delay:-6s; }

        @keyframes floatOrb {
          0%,100%{transform:translate(0,0)}
          33%{transform:translate(30px,-20px)}
          66%{transform:translate(-20px,30px)}
        }

        .content-wrapper { position:relative; z-index:10; max-width:860px; width:100%; }

        .header-section {
          text-align:center; margin-bottom:48px;
          animation:fadeSlideDown 0.7s ease forwards;
        }

        @keyframes fadeSlideDown {
          from{opacity:0;transform:translateY(-30px)}
          to{opacity:1;transform:translateY(0)}
        }

        .globe-icon {
          font-size:3.5rem; display:block; margin-bottom:16px;
          animation:pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%,100%{transform:scale(1)} 50%{transform:scale(1.1)}
        }

        .main-title {
          font-family:'Playfair Display',serif;
          font-size:clamp(2rem,5vw,3.2rem);
          font-weight:700; margin:0 0 12px;
          background:linear-gradient(135deg,#166534 0%,#22c55e 50%,#86efac 100%);
          -webkit-background-clip:text;
          -webkit-text-fill-color:transparent;
          background-clip:text;
        }

        .subtitle { color:#374151; font-size:1.05rem; font-weight:400; margin:0 0 20px; }

        .title-line {
          width:60px; height:3px;
          background:linear-gradient(90deg,#22c55e,#86efac);
          border-radius:2px; margin:0 auto;
        }

        .lang-grid {
          display:grid;
          grid-template-columns:repeat(5,1fr);
          gap:14px; margin-bottom:32px;
        }

        @media(max-width:700px){ .lang-grid{grid-template-columns:repeat(2,1fr)} }
        @media(min-width:701px) and (max-width:900px){ .lang-grid{grid-template-columns:repeat(3,1fr)} }

        .lang-card {
          position:relative; background:#ffffff;
          border:1.5px solid #e5e7eb; border-radius:16px;
          padding:22px 12px 18px; cursor:pointer;
          display:flex; flex-direction:column; align-items:center; gap:6px;
          transition:all 0.25s ease;
          animation:cardReveal 0.5s ease forwards;
          opacity:0; transform:translateY(20px);
          box-shadow:0 4px 6px -1px rgba(0,0,0,0.1),0 2px 4px -1px rgba(0,0,0,0.06);
        }

        @keyframes cardReveal {
          to{opacity:1;transform:translateY(0)}
        }

        .lang-card.hovered {
          background:#f0fdf4; border-color:#22c55e;
          transform:translateY(-4px) scale(1.03);
          box-shadow:0 16px 40px rgba(34,197,94,0.2);
        }

        .lang-card.selected {
          background:#dcfce7; border-color:#22c55e; border-width:2px;
          box-shadow:0 0 30px rgba(34,197,94,0.3); transform:scale(1.05);
        }

        .lang-card.dimmed { opacity:0.4; transform:scale(0.96); filter:grayscale(0.3); }
        .lang-card:disabled { cursor:not-allowed; }

        .lang-flag    { font-size:2rem; line-height:1; }
        .lang-native  { font-size:1rem; font-weight:600; color:#166534; text-align:center; }
        .lang-english { font-size:0.72rem; font-weight:500; color:#4b5563; text-transform:uppercase; letter-spacing:0.08em; }

        .check-icon {
          position:absolute; top:8px; right:10px;
          color:#22c55e; font-size:1.3rem; font-weight:700;
          animation:popIn 0.2s ease;
        }

        @keyframes popIn {
          from{transform:scale(0)} to{transform:scale(1)}
        }

        .footer-note-container { text-align:center; }

        .footer-note {
          color:#6b7280; font-size:0.85rem; font-weight:400;
          background:rgba(255,255,255,0.8); padding:8px 16px;
          border-radius:20px; display:inline-block;
          backdrop-filter:blur(4px); border:1px solid #e5e7eb;
        }
      `}</style>
    </div>
  );
}