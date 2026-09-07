import React, { createContext, useContext, useState, useEffect } from "react";

export type SupportedLanguage = 
  | "en" // English
  | "ta" // Tamil
  | "hi" // Hindi
  | "te" // Telugu
  | "kn" // Kannada
  | "ml" // Malayalam
  | "mr" // Marathi
  | "bn" // Bengali
  | "gu" // Gujarati
  | "or" // Odia
  | "pa" // Punjabi
  | "as" // Assamese
  | "sa" // Sanskrit
  | "es" // Spanish
  | "fr" // French
  | "de" // German
  | "pt" // Portuguese
  | "id" // Indonesian
  | "th" // Thai
  | "si" // Sinhala
  | "ne" // Nepali
  | "ja" // Japanese
  | "ko" // Korean
  | "ar" // Arabic
  | "it" // Italian
  | "nl" // Dutch
  | "ru" // Russian
  | "ur" // Urdu
  | "ms" // Malay
  | "zh-CN"; // Chinese Simplified

export interface LanguageMeta {
  code: SupportedLanguage;
  label: string;
  level: "A" | "B" | "C";
  nativeLabel: string;
  uiStatus: "full_ui" | "controlled_expansion" | "framework";
  contentStatus: "full_content_priority" | "controlled_expansion" | "framework";
  reviewStatus: "needs_human_review";
  fallbackLanguage: "en" | "ta";
}

export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  { code: "en", label: "English", level: "A", nativeLabel: "English", uiStatus: "full_ui", contentStatus: "full_content_priority", reviewStatus: "needs_human_review", fallbackLanguage: "en" },
  { code: "ta", label: "Tamil", level: "A", nativeLabel: "தமிழ்", uiStatus: "full_ui", contentStatus: "full_content_priority", reviewStatus: "needs_human_review", fallbackLanguage: "en" },
  { code: "hi", label: "Hindi", level: "A", nativeLabel: "हिन्दी", uiStatus: "full_ui", contentStatus: "controlled_expansion", reviewStatus: "needs_human_review", fallbackLanguage: "en" },
  { code: "te", label: "Telugu", level: "A", nativeLabel: "తెలుగు", uiStatus: "full_ui", contentStatus: "controlled_expansion", reviewStatus: "needs_human_review", fallbackLanguage: "en" },
  { code: "kn", label: "Kannada", level: "A", nativeLabel: "ಕನ್ನಡ", uiStatus: "full_ui", contentStatus: "controlled_expansion", reviewStatus: "needs_human_review", fallbackLanguage: "en" },
  { code: "ml", label: "Malayalam", level: "A", nativeLabel: "മലയാളം", uiStatus: "full_ui", contentStatus: "controlled_expansion", reviewStatus: "needs_human_review", fallbackLanguage: "en" },
  { code: "mr", label: "Marathi", level: "B", nativeLabel: "मराठी", uiStatus: "controlled_expansion", contentStatus: "controlled_expansion", reviewStatus: "needs_human_review", fallbackLanguage: "en" },
  { code: "bn", label: "Bengali", level: "B", nativeLabel: "বাংলা", uiStatus: "controlled_expansion", contentStatus: "controlled_expansion", reviewStatus: "needs_human_review", fallbackLanguage: "en" },
  { code: "gu", label: "Gujarati", level: "B", nativeLabel: "ગુજરાતી", uiStatus: "controlled_expansion", contentStatus: "controlled_expansion", reviewStatus: "needs_human_review", fallbackLanguage: "en" },
  { code: "or", label: "Odia", level: "B", nativeLabel: "ଓଡ଼ିଆ", uiStatus: "controlled_expansion", contentStatus: "controlled_expansion", reviewStatus: "needs_human_review", fallbackLanguage: "en" },
  { code: "pa", label: "Punjabi", level: "B", nativeLabel: "ਪੰਜਾਬੀ", uiStatus: "controlled_expansion", contentStatus: "controlled_expansion", reviewStatus: "needs_human_review", fallbackLanguage: "en" },
  { code: "as", label: "Assamese", level: "B", nativeLabel: "অসমীয়া", uiStatus: "controlled_expansion", contentStatus: "controlled_expansion", reviewStatus: "needs_human_review", fallbackLanguage: "en" },
  { code: "sa", label: "Sanskrit", level: "B", nativeLabel: "संस्कृतम्", uiStatus: "controlled_expansion", contentStatus: "controlled_expansion", reviewStatus: "needs_human_review", fallbackLanguage: "en" },
  { code: "es", label: "Spanish", level: "C", nativeLabel: "Español", uiStatus: "framework", contentStatus: "framework", reviewStatus: "needs_human_review", fallbackLanguage: "en" },
  { code: "fr", label: "French", level: "C", nativeLabel: "Français", uiStatus: "framework", contentStatus: "framework", reviewStatus: "needs_human_review", fallbackLanguage: "en" },
  { code: "de", label: "German", level: "C", nativeLabel: "Deutsch", uiStatus: "framework", contentStatus: "framework", reviewStatus: "needs_human_review", fallbackLanguage: "en" },
  { code: "pt", label: "Portuguese", level: "C", nativeLabel: "Português", uiStatus: "framework", contentStatus: "framework", reviewStatus: "needs_human_review", fallbackLanguage: "en" },
  { code: "id", label: "Indonesian", level: "C", nativeLabel: "Bahasa Indonesia", uiStatus: "framework", contentStatus: "framework", reviewStatus: "needs_human_review", fallbackLanguage: "en" },
  { code: "th", label: "Thai", level: "C", nativeLabel: "ไทย", uiStatus: "framework", contentStatus: "framework", reviewStatus: "needs_human_review", fallbackLanguage: "en" },
  { code: "si", label: "Sinhala", level: "C", nativeLabel: "සිංහල", uiStatus: "framework", contentStatus: "framework", reviewStatus: "needs_human_review", fallbackLanguage: "en" },
  { code: "ne", label: "Nepali", level: "C", nativeLabel: "नेपाली", uiStatus: "framework", contentStatus: "framework", reviewStatus: "needs_human_review", fallbackLanguage: "en" },
  { code: "ja", label: "Japanese", level: "C", nativeLabel: "日本語", uiStatus: "framework", contentStatus: "framework", reviewStatus: "needs_human_review", fallbackLanguage: "en" },
  { code: "ko", label: "Korean", level: "C", nativeLabel: "한국어", uiStatus: "framework", contentStatus: "framework", reviewStatus: "needs_human_review", fallbackLanguage: "en" },
  { code: "ar", label: "Arabic", level: "C", nativeLabel: "العربية", uiStatus: "framework", contentStatus: "framework", reviewStatus: "needs_human_review", fallbackLanguage: "en" },
  { code: "it", label: "Italian", level: "C", nativeLabel: "Italiano", uiStatus: "framework", contentStatus: "framework", reviewStatus: "needs_human_review", fallbackLanguage: "en" },
  { code: "nl", label: "Dutch", level: "C", nativeLabel: "Nederlands", uiStatus: "framework", contentStatus: "framework", reviewStatus: "needs_human_review", fallbackLanguage: "en" },
  { code: "ru", label: "Russian", level: "C", nativeLabel: "Русский", uiStatus: "framework", contentStatus: "framework", reviewStatus: "needs_human_review", fallbackLanguage: "en" },
  { code: "ur", label: "Urdu", level: "C", nativeLabel: "اردو", uiStatus: "framework", contentStatus: "framework", reviewStatus: "needs_human_review", fallbackLanguage: "en" },
  { code: "ms", label: "Malay", level: "C", nativeLabel: "Bahasa Melayu", uiStatus: "framework", contentStatus: "framework", reviewStatus: "needs_human_review", fallbackLanguage: "en" },
  { code: "zh-CN", label: "Chinese Simplified", level: "C", nativeLabel: "简体中文", uiStatus: "framework", contentStatus: "framework", reviewStatus: "needs_human_review", fallbackLanguage: "en" },
];

export type TranslationUiState = "UI_COMPLETE" | "UI_PARTIAL";
export type TranslationContentState = "CONTENT_COMPLETE" | "CONTENT_PARTIAL" | "CONTENT_PENDING";

export interface LanguageTranslationState {
  ui: TranslationUiState;
  content: TranslationContentState;
}

/**
 * Honest availability metadata for the selector. A translated shell is not
 * treated as proof that the governed Ramayana corpus is translated.
 */
export const LANGUAGE_TRANSLATION_STATES: Record<SupportedLanguage, LanguageTranslationState> = Object.fromEntries(
  SUPPORTED_LANGUAGES.map((item) => [item.code, {
    ui: item.uiStatus === "full_ui" ? "UI_COMPLETE" : "UI_PARTIAL",
    content: ["en", "ta", "hi", "te", "kn", "ml"].includes(item.code) ? "CONTENT_PARTIAL" : "CONTENT_PENDING",
  }]),
) as Record<SupportedLanguage, LanguageTranslationState>;

export function isSupportedLanguage(value: string | null): value is SupportedLanguage {
  return Boolean(value && SUPPORTED_LANGUAGES.some((language) => language.code === value));
}

interface MultilingualContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  contentLanguage: SupportedLanguage;
  setContentLanguage: (lang: SupportedLanguage) => void;
  t: (key: string) => string;
  getLanguageMeta: (code: SupportedLanguage) => LanguageMeta;
  resolveContent: (value: string | null | undefined, availableLanguage?: SupportedLanguage) => { text: string; language: SupportedLanguage; isFallback: boolean };
}

const translations: Partial<Record<SupportedLanguage, Record<string, string>>> = {
  en: {
    heroTitle: "Explore the Eternal RamaVerse",
    heroSubtitle: "Immerse yourself in the sacred Valmiki Ramayana across seven Kandas, wisdom records, characters, and sacred places.",
    exploreKandas: "Explore 7 Kandas",
    guidedSearch: "Guided Search",
    kandasTitle: "7 Kandas Explorer",
    wisdomTitle: "108 Wisdom Records",
    charactersTitle: "51 Characters Encyclopedia",
    placesTitle: "25 Sacred Places Atlas",
    guidanceTitle: "100 Guidance Records",
    storiesTitle: "30 Kids Stories",
    quizzesTitle: "100 Quizzes",
    audioTitle: "30 Audio Scripts",
    libraryTitle: "Library & Journal",
    askRamaTitle: "Ask RamaVerse",
    homeLabel: "Home",
    exploreLabel: "Explore",
    ramaLifeLabel: "Rama Life",
    journeyLabel: "Journey",
    wisdomLabel: "Wisdom",
    askLabel: "Ask",
    libraryLabel: "Library",
    searchLabel: "Search",
    primaryLabel: "Primary",
    exploreSectionLabel: "Explore",
    contentNotice: "Full Ramayana content for this language is being expanded. You can continue in Tamil or English.",
    sourceThreadCaption: "Source-linked learning, one step at a time.",
    canonicalFirst: "Canonical-first",
    offlineFriendly: "Offline-friendly",
    exploreKnowledgeUniverse: "Explore the knowledge universe",
    followTheThread: "Follow the thread",
    goDeeperGently: "Go deeper, gently.",
    sourceConsciousDescription: "Move from narrative to place, question, or private reflection without losing the source trail.",
  },
  ta: {
    heroTitle: "நித்திய ராமவெர்ஸை ஆராயுங்கள்",
    heroSubtitle: "வால்மீகி ராமாயணத்தின் புனித காவியத்தை ஏழு காண்டங்கள், ஞான பதிவுகள் மற்றும் புனித தலங்கள் வழியாக உணருங்கள்.",
    exploreKandas: "7 காண்டங்களை காண்க",
    guidedSearch: "வழிகாட்டப்பட்ட தேடல்",
    kandasTitle: "7 காண்டங்கள்",
    wisdomTitle: "108 ஞான பதிவுகள்",
    charactersTitle: "51 கதாப்பாத்திரங்கள்",
    placesTitle: "25 புனித தலங்கள்",
    guidanceTitle: "100 வாழ்க்கை வழிகாட்டிகள்",
    storiesTitle: "30 குழந்தைகள் கதைகள்",
    quizzesTitle: "100 வினாடி வினாக்கள்",
    audioTitle: "30 ஆடியோ குறிப்புகள்",
    libraryTitle: "நூலகம் மற்றும் குறிப்பேடு",
    askRamaTitle: "ராமவெர்ஸிடம் கேளுங்கள்",
    homeLabel: "முகப்பு",
    exploreLabel: "ஆராயுங்கள்",
    ramaLifeLabel: "ராமரின் வாழ்க்கை",
    journeyLabel: "பயணம்",
    wisdomLabel: "ஞானம்",
    askLabel: "கேளுங்கள்",
    libraryLabel: "நூலகம்",
    searchLabel: "தேடல்",
    primaryLabel: "முதன்மை",
    exploreSectionLabel: "ஆராயுங்கள்",
    contentNotice: "இந்த மொழிக்கான முழு ராமாயண உள்ளடக்கமும் விரிவுபடுத்தப்பட்டு வருகிறது. நீங்கள் தமிழ் அல்லது ஆங்கிலத்தில் தொடரலாம்.",
    sourceThreadCaption: "ஆதாரத்துடன் இணைந்த கற்றல், படிப்படியாக.",
    canonicalFirst: "நியம ஆதாரமே முதன்மை",
    offlineFriendly: "ஆஃப்லைனிலும் இயங்கும்",
    exploreKnowledgeUniverse: "அறிவு உலகை ஆராயுங்கள்",
    followTheThread: "தொடர்பைத் தொடருங்கள்",
    goDeeperGently: "மேலும் ஆழமாக, மெதுவாக.",
    sourceConsciousDescription: "ஆதாரத் தடத்தை இழக்காமல் கதை, தலம், கேள்வி அல்லது தனிப்பட்ட சிந்தனைக்குச் செல்லுங்கள்.",
  },
  hi: {
    heroTitle: "अनंत रामावेर्स का अन्वेषण करें",
    heroSubtitle: "वाल्मीकि रामायण की सात कांडों, ज्ञान अभिलेखों और पवित्र स्थानों की पावन यात्रा करें।",
    exploreKandas: "7 कांड देखें",
    guidedSearch: "मार्गदर्शित खोज",
    kandasTitle: "7 कांड",
    wisdomTitle: "108 ज्ञान अभिलेख",
    charactersTitle: "51 पात्र विश्वकोश",
    placesTitle: "25 पवित्र स्थल एटलस",
    guidanceTitle: "100 मार्गदर्शन रिकॉर्ड",
    storiesTitle: "30 बाल कथाएँ",
    quizzesTitle: "100 क्विज़",
    audioTitle: "30 ऑडियो स्क्रिप्ट",
    libraryTitle: "पुस्तकालय और पत्रिका",
    askRamaTitle: "रामावेर्स से पूछें",
    contentNotice: "इस भाषा के लिए संपूर्ण रामायण सामग्री का विस्तार किया जा रहा है। आप तमिल या अंग्रेजी में जारी रख सकते हैं।",
    sourceThreadCaption: "स्रोत से जुड़ा सीखना, एक कदम पर एक कदम।",
    canonicalFirst: "प्रामाणिक स्रोत पहले",
    offlineFriendly: "ऑफ़लाइन भी उपलब्ध",
    exploreKnowledgeUniverse: "ज्ञान-विश्व का अन्वेषण करें",
    followTheThread: "स्रोत-धागे का अनुसरण करें",
    goDeeperGently: "धीरे-धीरे और गहराई में जाएँ।",
    sourceConsciousDescription: "स्रोत-धागा खोए बिना कथा, स्थान, प्रश्न या निजी मनन के बीच आगे बढ़ें।",
  },
  te: {
    heroTitle: "శాశ్వత రామవెర్స్‌ను అన్వేషించండి",
    heroSubtitle: "వాల్మీకి రామాయణంలోని ఏడు కాండలు, జ్ఞాన రికార్ట్లు మరియు పవిత్ర ప్రదేశాలను అన్వేషించండి.",
    exploreKandas: "7 కాండలను అన్వేషించండి",
    guidedSearch: "గైడెడ్ సెర్చ్",
    kandasTitle: "7 కాండలు",
    wisdomTitle: "108 జ్ఞాన రికార్ట్లు",
    charactersTitle: "51 పాత్రలు",
    placesTitle: "25 పవిత్ర ప్రదేశాలు",
    guidanceTitle: "100 మార్గదర్శక రికార్ట్లు",
    storiesTitle: "30 పిల్లల కథలు",
    quizzesTitle: "100 క్విజ్‌లు",
    audioTitle: "30 ఆడియో స్క్రిప్ట్‌లు",
    libraryTitle: "లైబ్రరీ & జర్నల్",
    askRamaTitle: "రామవెర్స్‌ను అడగండి",
    contentNotice: "ఈ భాషకు సంబంధించిన పూర్తి రామాయణ కంటెంట్ విస్తరించబడుతోంది. మీరు తమిళం లేదా ఇంగ్లీషులో కొనసాగవచ్చు.",
    sourceThreadCaption: "మూలాధారంతో కూడిన అభ్యాసం, ఒక్కో అడుగుగా.",
    canonicalFirst: "కానన్‌కు ప్రాధాన్యం",
    offlineFriendly: "ఆఫ్‌లైన్‌లో కూడా",
    exploreKnowledgeUniverse: "జ్ఞాన విశ్వాన్ని అన్వేషించండి",
    followTheThread: "మూలాధార తంతును అనుసరించండి",
    goDeeperGently: "మరింత లోతుగా, నెమ్మదిగా.",
    sourceConsciousDescription: "మూలాధారపు తంతును కోల్పోకుండా కథనం, స్థలం, ప్రశ్న లేదా వ్యక్తిగత ఆలోచనకు వెళ్లండి.",
  },
  kn: {
    heroTitle: "ಅನಂತ ರಾಮವರ್ಸ್ ಅನ್ನು ಅನ್ವೇಷಿಸಿ",
    heroSubtitle: "ವಾಲ್ಮೀಕಿ ರಾಮಾಯಣದ ಏಳು ಕಾಂಡಗಳು, ಜ್ಞಾನ ದಾಖಲೆಗಳು ಮತ್ತು ಪವಿತ್ರ ಸ್ಥಳಗಳನ್ನು ಅನ್ವೇಷಿಸಿ.",
    exploreKandas: "7 ಕಾಂಡಗಳನ್ನು ವೀಕ್ಷಿಸಿ",
    guidedSearch: "ಮಾರ್ಗದರ್ಶಿತ ಹುಡುಕಾಟ",
    kandasTitle: "7 ಕಾಂಡಗಳು",
    wisdomTitle: "108 ಜ್ಞಾನ ದಾಖಲೆಗಳು",
    charactersTitle: "51 ಪಾತ್ರಗಳು",
    placesTitle: "25 ಪವಿತ್ರ ಸ್ಥಳಗಳು",
    guidanceTitle: "100 ಮಾರ್ಗದರ್ಶನ ದಾಖಲೆಗಳು",
    storiesTitle: "30 ಮಕ್ಕಳ ಕಥೆಗಳು",
    quizzesTitle: "100 ರಸಪ್ರಶ್ನೆಗಳು",
    audioTitle: "30 ಆಡಿಯೋ ಸ್ಕ್ರಿಪ್ಟ್‌ಗಳು",
    libraryTitle: "ಗ್ರಂಥಾಲಯ ಮತ್ತು ಜರ್ನಲ್",
    askRamaTitle: "ರಾಮವರ್ಸ್ ಅನ್ನು ಕೇಳಿ",
    contentNotice: "ಈ ಭಾಷೆಯ ಸಂಪೂರ್ಣ ರಾಮಾಯಣ ವಿಷಯವನ್ನು ವಿಸ್ತರಿಸಲಾಗುತ್ತಿದೆ. ನೀವು ತಮಿಳು ಅಥವಾ ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಮುಂದುವರಿಯಬಹುದು.",
    sourceThreadCaption: "ಮೂಲಾಧಾರಕ್ಕೆ ಜೋಡಿದ ಕಲಿಕೆ, ಹೆಜ್ಜೆ ಹೆಜ್ಜೆಯಾಗಿ.",
    canonicalFirst: "ಕ್ಯಾನನ್‌ಗೆ ಮೊದಲ ಆದ್ಯತೆ",
    offlineFriendly: "ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿಯೂ ಲಭ್ಯ",
    exploreKnowledgeUniverse: "ಜ್ಞಾನ ವಿಶ್ವವನ್ನು ಅನ್ವೇಷಿಸಿ",
    followTheThread: "ಮೂಲಾಧಾರದ ಹಾದಿಯನ್ನು ಅನುಸರಿಸಿ",
    goDeeperGently: "ಇನ್ನಷ್ಟು ಆಳವಾಗಿ, ನಿಧಾನವಾಗಿ.",
    sourceConsciousDescription: "ಮೂಲಾಧಾರದ ಹಾದಿ ಕಳೆದುಕೊಳ್ಳದೆ ಕಥೆ, ಸ್ಥಳ, ಪ್ರಶ್ನೆ ಅಥವಾ ವೈಯಕ್ತಿಕ ಚಿಂತನೆಗೆ ಸಾಗಿರಿ.",
  },
  ml: {
    heroTitle: "ശാശ്വത രാമവേഴ്സ് പര്യവേക്ഷണം ചെയ്യുക",
    heroSubtitle: "വാൽമീകി രാമായണത്തിലെ ഏഴ് കാണ്ടങ്ങളും ജ്ഞാന രേഖകളും പവിത്ര സ്ഥലങ്ങളും അനുഭവിക്കുക.",
    exploreKandas: "7 കാണ്ടങ്ങൾ കാണുക",
    guidedSearch: "മാർഗ്ഗനിർദ്ദേശമുള്ള തിരയൽ",
    kandasTitle: "7 കാണ്ടങ്ങൾ",
    wisdomTitle: "108 ജ്ഞാന രേഖകൾ",
    charactersTitle: "51 കഥാപാത്രങ്ങൾ",
    placesTitle: "25 പുണ്യസ്ഥലങ്ങൾ",
    guidanceTitle: "100 മാർഗ്ഗനിർദ്ദേശ രേഖകൾ",
    storiesTitle: "30 കുട്ടികളുടെ കഥകൾ",
    quizzesTitle: "100 ക്വിസുകൾ",
    audioTitle: "30 ഓഡിയോ സ്ക്രിപ്റ്റുകൾ",
    libraryTitle: "ലൈബ്രറിയും ജേർണലും",
    askRamaTitle: "രാമവേഴ്സിനോട് ചോദിക്കുക",
    contentNotice: "ഈ ഭാഷയ്ക്കുള്ള സമ്പൂർണ്ണ രാമായണ ഉള്ളടക്കം വിപുീകരിച്ചുകൊണ്ടിരിക്കുകയാണ്. നിങ്ങൾക്ക് തമിഴിലോ ഇംഗ്ലീഷിലോ തുടരാം.",
    sourceThreadCaption: "ഉറവിടവുമായി ബന്ധിപ്പിച്ച പഠനം, ഓരോ പടിയായി.",
    canonicalFirst: "കാനോനിന് പ്രഥമ പരിഗണന",
    offlineFriendly: "ഓഫ്‌ലൈനിലും ലഭ്യം",
    exploreKnowledgeUniverse: "അറിവിന്റെ ലോകം പര്യവേക്ഷണം ചെയ്യുക",
    followTheThread: "ഉറവിടപ്പാത പിന്തുടരുക",
    goDeeperGently: "കൂടുതൽ ആഴത്തിലേക്ക്, സാവധാനം.",
    sourceConsciousDescription: "ഉറവിടപ്പാത നഷ്ടപ്പെടാതെ കഥ, സ്ഥലം, ചോദ്യം അല്ലെങ്കിൽ സ്വകാര്യ ചിന്തയിലേക്ക് നീങ്ങുക.",
  },
  sa: {
    heroTitle: "अनन्तरामवेर्स-अन्वेषणम्",
    heroSubtitle: "वाल्मीकिरामायणस्य सप्तकाण्डानि, ज्ञानलेखाः, पञ्चविंशतिपवित्रस्थानानि च अन्विष्यताम्।",
    exploreKandas: "सप्तकाण्डानि पश्यन्तु",
    guidedSearch: "निर्देशितसन्धानम्",
    kandasTitle: "सप्त काण्डानि",
    wisdomTitle: "१०८ ज्ञानलेखाः",
    charactersTitle: "५१ पात्राणि",
    placesTitle: "२५ पवित्रस्थानानि",
    guidanceTitle: "१०० मार्गदर्शनलेखाः",
    storiesTitle: "३० बालकथाः",
    quizzesTitle: "१०० प्रश्नावल्याः",
    audioTitle: "३० श्रव्यलिप्याः",
    libraryTitle: "ग्रंथालयः पत्रिका च",
    askRamaTitle: "रामवेर्स पृच्छतु",
    contentNotice: "अस्य भाषायाः सम्पूर्णं रामायणसामग्री वर्धमानमस्ति। भवन्तः तमिळु-आङ्ग्लभाषयोः प्रदेष्टुं शक्नुवन्ति।",
  },
  es: {
    heroTitle: "Explora el Eterno RamaVerse",
    heroSubtitle: "Sumérgete en el sagrado Valmiki Ramayana a través de siete Kandas, registros de sabiduría y lugares sagrados.",
    exploreKandas: "Explorar 7 Kandas",
    guidedSearch: "Búsqueda Guiada",
    kandasTitle: "7 Kandas",
    wisdomTitle: "108 Registros de Sabiduría",
    charactersTitle: "51 Personajes",
    placesTitle: "25 Lugares Sagrados",
    guidanceTitle: "100 Registros de Guía",
    storiesTitle: "30 Cuentos Infantiles",
    quizzesTitle: "100 Cuestionarios",
    audioTitle: "30 Guiones de Audio",
    libraryTitle: "Biblioteca y Diario",
    askRamaTitle: "Pregunta a RamaVerse",
    contentNotice: "El contenido completo de Ramayana para este idioma se está expandiendo. Puede continuar en tamil o inglés.",
  },
  fr: {
    heroTitle: "Explorez le RamaVerse Éternel",
    heroSubtitle: "Plongez dans le Valmiki Ramayana sacré à travers sept Kandas, des recueils de sagesse et des lieux sacrés.",
    exploreKandas: "Explorer les 7 Kandas",
    guidedSearch: "Recherche Guidée",
    kandasTitle: "7 Kandas",
    wisdomTitle: "108 Registres de Sagesse",
    charactersTitle: "51 Personnages",
    placesTitle: "25 Lieux Sacrés",
    guidanceTitle: "100 Registres de Guidance",
    storiesTitle: "30 Histoires pour Enfants",
    quizzesTitle: "100 Quiz",
    audioTitle: "30 Scripts Audio",
    libraryTitle: "Bibliothèque et Journal",
    askRamaTitle: "Demander à RamaVerse",
    contentNotice: "Le contenu complet du Ramayana pour cette langue est en cours d'expansion. Vous pouvez continuer en tamoul ou en anglais.",
  },
};

