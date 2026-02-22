import { useState, useRef, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";

export default function LanguageSwitcher() {
  const { selectedLang, chooseLanguage, resetLanguage, LANGUAGES } = useLanguage();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!selectedLang) return null;

  return (
    <div ref={dropdownRef} className="lang-switcher">
      <button
        className="switcher-btn"
        onClick={() => setOpen((p) => !p)}
        title="Change Language"
      >
        <span>{selectedLang.flag}</span>
        <span className="btn-label">{selectedLang.native}</span>
        <span className={`chevron ${open ? "open" : ""}`}>▾</span>
      </button>

      {open && (
        <div className="dropdown">
          <div className="dropdown-header">Select Language</div>
          <div className="dropdown-list">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                className={`dropdown-item ${selectedLang.code === lang.code ? "active" : ""}`}
                onClick={() => {
                  setOpen(false);
                  chooseLanguage(lang);
                }}
              >
                <span className="item-flag">{lang.flag}</span>
                <div className="item-text">
                  <span className="item-native">{lang.native}</span>
                  <span className="item-english">{lang.name}</span>
                </div>
                {selectedLang.code === lang.code && <span className="active-dot">●</span>}
              </button>
            ))}
          </div>
          <div className="dropdown-footer">
            <button className="reset-btn" onClick={resetLanguage}>
              ↩ Back to Language Select
            </button>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600&display=swap');

        .lang-switcher {
          position: relative;
          font-family: 'Outfit', sans-serif;
          z-index: 9999;
        }

        .switcher-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.08);
          border: 1.5px solid rgba(255,255,255,0.15);
          border-radius: 10px;
          padding: 8px 14px;
          color: #f1f5f9;
          cursor: pointer;
          font-family: 'Outfit', sans-serif;
          font-size: 0.92rem;
          font-weight: 500;
          transition: all 0.2s;
          backdrop-filter: blur(10px);
        }

        .switcher-btn:hover {
          background: rgba(99, 102, 241, 0.2);
          border-color: #6366f1;
        }

        .btn-label {
          max-width: 90px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .chevron {
          font-size: 0.75rem;
          transition: transform 0.2s;
          display: inline-block;
        }
        .chevron.open { transform: rotate(180deg); }

        .dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          background: #0f1117;
          border: 1.5px solid rgba(255,255,255,0.1);
          border-radius: 14px;
          width: 220px;
          box-shadow: 0 24px 60px rgba(0,0,0,0.5);
          overflow: hidden;
          animation: dropIn 0.2s ease;
        }

        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .dropdown-header {
          padding: 12px 16px 8px;
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #475569;
        }

        .dropdown-list {
          max-height: 320px;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: #334155 transparent;
        }

        .dropdown-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          background: transparent;
          border: none;
          cursor: pointer;
          color: #cbd5e1;
          font-family: 'Outfit', sans-serif;
          transition: background 0.15s;
        }

        .dropdown-item:hover { background: rgba(99,102,241,0.12); }
        .dropdown-item.active { background: rgba(99,102,241,0.18); }

        .item-flag { font-size: 1.2rem; flex-shrink: 0; }

        .item-text {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          flex: 1;
        }

        .item-native {
          font-size: 0.9rem;
          font-weight: 500;
          color: #f1f5f9;
        }

        .item-english {
          font-size: 0.72rem;
          color: #64748b;
        }

        .active-dot {
          color: #6366f1;
          font-size: 0.6rem;
        }

        .dropdown-footer {
          border-top: 1px solid rgba(255,255,255,0.06);
          padding: 10px 16px;
        }

        .reset-btn {
          background: none;
          border: none;
          color: #6366f1;
          font-family: 'Outfit', sans-serif;
          font-size: 0.82rem;
          cursor: pointer;
          padding: 0;
          transition: color 0.2s;
        }

        .reset-btn:hover { color: #a5b4fc; }
      `}</style>
    </div>
  );
}