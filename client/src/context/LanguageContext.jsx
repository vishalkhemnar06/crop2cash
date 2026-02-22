import { createContext, useContext, useState, useEffect } from "react";

export const LANGUAGES = [
  { code: "en",    name: "English",    native: "English",   flag: "🇺🇸", dir: "ltr" },
  { code: "hi",    name: "Hindi",      native: "हिंदी",      flag: "🇮🇳", dir: "ltr" },
  { code: "mr",    name: "Marathi",    native: "मराठी",      flag: "🇮🇳", dir: "ltr" },
  { code: "es",    name: "Spanish",    native: "Español",   flag: "🇪🇸", dir: "ltr" },
  { code: "fr",    name: "French",     native: "Français",  flag: "🇫🇷", dir: "ltr" },
  { code: "zh-CN", name: "Chinese",    native: "中文",       flag: "🇨🇳", dir: "ltr" },
  { code: "ar",    name: "Arabic",     native: "العربية",   flag: "🇸🇦", dir: "rtl" },
  { code: "pt",    name: "Portuguese", native: "Português", flag: "🇧🇷", dir: "ltr" },
  { code: "ru",    name: "Russian",    native: "Русский",   flag: "🇷🇺", dir: "ltr" },
  { code: "ja",    name: "Japanese",   native: "日本語",     flag: "🇯🇵", dir: "ltr" },
];

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  // ✅ Pure in-memory only — no localStorage, no sessionStorage
  // Resets to null on every page open/refresh → selector always shows
  const [selectedLang, setSelectedLang] = useState(null);

  function applyGoogleTranslate(langCode) {
    const value = langCode === "en" ? "/en/en" : `/en/${langCode}`;
    document.cookie = `googtrans=${value}; path=/`;
    document.cookie = `googtrans=${value}; path=/; domain=${window.location.hostname}`;
  }

  useEffect(() => {
    if (!selectedLang) return;
    applyGoogleTranslate(selectedLang.code);
    document.documentElement.dir  = selectedLang.dir;
    document.documentElement.lang = selectedLang.code;
  }, [selectedLang]);

  // ✅ navigate("/home") is called here after language is picked
  function chooseLanguage(lang, navigate) {
    applyGoogleTranslate(lang.code);
    setSelectedLang(lang);          // store in memory only
    if (navigate) navigate("/home"); // always go to /home
  }

  return (
    <LanguageContext.Provider value={{ selectedLang, chooseLanguage, LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}