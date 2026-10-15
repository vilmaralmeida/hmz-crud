import i18n from "i18next"
import { initReactI18next } from "react-i18next"

import { resources } from "@/i18n/resources"

i18n.use(initReactI18next).init({
  resources,
  lng: "pt",
  fallbackLng: "pt",
  interpolation: { escapeValue: false },
})

export default i18n
