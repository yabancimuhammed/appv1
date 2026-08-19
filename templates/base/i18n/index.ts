// Configuration i18next — copiée telle quelle en phase Scaffold (voir skill expo-ios-app).
// Détecte la langue système, retombe sur EN si la langue n'est ni FR ni EN. Toute app La Recette utilise
// EXACTEMENT ce setup — les clés vivent dans fr.json/en.json (au niveau app + fusionnées avec celles de
// l'archétype cloné, voir templates/archetypes/<x>/i18n/).
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";

import fr from "./fr.json";
import en from "./en.json";

const deviceLanguage = Localization.getLocales()[0]?.languageCode ?? "en";
const supported = ["fr", "en"];
const startLanguage = supported.includes(deviceLanguage) ? deviceLanguage : "en";

i18n.use(initReactI18next).init({
  resources: {
    fr: { translation: fr },
    en: { translation: en },
  },
  lng: startLanguage,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  compatibilityJSON: "v4",
});

export default i18n;
