import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { resources } from "./i18n/resources";

const savedLanguage = window.localStorage.getItem("app-language");
const fallbackLanguage = "es";
const language = savedLanguage && (savedLanguage === "es" || savedLanguage === "en") ? savedLanguage : fallbackLanguage;

void i18n.use(initReactI18next).init({
  resources,
  lng: language,
  fallbackLng: fallbackLanguage,
  interpolation: {
    escapeValue: false,
  },
});

i18n.on("languageChanged", (nextLanguage) => {
  window.localStorage.setItem("app-language", nextLanguage);
});

export default i18n;