/**
 * Route and UI labels are keyed by stable locale codes, never by display order.
 * Corpus fields remain separate: untranslated governed content is rendered with
 * a selected-language fallback notice and its original source language intact.
 */
const tierATranslations: Partial<Record<SupportedLanguage, Record<string, string>>> = {
  en: {
    brandTagline: "Sacred Ramayana Platform", inNavigation: "in navigation", knowledgeGraph: "Knowledge Graph", uiContentSeparate: "UI language and corpus availability are separate. Selecting a language never implies that every record has a reviewed translation.", craftedWith: "Crafted with", forHeritage: "for the Ramayana heritage.", navHome: "Home", navExplore: "Explore", navKandas: "Kandas", navRamaLife: "Rama Life", navJourney: "Journey", navWisdom: "Wisdom", navAsk: "Ask", navLibrary: "Library", navSearch: "Search", navPrimary: "Primary", navExploreSection: "Explore", navGuidance: "Guidance", navStories: "Stories", navQuizzes: "Quizzes", navAudio: "Audio", save: "Save", saved: "Saved", markRead: "Mark read", markUnread: "Mark unread", decreaseFont: "Decrease reading font size", increaseFont: "Increase reading font size", hideSource: "Hide source", sourcePanel: "Source panel", readerLoading: "Loading edition-aware Sarga reader…", sargaUnavailable: "Sarga unavailable", returnKandas: "Return to Kandas", sourceRecordOnly: "This route is reserved for source-located records. It is not substituted with invented content.", markedReadDevice: "Marked read on this device.", readerStatusNotice: "The selected interface language does not imply an unreviewed Sarga translation.", metadataAvailability: "Record metadata availability", unavailableFields: "Unavailable fields are intentionally shown as unavailable rather than inferred from another edition or tradition.", available: "Available", recordPublished: "Published for this source-located record.", directLocator: "Direct edition locator available.", sectionNotPublished: "Not published until section-level source verification is complete.", entityNotPublished: "Not published until source-linked entity mapping is available.", dialogueNotPublished: "Not published until source-linked editorial review is complete.", dialogueLinks: "Dialogue and theme links", askWelcome: "Namaste! I am your RamaVerse Guided Search assistant, grounded exclusively in the 550 verified canonical records of Valmiki Ramayana. Ask me about Dharma, Rama’s journey, characters, or philosophical wisdom.", relationshipDiscovery: "Relationship discovery", relationshipNavigator: "Relationship evidence navigator", relationshipStatus: "Published relationship evidence status", publishedEdges: "Published relationship edges", fallbackProfile: "Fallback: select a profile’s evidence view", nextPublication: "Next publication gate: source-level review", firstProfile: "First profile", secondProfile: "Second profile", chooseProfile: "Choose a current profile", inspectGap: "Inspect evidence gap", loadingCharacters: "Loading 51 characters…", appearances: "Appearances", viewEvidence: "View evidence state", langStatus: "Source & language status", sourceId: "Source ID", tradition: "Tradition", openSourceLocator: "Open source locator", previousSarga: "Previous available Sarga", nextSarga: "Next available Sarga", noEarlier: "No earlier source-located record available", noLater: "No later source-located record available", langChange: "View / Change language", langCurrent: "Current language", langSearch: "Search languages", langList: "Available interface languages", langClose: "Close language selector", langNoMatch: "No interface language matches this search.", langSaved: "Your choice is saved on this device.", langEscape: "Press Escape to close.", uiComplete: "UI COMPLETE", uiPartial: "UI PARTIAL", contentAvailable: "CONTENT AVAILABLE", contentPartial: "CONTENT PARTIAL", contentPending: "CONTENT PENDING", contentFallback: "This record is not yet translated into the selected content language. English is shown and clearly labelled as an English fallback.", sourceLanguage: "Source language", sourceSanskrit: "Sanskrit / संस्कृतम्", translationUnavailable: "Selected-language translation unavailable", englishFallback: "English fallback", canonicalOnly: "Canonical-only", stagingNotIndexed: "Staging records are not indexed in public results.", skipLink: "Skip to main content", openMenu: "Open navigation menu", closeMenu: "Close navigation menu", corpusLegend: "Corpus classification legend", corpusLegendText: "Every module distinguishes source layers rather than treating later, regional, editorial, or unpublished material as one canonical stream.", canonicalExplore: "Canonical Explore", spiritualLearning: "Spiritual & Learning", sacredPlatform: "Sacred Platform", footerSummary: "The definitive digital home for the sacred Ramayana universe across seven Kandas, wisdom records, characters, sacred places, and spiritual guidance.", platformFidelity: "Dedicated to preserving and presenting the eternal wisdom of the Valmiki Ramayana with reverence and scholarly fidelity.", exploreModule: "Explore module", openAtlas: "Open Atlas", askAssistant: "Ask Assistant", openLibrary: "Open Library", statsKandas: "Sacred Kandas", statsWisdom: "Wisdom Records", statsCharacters: "Characters", statsPlaces: "Sacred Places", modulesTitle: "Comprehensive Platform Modules", modulesSubtitle: "Traverse every facet of the Ramayana through source-backed exploration tools, interactive timelines, and grounded assistance.", sourceGovernedBadge: "Source-governed sacred Ramayana knowledge universe", booksOfRamayana: "7 Books of the Ramayana", kandaExplorer: "The Seven Kandas Explorer", kandaIntro: "Journey through the current seven-Kanda corpus. Sarga navigation remains edition-aware until each locator is source-verified.", loadingKandas: "Loading sacred Kandas…", kanda: "Kanda", bookOf: "Book {n} of 7", editionAwareIndex: "Edition-aware Sarga index", kandaSummary: "Kanda summary", corpusMilestones: "Current corpus milestones", milestone: "Milestone", verifiedSargaIndex: "Verified Sarga index", editionOnly: "Only edition-specific, source-located records are shown.", openReader: "Open reader", openSource: "Open source", sourceLocated: "Source-located", sourceLocatedRelease: "Source-located in this release", sourceAcquired: "Source acquired", sourceAcquiredReview: "Quarantined review evidence; not canonical", notAcquired: "Not acquired", notPublished: "Not canonical", editorialReview: "Editorial review", nextSource: "Next exact source verification point", tamilTitle: "Tamil title", sourceText: "Source text", linksUnderReview: "Events and characters under review", noPublicationPath: "No publication path", stagingBranch: "Physical staging branch", underReview: "Under review — not canonical", inspectSource: "Inspect source locator", searchTitle: "RamaVerse Guided Search", searchBadge: "Deterministic local retrieval engine", searchSubtitle: "Search across source-located Sargas, wisdom records, characters, sacred places, guidance, stories, quizzes, and audio scripts.", searchInput: "Type to search across the entire RamaVerse universe…", foundMatches: "Found {n} matching canonical records for \"{q}\"", contentType: "Content type", reviewState: "Review state", allTypes: "All current canonical types", allStates: "All editorial states", needsSourceReview: "Needs source review", needsTamilReview: "Needs human Tamil review", traditionVariant: "Tradition variant", searchBegin: "Enter a search term above to begin exploring the RamaVerse knowledge graph.", searching: "Searching canonical records…", noRecords: "No records found matching \"{q}\".", searchCanonicalOnly: "Search is canonical-only.", record: "Record", character: "Character", location: "Location", guidance: "Guidance", story: "Story", quiz: "Quiz", wisdomRecords: "Wisdom records", characters: "Characters", sacredPlaces: "Sacred places", guidanceRecords: "Guidance records", kidsStories: "Kids stories", quizzes: "Quizzes", audioScripts: "Audio scripts", readerLanguage: "Reader interface language", progressDevice: "Reading progress is kept on this device.", summaryDisclosure: "This is an editorial summary. It is not displayed as a verse translation or quotation.", sourceStatus: "Source and language status", selectedInterface: "Selected interface", currentCanonical: "Current canonical", noBookmarks: "No bookmarks saved yet", noReflections: "No spiritual reflections yet", title: "Title", spiritualNote: "Spiritual note", clearLibraryConfirm: "Are you sure you want to clear all local library data?", unexpectedError: "An unexpected error occurred." },
  ta: {
    brandTagline: "புனித ராமாயண தளம்", inNavigation: "வழிசெலுத்தலில்", knowledgeGraph: "அறிவு வரைபடம்", uiContentSeparate: "இடைமுக மொழியும் தொகுப்பு கிடைப்பும் தனித்தனியானவை. மொழியைத் தேர்ந்தெடுப்பது ஒவ்வொரு பதிவும் மனிதர் மதிப்பாய்வு செய்த மொழிபெயர்ப்பைக் கொண்டுள்ளது என்று பொருளல்ல.", craftedWith: "அர்ப்பணிப்புடன் உருவாக்கப்பட்டது", forHeritage: "ராமாயண மரபுக்காக", navHome: "முகப்பு", navExplore: "ஆய்வு", navKandas: "காண்டங்கள்", navRamaLife: "ராமர் வாழ்க்கை", navJourney: "பயணம்", navWisdom: "ஞானம்", navAsk: "கேளுங்கள்", navLibrary: "நூலகம்", navSearch: "தேடல்", navPrimary: "முதன்மை", navExploreSection: "ஆய்வு", navGuidance: "வழிகாட்டல்", navStories: "கதைகள்", navQuizzes: "வினாடி வினாக்கள்", navAudio: "ஆடியோ", save: "சேமிக்க", saved: "சேமிக்கப்பட்டது", markRead: "வாசித்ததாகக் குறிக்க", markUnread: "வாசிக்காததாகக் குறிக்க", decreaseFont: "வாசிப்பு எழுத்தளவை குறைக்க", increaseFont: "வாசிப்பு எழுத்தளவை அதிகரிக்க", hideSource: "மூலத்தை மறைக்க", sourcePanel: "மூலப் பலகம்", readerLoading: "பதிப்பு சார்ந்த சர்க்க வாசகர் ஏற்றப்படுகிறது…", sargaUnavailable: "சர்க்க கிடைக்கவில்லை", returnKandas: "காண்டங்களுக்குத் திரும்புக", sourceRecordOnly: "இந்தப் பாதை மூல இடமுள்ள பதிவுகளுக்காக மட்டுமே. கற்பனை உள்ளடக்கம் சேர்க்கப்படவில்லை.", markedReadDevice: "இந்தச் சாதனத்தில் வாசித்ததாகக் குறிக்கப்பட்டது.", readerStatusNotice: "தேர்ந்தெடுத்த இடைமுக மொழி மதிப்பாய்வு செய்யாத சர்க்க மொழிபெயர்ப்பு உள்ளது என்று பொருளல்ல.", metadataAvailability: "பதிவு மெட்டாடேட்டா கிடைப்பு", unavailableFields: "கிடைக்காத புலங்கள் மற்றொரு பதிப்பு அல்லது மரபிலிருந்து ஊகிக்கப்படாமல் கிடைக்கவில்லை என்று காட்டப்படுகின்றன.", available: "கிடைக்கிறது", recordPublished: "இந்த மூல இடமுள்ள பதிவுக்காக வெளியிடப்பட்டது.", directLocator: "நேரடி பதிப்பு மூல இடம் கிடைக்கிறது.", sectionNotPublished: "பகுதி-நிலை மூலச் சரிபார்ப்பு முடியும் வரை வெளியிடப்படாது.", entityNotPublished: "மூல இணைந்த நிறுவன வரைபடம் கிடைக்கும் வரை வெளியிடப்படாது.", dialogueNotPublished: "மூல இணைந்த தொகுப்பாசிரியர் மறுஆய்வு முடியும் வரை வெளியிடப்படாது.", dialogueLinks: "உரையாடல் மற்றும் கருப்பொருள் இணைப்புகள்", askWelcome: "வணக்கம்! வால்மீகி ராமாயணத்தின் சரிபார்க்கப்பட்ட 550 முதன்மைப் பதிவுகளை மட்டுமே அடிப்படையாகக் கொண்ட ராமவெர்ஸ் வழிகாட்டித் தேடல் உதவியாளர் நான். தர்மம், ராமரின் பயணம், கதாப்பாத்திரங்கள் அல்லது தத்துவ ஞானம் குறித்து கேளுங்கள்.", relationshipDiscovery: "உறவு ஆய்வு", relationshipNavigator: "உறவு ஆதார வழிகாட்டி", relationshipStatus: "வெளியிடப்பட்ட உறவு ஆதார நிலை", publishedEdges: "வெளியிடப்பட்ட உறவு இணைப்புகள்", fallbackProfile: "மாற்று வழி: ஒரு சுயவிவரத்தின் ஆதாரக் காட்சியைத் தேர்ந்தெடுக்கவும்", nextPublication: "அடுத்த வெளியீட்டு வாயில்: மூல மறுஆய்வு", firstProfile: "முதல் சுயவிவரம்", secondProfile: "இரண்டாவது சுயவிவரம்", chooseProfile: "தற்போதைய சுயவிவரத்தைத் தேர்ந்தெடுக்கவும்", inspectGap: "ஆதார இடைவெளியைப் பார்க்க", loadingCharacters: "51 கதாப்பாத்திரங்கள் ஏற்றப்படுகின்றன…", appearances: "தோற்றங்கள்", viewEvidence: "ஆதார நிலையைப் பார்க்க", langStatus: "மூலம் மற்றும் மொழி நிலை", sourceId: "மூல ID", tradition: "மரபு", openSourceLocator: "மூல இடத்தைத் திறக்க", previousSarga: "முந்தைய கிடைக்கும் சர்க்கம்", nextSarga: "அடுத்த கிடைக்கும் சர்க்கம்", noEarlier: "முந்தைய மூல இடமுள்ள பதிவு இல்லை", noLater: "பிந்தைய மூல இடமுள்ள பதிவு இல்லை", langChange: "மொழியைப் பார்க்க / மாற்ற", langCurrent: "தற்போதைய மொழி", langSearch: "மொழிகளைத் தேடுங்கள்", langList: "கிடைக்கும் இடைமுக மொழிகள்", langClose: "மொழித் தேர்வை மூடுக", langNoMatch: "இந்த தேடலுக்கு எந்த இடைமுக மொழியும் பொருந்தவில்லை.", langSaved: "உங்கள் தேர்வு இந்த சாதனத்தில் சேமிக்கப்படுகிறது.", langEscape: "மூட Escape விசையை அழுத்தவும்.", uiComplete: "இடைமுகம் முழுமை", uiPartial: "இடைமுகம் பகுதி", contentAvailable: "உள்ளடக்கம் கிடைக்கிறது", contentPartial: "உள்ளடக்கம் பகுதி", contentPending: "உள்ளடக்கம் நிலுவையில்", contentFallback: "இந்த பதிவு தேர்ந்தெடுக்கப்பட்ட உள்ளடக்க மொழியில் இன்னும் மொழிபெயர்க்கப்படவில்லை. ஆங்கிலம் ஆங்கில மாற்று உள்ளடக்கமாகத் தெளிவாகக் காட்டப்படுகிறது.", sourceLanguage: "மூல மொழி", sourceSanskrit: "சமஸ்கிருதம் / संस्कृतम्", translationUnavailable: "தேர்ந்தெடுத்த மொழிபெயர்ப்பு கிடைக்கவில்லை", englishFallback: "ஆங்கில மாற்று", canonicalOnly: "முதன்மை பதிவுகள் மட்டும்", stagingNotIndexed: "நிலுவை பதிவுகள் பொது தேடலில் சேர்க்கப்படவில்லை.", skipLink: "முதன்மை உள்ளடக்கத்திற்குச் செல்லுங்கள்", openMenu: "வழிசெலுத்தல் மெனுவைத் திறக்க", closeMenu: "வழிசெலுத்தல் மெனுவை மூட", corpusLegend: "பதிவு வகைப்பாட்டு விளக்கம்", corpusLegendText: "பிந்தைய, பிராந்திய, தொகுப்பாசிரியர் அல்லது வெளியிடப்படாத பதிவுகளை ஒரே முதன்மை ஓட்டமாகக் கருதாமல் ஒவ்வொரு தொகுதியும் மூல அடுக்குகளைப் பிரிக்கிறது.", canonicalExplore: "முதன்மை ஆய்வு", spiritualLearning: "ஆன்மிகம் மற்றும் கற்றல்", sacredPlatform: "புனித தளம்", footerSummary: "ஏழு காண்டங்கள், ஞானப் பதிவுகள், கதாபாத்திரங்கள், புனிதத் தலங்கள் மற்றும் ஆன்மிக வழிகாட்டலுடன் ராமாயண உலகிற்கான டிஜிட்டல் இல்லம்.", platformFidelity: "வால்மீகி ராமாயணத்தின் நித்திய ஞானத்தை மரியாதையுடனும் ஆய்வுநேர்மையுடனும் காக்கவும் வழங்கவும் அர்ப்பணிக்கப்பட்டது.", exploreModule: "தொகுதியை ஆராயுங்கள்", openAtlas: "அட்லஸைத் திறக்க", askAssistant: "உதவியாளரிடம் கேட்க", openLibrary: "நூலகத்தைத் திறக்க", statsKandas: "புனித காண்டங்கள்", statsWisdom: "ஞானப் பதிவுகள்", statsCharacters: "கதாப்பாத்திரங்கள்", statsPlaces: "புனிதத் தலங்கள்", modulesTitle: "முழுமையான தளத் தொகுதிகள்", modulesSubtitle: "மூல ஆதார ஆய்வு கருவிகள், காலவரிசைகள் மற்றும் ஆதாரமுள்ள உதவியுடன் ராமாயணத்தின் ஒவ்வொரு பரிமாணத்தையும் ஆராயுங்கள்.", sourceGovernedBadge: "மூல ஆதாரத்தால் நிர்வகிக்கப்படும் புனித ராமாயண அறிவுலகம்", booksOfRamayana: "ராமாயணத்தின் 7 காண்டங்கள்", kandaExplorer: "ஏழு காண்டங்கள் ஆய்வு", kandaIntro: "தற்போதைய ஏழு காண்டத் தொகுப்பை ஆராயுங்கள். ஒவ்வொரு இடமும் மூலத்தால் சரிபார்க்கப்படும் வரை சர்க்க வழிசெலுத்தல் பதிப்பு சார்ந்ததாக இருக்கும்.", loadingKandas: "புனித காண்டங்கள் ஏற்றப்படுகின்றன…", kanda: "காண்டம்", bookOf: "7-இல் {n}-ஆம் காண்டம்", editionAwareIndex: "பதிப்பு சார்ந்த சர்க்க அட்டவணை", kandaSummary: "காண்டச் சுருக்கம்", corpusMilestones: "தற்போதைய தொகுப்பு மைல்கற்கள்", milestone: "மைல்கல்", verifiedSargaIndex: "சரிபார்க்கப்பட்ட சர்க்க அட்டவணை", editionOnly: "பதிப்பு சார்ந்த, மூல இடமுள்ள பதிவுகள் மட்டும் காட்டப்படுகின்றன.", openReader: "வாசிப்பைத் திறக்க", openSource: "மூலத்தைத் திறக்க", sourceLocated: "மூல இடம் உள்ளது", sourceLocatedRelease: "இந்த வெளியீட்டில் மூல இடம் உள்ளது", sourceAcquired: "மூலம் பெறப்பட்டது", sourceAcquiredReview: "தனிமைப்படுத்தப்பட்ட மறுஆய்வு ஆதாரம்; முதன்மை பதிவு அல்ல", notAcquired: "பெறப்படவில்லை", notPublished: "முதன்மை பதிவு அல்ல", editorialReview: "தொகுப்பாசிரியர் மறுஆய்வு", nextSource: "அடுத்த துல்லியமான மூலச் சரிபார்ப்பு இடம்", tamilTitle: "தமிழ்த் தலைப்பு", sourceText: "மூல உரை", linksUnderReview: "நிகழ்வுகள் மற்றும் கதாப்பாத்திரங்கள் மறுஆய்வில்", noPublicationPath: "வெளியீட்டு பாதை இல்லை", stagingBranch: "நிலுவைத் தொகுப்பு கிளை", underReview: "மறுஆய்வில் — முதன்மை பதிவு அல்ல", inspectSource: "மூல இடத்தைப் பார்க்க", searchTitle: "ராமவெர்ஸ் வழிகாட்டிய தேடல்", searchBadge: "நிர்ணயிக்கப்பட்ட உள்ளூர் தேடல் இயந்திரம்", searchSubtitle: "மூல இடமுள்ள சர்க்கங்கள், ஞானப் பதிவுகள், கதாப்பாத்திரங்கள், புனிதத் தலங்கள், வழிகாட்டல், கதைகள், வினாடி வினாக்கள் மற்றும் ஆடியோ குறிப்புகளில் தேடுங்கள்.", searchInput: "முழு ராமவெர்ஸ் உலகிலும் தேட தட்டச்சிடுங்கள்…", foundMatches: "\"{q}\" க்கான {n} முதன்மைப் பதிவுகள் கிடைத்தன", contentType: "உள்ளடக்க வகை", reviewState: "மறுஆய்வு நிலை", allTypes: "அனைத்து தற்போதைய முதன்மை வகைகளும்", allStates: "அனைத்து தொகுப்பாசிரியர் நிலைகளும்", needsSourceReview: "மூல மறுஆய்வு தேவை", needsTamilReview: "மனித தமிழ் மறுஆய்வு தேவை", traditionVariant: "மரபு மாறுபாடு", searchBegin: "ராமவெர்ஸ் அறிவு வரைபடத்தை ஆராய மேலே தேடல் சொல்லை உள்ளிடுங்கள்.", searching: "முதன்மைப் பதிவுகள் தேடப்படுகின்றன…", noRecords: "\"{q}\" க்கு பதிவுகள் எதுவும் கிடைக்கவில்லை.", searchCanonicalOnly: "முதன்மைப் பதிவுகள் மட்டும் தேடப்படும். ", record: "பதிவு", character: "கதாப்பாத்திரம்", location: "இடம்", guidance: "வழிகாட்டல்", story: "கதை", quiz: "வினாடி வினா", wisdomRecords: "ஞானப் பதிவுகள்", characters: "கதாப்பாத்திரங்கள்", sacredPlaces: "புனிதத் தலங்கள்", guidanceRecords: "வழிகாட்டல் பதிவுகள்", kidsStories: "குழந்தைகள் கதைகள்", quizzes: "வினாடி வினாக்கள்", audioScripts: "ஆடியோ குறிப்புகள்", readerLanguage: "வாசகர் இடைமுக மொழி", progressDevice: "வாசிப்பு முன்னேற்றம் இந்த சாதனத்தில் சேமிக்கப்படுகிறது.", summaryDisclosure: "இது ஒரு தொகுப்பாசிரியர் சுருக்கம்; செய்யுள் மொழிபெயர்ப்பாகவோ மேற்கோளாகவோ காட்டப்படவில்லை.", sourceStatus: "மூலம் மற்றும் மொழி நிலை", selectedInterface: "தேர்ந்தெடுத்த இடைமுகம்", currentCanonical: "தற்போதைய முதன்மை", noBookmarks: "புத்தகக்குறிப்புகள் இன்னும் இல்லை", noReflections: "ஆன்மிகக் குறிப்புகள் இன்னும் இல்லை", title: "தலைப்பு", spiritualNote: "ஆன்மிகக் குறிப்பு", clearLibraryConfirm: "உள்ளூர் நூலகத் தரவை முழுவதும் அழிக்க விரும்புகிறீர்களா?", unexpectedError: "எதிர்பாராத பிழை ஏற்பட்டது." },
  hi: {
    brandTagline: "पवित्र रामायण मंच", inNavigation: "नेविगेशन में", knowledgeGraph: "ज्ञान ग्राफ़", uiContentSeparate: "इंटरफ़ेस भाषा और संग्रह की उपलब्धता अलग हैं। भाषा चुनने का अर्थ यह नहीं कि हर अभिलेख का मानव-समीक्षित अनुवाद उपलब्ध है।", craftedWith: "समर्पण से निर्मित", forHeritage: "रामायण की विरासत के लिए", navHome: "मुखपृष्ठ", navExplore: "अन्वेषण", navKandas: "कांड", navRamaLife: "राम जीवन", navJourney: "यात्रा", navWisdom: "ज्ञान", navAsk: "पूछें", navLibrary: "पुस्तकालय", navSearch: "खोज", navPrimary: "मुख्य", navExploreSection: "अन्वेषण", navGuidance: "मार्गदर्शन", navStories: "कथाएँ", navQuizzes: "प्रश्नोत्तरी", navAudio: "ऑडियो", save: "सहेजें", saved: "सहेजा गया", markRead: "पठित चिह्नित करें", markUnread: "अपठित चिह्नित करें", decreaseFont: "पठन अक्षर आकार घटाएँ", increaseFont: "पठन अक्षर आकार बढ़ाएँ", hideSource: "स्रोत छिपाएँ", sourcePanel: "स्रोत पैनल", readerLoading: "संस्करण-सचेत सर्ग पाठ लोड हो रहा है…", sargaUnavailable: "सर्ग उपलब्ध नहीं", returnKandas: "कांड पर लौटें", sourceRecordOnly: "यह मार्ग केवल स्रोत-स्थित अभिलेखों के लिए है। इसमें गढ़ी हुई सामग्री नहीं जोड़ी जाती।", markedReadDevice: "इस उपकरण पर पठित चिह्नित किया गया।", readerStatusNotice: "चयनित इंटरफ़ेस भाषा का अर्थ यह नहीं कि सर्ग का मानव-समीक्षित अनुवाद उपलब्ध है।", metadataAvailability: "अभिलेख मेटाडेटा उपलब्धता", unavailableFields: "अनुपलब्ध फ़ील्ड को किसी अन्य संस्करण या परंपरा से अनुमानित करने के बजाय अनुपलब्ध दिखाया गया है।", available: "उपलब्ध", recordPublished: "इस स्रोत-स्थित अभिलेख के लिए प्रकाशित।", directLocator: "प्रत्यक्ष संस्करण स्रोत-स्थान उपलब्ध।", sectionNotPublished: "खंड-स्तरीय स्रोत सत्यापन पूरा होने तक प्रकाशित नहीं।", entityNotPublished: "स्रोत-लिंक्ड इकाई मानचित्रण उपलब्ध होने तक प्रकाशित नहीं।", dialogueNotPublished: "स्रोत-लिंक्ड संपादकीय समीक्षा पूरी होने तक प्रकाशित नहीं।", dialogueLinks: "संवाद और विषय लिंक", askWelcome: "नमस्ते! मैं वाल्मीकि रामायण के सत्यापित 550 canonical अभिलेखों पर आधारित रामावर्स निर्देशित खोज सहायक हूँ। धर्म, राम की यात्रा, पात्रों या दार्शनिक ज्ञान के बारे में पूछें।", relationshipDiscovery: "संबंध अन्वेषण", relationshipNavigator: "संबंध साक्ष्य नेविगेटर", relationshipStatus: "प्रकाशित संबंध साक्ष्य स्थिति", publishedEdges: "प्रकाशित संबंध किनारे", fallbackProfile: "वैकल्पिक मार्ग: प्रोफ़ाइल का साक्ष्य दृश्य चुनें", nextPublication: "अगला प्रकाशन द्वार: स्रोत समीक्षा", firstProfile: "पहली प्रोफ़ाइल", secondProfile: "दूसरी प्रोफ़ाइल", chooseProfile: "वर्तमान प्रोफ़ाइल चुनें", inspectGap: "साक्ष्य अंतर देखें", loadingCharacters: "51 पात्र लोड हो रहे हैं…", appearances: "उपस्थिति", viewEvidence: "साक्ष्य स्थिति देखें", langStatus: "स्रोत और भाषा स्थिति", sourceId: "स्रोत ID", tradition: "परंपरा", openSourceLocator: "स्रोत स्थान खोलें", previousSarga: "पिछला उपलब्ध सर्ग", nextSarga: "अगला उपलब्ध सर्ग", noEarlier: "पहले का स्रोत-स्थित अभिलेख उपलब्ध नहीं", noLater: "बाद का स्रोत-स्थित अभिलेख उपलब्ध नहीं", langChange: "भाषा देखें / बदलें", langCurrent: "वर्तमान भाषा", langSearch: "भाषाएँ खोजें", langList: "उपलब्ध इंटरफ़ेस भाषाएँ", langClose: "भाषा चयन बंद करें", langNoMatch: "इस खोज से कोई इंटरफ़ेस भाषा मेल नहीं खाती।", langSaved: "आपकी पसंद इस उपकरण पर सुरक्षित है।", langEscape: "बंद करने के लिए Escape दबाएँ।", uiComplete: "इंटरफ़ेस पूर्ण", uiPartial: "इंटरफ़ेस आंशिक", contentAvailable: "सामग्री उपलब्ध", contentPartial: "सामग्री आंशिक", contentPending: "सामग्री लंबित", contentFallback: "यह अभिलेख चुनी गई सामग्री भाषा में अभी अनूदित नहीं है। अंग्रेज़ी को अंग्रेज़ी वैकल्पिक सामग्री के रूप में स्पष्ट रूप से दिखाया गया है।", sourceLanguage: "मूल भाषा", sourceSanskrit: "संस्कृत / संस्कृतम्", translationUnavailable: "चुनी हुई भाषा का अनुवाद उपलब्ध नहीं", englishFallback: "अंग्रेज़ी विकल्प", canonicalOnly: "केवल प्रमाणित मूल", stagingNotIndexed: "स्टेजिंग अभिलेख सार्वजनिक खोज में शामिल नहीं हैं।", skipLink: "मुख्य सामग्री पर जाएँ", openMenu: "नेविगेशन मेनू खोलें", closeMenu: "नेविगेशन मेनू बंद करें", corpusLegend: "स्रोत-वर्गीकरण विवरण", corpusLegendText: "हर मॉड्यूल बाद के, क्षेत्रीय, संपादकीय या अप्रकाशित स्रोतों को एक ही प्रमाणित धारा न मानकर अलग रखता है।", canonicalExplore: "प्रमाणित खोज", spiritualLearning: "आध्यात्मिक और सीखना", sacredPlatform: "पवित्र मंच", footerSummary: "सात कांडों, ज्ञान अभिलेखों, पात्रों, पवित्र स्थानों और आध्यात्मिक मार्गदर्शन सहित पवित्र रामायण का डिजिटल घर।", platformFidelity: "वाल्मीकि रामायण के शाश्वत ज्ञान को श्रद्धा और विद्वतापूर्ण निष्ठा से प्रस्तुत करने के लिए समर्पित।", exploreModule: "मॉड्यूल देखें", openAtlas: "एटलस खोलें", askAssistant: "सहायक से पूछें", openLibrary: "पुस्तकालय खोलें", statsKandas: "पवित्र कांड", statsWisdom: "ज्ञान अभिलेख", statsCharacters: "पात्र", statsPlaces: "पवित्र स्थान", modulesTitle: "व्यापक मंच मॉड्यूल", modulesSubtitle: "स्रोत-आधारित उपकरणों, समयरेखाओं और प्रमाणित सहायता से रामायण के हर पक्ष को जानें।", sourceGovernedBadge: "स्रोत-नियंत्रित पवित्र रामायण ज्ञान जगत", booksOfRamayana: "रामायण के 7 कांड", kandaExplorer: "सात कांड अन्वेषक", kandaIntro: "वर्तमान सात-कांड संग्रह की यात्रा करें। प्रत्येक स्रोत-स्थान सत्यापित होने तक सर्ग नेविगेशन संस्करण-सचेत रहेगा।", loadingKandas: "पवित्र कांड लोड हो रहे हैं…", kanda: "कांड", bookOf: "7 में से कांड {n}", editionAwareIndex: "संस्करण-सचेत सर्ग सूची", kandaSummary: "कांड सारांश", corpusMilestones: "वर्तमान संग्रह पड़ाव", milestone: "पड़ाव", verifiedSargaIndex: "सत्यापित सर्ग सूची", editionOnly: "केवल संस्करण-विशिष्ट, स्रोत-स्थित अभिलेख दिखाए जाते हैं।", openReader: "पाठ खोलें", openSource: "स्रोत खोलें", sourceLocated: "स्रोत स्थित", sourceLocatedRelease: "इस रिलीज़ में स्रोत स्थित", sourceAcquired: "स्रोत प्राप्त", sourceAcquiredReview: "पृथक समीक्षा प्रमाण; प्रमाणित मूल नहीं", notAcquired: "प्राप्त नहीं", notPublished: "प्रमाणित मूल नहीं", editorialReview: "संपादकीय समीक्षा", nextSource: "अगला सटीक स्रोत सत्यापन बिंदु", tamilTitle: "तमिल शीर्षक", sourceText: "मूल पाठ", linksUnderReview: "घटनाएँ और पात्र समीक्षा में", noPublicationPath: "प्रकाशन पथ नहीं", stagingBranch: "स्टेजिंग शाखा", underReview: "समीक्षा में — प्रमाणित मूल नहीं", inspectSource: "स्रोत स्थान देखें", searchTitle: "रामावेर्स निर्देशित खोज", searchBadge: "निर्धारित स्थानीय खोज इंजन", searchSubtitle: "स्रोत-स्थित सर्गों, ज्ञान अभिलेखों, पात्रों, पवित्र स्थानों, मार्गदर्शन, कहानियों, क्विज़ और ऑडियो स्क्रिप्ट में खोजें।", searchInput: "पूरे रामावेर्स में खोजने के लिए लिखें…", foundMatches: "\"{q}\" के लिए {n} प्रमाणित अभिलेख मिले", contentType: "सामग्री प्रकार", reviewState: "समीक्षा स्थिति", allTypes: "सभी वर्तमान प्रमाणित प्रकार", allStates: "सभी संपादकीय स्थितियाँ", needsSourceReview: "स्रोत समीक्षा आवश्यक", needsTamilReview: "मानव तमिल समीक्षा आवश्यक", traditionVariant: "परंपरा भिन्नता", searchBegin: "रामावेर्स ज्ञान जगत देखने के लिए ऊपर खोज शब्द लिखें।", searching: "प्रमाणित अभिलेख खोजे जा रहे हैं…", noRecords: "\"{q}\" से मेल खाते अभिलेख नहीं मिले।", searchCanonicalOnly: "खोज केवल प्रमाणित मूल में होती है।", record: "अभिलेख", character: "पात्र", location: "स्थान", guidance: "मार्गदर्शन", story: "कथा", quiz: "प्रश्नोत्तरी", wisdomRecords: "ज्ञान अभिलेख", characters: "पात्र", sacredPlaces: "पवित्र स्थान", guidanceRecords: "मार्गदर्शन अभिलेख", kidsStories: "बाल कथाएँ", quizzes: "प्रश्नोत्तरी", audioScripts: "ऑडियो स्क्रिप्ट", readerLanguage: "पाठक इंटरफ़ेस भाषा", progressDevice: "पठन प्रगति इस उपकरण पर सुरक्षित है।", summaryDisclosure: "यह संपादकीय सारांश है; इसे श्लोक अनुवाद या उद्धरण के रूप में नहीं दिखाया गया है।", sourceStatus: "स्रोत और भाषा स्थिति", selectedInterface: "चयनित इंटरफ़ेस", currentCanonical: "वर्तमान प्रमाणित मूल", noBookmarks: "अभी कोई बुकमार्क नहीं", noReflections: "अभी कोई आध्यात्मिक टिप्पणी नहीं", title: "शीर्षक", spiritualNote: "आध्यात्मिक टिप्पणी", clearLibraryConfirm: "क्या आप सभी स्थानीय पुस्तकालय डेटा को हटाना चाहते हैं?", unexpectedError: "एक अनपेक्षित त्रुटि हुई।" },
  te: {
    brandTagline: "పవిత్ర రామాయణ వేదిక", inNavigation: "నావిగేషన్‌లో", knowledgeGraph: "జ్ఞాన గ్రాఫ్", uiContentSeparate: "ఇంటర్‌ఫేస్ భాష మరియు కంటెంట్ లభ్యత వేర్వేరు. భాషను ఎంచుకోవడం ప్రతి రికార్డుకు మానవ సమీక్ష చేసిన అనువాదం ఉందని సూచించదు.", craftedWith: "అంకితభావంతో రూపొందించబడింది", forHeritage: "రామాయణ వారసత్వం కోసం", navHome: "హోమ్", navExplore: "అన్వేషణ", navKandas: "కాండలు", navRamaLife: "రాముని జీవితం", navJourney: "ప్రయాణం", navWisdom: "జ్ఞానం", navAsk: "అడగండి", navLibrary: "లైబ్రరీ", navSearch: "శోధన", navPrimary: "ప్రధానం", navExploreSection: "అన్వేషణ", navGuidance: "మార్గదర్శకత్వం", navStories: "కథలు", navQuizzes: "క్విజ్‌లు", navAudio: "ఆడియో", save: "సేవ్ చేయి", saved: "సేవ్ చేయబడింది", markRead: "చదివినదిగా గుర్తించు", markUnread: "చదవనిదిగా గుర్తించు", decreaseFont: "చదువు అక్షర పరిమాణం తగ్గించు", increaseFont: "చదువు అక్షర పరిమాణం పెంచు", hideSource: "మూలాన్ని దాచు", sourcePanel: "మూల ప్యానెల్", readerLoading: "ఎడిషన్-ఆధారిత సర్గ రీడర్ లోడ్ అవుతోంది…", sargaUnavailable: "సర్గ అందుబాటులో లేదు", returnKandas: "కాండలకు తిరిగి వెళ్లండి", sourceRecordOnly: "ఈ మార్గం మూలం-లొకేటెడ్ రికార్డుల కోసం మాత్రమే. కల్పిత కంటెంట్ జోడించబడదు.", markedReadDevice: "ఈ పరికరంలో చదివినదిగా గుర్తించబడింది.", readerStatusNotice: "ఎంచుకున్న ఇంటర్‌ఫేస్ భాష అంటే సర్గకు మానవ సమీక్ష చేసిన అనువాదం ఉందని కాదు.", metadataAvailability: "రికార్డు మెటాడేటా లభ్యత", unavailableFields: "అందుబాటులో లేని ఫీల్డులు ఇతర ఎడిషన్ లేదా సంప్రదాయం నుంచి ఊహించకుండా అందుబాటులో లేవని చూపబడతాయి.", available: "అందుబాటులో ఉంది", recordPublished: "ఈ మూల-లొకేటెడ్ రికార్డు కోసం ప్రచురించబడింది.", directLocator: "ప్రత్యక్ష ఎడిషన్ లొకేటర్ అందుబాటులో ఉంది.", sectionNotPublished: "సెక్షన్-స్థాయి మూల ధృవీకరణ పూర్తయ్యే వరకు ప్రచురించబడదు.", entityNotPublished: "మూల-లింక్ చేసిన ఎంటిటీ మ్యాపింగ్ అందుబాటులోకి వచ్చే వరకు ప్రచురించబడదు.", dialogueNotPublished: "మూల-లింక్ చేసిన సంపాదకీయ సమీక్ష పూర్తయ్యే వరకు ప్రచురించబడదు.", dialogueLinks: "సంభాషణ మరియు అంశ లింకులు", askWelcome: "నమస్తే! వాల్మీకి రామాయణంలోని ధృవీకరించిన 550 ప్రధాన రికార్డులపై ఆధారపడిన రామావర్స్ మార్గదర్శిత శోధన సహాయకుడిని. ధర్మం, రాముని ప్రయాణం, పాత్రలు లేదా తాత్విక జ్ఞానం గురించి అడగండి.", relationshipDiscovery: "సంబంధాల అన్వేషణ", relationshipNavigator: "సంబంధ ఆధార నావిగేటర్", relationshipStatus: "ప్రచురిత సంబంధ ఆధార స్థితి", publishedEdges: "ప్రచురిత సంబంధ అంచులు", fallbackProfile: "ఫాల్‌బ్యాక్: ప్రొఫైల్ ఆధార వీక్షణను ఎంచుకోండి", nextPublication: "తదుపరి ప్రచురణ గేట్: మూల సమీక్ష", firstProfile: "మొదటి ప్రొఫైల్", secondProfile: "రెండవ ప్రొఫైల్", chooseProfile: "ప్రస్తుత ప్రొఫైల్‌ను ఎంచుకోండి", inspectGap: "ఆధార లోటును పరిశీలించండి", loadingCharacters: "51 పాత్రలు లోడ్ అవుతున్నాయి…", appearances: "కనిపించిన సందర్భాలు", viewEvidence: "ఆధార స్థితిని చూడండి", langStatus: "మూలం మరియు భాష స్థితి", sourceId: "మూల ID", tradition: "సంప్రదాయం", openSourceLocator: "మూల లొకేటర్ తెరవండి", previousSarga: "మునుపటి అందుబాటులో ఉన్న సర్గ", nextSarga: "తదుపరి అందుబాటులో ఉన్న సర్గ", noEarlier: "మునుపటి మూల-లొకేటెడ్ రికార్డు అందుబాటులో లేదు", noLater: "తరువాతి మూల-లొకేటెడ్ రికార్డు అందుబాటులో లేదు", langChange: "భాషను చూడండి / మార్చండి", langCurrent: "ప్రస్తుత భాష", langSearch: "భాషలను వెతకండి", langList: "అందుబాటులో ఉన్న ఇంటర్‌ఫేస్ భాషలు", langClose: "భాష ఎంపికను మూసివేయండి", langNoMatch: "ఈ శోధనకు ఇంటర్‌ఫేస్ భాష ఏదీ సరిపోలలేదు.", langSaved: "మీ ఎంపిక ఈ పరికరంలో భద్రపరచబడింది.", langEscape: "మూసివేయడానికి Escape నొక్కండి.", uiComplete: "ఇంటర్‌ఫేస్ పూర్తి", uiPartial: "ఇంటర్‌ఫేస్ భాగికం", contentAvailable: "కంటెంట్ అందుబాటులో ఉంది", contentPartial: "కంటెంట్ భాగికం", contentPending: "కంటెంట్ పెండింగ్", contentFallback: "ఈ రికార్డు ఎంచుకున్న కంటెంట్ భాషలో ఇంకా అనువదించబడలేదు. ఇంగ్లీష్ ప్రత్యామ్నాయ కంటెంట్‌గా స్పష్టంగా చూపబడుతోంది.", sourceLanguage: "మూల భాష", sourceSanskrit: "సంస్కృతం / संस्कृतम्", translationUnavailable: "ఎంచుకున్న భాష అనువాదం అందుబాటులో లేదు", englishFallback: "ఇంగ్లీష్ ప్రత్యామ్నాయం", canonicalOnly: "కానానికల్ మాత్రమే", stagingNotIndexed: "స్టేజింగ్ రికార్డులు ప్రజా శోధనలో సూచిక చేయబడవు.", skipLink: "ప్రధాన కంటెంట్‌కు వెళ్లండి", openMenu: "నావిగేషన్ మెనూను తెరవండి", closeMenu: "నావిగేషన్ మెనూను మూసివేయండి", corpusLegend: "మూల వర్గీకరణ వివరణ", corpusLegendText: "తరువాతి, ప్రాంతీయ, సంపాదకీయ లేదా ప్రచురించని మూలాలను ఒకే కానానికల్ ప్రవాహంగా కాకుండా ప్రతి మాడ్యూల్ వేరు చేస్తుంది.", canonicalExplore: "కానానికల్ అన్వేషణ", spiritualLearning: "ఆధ్యాత్మికం మరియు అభ్యాసం", sacredPlatform: "పవిత్ర వేదిక", footerSummary: "ఏడు కాండలు, జ్ఞాన రికార్డులు, పాత్రలు, పవిత్ర ప్రదేశాలు మరియు ఆధ్యాత్మిక మార్గదర్శకంతో పవిత్ర రామాయణానికి డిజిటల్ నిలయం.", platformFidelity: "వాల్మీకి రామాయణ శాశ్వత జ్ఞానాన్ని గౌరవంతో, పాండిత్య నిబద్ధతతో అందించడానికి అంకితం.", exploreModule: "మాడ్యూల్‌ను అన్వేషించండి", openAtlas: "అట్లాస్ తెరవండి", askAssistant: "సహాయకుడిని అడగండి", openLibrary: "లైబ్రరీ తెరవండి", statsKandas: "పవిత్ర కాండలు", statsWisdom: "జ్ఞాన రికార్డులు", statsCharacters: "పాత్రలు", statsPlaces: "పవిత్ర ప్రదేశాలు", modulesTitle: "సమగ్ర వేదిక మాడ్యూల్స్", modulesSubtitle: "మూలాధార సాధనాలు, టైమ్‌లైన్లు మరియు ఆధారిత సహాయంతో రామాయణంలోని ప్రతి కోణాన్ని అన్వేషించండి.", sourceGovernedBadge: "మూలాధార పరిపాలిత పవిత్ర రామాయణ జ్ఞాన విశ్వం", booksOfRamayana: "రామాయణంలోని 7 కాండలు", kandaExplorer: "ఏడు కాండల అన్వేషణ", kandaIntro: "ప్రస్తుత ఏడు-కాండల సంగ్రహాన్ని అన్వేషించండి. ప్రతి లొకేటర్ మూలంగా ధృవీకరించబడే వరకు సర్గ నావిగేషన్ ఎడిషన్‌ను గౌరవిస్తుంది.", loadingKandas: "పవిత్ర కాండలు లోడ్ అవుతున్నాయి…", kanda: "కాండ", bookOf: "7లో కాండ {n}", editionAwareIndex: "ఎడిషన్-ఆధారిత సర్గ సూచిక", kandaSummary: "కాండ సారాంశం", corpusMilestones: "ప్రస్తుత సంగ్రహ మైలురాళ్లు", milestone: "మైలురాయి", verifiedSargaIndex: "ధృవీకరించిన సర్గ సూచిక", editionOnly: "ఎడిషన్-నిర్దిష్ట, మూల-లొకేటెడ్ రికార్డులు మాత్రమే చూపబడతాయి.", openReader: "రీడర్ తెరవండి", openSource: "మూలాన్ని తెరవండి", sourceLocated: "మూలం లొకేట్ చేయబడింది", sourceLocatedRelease: "ఈ విడుదలలో మూలం లొకేట్ చేయబడింది", sourceAcquired: "మూలం పొందబడింది", sourceAcquiredReview: "క్వారంటైన్ చేసిన సమీక్ష ఆధారం; కానానికల్ కాదు", notAcquired: "పొందలేదు", notPublished: "కానానికల్ కాదు", editorialReview: "సంపాదకీయ సమీక్ష", nextSource: "తదుపరి ఖచ్చితమైన మూల ధృవీకరణ స్థానం", tamilTitle: "తమిళ శీర్షిక", sourceText: "మూల పాఠ్యం", linksUnderReview: "ఈవెంట్లు మరియు పాత్రలు సమీక్షలో ఉన్నాయి", noPublicationPath: "ప్రచురణ మార్గం లేదు", stagingBranch: "స్టేజింగ్ శాఖ", underReview: "సమీక్షలో — కానానికల్ కాదు", inspectSource: "మూల లొకేటర్ చూడండి", searchTitle: "రామవెర్స్ గైడెడ్ సెర్చ్", searchBadge: "నిర్ణీత స్థానిక శోధన ఇంజిన్", searchSubtitle: "మూల-లొకేటెడ్ సర్గలు, జ్ఞాన రికార్డులు, పాత్రలు, పవిత్ర ప్రదేశాలు, మార్గదర్శకత్వం, కథలు, క్విజ్‌లు మరియు ఆడియో స్క్రిప్ట్‌లలో శోధించండి.", searchInput: "మొత్తం రామవెర్స్‌లో శోధించడానికి టైప్ చేయండి…", foundMatches: "\"{q}\" కు {n} కానానికల్ రికార్డులు దొరికాయి", contentType: "కంటెంట్ రకం", reviewState: "సమీక్ష స్థితి", allTypes: "అన్ని ప్రస్తుత కానానికల్ రకాలు", allStates: "అన్ని సంపాదకీయ స్థితులు", needsSourceReview: "మూల సమీక్ష అవసరం", needsTamilReview: "మానవ తమిళ సమీక్ష అవసరం", traditionVariant: "సంప్రదాయ భేదం", searchBegin: "రామవెర్స్ జ్ఞాన గ్రాఫ్‌ను అన్వేషించడానికి పై శోధన పదాన్ని నమోదు చేయండి.", searching: "కానానికల్ రికార్డులు శోధించబడుతున్నాయి…", noRecords: "\"{q}\" కు సరిపోలే రికార్డులు లేవు.", searchCanonicalOnly: "శోధన కానానికల్ రికార్డుల్లో మాత్రమే జరుగుతుంది.", record: "రికార్డు", character: "పాత్ర", location: "స్థలం", guidance: "మార్గదర్శకత్వం", story: "కథ", quiz: "క్విజ్", wisdomRecords: "జ్ఞాన రికార్డులు", characters: "పాత్రలు", sacredPlaces: "పవిత్ర ప్రదేశాలు", guidanceRecords: "మార్గదర్శక రికార్డులు", kidsStories: "పిల్లల కథలు", quizzes: "క్విజ్‌లు", audioScripts: "ఆడియో స్క్రిప్ట్‌లు", readerLanguage: "రీడర్ ఇంటర్‌ఫేస్ భాష", progressDevice: "పఠన పురోగతి ఈ పరికరంలో భద్రపరచబడుతుంది.", summaryDisclosure: "ఇది సంపాదకీయ సారాంశం; ఇది శ్లోక అనువాదం లేదా ఉద్ధరణగా చూపబడదు.", sourceStatus: "మూలం మరియు భాష స్థితి", selectedInterface: "ఎంచుకున్న ఇంటర్‌ఫేస్", currentCanonical: "ప్రస్తుత కానానికల్", noBookmarks: "ఇంకా బుక్‌మార్క్‌లు లేవు", noReflections: "ఇంకా ఆధ్యాత్మిక ప్రతిబింబాలు లేవు", title: "శీర్షిక", spiritualNote: "ఆధ్యాత్మిక గమనిక", clearLibraryConfirm: "అన్ని స్థానిక లైబ్రరీ డేటాను తొలగించాలనుకుంటున్నారా?", unexpectedError: "అనుకోని లోపం జరిగింది." },
  kn: {
    brandTagline: "ಪವಿತ್ರ ರಾಮಾಯಣ ವೇದಿಕೆ", inNavigation: "ನ್ಯಾವಿಗೇಶನ್‌ನಲ್ಲಿ", knowledgeGraph: "ಜ್ಞಾನ ಗ್ರಾಫ್", uiContentSeparate: "ಇಂಟರ್‌ಫೇಸ್ ಭಾಷೆ ಮತ್ತು ವಿಷಯ ಲಭ್ಯತೆ ಪ್ರತ್ಯೇಕ. ಭಾಷೆ ಆಯ್ಕೆ ಮಾಡಿದರೆ ಪ್ರತಿಯೊಂದು ದಾಖಲೆಯ ಮಾನವ-ಪರಿಶೀಲಿತ ಅನುವಾದವಿದೆ ಎಂದಲ್ಲ.", craftedWith: "ಅರ್ಪಣೆಯಿಂದ ರೂಪಿಸಲಾಗಿದೆ", forHeritage: "ರಾಮಾಯಣ ಪರಂಪರೆಗಾಗಿ", navHome: "ಮುಖಪುಟ", navExplore: "ಅನ್ವೇಷಣೆ", navKandas: "ಕಾಂಡಗಳು", navRamaLife: "ರಾಮನ ಜೀವನ", navJourney: "ಪ್ರಯಾಣ", navWisdom: "ಜ್ಞಾನ", navAsk: "ಕೇಳಿ", navLibrary: "ಗ್ರಂಥಾಲಯ", navSearch: "ಹುಡುಕಾಟ", navPrimary: "ಪ್ರಮುಖ", navExploreSection: "ಅನ್ವೇಷಣೆ", navGuidance: "ಮಾರ್ಗದರ್ಶನ", navStories: "ಕಥೆಗಳು", navQuizzes: "ಕ್ವಿಜ್‌ಗಳು", navAudio: "ಆಡಿಯೋ", save: "ಉಳಿಸಿ", saved: "ಉಳಿಸಲಾಗಿದೆ", markRead: "ಓದಿದ ಎಂದು ಗುರುತಿಸಿ", markUnread: "ಓದಿಲ್ಲ ಎಂದು ಗುರುತಿಸಿ", decreaseFont: "ಓದುವ ಅಕ್ಷರ ಗಾತ್ರ ಕಡಿಮೆ ಮಾಡಿ", increaseFont: "ಓದುವ ಅಕ್ಷರ ಗಾತ್ರ ಹೆಚ್ಚಿಸಿ", hideSource: "ಮೂಲವನ್ನು ಮರೆಮಾಡಿ", sourcePanel: "ಮೂಲ ಫಲಕ", readerLoading: "ಆವೃತ್ತಿ-ಜಾಗೃತ ಸರ್ಗ ರೀಡರ್ ಲೋಡ್ ಆಗುತ್ತಿದೆ…", sargaUnavailable: "ಸರ್ಗ ಲಭ್ಯವಿಲ್ಲ", returnKandas: "ಕಾಂಡಗಳಿಗೆ ಹಿಂತಿರುಗಿ", sourceRecordOnly: "ಈ ಮಾರ್ಗವು ಮೂಲ-ಸ್ಥಳ ಹೊಂದಿರುವ ದಾಖಲೆಗಳಿಗೆ ಮಾತ್ರ. ಕಲ್ಪಿತ ವಿಷಯ ಸೇರಿಸಲಾಗುವುದಿಲ್ಲ.", markedReadDevice: "ಈ ಸಾಧನದಲ್ಲಿ ಓದಿದಂತೆ ಗುರುತಿಸಲಾಗಿದೆ.", readerStatusNotice: "ಆಯ್ಕೆ ಮಾಡಿದ ಇಂಟರ್‌ಫೇಸ್ ಭಾಷೆ ಎಂದರೆ ಸರ್ಗದ ಮಾನವ-ಪರಿಶೀಲಿತ ಅನುವಾದವಿದೆ ಎಂದಲ್ಲ.", metadataAvailability: "ದಾಖಲೆ ಮೆಟಾಡೇಟಾ ಲಭ್ಯತೆ", unavailableFields: "ಲಭ್ಯವಿಲ್ಲದ ಕ್ಷೇತ್ರಗಳನ್ನು ಬೇರೆ ಆವೃತ್ತಿ ಅಥವಾ ಪರಂಪರೆಯಿಂದ ಊಹಿಸದೆ ಲಭ್ಯವಿಲ್ಲ ಎಂದು ತೋರಿಸಲಾಗುತ್ತದೆ.", available: "ಲಭ್ಯ", recordPublished: "ಈ ಮೂಲ-ಸ್ಥಳಿತ ದಾಖಲೆಗಾಗಿ ಪ್ರಕಟಿಸಲಾಗಿದೆ.", directLocator: "ನೇರ ಆವೃತ್ತಿ ಮೂಲ ಸ್ಥಳ ಲಭ್ಯ.", sectionNotPublished: "ವಿಭಾಗ-ಮಟ್ಟದ ಮೂಲ ಪರಿಶೀಲನೆ ಮುಗಿಯುವವರೆಗೆ ಪ್ರಕಟಿಸಲಾಗುವುದಿಲ್ಲ.", entityNotPublished: "ಮೂಲ-ಲಿಂಕ್ ಮಾಡಿದ ಘಟಕ ನಕ್ಷೆ ಲಭ್ಯವಾಗುವವರೆಗೆ ಪ್ರಕಟಿಸಲಾಗುವುದಿಲ್ಲ.", dialogueNotPublished: "ಮೂಲ-ಲಿಂಕ್ ಮಾಡಿದ ಸಂಪಾದಕೀಯ ಪರಿಶೀಲನೆ ಮುಗಿಯುವವರೆಗೆ ಪ್ರಕಟಿಸಲಾಗುವುದಿಲ್ಲ.", dialogueLinks: "ಸಂಭಾಷಣೆ ಮತ್ತು ವಿಷಯ ಲಿಂಕ್‌ಗಳು", askWelcome: "ನಮಸ್ತೆ! ವಾಲ್ಮೀಕಿ ರಾಮಾಯಣದ ಪರಿಶೀಲಿತ 550 ಕಾನೋನಿಕಲ್ ದಾಖಲೆಗಳನ್ನೇ ಆಧರಿಸಿರುವ ರಾಮಾವರ್ಸ್ ಮಾರ್ಗದರ್ಶಿತ ಹುಡುಕಾಟ ಸಹಾಯಕನು ನಾನು. ಧರ್ಮ, ರಾಮನ ಪ್ರಯಾಣ, ಪಾತ್ರಗಳು ಅಥವಾ ತಾತ್ವಿಕ ಜ್ಞಾನ ಕುರಿತು ಕೇಳಿ.", relationshipDiscovery: "ಸಂಬಂಧ ಅನ್ವೇಷಣೆ", relationshipNavigator: "ಸಂಬಂಧ ಸಾಕ್ಷ್ಯ ನಾವಿಗೇಟರ್", relationshipStatus: "ಪ್ರಕಟಿತ ಸಂಬಂಧ ಸಾಕ್ಷ್ಯ ಸ್ಥಿತಿ", publishedEdges: "ಪ್ರಕಟಿತ ಸಂಬಂಧ ಅಂಚುಗಳು", fallbackProfile: "ಪರ್ಯಾಯ: ಪ್ರೊಫೈಲ್‌ನ ಸಾಕ್ಷ್ಯ ವೀಕ್ಷಣೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ", nextPublication: "ಮುಂದಿನ ಪ್ರಕಟಣೆ ದ್ವಾರ: ಮೂಲ ಪರಿಶೀಲನೆ", firstProfile: "ಮೊದಲ ಪ್ರೊಫೈಲ್", secondProfile: "ಎರಡನೇ ಪ್ರೊಫೈಲ್", chooseProfile: "ಪ್ರಸ್ತುತ ಪ್ರೊಫೈಲ್ ಆಯ್ಕೆಮಾಡಿ", inspectGap: "ಸಾಕ್ಷ್ಯ ಅಂತರ ಪರಿಶೀಲಿಸಿ", loadingCharacters: "51 ಪಾತ್ರಗಳು ಲೋಡ್ ಆಗುತ್ತಿವೆ…", appearances: "ಕಾಣಿಸಿಕೊಳ್ಳುವಿಕೆ", viewEvidence: "ಸಾಕ್ಷ್ಯ ಸ್ಥಿತಿ ವೀಕ್ಷಿಸಿ", langStatus: "ಮೂಲ ಮತ್ತು ಭಾಷಾ ಸ್ಥಿತಿ", sourceId: "ಮೂಲ ID", tradition: "ಪರಂಪರೆ", openSourceLocator: "ಮೂಲ ಲೊಕೇಟರ್ ತೆರೆಯಿರಿ", previousSarga: "ಹಿಂದಿನ ಲಭ್ಯ ಸರ್ಗ", nextSarga: "ಮುಂದಿನ ಲಭ್ಯ ಸರ್ಗ", noEarlier: "ಹಿಂದಿನ ಮೂಲ-ಸ್ಥಳಿತ ದಾಖಲೆ ಲಭ್ಯವಿಲ್ಲ", noLater: "ನಂತರದ ಮೂಲ-ಸ್ಥಳಿತ ದಾಖಲೆ ಲಭ್ಯವಿಲ್ಲ", langChange: "ಭಾಷೆ ನೋಡಿ / ಬದಲಿಸಿ", langCurrent: "ಪ್ರಸ್ತುತ ಭಾಷೆ", langSearch: "ಭಾಷೆಗಳನ್ನು ಹುಡುಕಿ", langList: "ಲಭ್ಯವಿರುವ ಇಂಟರ್‌ಫೇಸ್ ಭಾಷೆಗಳು", langClose: "ಭಾಷಾ ಆಯ್ಕೆಯನ್ನು ಮುಚ್ಚಿ", langNoMatch: "ಈ ಹುಡುಕಾಟಕ್ಕೆ ಯಾವುದೇ ಇಂಟರ್‌ಫೇಸ್ ಭಾಷೆ ಹೊಂದಿಕೆಯಾಗಲಿಲ್ಲ.", langSaved: "ನಿಮ್ಮ ಆಯ್ಕೆ ಈ ಸಾಧನದಲ್ಲಿ ಉಳಿಸಲಾಗಿದೆ.", langEscape: "ಮುಚ್ಚಲು Escape ಒತ್ತಿ.", uiComplete: "ಇಂಟರ್‌ಫೇಸ್ ಪೂರ್ಣ", uiPartial: "ಇಂಟರ್‌ಫೇಸ್ ಭಾಗಶಃ", contentAvailable: "ವಿಷಯ ಲಭ್ಯ", contentPartial: "ವಿಷಯ ಭಾಗಶಃ", contentPending: "ವಿಷಯ ಬಾಕಿ", contentFallback: "ಈ ದಾಖಲೆಯನ್ನು ಆಯ್ಕೆ ಮಾಡಿದ ವಿಷಯ ಭಾಷೆಗೆ ಇನ್ನೂ ಅನುವಾದಿಸಲಾಗಿಲ್ಲ. ಇಂಗ್ಲಿಷ್ ಅನ್ನು ಇಂಗ್ಲಿಷ್ ಪರ್ಯಾಯ ವಿಷಯವೆಂದು ಸ್ಪಷ್ಟವಾಗಿ ತೋರಿಸಲಾಗಿದೆ.", sourceLanguage: "ಮೂಲ ಭಾಷೆ", sourceSanskrit: "ಸಂಸ್ಕೃತ / संस्कृतम्", translationUnavailable: "ಆಯ್ಕೆ ಮಾಡಿದ ಭಾಷೆಯ ಅನುವಾದ ಲಭ್ಯವಿಲ್ಲ", englishFallback: "ಇಂಗ್ಲಿಷ್ ಪರ್ಯಾಯ", canonicalOnly: "ಕ್ಯಾನಾನಿಕಲ್ ಮಾತ್ರ", stagingNotIndexed: "ಸ್ಟೇಜಿಂಗ್ ದಾಖಲೆಗಳು ಸಾರ್ವಜನಿಕ ಹುಡುಕಾಟದಲ್ಲಿ ಸೂಚ್ಯಂಕವಾಗುವುದಿಲ್ಲ.", skipLink: "ಮುಖ್ಯ ವಿಷಯಕ್ಕೆ ಹೋಗಿ", openMenu: "ನ್ಯಾವಿಗೇಶನ್ ಮೆನು ತೆರೆಯಿರಿ", closeMenu: "ನ್ಯಾವಿಗೇಶನ್ ಮೆನು ಮುಚ್ಚಿರಿ", corpusLegend: "ಮೂಲ ವರ್ಗೀಕರಣ ವಿವರಣೆ", corpusLegendText: "ನಂತರದ, ಪ್ರಾದೇಶಿಕ, ಸಂಪಾದಕೀಯ ಅಥವಾ ಪ್ರಕಟಿಸದ ಮೂಲಗಳನ್ನು ಒಂದೇ ಕ್ಯಾನಾನಿಕಲ್ ಹರಿವಾಗಿ ಕಾಣದೆ ಪ್ರತಿ ಘಟಕ ಪ್ರತ್ಯೇಕಿಸುತ್ತದೆ.", canonicalExplore: "ಕ್ಯಾನಾನಿಕಲ್ ಅನ್ವೇಷಣೆ", spiritualLearning: "ಆಧ್ಯಾತ್ಮಿಕ ಮತ್ತು ಕಲಿಕೆ", sacredPlatform: "ಪವಿತ್ರ ವೇದಿಕೆ", footerSummary: "ಏಳು ಕಾಂಡಗಳು, ಜ್ಞಾನ ದಾಖಲೆಗಳು, ಪಾತ್ರಗಳು, ಪವಿತ್ರ ಸ್ಥಳಗಳು ಮತ್ತು ಆಧ್ಯಾತ್ಮಿಕ ಮಾರ್ಗದರ್ಶನದ ಪವಿತ್ರ ರಾಮಾಯಣದ ಡಿಜಿಟಲ್ ಮನೆ.", platformFidelity: "ವಾಲ್ಮೀಕಿ ರಾಮಾಯಣದ ಶಾಶ್ವತ ಜ್ಞಾನವನ್ನು ಗೌರವ ಮತ್ತು ಪಾಂಡಿತ್ಯದ ನಿಷ್ಠೆಯಿಂದ ಉಳಿಸಿ ಪ್ರಸ್ತುತಪಡಿಸಲು ಸಮರ್ಪಿತ.", exploreModule: "ಘಟಕವನ್ನು ಅನ್ವೇಷಿಸಿ", openAtlas: "ಅಟ್ಲಾಸ್ ತೆರೆಯಿರಿ", askAssistant: "ಸಹಾಯಕನನ್ನು ಕೇಳಿ", openLibrary: "ಗ್ರಂಥಾಲಯ ತೆರೆಯಿರಿ", statsKandas: "ಪವಿತ್ರ ಕಾಂಡಗಳು", statsWisdom: "ಜ್ಞಾನ ದಾಖಲೆಗಳು", statsCharacters: "ಪಾತ್ರಗಳು", statsPlaces: "ಪವಿತ್ರ ಸ್ಥಳಗಳು", modulesTitle: "ಸಮಗ್ರ ವೇದಿಕೆ ಘಟಕಗಳು", modulesSubtitle: "ಮೂಲಾಧಾರಿತ ಸಾಧನಗಳು, ಕಾಲರೇಖೆಗಳು ಮತ್ತು ಆಧಾರಿತ ಸಹಾಯದಿಂದ ರಾಮಾಯಣದ ಪ್ರತಿಯೊಂದು ಅಂಶವನ್ನು ಅನ್ವೇಷಿಸಿ.", sourceGovernedBadge: "ಮೂಲಾಧಾರ ನಿಯಂತ್ರಿತ ಪವಿತ್ರ ರಾಮಾಯಣ ಜ್ಞಾನ ವಿಶ್ವ", booksOfRamayana: "ರಾಮಾಯಣದ 7 ಕಾಂಡಗಳು", kandaExplorer: "ಏಳು ಕಾಂಡಗಳ ಅನ್ವೇಷಕ", kandaIntro: "ಪ್ರಸ್ತುತ ಏಳು-ಕಾಂಡ ಸಂಗ್ರಹವನ್ನು ಅನ್ವೇಷಿಸಿ. ಪ್ರತಿಯೊಂದು ಲೊಕೇಟರ್ ಮೂಲದಿಂದ ಪರಿಶೀಲಿಸುವವರೆಗೆ ಸರ್ಗ ನ್ಯಾವಿಗೇಶನ್ ಆವೃತ್ತಿ-ಜಾಗೃತವಾಗಿರುತ್ತದೆ.", loadingKandas: "ಪವಿತ್ರ ಕಾಂಡಗಳು ಲೋಡ್ ಆಗುತ್ತಿವೆ…", kanda: "ಕಾಂಡ", bookOf: "7ರಲ್ಲಿ ಕಾಂಡ {n}", editionAwareIndex: "ಆವೃತ್ತಿ-ಜಾಗೃತ ಸರ್ಗ ಸೂಚ್ಯಂಕ", kandaSummary: "ಕಾಂಡ ಸಾರಾಂಶ", corpusMilestones: "ಪ್ರಸ್ತುತ ಸಂಗ್ರಹ ಮೈಲಿಗಲ್ಲುಗಳು", milestone: "ಮೈಲಿಗಲ್ಲು", verifiedSargaIndex: "ಪರಿಶೀಲಿತ ಸರ್ಗ ಸೂಚ್ಯಂಕ", editionOnly: "ಆವೃತ್ತಿ-ನಿರ್ದಿಷ್ಟ, ಮೂಲ-ಸ್ಥಾನ ಹೊಂದಿರುವ ದಾಖಲೆಗಳನ್ನು ಮಾತ್ರ ತೋರಿಸಲಾಗುತ್ತದೆ.", openReader: "ರೀಡರ್ ತೆರೆಯಿರಿ", openSource: "ಮೂಲ ತೆರೆಯಿರಿ", sourceLocated: "ಮೂಲ ಸ್ಥಳ ಗುರುತಿಸಲಾಗಿದೆ", sourceLocatedRelease: "ಈ ಬಿಡುಗಡೆದಲ್ಲಿ ಮೂಲ ಸ್ಥಳ ಗುರುತಿಸಲಾಗಿದೆ", sourceAcquired: "ಮೂಲ ಪಡೆದುಕೊಳ್ಳಲಾಗಿದೆ", sourceAcquiredReview: "ಕ್ವಾರಂಟೈನ್ ಮಾಡಿದ ಪರಿಶೀಲನಾ ಸಾಕ್ಷ್ಯ; ಕ್ಯಾನಾನಿಕಲ್ ಅಲ್ಲ", notAcquired: "ಪಡೆದಿಲ್ಲ", notPublished: "ಕ್ಯಾನಾನಿಕಲ್ ಅಲ್ಲ", editorialReview: "ಸಂಪಾದಕೀಯ ಪರಿಶೀಲನೆ", nextSource: "ಮುಂದಿನ ನಿಖರ ಮೂಲ ಪರಿಶೀಲನಾ ಬಿಂದು", tamilTitle: "ತಮಿಳು ಶೀರ್ಷಿಕೆ", sourceText: "ಮೂಲ ಪಠ್ಯ", linksUnderReview: "ಘಟನೆಗಳು ಮತ್ತು ಪಾತ್ರಗಳು ಪರಿಶೀಲನೆಯಲ್ಲಿ", noPublicationPath: "ಪ್ರಕಟಣಾ ದಾರಿ ಇಲ್ಲ", stagingBranch: "ಸ್ಟೇಜಿಂಗ್ ಶಾಖೆ", underReview: "ಪರಿಶೀಲನೆಯಲ್ಲಿ — ಕ್ಯಾನಾನಿಕಲ್ ಅಲ್ಲ", inspectSource: "ಮೂಲ ಲೊಕೇಟರ್ ಪರಿಶೀಲಿಸಿ", searchTitle: "ರಾಮವರ್ಸ್ ಮಾರ್ಗದರ್ಶಿತ ಹುಡುಕಾಟ", searchBadge: "ನಿರ್ಧಾರಿತ ಸ್ಥಳೀಯ ಹುಡುಕಾಟ ಎಂಜಿನ್", searchSubtitle: "ಮೂಲ-ಸ್ಥಾನಿತ ಸರ್ಗಗಳು, ಜ್ಞಾನ ದಾಖಲೆಗಳು, ಪಾತ್ರಗಳು, ಪವಿತ್ರ ಸ್ಥಳಗಳು, ಮಾರ್ಗದರ್ಶನ, ಕಥೆಗಳು, ಕ್ವಿಜ್‌ಗಳು ಮತ್ತು ಆಡಿಯೋ ಸ್ಕ್ರಿಪ್ಟ್‌ಗಳಲ್ಲಿ ಹುಡುಕಿ.", searchInput: "ಸಂಪೂರ್ಣ ರಾಮವರ್ಸ್‌ನಲ್ಲಿ ಹುಡುಕಲು ಟೈಪ್ ಮಾಡಿ…", foundMatches: "\"{q}\" ಗೆ {n} ಕ್ಯಾನಾನಿಕಲ್ ದಾಖಲೆಗಳು ದೊರೆತವು", contentType: "ವಿಷಯ ಪ್ರಕಾರ", reviewState: "ಪರಿಶೀಲನಾ ಸ್ಥಿತಿ", allTypes: "ಎಲ್ಲಾ ಪ್ರಸ್ತುತ ಕ್ಯಾನಾನಿಕಲ್ ಪ್ರಕಾರಗಳು", allStates: "ಎಲ್ಲಾ ಸಂಪಾದಕೀಯ ಸ್ಥಿತಿಗಳು", needsSourceReview: "ಮೂಲ ಪರಿಶೀಲನೆ ಅಗತ್ಯ", needsTamilReview: "ಮಾನವ ತಮಿಳು ಪರಿಶೀಲನೆ ಅಗತ್ಯ", traditionVariant: "ಪರಂಪರೆ ಭೇದ", searchBegin: "ರಾಮವರ್ಸ್ ಜ್ಞಾನ ಗ್ರಾಫ್ ಅನ್ವೇಷಿಸಲು ಮೇಲಿನ ಹುಡುಕಾಟ ಪದವನ್ನು ನಮೂದಿಸಿ.", searching: "ಕ್ಯಾನಾನಿಕಲ್ ದಾಖಲೆಗಳನ್ನು ಹುಡುಕಲಾಗುತ್ತಿದೆ…", noRecords: "\"{q}\" ಗೆ ಹೊಂದುವ ದಾಖಲೆಗಳಿಲ್ಲ.", searchCanonicalOnly: "ಹುಡುಕಾಟ ಕ್ಯಾನಾನಿಕಲ್ ದಾಖಲೆಗಳಲ್ಲಿ ಮಾತ್ರ.", record: "ದಾಖಲೆ", character: "ಪಾತ್ರ", location: "ಸ್ಥಳ", guidance: "ಮಾರ್ಗದರ್ಶನ", story: "ಕಥೆ", quiz: "ಪ್ರಶ್ನೋತ್ತರ", wisdomRecords: "ಜ್ಞಾನ ದಾಖಲೆಗಳು", characters: "ಪಾತ್ರಗಳು", sacredPlaces: "ಪವಿತ್ರ ಸ್ಥಳಗಳು", guidanceRecords: "ಮಾರ್ಗದರ್ಶನ ದಾಖಲೆಗಳು", kidsStories: "ಮಕ್ಕಳ ಕಥೆಗಳು", quizzes: "ಕ್ವಿಜ್‌ಗಳು", audioScripts: "ಆಡಿಯೋ ಸ್ಕ್ರಿಪ್ಟ್‌ಗಳು", readerLanguage: "ರೀಡರ್ ಇಂಟರ್‌ಫೇಸ್ ಭಾಷೆ", progressDevice: "ಓದುವ ಪ್ರಗತಿಯನ್ನು ಈ ಸಾಧನದಲ್ಲಿ ಉಳಿಸಲಾಗುತ್ತದೆ.", summaryDisclosure: "ಇದು ಸಂಪಾದಕೀಯ ಸಾರಾಂಶ; ಇದನ್ನು ಶ್ಲೋಕ ಅನುವಾದ ಅಥವಾ ಉಲ್ಲೇಖವಾಗಿ ತೋರಿಸಲಾಗುವುದಿಲ್ಲ.", sourceStatus: "ಮೂಲ ಮತ್ತು ಭಾಷಾ ಸ್ಥಿತಿ", selectedInterface: "ಆಯ್ಕೆ ಮಾಡಿದ ಇಂಟರ್‌ಫೇಸ್", currentCanonical: "ಪ್ರಸ್ತುತ ಕ್ಯಾನಾನಿಕಲ್", noBookmarks: "ಇನ್ನೂ ಯಾವುದೇ ಬುಕ್‌ಮಾರ್ಕ್‌ಗಳಿಲ್ಲ", noReflections: "ಇನ್ನೂ ಯಾವುದೇ ಆಧ್ಯಾತ್ಮಿಕ ಟಿಪ್ಪಣಿಗಳಿಲ್ಲ", title: "ಶೀರ್ಷಿಕೆ", spiritualNote: "ಆಧ್ಯಾತ್ಮಿಕ ಟಿಪ್ಪಣಿ", clearLibraryConfirm: "ಎಲ್ಲಾ ಸ್ಥಳೀಯ ಗ್ರಂಥಾಲಯದ ಡೇಟಾವನ್ನು ತೆರವುಗೊಳಿಸಲು ನೀವು ಖಚಿತವೇ?", unexpectedError: "ಅನಿರೀಕ್ಷಿತ ದೋಷ ಸಂಭವಿಸಿದೆ." },
  ml: {
    brandTagline: "പവിത്ര രാമായണ വേദി", inNavigation: "നാവിഗേഷനിൽ", knowledgeGraph: "ജ്ഞാന ഗ്രാഫ്", uiContentSeparate: "ഇന്റർഫേസ് ഭാഷയും ഉള്ളടക്ക ലഭ്യതയും വേറിട്ടതാണ്. ഒരു ഭാഷ തിരഞ്ഞെടുക്കുന്നത് എല്ലാ രേഖകൾക്കും മനുഷ്യൻ പരിശോധിച്ച വിവർത്തനം ഉണ്ടെന്നർത്ഥമല്ല.", craftedWith: "സമർപ്പണത്തോടെ നിർമ്മിച്ചത്", forHeritage: "രാമായണ പൈതൃകത്തിനായി", navHome: "ഹോം", navExplore: "പര്യവേക്ഷണം", navKandas: "കാണ്ഡങ്ങൾ", navRamaLife: "രാമന്റെ ജീവിതം", navJourney: "യാത്ര", navWisdom: "ജ്ഞാനം", navAsk: "ചോദിക്കുക", navLibrary: "ലൈബ്രറി", navSearch: "തിരയൽ", navPrimary: "പ്രധാന", navExploreSection: "പര്യവേക്ഷണം", navGuidance: "മാർഗ്ഗനിർദ്ദേശം", navStories: "കഥകൾ", navQuizzes: "ക്വിസുകൾ", navAudio: "ഓഡിയോ", save: "സംരക്ഷിക്കുക", saved: "സംരക്ഷിച്ചു", markRead: "വായിച്ചതായി അടയാളപ്പെടുത്തുക", markUnread: "വായിക്കാത്തതായി അടയാളപ്പെടുത്തുക", decreaseFont: "വായന അക്ഷര വലുപ്പം കുറയ്ക്കുക", increaseFont: "വായന അക്ഷര വലുപ്പം കൂട്ടുക", hideSource: "ഉറവിടം മറയ്ക്കുക", sourcePanel: "ഉറവിട പാനൽ", readerLoading: "പതിപ്പ്-ബോധമുള്ള സർഗ്ഗ റീഡർ ലോഡ് ചെയ്യുന്നു…", sargaUnavailable: "സർഗ്ഗ ലഭ്യമല്ല", returnKandas: "കാണ്ഡങ്ങളിലേക്ക് മടങ്ങുക", sourceRecordOnly: "ഈ വഴി ഉറവിടം സ്ഥിതിചെയ്യുന്ന രേഖകൾക്കായി മാത്രം. കെട്ടിച്ചമച്ച ഉള്ളടക്കം ചേർക്കുന്നില്ല.", markedReadDevice: "ഈ ഉപകരണത്തിൽ വായിച്ചതായി അടയാളപ്പെടുത്തി.", readerStatusNotice: "തിരഞ്ഞെടുത്ത ഇന്റർഫേസ് ഭാഷയിൽ സർഗ്ഗത്തിന് മനുഷ്യൻ പരിശോധിച്ച വിവർത്തനം ഉണ്ടെന്നർത്ഥമല്ല.", metadataAvailability: "രേഖ മെറ്റാഡാറ്റ ലഭ്യത", unavailableFields: "ലഭ്യമല്ലാത്ത ഫീൽഡുകൾ മറ്റൊരു പതിപ്പിൽ നിന്നോ പാരമ്പര്യത്തിൽ നിന്നോ ഊഹിക്കാതെ ലഭ്യമല്ലെന്ന് കാണിക്കുന്നു.", available: "ലഭ്യം", recordPublished: "ഈ ഉറവിടം-സ്ഥിതിചെയ്യുന്ന രേഖയ്ക്കായി പ്രസിദ്ധീകരിച്ചത്.", directLocator: "നേരിട്ടുള്ള പതിപ്പ് ഉറവിട സ്ഥാനം ലഭ്യം.", sectionNotPublished: "വിഭാഗ-തല ഉറവിട പരിശോധന പൂർത്തിയാകുന്നതുവരെ പ്രസിദ്ധീകരിക്കില്ല.", entityNotPublished: "ഉറവിട-ലിങ്കുചെയ്ത എന്റിറ്റി മാപ്പിംഗ് ലഭ്യമാകുന്നതുവരെ പ്രസിദ്ധീകരിക്കില്ല.", dialogueNotPublished: "ഉറവിട-ലിങ്കുചെയ്ത എഡിറ്റോറിയൽ അവലോകനം പൂർത്തിയാകുന്നതുവരെ പ്രസിദ്ധീകരിക്കില്ല.", dialogueLinks: "സംഭാഷണവും വിഷയ ലിങ്കുകളും", askWelcome: "നമസ്കാരം! വാല്മീകി രാമായണത്തിലെ പരിശോധിച്ച 550 കാനോനിക്കൽ രേഖകളെ മാത്രം അടിസ്ഥാനമാക്കിയ രാമവേഴ്സ് ഗൈഡഡ് സെർച്ച് സഹായിയാണ് ഞാൻ. ധർമ്മം, രാമന്റെ യാത്ര, കഥാപാത്രങ്ങൾ, തത്ത്വചിന്ത എന്നിവയെക്കുറിച്ച് ചോദിക്കൂ.", relationshipDiscovery: "ബന്ധ പര്യവേക്ഷണം", relationshipNavigator: "ബന്ധ തെളിവ് നാവിഗേറ്റർ", relationshipStatus: "പ്രസിദ്ധീകരിച്ച ബന്ധ തെളിവ് നില", publishedEdges: "പ്രസിദ്ധീകരിച്ച ബന്ധ അരികുകൾ", fallbackProfile: "പകരം: ഒരു പ്രൊഫൈലിന്റെ തെളിവ് കാഴ്ച തിരഞ്ഞെടുക്കുക", nextPublication: "അടുത്ത പ്രസിദ്ധീകരണ കവാടം: ഉറവിട അവലോകനം", firstProfile: "ആദ്യ പ്രൊഫൈൽ", secondProfile: "രണ്ടാം പ്രൊഫൈൽ", chooseProfile: "നിലവിലെ പ്രൊഫൈൽ തിരഞ്ഞെടുക്കുക", inspectGap: "തെളിവ് വിടവ് പരിശോധിക്കുക", loadingCharacters: "51 കഥാപാത്രങ്ങൾ ലോഡ് ചെയ്യുന്നു…", appearances: "പ്രത്യക്ഷതകൾ", viewEvidence: "തെളിവ് നില കാണുക", langStatus: "ഉറവിടവും ഭാഷാ നിലയും", sourceId: "ഉറവിട ID", tradition: "പാരമ്പര്യം", openSourceLocator: "ഉറവിട ലൊക്കേറ്റർ തുറക്കുക", previousSarga: "മുമ്പത്തെ ലഭ്യമായ സർഗ്ഗ", nextSarga: "അടുത്ത ലഭ്യമായ സർഗ്ഗ", noEarlier: "മുമ്പത്തെ ഉറവിടം-സ്ഥിതിചെയ്യുന്ന രേഖ ലഭ്യമല്ല", noLater: "പിന്നീടുള്ള ഉറവിടം-സ്ഥിതിചെയ്യുന്ന രേഖ ലഭ്യമല്ല", langChange: "ഭാഷ കാണുക / മാറ്റുക", langCurrent: "നിലവിലെ ഭാഷ", langSearch: "ഭാഷകൾ തിരയുക", langList: "ലഭ്യമായ ഇന്റർഫേസ് ഭാഷകൾ", langClose: "ഭാഷാ തിരഞ്ഞെടുപ്പ് അടയ്ക്കുക", langNoMatch: "ഈ തിരച്ചിലുമായി പൊരുത്തപ്പെടുന്ന ഇന്റർഫേസ് ഭാഷയില്ല.", langSaved: "നിങ്ങളുടെ തിരഞ്ഞെടുപ്പ് ഈ ഉപകരണത്തിൽ സംരക്ഷിച്ചു.", langEscape: "അടയ്ക്കാൻ Escape അമർത്തുക.", uiComplete: "ഇന്റർഫേസ് പൂർണ്ണം", uiPartial: "ഇന്റർഫേസ് ഭാഗികം", contentAvailable: "ഉള്ളടക്കം ലഭ്യം", contentPartial: "ഉള്ളടക്കം ഭാഗികം", contentPending: "ഉള്ളടക്കം തീർപ്പാക്കാത്തത്", contentFallback: "ഈ രേഖ തിരഞ്ഞെടുത്ത ഉള്ളടക്ക ഭാഷയിലേക്ക് ഇതുവരെ വിവർത്തനം ചെയ്തിട്ടില്ല. ഇംഗ്ലീഷ് ഒരു ഇംഗ്ലീഷ് പകരം ഉള്ളടക്കമായി വ്യക്തമായി കാണിക്കുന്നു.", sourceLanguage: "മൂല ഭാഷ", sourceSanskrit: "സംസ്കൃതം / संस्कृतम्", translationUnavailable: "തിരഞ്ഞെടുത്ത ഭാഷയുടെ വിവർത്തനം ലഭ്യമല്ല", englishFallback: "ഇംഗ്ലീഷ് പകരം", canonicalOnly: "കാനോനിക്കൽ മാത്രം", stagingNotIndexed: "സ്റ്റേജിംഗ് രേഖകൾ പൊതുതിരച്ചിലിൽ സൂചികയിലാക്കുന്നില്ല.", skipLink: "പ്രധാന ഉള്ളടക്കത്തിലേക്ക് പോകുക", openMenu: "നാവിഗേഷൻ മെനു തുറക്കുക", closeMenu: "നാവിഗേഷൻ മെനു അടയ്ക്കുക", corpusLegend: "മൂല വർഗ്ഗീകരണ വിശദീകരണം", corpusLegendText: "പിന്നീടുള്ള, പ്രാദേശിക, എഡിറ്റോറിയൽ അല്ലെങ്കിൽ പ്രസിദ്ധീകരിക്കാത്ത ഉറവിടങ്ങളെ ഒരൊറ്റ കാനോനിക്കൽ പ്രവാഹമായി കാണാതെ ഓരോ ഘടകവും വേർതിരിക്കുന്നു.", canonicalExplore: "കാനോനിക്കൽ പര്യവേക്ഷണം", spiritualLearning: "ആത്മീയവും പഠനവും", sacredPlatform: "പവിത്ര വേദി", footerSummary: "ഏഴ് കാണ്ഡങ്ങൾ, ജ്ഞാന രേഖകൾ, കഥാപാത്രങ്ങൾ, പുണ്യസ്ഥലങ്ങൾ, ആത്മീയ മാർഗ്ഗനിർദ്ദേശം എന്നിവയുള്ള പവിത്ര രാമായണത്തിന്റെ ഡിജിറ്റൽ ഭവനം.", platformFidelity: "വാല്മീകി രാമായണത്തിന്റെ ശാശ്വത ജ്ഞാനം ആദരവോടും പാണ്ഡിത്യനിഷ്ഠയോടും സംരക്ഷിക്കാനും അവതരിപ്പിക്കാനും സമർപ്പിതം.", exploreModule: "ഘടകം പര്യവേക്ഷണം ചെയ്യുക", openAtlas: "അറ്റ്ലസ് തുറക്കുക", askAssistant: "സഹായിയോട് ചോദിക്കുക", openLibrary: "ലൈബ്രറി തുറക്കുക", statsKandas: "പവിത്ര കാണ്ഡങ്ങൾ", statsWisdom: "ജ്ഞാന രേഖകൾ", statsCharacters: "കഥാപാത്രങ്ങൾ", statsPlaces: "പുണ്യസ്ഥലങ്ങൾ", modulesTitle: "സമഗ്ര വേദി ഘടകങ്ങൾ", modulesSubtitle: "മൂലാധാരിത ഉപകരണങ്ങൾ, കാലരേഖകൾ, അടിസ്ഥാനമുള്ള സഹായം എന്നിവയിലൂടെ രാമായണത്തിന്റെ ഓരോ വശവും പര്യവേക്ഷണം ചെയ്യുക.", sourceGovernedBadge: "മൂലാധാര നിയന്ത്രിത പവിത്ര രാമായണ ജ്ഞാനലോകം", booksOfRamayana: "രാമായണത്തിലെ 7 കാണ്ഡങ്ങൾ", kandaExplorer: "ഏഴ് കാണ്ഡ പര്യവേക്ഷകൻ", kandaIntro: "നിലവിലെ ഏഴ്-കാണ്ഡ ശേഖരം പര്യവേക്ഷണം ചെയ്യുക. ഓരോ ലൊക്കേറ്ററും ഉറവിടം പരിശോധിക്കുന്നതുവരെ സർഗ്ഗ നാവിഗേഷൻ പതിപ്പ്-ബോധമുള്ളതായിരിക്കും.", loadingKandas: "പവിത്ര കാണ്ഡങ്ങൾ ലോഡ് ചെയ്യുന്നു…", kanda: "കാണ്ഡം", bookOf: "7ൽ കാണ്ഡം {n}", editionAwareIndex: "പതിപ്പ്-ബോധമുള്ള സർഗ്ഗ സൂചിക", kandaSummary: "കാണ്ഡ സംഗ്രഹം", corpusMilestones: "നിലവിലെ ശേഖര നാഴികക്കല്ലുകൾ", milestone: "നാഴികക്കല്ല്", verifiedSargaIndex: "പരിശോധിച്ച സർഗ്ഗ സൂചിക", editionOnly: "പതിപ്പ്-നിർദ്ദിഷ്ട, ഉറവിട സ്ഥാനമുള്ള രേഖകൾ മാത്രം കാണിക്കുന്നു.", openReader: "റീഡർ തുറക്കുക", openSource: "ഉറവിടം തുറക്കുക", sourceLocated: "ഉറവിടം സ്ഥിതിചെയ്യുന്നു", sourceLocatedRelease: "ഈ റിലീസിൽ ഉറവിടം സ്ഥിതിചെയ്യുന്നു", sourceAcquired: "ഉറവിടം നേടി", sourceAcquiredReview: "ക്വാറന്റൈൻ ചെയ്ത അവലോകന തെളിവ്; കാനോനിക്കൽ അല്ല", notAcquired: "നേടിയിട്ടില്ല", notPublished: "കാനോനിക്കൽ അല്ല", editorialReview: "എഡിറ്റോറിയൽ അവലോകനം", nextSource: "അടുത്ത കൃത്യമായ ഉറവിട പരിശോധനാ സ്ഥാനം", tamilTitle: "തമിഴ് ശീർഷകം", sourceText: "മൂലപാഠം", linksUnderReview: "സംഭവങ്ങളും കഥാപാത്രങ്ങളും അവലോകനത്തിൽ", noPublicationPath: "പ്രസിദ്ധീകരണ പാതയില്ല", stagingBranch: "സ്റ്റേജിംഗ് ശാഖ", underReview: "അവലോകനത്തിൽ — കാനോനിക്കൽ അല്ല", inspectSource: "ഉറവിട ലൊക്കേറ്റർ പരിശോധിക്കുക", searchTitle: "രാമവേഴ്സ് ഗൈഡഡ് തിരയൽ", searchBadge: "നിർണ്ണയിത പ്രാദേശിക തിരച്ചിൽ എഞ്ചിൻ", searchSubtitle: "ഉറവിടം സ്ഥിതിചെയ്യുന്ന സർഗ്ഗങ്ങൾ, ജ്ഞാന രേഖകൾ, കഥാപാത്രങ്ങൾ, പുണ്യസ്ഥലങ്ങൾ, മാർഗ്ഗനിർദ്ദേശം, കഥകൾ, ക്വിസുകൾ, ഓഡിയോ സ്ക്രിപ്റ്റുകൾ എന്നിവയിൽ തിരയുക.", searchInput: "മുഴുവൻ രാമവേഴ്സിലും തിരയാൻ ടൈപ്പ് ചെയ്യുക…", foundMatches: "\"{q}\" എന്നതിനായി {n} കാനോനിക്കൽ രേഖകൾ കണ്ടെത്തി", contentType: "ഉള്ളടക്ക തരം", reviewState: "അവലോകന നില", allTypes: "നിലവിലെ എല്ലാ കാനോനിക്കൽ തരങ്ങളും", allStates: "എല്ലാ എഡിറ്റോറിയൽ നിലകളും", needsSourceReview: "ഉറവിട അവലോകനം ആവശ്യമാണ്", needsTamilReview: "മനുഷ്യ തമിഴ് അവലോകനം ആവശ്യമാണ്", traditionVariant: "പാരമ്പര്യ വ്യത്യാസം", searchBegin: "രാമവേഴ്സ് ജ്ഞാന ഗ്രാഫ് പര്യവേക്ഷണം ചെയ്യാൻ മുകളിൽ തിരയൽ പദം നൽകുക.", searching: "കാനോനിക്കൽ രേഖകൾ തിരയുന്നു…", noRecords: "\"{q}\" എന്നതിനായി രേഖകളൊന്നും കണ്ടെത്തിയില്ല.", searchCanonicalOnly: "തിരയൽ കാനോനിക്കൽ രേഖകളിൽ മാത്രം.", record: "രേഖ", character: "കഥാപാത്രം", location: "സ്ഥലം", guidance: "മാർഗ്ഗനിർദ്ദേശം", story: "കഥ", quiz: "ക്വിസ്", wisdomRecords: "ജ്ഞാന രേഖകൾ", characters: "കഥാപാത്രങ്ങൾ", sacredPlaces: "പുണ്യസ്ഥലങ്ങൾ", guidanceRecords: "മാർഗ്ഗനിർദ്ദേശ രേഖകൾ", kidsStories: "കുട്ടികളുടെ കഥകൾ", quizzes: "ക്വിസുകൾ", audioScripts: "ഓഡിയോ സ്ക്രിപ്റ്റുകൾ", readerLanguage: "റീഡർ ഇന്റർഫേസ് ഭാഷ", progressDevice: "വായന പുരോഗതി ഈ ഉപകരണത്തിൽ സംരക്ഷിക്കുന്നു.", summaryDisclosure: "ഇത് ഒരു എഡിറ്റോറിയൽ സംഗ്രഹമാണ്; ശ്ലോക വിവർത്തനമോ ഉദ്ധരണിയോ ആയി ഇത് കാണിക്കുന്നില്ല.", sourceStatus: "ഉറവിടവും ഭാഷാ നിലയും", selectedInterface: "തിരഞ്ഞെടുത്ത ഇന്റർഫേസ്", currentCanonical: "നിലവിലെ കാനോനിക്കൽ", noBookmarks: "ബുക്ക്മാർക്കുകളൊന്നുമില്ല", noReflections: "ആത്മീയ കുറിപ്പുകളൊന്നുമില്ല", title: "ശീർഷകം", spiritualNote: "ആത്മീയ കുറിപ്പ്", clearLibraryConfirm: "എല്ലാ പ്രാദേശിക ലൈബ്രറി ഡാറ്റയും മായ്ക്കണമെന്ന് ഉറപ്പാണോ?", unexpectedError: "പ്രതീക്ഷിക്കാത്ത പിശക് സംഭവിച്ചു." },
};

