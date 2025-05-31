import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translations for the voting portal
const translations = {
  en: {
    // Common
    'welcome': 'Welcome',
    'login': 'Login',
    'logout': 'Logout',
    'submit': 'Submit',
    'cancel': 'Cancel',
    'back': 'Back',
    'next': 'Next',
    'language': 'Language',
    
    // Voting Portal
    'voting_portal': 'Voting Portal',
    'voter_login': 'Voter Login',
    'admin_login': 'Admin Login',
    'voter_id': 'Voter ID',
    'password': 'Password',
    'login_as_voter': 'Login as Voter',
    'login_as_admin': 'Login as Admin',
    'biometric_verification': 'Biometric Verification',
    'face_verification': 'Face Verification',
    'fingerprint_verification': 'Fingerprint Verification',
    'scan_face': 'Scan your face for verification',
    'scan_fingerprint': 'Place your finger on the scanner',
    'verification_success': 'Verification Successful',
    'verification_failed': 'Verification Failed',
    'cast_vote': 'Cast Your Vote',
    'select_candidate': 'Select a candidate',
    'confirm_vote': 'Confirm Your Vote',
    'vote_submitted': 'Vote Submitted Successfully',
    'candidates': 'Candidates',
    'party': 'Party',
    'qualification': 'Qualification',
    'experience': 'Experience',
    'nota': 'None of the Above (NOTA)',
  },
  hi: {
    // Common
    'welcome': 'स्वागत है',
    'login': 'लॉगिन',
    'logout': 'लॉगआउट',
    'submit': 'सबमिट करें',
    'cancel': 'रद्द करें',
    'back': 'वापस',
    'next': 'आगे',
    'language': 'भाषा',
    
    // Voting Portal
    'voting_portal': 'मतदान पोर्टल',
    'voter_login': 'मतदाता लॉगिन',
    'admin_login': 'एडमिन लॉगिन',
    'voter_id': 'मतदाता आईडी',
    'password': 'पासवर्ड',
    'login_as_voter': 'मतदाता के रूप में लॉगिन करें',
    'login_as_admin': 'एडमिन के रूप में लॉगिन करें',
    'biometric_verification': 'बायोमेट्रिक सत्यापन',
    'face_verification': 'चेहरा सत्यापन',
    'fingerprint_verification': 'फिंगरप्रिंट सत्यापन',
    'scan_face': 'सत्यापन के लिए अपना चेहरा स्कैन करें',
    'scan_fingerprint': 'स्कैनर पर अपनी उंगली रखें',
    'verification_success': 'सत्यापन सफल',
    'verification_failed': 'सत्यापन असफल',
    'cast_vote': 'अपना वोट डालें',
    'select_candidate': 'एक उम्मीदवार चुनें',
    'confirm_vote': 'अपने वोट की पुष्टि करें',
    'vote_submitted': 'वोट सफलतापूर्वक जमा किया गया',
    'candidates': 'उम्मीदवार',
    'party': 'पार्टी',
    'qualification': 'योग्यता',
    'experience': 'अनुभव',
    'nota': 'उपरोक्त में से कोई नहीं (नोटा)',
  },
  te: {
    // Common
    'welcome': 'స్వాగతం',
    'login': 'లాగిన్',
    'logout': 'లాగ్అవుట్',
    'submit': 'సమర్పించు',
    'cancel': 'రద్దు చేయి',
    'back': 'వెనుకకు',
    'next': 'తదుపరి',
    'language': 'భాష',
    
    // Voting Portal
    'voting_portal': 'ఓటింగ్ పోర్టల్',
    'voter_login': 'ఓటరు లాగిన్',
    'admin_login': 'అడ్మిన్ లాగిన్',
    'voter_id': 'ఓటరు ID',
    'password': 'పాస్‌వర్డ్',
    'login_as_voter': 'ఓటరుగా లాగిన్ అవండి',
    'login_as_admin': 'అడ్మిన్‌గా లాగిన్ అవండి',
    'biometric_verification': 'బయోమెట్రిక్ ధృవీకరణ',
    'face_verification': 'ముఖ ధృవీకరణ',
    'fingerprint_verification': 'వేలిముద్ర ధృవీకరణ',
    'scan_face': 'ధృవీకరణ కోసం మీ ముఖాన్ని స్కాన్ చేయండి',
    'scan_fingerprint': 'స్కానర్‌పై మీ వేలును ఉంచండి',
    'verification_success': 'ధృవీకరణ విజయవంతం',
    'verification_failed': 'ధృవీకరణ విఫలమైంది',
    'cast_vote': 'మీ ఓటు వేయండి',
    'select_candidate': 'ఒక అభ్యర్థిని ఎంచుకోండి',
    'confirm_vote': 'మీ ఓటును ధృవీకరించండి',
    'vote_submitted': 'ఓటు విజయవంతంగా సమర్పించబడింది',
    'candidates': 'అభ్యర్థులు',
    'party': 'పార్టీ',
    'qualification': 'అర్హత',
    'experience': 'అనుభవం',
    'nota': 'పైవారిలో ఎవరూ లేరు (నోటా)',
  }
};

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('voting-language');
    if (savedLanguage && ['en', 'hi', 'te'].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem('voting-language', lang);
  };

  const t = (key: string): string => {
    const langTranslations = translations[language as keyof typeof translations] || translations.en;
    return langTranslations[key as keyof typeof langTranslations] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}