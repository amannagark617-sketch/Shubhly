// Languages the site and the written report support.
//   name   how the language is written in its own script
//   ai     the language name given to the AI writer
//   prose  the language the daily wording tables use ("en", "hi" or "hn");
//          languages without their own daily wording use the closest one
export const LANGUAGES = {
  en: { name: "English", ai: "English", prose: "en" },
  hi: { name: "हिंदी", ai: "Hindi", prose: "hi" },
  hn: { name: "Hinglish", ai: "Hinglish", prose: "hn" },
  mr: { name: "मराठी", ai: "Marathi", prose: "hi" },
  bn: { name: "বাংলা", ai: "Bengali", prose: "en" },
  ta: { name: "தமிழ்", ai: "Tamil", prose: "en" },
  te: { name: "తెలుగు", ai: "Telugu", prose: "en" },
  gu: { name: "ગુજરાતી", ai: "Gujarati", prose: "hi" },
};