for (const code of Object.keys(tierATranslations) as SupportedLanguage[]) {
  translations[code] = { ...(translations[code] ?? {}), ...tierATranslations[code] };
}

export const REQUIRED_UI_KEYS = Object.keys(tierATranslations.en ?? {});
export const TIER_A_UI_LANGUAGES: SupportedLanguage[] = ["en", "ta", "hi", "te", "kn", "ml"];

const KANDA_LABELS: Partial<Record<SupportedLanguage, string[]>> = {
  en: ["Bala Kanda", "Ayodhya Kanda", "Aranya Kanda", "Kishkindha Kanda", "Sundara Kanda", "Yuddha Kanda", "Uttara Kanda"],
  ta: ["பால காண்டம்", "அயோத்தி காண்டம்", "ஆரண்ய காண்டம்", "கிஷ்கிந்தா காண்டம்", "சுந்தர காண்டம்", "யுத்த காண்டம்", "உத்தர காண்டம்"],
  hi: ["बाल कांड", "अयोध्या कांड", "अरण्य कांड", "किष्किंधा कांड", "सुंदर कांड", "युद्ध कांड", "उत्तर कांड"],
  te: ["బాల కాండ", "అయోధ్య కాండ", "అరణ్య కాండ", "కిష్కింధ కాండ", "సుందర కాండ", "యుద్ధ కాండ", "ఉత్తర కాండ"],
  kn: ["ಬಾಲ ಕಾಂಡ", "ಅಯೋಧ್ಯ ಕಾಂಡ", "ಅರಣ್ಯ ಕಾಂಡ", "ಕಿಷ್ಕಿಂಧ ಕಾಂಡ", "ಸುಂದರ ಕಾಂಡ", "ಯುದ್ಧ ಕಾಂಡ", "ಉತ್ತರ ಕಾಂಡ"],
  ml: ["ബാല കാണ്ഡം", "അയോധ്യ കാണ്ഡം", "അരണ്യ കാണ്ഡം", "കിഷ്കിന്ധ കാണ്ഡം", "സുന്ദര കാണ്ഡം", "യുദ്ധ കാണ്ഡം", "ഉത്തര കാണ്ഡം"],
};

