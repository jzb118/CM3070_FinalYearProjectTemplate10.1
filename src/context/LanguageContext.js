import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations, contentTranslations } from '../utils/translations';
import { StorageService } from '../services/StorageService';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    const [language, setLanguageState] = useState('en');
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        loadLanguage();
    }, []);

    const loadLanguage = async () => {
        const saved = await StorageService.getLanguage();
        if (saved) setLanguageState(saved);
        setIsLoaded(true);
    };

    const setLanguage = useCallback(async (lang) => {
        setLanguageState(lang);
        await StorageService.setLanguage(lang);
    }, []);

    // Translate UI strings
    const t = useCallback((key) => {
        const langStrings = translations[language] || translations.en;
        return langStrings[key] || translations.en[key] || key;
    }, [language]);

    // Translate database content by category and record ID
    // Usage: tc('hazards', 'flood', 'name') returns translated name or null
    const tc = useCallback((category, id, field) => {
        if (language === 'en') return null; // Use original DB value for English
        const langContent = contentTranslations[language];
        if (!langContent) return null;
        const cat = langContent[category];
        if (!cat) return null;
        const record = cat[id];
        if (!record) return null;
        // For checklists, the record is a plain string
        if (typeof record === 'string') return record;
        return record[field] || null;
    }, [language]);

    if (!isLoaded) return null;

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, tc }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
