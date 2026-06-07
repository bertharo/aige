import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { t as translate } from './translations';
import { normalizeLangCode } from './languages';

const LANG_KEY = 'kinness_lang';
const LANG_CHOSEN_KEY = 'kinness_lang_chosen';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [langChosen, setLangChosen] = useState(() => {
    if (localStorage.getItem(LANG_CHOSEN_KEY) === '1') return true;
    if (localStorage.getItem(LANG_KEY)) {
      localStorage.setItem(LANG_CHOSEN_KEY, '1');
      return true;
    }
    return false;
  });
  const [showPicker, setShowPicker] = useState(false);
  const [lang, setLang] = useState(() => normalizeLangCode(localStorage.getItem(LANG_KEY) || 'en'));

  useEffect(() => {
    localStorage.setItem(LANG_KEY, lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const chooseLanguage = useCallback((code) => {
    const normalized = normalizeLangCode(code);
    setLang(normalized);
    localStorage.setItem(LANG_KEY, normalized);
    localStorage.setItem(LANG_CHOSEN_KEY, '1');
    setLangChosen(true);
    setShowPicker(false);
  }, []);

  const openLanguagePicker = useCallback(() => setShowPicker(true), []);
  const closeLanguagePicker = useCallback(() => setShowPicker(false), []);

  const t = useCallback((key, vars) => translate(lang, key, vars), [lang]);

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang: chooseLanguage,
        chooseLanguage,
        langChosen,
        showPicker,
        openLanguagePicker,
        closeLanguagePicker,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