export function getLocalizedKandaLabel(language: SupportedLanguage, kandaNumber: number) {
  return KANDA_LABELS[language]?.[kandaNumber - 1] ?? KANDA_LABELS.en?.[kandaNumber - 1] ?? `Kanda ${kandaNumber}`;
}

export function localizedPath(language: SupportedLanguage, path: string) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `/${language}${normalized === "/" ? "" : normalized}`;
}

export function stripLocalePrefix(path: string) {
  const match = path.match(/^\/([a-z]{2}(?:-[A-Z]{2})?)(?=\/|$)/);
  if (!match || !isSupportedLanguage(match[1])) return { path: path || "/", language: null as SupportedLanguage | null };
  const stripped = path.slice(match[0].length) || "/";
  return { path: stripped.startsWith("/") ? stripped : `/${stripped}`, language: match[1] as SupportedLanguage };
}

export function translationStatusKey(status: string) {
  if (status === "UI_COMPLETE") return "uiComplete";
  if (status === "CONTENT_AVAILABLE") return "contentAvailable";
  if (status === "CONTENT_PARTIAL") return "contentPartial";
  if (status === "CONTENT_PENDING") return "contentPending";
  return "uiPartial";
}

const semanticTierATranslations: Partial<Record<SupportedLanguage, Record<string, string>>> = {
  en: { askPresetHanuman: "Who is Hanuman", askQuestion: "Ask a grounded RamaVerse question", canonicalAnswerProvenance: "Canonical answer provenance", relationshipAwaitingSelection: "Select two profiles to inspect whether a source-verified relationship edge is available.", canonicalCorpusOnly: "Published Canonical Corpus Only", stagingExcluded: "Staging excluded: Yes", lineageQualities: "Lineage & qualities evidence", withheldPersonEvidence: "Withheld until person-level source evidence is published.", noEntityMapping: "No source-linked entity mapping is published for this profile.", noAliasList: "No source-backed alias list, tradition ID, or per-profile source locator is published for this record.", lineageQualitiesNote: "The existing profile description is retained as editorial context; no source-verified lineage edge or independent qualities register is published for this profile.", noRelationshipEdge: "No source-verified relationship edge is published for the selected profiles. The second profile’s evidence view can be inspected without inferring a connection.", guidanceBoundary: "Guidance is not a devotional guarantee", guidanceBoundaryAria: "Guidance and devotional boundary", publishedLayer: "Published layer: canonical guidance only · staging excluded · devotional records currently available: {n}", verifiedState: "VERIFIED", sourceAcquiredState: "SOURCE ACQUIRED", notAcquiredState: "NOT ACQUIRED", nextSourceReview: "Next source-acquired Sarga review", quarantinedSourceReadiness: "Quarantined source readiness", sourceAcquiredQueue: "Source-acquired continuation queue", verifiedLocatorsNotPublic: "Verified locators, not public corpus records", readinessOnlyText: "These locators prepare the review queue only. They do not contribute reader content, canonical coverage, public search, or offline canonical material.", reviewNoteExcluded: "This review note is excluded from the canonical Sarga count, reader navigation, and public search until formal reconciliation and editorial approval.", quarantinedStagingBranch: "Quarantined staging branch", physicalStagingBranch: "Physical staging branch", recordsUnderReconciliation: "{n} records under reconciliation", latestPhysicalCoverage: "Latest physical source coverage: {s}. These records remain excluded from the reader, public search, offline canonical content, and the 550-record baseline.", underReviewNotCanonical: "Under review — not canonical", sargaMetadataAvailability: "Sarga metadata availability", availabilityFieldwise: "Availability is declared field by field; an empty field is not inferred from an adjacent tradition or edition.", editionLocatorReader: "Edition, locator, reader navigation", verifiedListed: "VERIFIED for the source-located records listed above", notAcquiredKanda: "NOT ACQUIRED for this Kanda", englishDescriptorSummary: "English editorial descriptor and summary", availableListed: "Available only on the listed records", tamilReadingFields: "Tamil reading, events, characters, places, dialogues, themes", underReviewNotAcquired: "UNDER REVIEW / NOT ACQUIRED unless a record explicitly supplies the field.", translationState: "Translation state", noUnreviewedTranslation: "No unreviewed translation is presented as source text.", sourceAcquiredHeading: "source acquired" },
  ta: { askPresetHanuman: "ஹனுமான் யார்?", askQuestion: "ஆதாரமுள்ள ராமவெர்ஸ் கேள்வியைக் கேளுங்கள்", canonicalAnswerProvenance: "கானோனிக்கல் பதில் ஆதாரம்", relationshipAwaitingSelection: "மூலத்தால் சரிபார்க்கப்பட்ட உறவு இணைப்பு உள்ளதா என்பதைப் பார்க்க இரண்டு சுயவிவரங்களைத் தேர்ந்தெடுக்கவும்.", canonicalCorpusOnly: "வெளியிடப்பட்ட கானோனிக்கல் தொகுப்பு மட்டுமே", stagingExcluded: "ஸ்டேஜிங் விலக்கப்பட்டது: ஆம்", lineageQualities: "வம்சம் மற்றும் பண்புகள் ஆதாரம்", withheldPersonEvidence: "நபர்-நிலை ஆதாரம் வெளியிடப்படும் வரை மறைக்கப்பட்டுள்ளது.", noEntityMapping: "இந்தச் சுயவிவரத்திற்கு மூலத்துடன் இணைந்த நிறுவன வரைபடம் வெளியிடப்படவில்லை.", noAliasList: "இந்தப் பதிவிற்கு மூல ஆதரவு பெற்ற மாற்றுப்பெயர் பட்டியல், மரபு ID அல்லது சுயவிவர மூல இடம் வெளியிடப்படவில்லை.", lineageQualitiesNote: "தற்போதைய சுயவிவர விளக்கம் தொகுப்பாசிரியர் சூழலாக வைத்திருக்கப்படுகிறது; மூலச் சரிபார்த்த வம்ச இணைப்போ தனிப்பட்ட பண்புப் பதிவேட்டோ வெளியிடப்படவில்லை.", noRelationshipEdge: "தேர்ந்தெடுத்த சுயவிவரங்களுக்கு மூலச் சரிபார்த்த உறவு இணைப்பு வெளியிடப்படவில்லை. இரண்டாவது சுயவிவரத்தின் ஆதாரக் காட்சியை இணைப்பை ஊகிக்காமல் பார்க்கலாம்.", guidanceBoundary: "வழிகாட்டல் பக்தி உத்தரவாதம் அல்ல", guidanceBoundaryAria: "வழிகாட்டல் மற்றும் பக்தி எல்லை", publishedLayer: "வெளியிடப்பட்ட அடுக்கு: கானோனிக்கல் வழிகாட்டல் மட்டும் · ஸ்டேஜிங் விலக்கப்பட்டது · தற்போது கிடைக்கும் பக்திப் பதிவுகள்: {n}", verifiedState: "சரிபார்க்கப்பட்டது", sourceAcquiredState: "மூலம் பெறப்பட்டது", notAcquiredState: "பெறப்படவில்லை", nextSourceReview: "அடுத்த மூலப் பெறப்பட்ட சர்க்க மதிப்பாய்வு", quarantinedSourceReadiness: "தனிமைப்படுத்தப்பட்ட மூலத் தயார்நிலை", sourceAcquiredQueue: "மூலப் பெறப்பட்ட தொடர்ச்சி வரிசை", verifiedLocatorsNotPublic: "சரிபார்க்கப்பட்ட மூல இடங்கள்; பொது தொகுப்பு பதிவுகள் அல்ல", readinessOnlyText: "இந்த மூல இடங்கள் மதிப்பாய்வு வரிசைக்காக மட்டுமே. வாசகர் உள்ளடக்கம், கானோனிக்கல் பரப்பு, பொது தேடல் அல்லது ஆஃப்லைன் கானோனிக்கல் உள்ளடக்கத்தில் இவை சேராது.", reviewNoteExcluded: "முறையான சமரசமும் தொகுப்பாசிரியர் ஒப்புதலும் கிடைக்கும் வரை இந்த மதிப்பாய்வு குறிப்பு கானோனிக்கல் சர்க்க எண்ணிக்கை, வாசகர் வழிசெலுத்தல் மற்றும் பொது தேடலில் இருந்து விலக்கப்பட்டுள்ளது.", quarantinedStagingBranch: "தனிமைப்படுத்தப்பட்ட ஸ்டேஜிங் கிளை", physicalStagingBranch: "உடல் ஸ்டேஜிங் கிளை", recordsUnderReconciliation: "{n} பதிவுகள் சமரசத்தில்", latestPhysicalCoverage: "சமீபத்திய உடல் மூலப் பரப்பு: {s}. இந்தப் பதிவுகள் வாசகர், பொது தேடல், ஆஃப்லைன் கானோனிக்கல் உள்ளடக்கம் மற்றும் 550-பதிவு அடிப்படையிலிருந்து விலக்கப்பட்டுள்ளன.", underReviewNotCanonical: "மதிப்பாய்வில் — கானோனிக்கல் அல்ல", sargaMetadataAvailability: "சர்க்க மெட்டாடேட்டா கிடைப்பு", availabilityFieldwise: "கிடைப்பு ஒவ்வொரு புலமாக அறிவிக்கப்படுகிறது; அருகிலுள்ள மரபு அல்லது பதிப்பிலிருந்து காலிப் புலம் ஊகிக்கப்படாது.", editionLocatorReader: "பதிப்பு, மூல இடம், வாசகர் வழிசெலுத்தல்", verifiedListed: "மேலே பட்டியலிட்ட மூல இடமுள்ள பதிவுகளுக்கு சரிபார்க்கப்பட்டது", notAcquiredKanda: "இந்தக் காண்டத்திற்கு பெறப்படவில்லை", englishDescriptorSummary: "ஆங்கில தொகுப்பாசிரியர் விளக்கம் மற்றும் சுருக்கம்", availableListed: "பட்டியலிட்ட பதிவுகளில் மட்டும் கிடைக்கிறது", tamilReadingFields: "தமிழ் வாசிப்பு, நிகழ்வுகள், கதாப்பாத்திரங்கள், இடங்கள், உரையாடல்கள், கருப்பொருள்கள்", underReviewNotAcquired: "ஒரு பதிவு தெளிவாக புலத்தை வழங்காவிட்டால் மதிப்பாய்வில் / பெறப்படவில்லை.", translationState: "மொழிபெயர்ப்பு நிலை", noUnreviewedTranslation: "மதிப்பாய்வு செய்யாத மொழிபெயர்ப்பு மூல உரையாகக் காட்டப்படாது.", sourceAcquiredHeading: "மூலம் பெறப்பட்டது" },
  hi: { askPresetHanuman: "हनुमान कौन हैं?", askQuestion: "रामावर्स से प्रमाणित प्रश्न पूछें", canonicalAnswerProvenance: "प्रमाणित उत्तर का स्रोत", relationshipAwaitingSelection: "स्रोत-सत्यापित संबंध कड़ी उपलब्ध है या नहीं, यह देखने के लिए दो प्रोफ़ाइल चुनें।", canonicalCorpusOnly: "केवल प्रकाशित प्रमाणित अभिलेख", stagingExcluded: "स्टेजिंग अलग रखी गई: हाँ", lineageQualities: "वंश और गुणों का साक्ष्य", withheldPersonEvidence: "व्यक्ति-स्तरीय स्रोत साक्ष्य प्रकाशित होने तक रोका गया है।", noEntityMapping: "इस प्रोफ़ाइल के लिए स्रोत-लिंक्ड इकाई मानचित्र प्रकाशित नहीं है।", noAliasList: "इस अभिलेख के लिए स्रोत-समर्थित उपनाम सूची, परंपरा ID या प्रोफ़ाइल-स्तरीय स्रोत स्थान प्रकाशित नहीं है।", lineageQualitiesNote: "वर्तमान प्रोफ़ाइल विवरण संपादकीय संदर्भ के रूप में रखा गया है; स्रोत-सत्यापित वंश कड़ी या स्वतंत्र गुण-पंजी प्रकाशित नहीं है।", noRelationshipEdge: "चयनित प्रोफ़ाइलों के लिए स्रोत-सत्यापित संबंध कड़ी प्रकाशित नहीं है। दूसरे प्रोफ़ाइल का साक्ष्य दृश्य बिना संबंध का अनुमान लगाए देखा जा सकता है।", guidanceBoundary: "मार्गदर्शन भक्ति की गारंटी नहीं है", guidanceBoundaryAria: "मार्गदर्शन और भक्ति सीमा", publishedLayer: "प्रकाशित स्तर: केवल प्रमाणित मार्गदर्शन · स्टेजिंग अलग · उपलब्ध भक्ति अभिलेख: {n}", verifiedState: "सत्यापित", sourceAcquiredState: "स्रोत प्राप्त", notAcquiredState: "प्राप्त नहीं", nextSourceReview: "अगला स्रोत-प्राप्त सर्ग समीक्षा", quarantinedSourceReadiness: "पृथक स्रोत तैयारी", sourceAcquiredQueue: "स्रोत-प्राप्त निरंतरता कतार", verifiedLocatorsNotPublic: "सत्यापित लोकेटर; सार्वजनिक अभिलेख नहीं", readinessOnlyText: "ये लोकेटर केवल समीक्षा कतार के लिए हैं। ये पाठक सामग्री, प्रमाणित कवरेज, सार्वजनिक खोज या ऑफ़लाइन प्रमाणित सामग्री में शामिल नहीं हैं।", reviewNoteExcluded: "औपचारिक मिलान और संपादकीय अनुमोदन तक यह समीक्षा टिप्पणी प्रमाणित सर्ग गणना, पाठक नेविगेशन और सार्वजनिक खोज से अलग है।", quarantinedStagingBranch: "पृथक स्टेजिंग शाखा", physicalStagingBranch: "भौतिक स्टेजिंग शाखा", recordsUnderReconciliation: "{n} अभिलेख मिलान में", latestPhysicalCoverage: "नवीनतम भौतिक स्रोत कवरेज: {s}। ये अभिलेख पाठक, सार्वजनिक खोज, ऑफ़लाइन प्रमाणित सामग्री और 550-अभिलेख आधार से अलग हैं।", underReviewNotCanonical: "समीक्षा में — प्रमाणित नहीं", sargaMetadataAvailability: "सर्ग मेटाडेटा उपलब्धता", availabilityFieldwise: "उपलब्धता प्रत्येक फ़ील्ड के लिए घोषित है; खाली फ़ील्ड को किसी निकटवर्ती परंपरा या संस्करण से नहीं भरा जाता।", editionLocatorReader: "संस्करण, लोकेटर, पाठक नेविगेशन", verifiedListed: "ऊपर सूचीबद्ध स्रोत-स्थित अभिलेखों के लिए सत्यापित", notAcquiredKanda: "इस कांड के लिए प्राप्त नहीं", englishDescriptorSummary: "अंग्रेज़ी संपादकीय विवरण और सारांश", availableListed: "केवल सूचीबद्ध अभिलेखों पर उपलब्ध", tamilReadingFields: "तमिल पठन, घटनाएँ, पात्र, स्थान, संवाद, विषय", underReviewNotAcquired: "जब तक कोई अभिलेख फ़ील्ड स्पष्ट रूप से न दे, समीक्षा में / प्राप्त नहीं।", translationState: "अनुवाद स्थिति", noUnreviewedTranslation: "असमीक्षित अनुवाद को स्रोत-पाठ के रूप में प्रस्तुत नहीं किया जाता।", sourceAcquiredHeading: "स्रोत प्राप्त" },
  te: { askPresetHanuman: "హనుమంతుడు ఎవరు?", askQuestion: "ఆధారిత రామావర్స్ ప్రశ్న అడగండి", canonicalAnswerProvenance: "ప్రధాన సమాధాన ఆధారం", relationshipAwaitingSelection: "మూలం ధృవీకరించిన సంబంధ లింక్ ఉందో లేదో చూడటానికి రెండు ప్రొఫైళ్లను ఎంచుకోండి.", canonicalCorpusOnly: "ప్రచురిత ప్రధాన రికార్డులు మాత్రమే", stagingExcluded: "స్టేజింగ్ మినహాయించబడింది: అవును", lineageQualities: "వంశం మరియు లక్షణాల ఆధారం", withheldPersonEvidence: "వ్యక్తి-స్థాయి మూల ఆధారం ప్రచురించబడే వరకు నిలిపివేయబడింది.", noEntityMapping: "ఈ ప్రొఫైల్‌కు మూలంతో అనుసంధానించిన ఎంటిటీ మ్యాపింగ్ ప్రచురించబడలేదు.", noAliasList: "ఈ రికార్డుకు మూల-ఆధారిత ప్రత్యామ్నాయ పేర్ల జాబితా, సంప్రదాయ ID లేదా ప్రొఫైల్ మూల లొకేటర్ ప్రచురించబడలేదు.", lineageQualitiesNote: "ప్రస్తుత ప్రొఫైల్ వివరణ సంపాదకీయ సందర్భంగా ఉంచబడింది; మూలం ధృవీకరించిన వంశ లింక్ లేదా స్వతంత్ర లక్షణాల రిజిస్టర్ ప్రచురించబడలేదు.", noRelationshipEdge: "ఎంచుకున్న ప్రొఫైళ్లకు మూలం ధృవీకరించిన సంబంధ లింక్ ప్రచురించబడలేదు. రెండవ ప్రొఫైల్ ఆధార వీక్షణను సంబంధాన్ని ఊహించకుండా చూడవచ్చు.", guidanceBoundary: "మార్గదర్శకత్వం భక్తి హామీ కాదు", guidanceBoundaryAria: "మార్గదర్శకత్వం మరియు భక్తి పరిమితి", publishedLayer: "ప్రచురిత స్థాయి: ప్రధాన మార్గదర్శకత్వం మాత్రమే · స్టేజింగ్ మినహాయింపు · ప్రస్తుతం అందుబాటులో ఉన్న భక్తి రికార్డులు: {n}", verifiedState: "ధృవీకరించబడింది", sourceAcquiredState: "మూలం పొందబడింది", notAcquiredState: "పొందలేదు", nextSourceReview: "తదుపరి మూలం పొందిన సర్గ సమీక్ష", quarantinedSourceReadiness: "క్వారంటైన్ చేసిన మూల సిద్ధత", sourceAcquiredQueue: "మూలం పొందిన కొనసాగింపు క్యూ", verifiedLocatorsNotPublic: "ధృవీకరించిన లొకేటర్లు; ప్రజా రికార్డులు కావు", readinessOnlyText: "ఈ లొకేటర్లు సమీక్ష క్యూ కోసం మాత్రమే. ఇవి రీడర్ కంటెంట్, ప్రధాన కవరేజ్, ప్రజా శోధన లేదా ఆఫ్‌లైన్ ప్రధాన కంటెంట్‌లో చేరవు.", reviewNoteExcluded: "అధికారిక సమన్వయం మరియు సంపాదకీయ ఆమోదం వరకు ఈ సమీక్ష గమనిక ప్రధాన సర్గ లెక్క, రీడర్ నావిగేషన్ మరియు ప్రజా శోధన నుండి మినహాయించబడుతుంది.", quarantinedStagingBranch: "క్వారంటైన్ చేసిన స్టేజింగ్ శాఖ", physicalStagingBranch: "భౌతిక స్టేజింగ్ శాఖ", recordsUnderReconciliation: "{n} రికార్డులు సమన్వయంలో", latestPhysicalCoverage: "తాజా భౌతిక మూల కవరేజ్: {s}. ఈ రికార్డులు రీడర్, ప్రజా శోధన, ఆఫ్‌లైన్ ప్రధాన కంటెంట్ మరియు 550-రికార్డు ఆధారం నుండి మినహాయించబడ్డాయి.", underReviewNotCanonical: "సమీక్షలో — ప్రధాన కాదు", sargaMetadataAvailability: "సర్గ మెటాడేటా లభ్యత", availabilityFieldwise: "లభ్యత ప్రతి ఫీల్డ్‌కు ప్రకటించబడుతుంది; ఖాళీ ఫీల్డ్‌ను పక్క సంప్రదాయం లేదా ఎడిషన్ నుంచి ఊహించరు.", editionLocatorReader: "ఎడిషన్, లొకేటర్, రీడర్ నావిగేషన్", verifiedListed: "పైన జాబితా చేసిన మూల-లొకేటెడ్ రికార్డులకు ధృవీకరించబడింది", notAcquiredKanda: "ఈ కాండకు పొందలేదు", englishDescriptorSummary: "ఇంగ్లీష్ సంపాదకీయ వివరణ మరియు సారాంశం", availableListed: "జాబితా చేసిన రికార్డులలో మాత్రమే అందుబాటులో ఉంది", tamilReadingFields: "తమిళ పఠనం, ఈవెంట్లు, పాత్రలు, ప్రదేశాలు, సంభాషణలు, అంశాలు", underReviewNotAcquired: "రికార్డు ఫీల్డ్‌ను స్పష్టంగా ఇవ్వకపోతే సమీక్షలో / పొందలేదు.", translationState: "అనువాద స్థితి", noUnreviewedTranslation: "సమీక్షించని అనువాదం మూల పాఠ్యంగా చూపబడదు.", sourceAcquiredHeading: "మూలం పొందబడింది" },
  kn: { askPresetHanuman: "ಹನುಮಂತ ಯಾರು?", askQuestion: "ಆಧಾರಿತ ರಾಮಾವರ್ಸ್ ಪ್ರಶ್ನೆಯನ್ನು ಕೇಳಿ", canonicalAnswerProvenance: "ಕಾನೋನಿಕಲ್ ಉತ್ತರದ ಸಾಕ್ಷ್ಯ", relationshipAwaitingSelection: "ಮೂಲ-ಪರಿಶೀಲಿತ ಸಂಬಂಧ ಕೊಂಡಿ ಲಭ್ಯವಿದೆಯೇ ಎಂದು ಪರಿಶೀಲಿಸಲು ಎರಡು ಪ್ರೊಫೈಲ್‌ಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ.", canonicalCorpusOnly: "ಪ್ರಕಟಿತ ಕಾನೋನಿಕಲ್ ದಾಖಲೆಗಳು ಮಾತ್ರ", stagingExcluded: "ಸ್ಟೇಜಿಂಗ್ ಹೊರಗಿಡಲಾಗಿದೆ: ಹೌದು", lineageQualities: "ವಂಶ ಮತ್ತು ಗುಣಗಳ ಸಾಕ್ಷ್ಯ", withheldPersonEvidence: "ವ್ಯಕ್ತಿ-ಮಟ್ಟದ ಮೂಲ ಸಾಕ್ಷ್ಯ ಪ್ರಕಟವಾಗುವವರೆಗೆ ತಡೆಹಿಡಿಯಲಾಗಿದೆ.", noEntityMapping: "ಈ ಪ್ರೊಫೈಲ್‌ಗೆ ಮೂಲ-ಲಿಂಕ್ ಮಾಡಿದ ಘಟಕ ನಕ್ಷೆ ಪ್ರಕಟವಾಗಿಲ್ಲ.", noAliasList: "ಈ ದಾಖಲೆಗಾಗಿ ಮೂಲ-ಬೆಂಬಲಿತ ಪರ್ಯಾಯ ಹೆಸರುಗಳ ಪಟ್ಟಿ, ಪರಂಪರೆ ID ಅಥವಾ ಪ್ರೊಫೈಲ್ ಮೂಲ ಸ್ಥಳ ಪ್ರಕಟವಾಗಿಲ್ಲ.", lineageQualitiesNote: "ಪ್ರಸ್ತುತ ಪ್ರೊಫೈಲ್ ವಿವರಣೆಯನ್ನು ಸಂಪಾದಕೀಯ ಸಂದರ್ಭವಾಗಿ ಉಳಿಸಲಾಗಿದೆ; ಮೂಲ-ಪರಿಶೀಲಿತ ವಂಶ ಕೊಂಡಿ ಅಥವಾ ಸ್ವತಂತ್ರ ಗುಣಗಳ ನೋಂದಣಿ ಪ್ರಕಟವಾಗಿಲ್ಲ.", noRelationshipEdge: "ಆಯ್ದ ಪ್ರೊಫೈಲ್‌ಗಳಿಗೆ ಮೂಲ-ಪರಿಶೀಲಿತ ಸಂಬಂಧ ಕೊಂಡಿ ಪ್ರಕಟವಾಗಿಲ್ಲ. ಎರಡನೇ ಪ್ರೊಫೈಲ್‌ನ ಸಾಕ್ಷ್ಯ ವೀಕ್ಷಣೆಯನ್ನು ಸಂಬಂಧ ಊಹಿಸದೆ ಪರಿಶೀಲಿಸಬಹುದು.", guidanceBoundary: "ಮಾರ್ಗದರ್ಶನ ಭಕ್ತಿಯ ಭರವಸೆ ಅಲ್ಲ", guidanceBoundaryAria: "ಮಾರ್ಗದರ್ಶನ ಮತ್ತು ಭಕ್ತಿ ಮಿತಿ", publishedLayer: "ಪ್ರಕಟಿತ ಪದರ: ಕಾನೋನಿಕಲ್ ಮಾರ್ಗದರ್ಶನ ಮಾತ್ರ · ಸ್ಟೇಜಿಂಗ್ ಹೊರಗಿಡಲಾಗಿದೆ · ಲಭ್ಯವಿರುವ ಭಕ್ತಿ ದಾಖಲೆಗಳು: {n}", verifiedState: "ಪರಿಶೀಲಿಸಲಾಗಿದೆ", sourceAcquiredState: "ಮೂಲ ದೊರೆತಿದೆ", notAcquiredState: "ಪಡೆಯಲಾಗಿಲ್ಲ", nextSourceReview: "ಮುಂದಿನ ಮೂಲ-ಪಡೆದ ಸರ್ಗ ಪರಿಶೀಲನೆ", quarantinedSourceReadiness: "ಪ್ರತ್ಯೇಕಿಸಿದ ಮೂಲ ಸಿದ್ಧತೆ", sourceAcquiredQueue: "ಮೂಲ-ಪಡೆದ ಮುಂದುವರಿಕೆ ಸರತಿ", verifiedLocatorsNotPublic: "ಪರಿಶೀಲಿತ ಲೊಕೇಟರ್‌ಗಳು; ಸಾರ್ವಜನಿಕ ದಾಖಲೆಗಳಲ್ಲ", readinessOnlyText: "ಈ ಲೊಕೇಟರ್‌ಗಳು ಪರಿಶೀಲನಾ ಸರತಿಗಾಗಿ ಮಾತ್ರ. ಇವು ಓದುಗರ ವಿಷಯ, ಕಾನೋನಿಕಲ್ ವ್ಯಾಪ್ತಿ, ಸಾರ್ವಜನಿಕ ಹುಡುಕಾಟ ಅಥವಾ ಆಫ್‌ಲೈನ್ ಕಾನೋನಿಕಲ್ ವಿಷಯಕ್ಕೆ ಸೇರುವುದಿಲ್ಲ.", reviewNoteExcluded: "ಔಪಚಾರಿಕ ಹೊಂದಾಣಿಕೆ ಮತ್ತು ಸಂಪಾದಕೀಯ ಅನುಮೋದನೆವರೆಗೆ ಈ ಪರಿಶೀಲನಾ ಟಿಪ್ಪಣಿಯನ್ನು ಕಾನೋನಿಕಲ್ ಸರ್ಗ ಎಣಿಕೆ, ಓದುಗರ ನ್ಯಾವಿಗೇಶನ್ ಮತ್ತು ಸಾರ್ವಜನಿಕ ಹುಡುಕಾಟದಿಂದ ಹೊರಗಿಡಲಾಗಿದೆ.", quarantinedStagingBranch: "ಪ್ರತ್ಯೇಕಿಸಿದ ಸ್ಟೇಜಿಂಗ್ ಶಾಖೆ", physicalStagingBranch: "ಭೌತಿಕ ಸ್ಟೇಜಿಂಗ್ ಶಾಖೆ", recordsUnderReconciliation: "{n} ದಾಖಲೆಗಳು ಹೊಂದಾಣಿಕೆಯಲ್ಲಿ", latestPhysicalCoverage: "ಇತ್ತೀಚಿನ ಭೌತಿಕ ಮೂಲ ವ್ಯಾಪ್ತಿ: {s}. ಈ ದಾಖಲೆಗಳನ್ನು ಓದುಗ, ಸಾರ್ವಜನಿಕ ಹುಡುಕಾಟ, ಆಫ್‌ಲೈನ್ ಕಾನೋನಿಕಲ್ ವಿಷಯ ಮತ್ತು 550-ದಾಖಲೆ ಆಧಾರದಿಂದ ಹೊರಗಿಡಲಾಗಿದೆ.", underReviewNotCanonical: "ಪರಿಶೀಲನೆಯಲ್ಲಿ — ಕಾನೋನಿಕಲ್ ಅಲ್ಲ", sargaMetadataAvailability: "ಸರ್ಗ ಮೆಟಾಡೇಟಾ ಲಭ್ಯತೆ", availabilityFieldwise: "ಲಭ್ಯತೆಯನ್ನು ಪ್ರತಿ ಕ್ಷೇತ್ರಕ್ಕೆ ಘೋಷಿಸಲಾಗುತ್ತದೆ; ಖಾಲಿ ಕ್ಷೇತ್ರವನ್ನು ಪಕ್ಕದ ಪರಂಪರೆ ಅಥವಾ ಆವೃತ್ತಿಯಿಂದ ಊಹಿಸಲಾಗುವುದಿಲ್ಲ.", editionLocatorReader: "ಆವೃತ್ತಿ, ಲೊಕೇಟರ್, ಓದುಗರ ನ್ಯಾವಿಗೇಶನ್", verifiedListed: "ಮೇಲೆ ಪಟ್ಟಿ ಮಾಡಿದ ಮೂಲ-ಸ್ಥಳಿತ ದಾಖಲೆಗಳಿಗೆ ಪರಿಶೀಲಿಸಲಾಗಿದೆ", notAcquiredKanda: "ಈ ಕಾಂಡಕ್ಕೆ ಪಡೆಯಲಾಗಿಲ್ಲ", englishDescriptorSummary: "ಇಂಗ್ಲಿಷ್ ಸಂಪಾದಕೀಯ ವಿವರಣೆ ಮತ್ತು ಸಾರಾಂಶ", availableListed: "ಪಟ್ಟಿಯಲ್ಲಿರುವ ದಾಖಲೆಗಳಲ್ಲಿ ಮಾತ್ರ ಲಭ್ಯ", tamilReadingFields: "ತಮಿಳು ಓದು, ಘಟನೆಗಳು, ಪಾತ್ರಗಳು, ಸ್ಥಳಗಳು, ಸಂಭಾಷಣೆಗಳು, ವಿಷಯಗಳು", underReviewNotAcquired: "ದಾಖಲೆ ಕ್ಷೇತ್ರವನ್ನು ಸ್ಪಷ್ಟವಾಗಿ ನೀಡದಿದ್ದರೆ ಪರಿಶೀಲನೆಯಲ್ಲಿ / ಪಡೆಯಲಾಗಿಲ್ಲ.", translationState: "ಅನುವಾದ ಸ್ಥಿತಿ", noUnreviewedTranslation: "ಪರಿಶೀಲಿಸದ ಅನುವಾದವನ್ನು ಮೂಲ ಪಠ್ಯವಾಗಿ ತೋರಿಸಲಾಗುವುದಿಲ್ಲ.", sourceAcquiredHeading: "ಮೂಲ ದೊರೆತಿದೆ" },
  ml: { askPresetHanuman: "ഹനുമാൻ ആരാണ്?", askQuestion: "ഉറവിടാധിഷ്ഠിത രാമവേഴ്സ് ചോദ്യം ചോദിക്കൂ", canonicalAnswerProvenance: "കാനോനിക്കൽ ഉത്തരത്തിന്റെ തെളിവ്", relationshipAwaitingSelection: "ഉറവിടം പരിശോധിച്ച ബന്ധരേഖ ലഭ്യമാണോ എന്ന് പരിശോധിക്കാൻ രണ്ട് പ്രൊഫൈലുകൾ തിരഞ്ഞെടുക്കുക.", canonicalCorpusOnly: "പ്രസിദ്ധീകരിച്ച കാനോനിക്കൽ രേഖകൾ മാത്രം", stagingExcluded: "സ്റ്റേജിംഗ് ഒഴിവാക്കി: അതെ", lineageQualities: "വംശവും ഗുണങ്ങളും സംബന്ധിച്ച തെളിവ്", withheldPersonEvidence: "വ്യക്തി-തലത്തിലുള്ള ഉറവിട തെളിവ് പ്രസിദ്ധീകരിക്കുന്നതുവരെ തടഞ്ഞിരിക്കുന്നു.", noEntityMapping: "ഈ പ്രൊഫൈലിനായി ഉറവിടവുമായി ബന്ധിപ്പിച്ച എന്റിറ്റി മാപ്പിംഗ് പ്രസിദ്ധീകരിച്ചിട്ടില്ല.", noAliasList: "ഈ രേഖയ്ക്കായി ഉറവിട പിന്തുണയുള്ള അപരനാമ പട്ടിക, പാരമ്പര്യ ID, അല്ലെങ്കിൽ പ്രൊഫൈൽ ഉറവിട ലൊക്കേറ്റർ പ്രസിദ്ധീകരിച്ചിട്ടില്ല.", lineageQualitiesNote: "നിലവിലെ പ്രൊഫൈൽ വിവരണം എഡിറ്റോറിയൽ സന്ദർഭമായി നിലനിർത്തുന്നു; ഉറവിടം പരിശോധിച്ച വംശബന്ധമോ സ്വതന്ത്ര ഗുണരജിസ്റ്ററോ പ്രസിദ്ധീകരിച്ചിട്ടില്ല.", noRelationshipEdge: "തിരഞ്ഞെടുത്ത പ്രൊഫൈലുകൾക്കായി ഉറവിടം പരിശോധിച്ച ബന്ധരേഖ പ്രസിദ്ധീകരിച്ചിട്ടില്ല. രണ്ടാമത്തെ പ്രൊഫൈലിന്റെ തെളിവ് കാഴ്ച ബന്ധം അനുമാനിക്കാതെ പരിശോധിക്കാം.", guidanceBoundary: "മാർഗ്ഗനിർദ്ദേശം ഭക്തിയുടെ ഉറപ്പ് അല്ല", guidanceBoundaryAria: "മാർഗ്ഗനിർദ്ദേശവും ഭക്തി പരിധിയും", publishedLayer: "പ്രസിദ്ധീകരിച്ച പാളി: കാനോനിക്കൽ മാർഗ്ഗനിർദ്ദേശം മാത്രം · സ്റ്റേജിംഗ് ഒഴിവാക്കി · ലഭ്യമായ ഭക്തി രേഖകൾ: {n}", verifiedState: "പരിശോധിച്ചു", sourceAcquiredState: "ഉറവിടം ലഭിച്ചു", notAcquiredState: "ലഭ്യമല്ല", nextSourceReview: "അടുത്ത ഉറവിടം ലഭിച്ച സർഗ്ഗ അവലോകനം", quarantinedSourceReadiness: "ക്വാറന്റൈൻ ചെയ്ത ഉറവിട സജ്ജീകരണം", sourceAcquiredQueue: "ഉറവിടം ലഭിച്ച തുടർച്ചാ നിര", verifiedLocatorsNotPublic: "പരിശോധിച്ച ലൊക്കേറ്ററുകൾ; പൊതുരേഖകളല്ല", readinessOnlyText: "ഈ ലൊക്കേറ്ററുകൾ അവലോകന നിരയ്ക്കായി മാത്രം. വായനക്കാരുടെ ഉള്ളടക്കം, കാനോനിക്കൽ കവറേജ്, പൊതുതേടൽ, ഓഫ്‌ലൈൻ കാനോനിക്കൽ ഉള്ളടക്കം എന്നിവയിൽ ഇവ ഉൾപ്പെടുന്നില്ല.", reviewNoteExcluded: "ഔപചാരിക പൊരുത്തപ്പെടുത്തലും എഡിറ്റോറിയൽ അംഗീകാരവും ലഭിക്കുന്നതുവരെ ഈ അവലോകന കുറിപ്പ് കാനോനിക്കൽ സർഗ്ഗ എണ്ണത്തിൽ നിന്നും വായനാ നാവിഗേഷനിൽ നിന്നും പൊതുതേടലിൽ നിന്നും ഒഴിവാക്കിയിരിക്കുന്നു.", quarantinedStagingBranch: "ക്വാറന്റൈൻ ചെയ്ത സ്റ്റേജിംഗ് ശാഖ", physicalStagingBranch: "ഭൗതിക സ്റ്റേജിംഗ് ശാഖ", recordsUnderReconciliation: "{n} രേഖകൾ പൊരുത്തപ്പെടുത്തലിൽ", latestPhysicalCoverage: "ഏറ്റവും പുതിയ ഭൗതിക ഉറവിട കവറേജ്: {s}. ഈ രേഖകൾ വായനക്കാരിൽ നിന്നും പൊതുതേടലിൽ നിന്നും ഓഫ്‌ലൈൻ കാനോനിക്കൽ ഉള്ളടക്കത്തിൽ നിന്നും 550-രേഖാ അടിസ്ഥാനത്തിൽ നിന്നും ഒഴിവാക്കിയിരിക്കുന്നു.", underReviewNotCanonical: "അവലോകനത്തിൽ — കാനോനിക്കൽ അല്ല", sargaMetadataAvailability: "സർഗ്ഗ മെറ്റാഡാറ്റ ലഭ്യത", availabilityFieldwise: "ലഭ്യത ഓരോ ഫീൽഡായും പ്രഖ്യാപിക്കുന്നു; സമീപ പാരമ്പര്യത്തിൽ നിന്നോ പതിപ്പിൽ നിന്നോ ശൂന്യ ഫീൽഡ് അനുമാനിക്കുന്നില്ല.", editionLocatorReader: "പതിപ്പ്, ലൊക്കേറ്റർ, വായനാ നാവിഗേഷൻ", verifiedListed: "മുകളിൽ പട്ടികപ്പെടുത്തിയ ഉറവിട-ലൊക്കേറ്റഡ് രേഖകൾക്ക് പരിശോധിച്ചു", notAcquiredKanda: "ഈ കാണ്ഡത്തിന് ലഭ്യമാക്കിയിട്ടില്ല", englishDescriptorSummary: "ഇംഗ്ലീഷ് എഡിറ്റോറിയൽ വിവരണവും സംഗ്രഹവും", availableListed: "പട്ടികപ്പെടുത്തിയ രേഖകളിൽ മാത്രം ലഭ്യം", tamilReadingFields: "തമിഴ് വായന, സംഭവങ്ങൾ, കഥാപാത്രങ്ങൾ, സ്ഥലങ്ങൾ, സംഭാഷണങ്ങൾ, വിഷയങ്ങൾ", underReviewNotAcquired: "ഒരു രേഖ ഫീൽഡ് വ്യക്തമായി നൽകാത്തിടത്തോളം അവലോകനത്തിൽ / ലഭ്യമല്ല.", translationState: "വിവർത്തന നില", noUnreviewedTranslation: "അവലോകനം ചെയ്യാത്ത വിവർത്തനം ഉറവിടപാഠമായി കാണിക്കില്ല.", sourceAcquiredHeading: "ഉറവിടം ലഭിച്ചു" },
};
for (const code of Object.keys(semanticTierATranslations) as SupportedLanguage[]) {
  translations[code] = { ...(translations[code] || {}), ...semanticTierATranslations[code] };
}
const footerTierATranslations: Partial<Record<SupportedLanguage, Record<string, string>>> = {
  en: { footerKandas: "7 Kandas Explorer", footerWisdom: "108 Wisdom Records", footerCharacters: "51 Characters Encyclopedia", footerPlaces: "25 Sacred Places Atlas", footerGuidance: "100 Guidance Records", footerStories: "30 Kids Stories", footerQuizzes: "100 Quizzes & Challenges", footerAudio: "30 Audio Scripts", footerThemes: "Dharma • Bhakti • Jnana", footerCopyright: "© {year} RamaVerse Platform. All canonical rights preserved." },
  ta: { footerKandas: "7 காண்டங்கள் ஆய்வு", footerWisdom: "108 ஞானப் பதிவுகள்", footerCharacters: "51 கதாப்பாத்திர கலைக்களஞ்சியம்", footerPlaces: "25 புனித இடங்கள் அட்லஸ்", footerGuidance: "100 வழிகாட்டல் பதிவுகள்", footerStories: "30 குழந்தைகள் கதைகள்", footerQuizzes: "100 வினாடி வினாக்கள் மற்றும் சவால்கள்", footerAudio: "30 ஒலி உரைகள்", footerThemes: "தர்மம் • பக்தி • ஞானம்", footerCopyright: "© {year} ராமவெர்ஸ் தளம். அனைத்து கானோனிக்கல் உரிமைகளும் பாதுகாக்கப்பட்டவை." },
  hi: { footerKandas: "7 कांड अन्वेषण", footerWisdom: "108 ज्ञान अभिलेख", footerCharacters: "51 पात्र विश्वकोश", footerPlaces: "25 पवित्र स्थान एटलस", footerGuidance: "100 मार्गदर्शन अभिलेख", footerStories: "30 बाल कथाएँ", footerQuizzes: "100 प्रश्नोत्तरी और चुनौतियाँ", footerAudio: "30 ऑडियो स्क्रिप्ट", footerThemes: "धर्म • भक्ति • ज्ञान", footerCopyright: "© {year} रामावर्स मंच। सभी प्रमाणित अधिकार सुरक्षित हैं।" },
  te: { footerKandas: "7 కాండాల అన్వేషణ", footerWisdom: "108 జ్ఞాన రికార్డులు", footerCharacters: "51 పాత్రల విజ్ఞానసర్వస్వం", footerPlaces: "25 పవిత్ర ప్రదేశాల అట్లాస్", footerGuidance: "100 మార్గదర్శక రికార్డులు", footerStories: "30 పిల్లల కథలు", footerQuizzes: "100 క్విజ్‌లు మరియు సవాళ్లు", footerAudio: "30 ఆడియో స్క్రిప్ట్‌లు", footerThemes: "ధర్మం • భక్తి • జ్ఞానం", footerCopyright: "© {year} రామావర్స్ వేదిక. అన్ని ప్రధాన హక్కులు రక్షించబడ్డాయి." },
  kn: { footerKandas: "7 ಕಾಂಡಗಳ ಅನ್ವೇಷಣೆ", footerWisdom: "108 ಜ್ಞಾನ ದಾಖಲೆಗಳು", footerCharacters: "51 ಪಾತ್ರಗಳ ವಿಶ್ವಕೋಶ", footerPlaces: "25 ಪವಿತ್ರ ಸ್ಥಳಗಳ ಅಟ್ಲಾಸ್", footerGuidance: "100 ಮಾರ್ಗದರ್ಶನ ದಾಖಲೆಗಳು", footerStories: "30 ಮಕ್ಕಳ ಕಥೆಗಳು", footerQuizzes: "100 ಕ್ವಿಜ್‌ಗಳು ಮತ್ತು ಸವಾಲುಗಳು", footerAudio: "30 ಆಡಿಯೋ ಸ್ಕ್ರಿಪ್ಟ್‌ಗಳು", footerThemes: "ಧರ್ಮ • ಭಕ್ತಿ • ಜ್ಞಾನ", footerCopyright: "© {year} ರಾಮಾವರ್ಸ್ ವೇದಿಕೆ. ಎಲ್ಲಾ ಕಾನೋನಿಕಲ್ ಹಕ್ಕುಗಳನ್ನು ಸಂರಕ್ಷಿಸಲಾಗಿದೆ." },
  ml: { footerKandas: "7 കാണ്ഡങ്ങളുടെ പര്യവേക്ഷണം", footerWisdom: "108 ജ്ഞാന രേഖകൾ", footerCharacters: "51 കഥാപാത്രങ്ങളുടെ വിജ്ഞാനകോശം", footerPlaces: "25 പുണ്യസ്ഥലങ്ങളുടെ അറ്റ്ലസ്", footerGuidance: "100 മാർഗ്ഗനിർദ്ദേശ രേഖകൾ", footerStories: "30 കുട്ടിക്കഥകൾ", footerQuizzes: "100 ക്വിസുകളും വെല്ലുവിളികളും", footerAudio: "30 ഓഡിയോ സ്ക്രിപ്റ്റുകൾ", footerThemes: "ധർമ്മം • ഭക്തി • ജ്ഞാനം", footerCopyright: "© {year} രാമവേഴ്സ് വേദി. എല്ലാ കാനോനിക്കൽ അവകാശങ്ങളും സംരക്ഷിച്ചിരിക്കുന്നു." },
};
for (const code of Object.keys(footerTierATranslations) as SupportedLanguage[]) {
  translations[code] = { ...(translations[code] || {}), ...footerTierATranslations[code] };
}

export function formatTranslation(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? `{${key}}`));
}

const fallbackTranslationContext: MultilingualContextType = {
  language: "en",
  setLanguage: () => undefined,
  contentLanguage: "en",
  setContentLanguage: () => undefined,
  t: (key: string) => translations.en?.[key] || key,
  getLanguageMeta: (code: SupportedLanguage) => SUPPORTED_LANGUAGES.find((item) => item.code === code) || SUPPORTED_LANGUAGES[0],
  resolveContent: (value: string | null | undefined, availableLanguage: SupportedLanguage = "en") => ({ text: value ?? "", language: availableLanguage, isFallback: availableLanguage !== "en" }),
};
const MultilingualContext = createContext<MultilingualContextType>(fallbackTranslationContext);

export function MultilingualProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    try {
      const stored = localStorage.getItem("ramaverse_lang");
      if (isSupportedLanguage(stored)) {
        return stored;
      }
    } catch (e) {
      console.warn("Failed to read language from localStorage", e);
    }
    return "en";
  });

  const [contentLanguage, setContentLanguageState] = useState<SupportedLanguage>(() => {
    try {
      const stored = localStorage.getItem("ramaverse_content_lang");
      return isSupportedLanguage(stored) ? stored : "en";
    } catch {
      return "en";
    }
  });

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("ramaverse_lang", lang);
    } catch (e) {
      console.error("Failed to save language to localStorage", e);
    }
  };

  const setContentLanguage = (lang: SupportedLanguage) => {
    setContentLanguageState(lang);
    try {
      localStorage.setItem("ramaverse_content_lang", lang);
    } catch (e) {
      console.error("Failed to save content language", e);
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem("ramaverse_lang", language);
      document.documentElement.lang = language;
      document.documentElement.dir = language === "ar" || language === "ur" ? "rtl" : "ltr";
    } catch (e) {
      console.error("Failed to save language", e);
    }
  }, [language]);

  const t = (key: string) => {
    const dict = translations[language] || translations.en;
    return dict?.[key] || translations.en?.[key] || key;
  };

  const resolveContent = (value: string | null | undefined, availableLanguage: SupportedLanguage = "en") => ({
    text: value ?? "",
    language: availableLanguage,
    isFallback: availableLanguage !== contentLanguage,
  });

  const getLanguageMeta = (code: SupportedLanguage): LanguageMeta => {
    return SUPPORTED_LANGUAGES.find((l) => l.code === code) || SUPPORTED_LANGUAGES[0];
  };

  return (
    <MultilingualContext.Provider value={{ language, setLanguage, contentLanguage, setContentLanguage, t, getLanguageMeta, resolveContent }}>
      {children}
    </MultilingualContext.Provider>
  );
}

export function useTranslation() {
  return useContext(MultilingualContext);
}
