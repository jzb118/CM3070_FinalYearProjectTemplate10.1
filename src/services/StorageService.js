import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
    HAS_SEEN_ONBOARDING: 'has_seen_onboarding',
    USER_NAME: 'user_name',
    NOTIFICATIONS_ENABLED: 'notifications_enabled',
    LANGUAGE: 'app_language',
};

export const StorageService = {
    async setNotificationSettings(enabled) {
        try {
            await AsyncStorage.setItem(KEYS.NOTIFICATIONS_ENABLED, JSON.stringify(enabled));
        } catch (e) {
            console.error('Error saving notification settings', e);
        }
    },

    async getNotificationSettings() {
        try {
            const value = await AsyncStorage.getItem(KEYS.NOTIFICATIONS_ENABLED);
            // Default to true if not set
            return value != null ? JSON.parse(value) : true;
        } catch (e) {
            console.error('Error reading notification settings', e);
            return true;
        }
    },

    async setHasSeenOnboarding(value) {
        try {
            await AsyncStorage.setItem(KEYS.HAS_SEEN_ONBOARDING, JSON.stringify(value));
        } catch (e) {
            console.error('Error saving onboarding status', e);
        }
    },

    async getHasSeenOnboarding() {
        try {
            const value = await AsyncStorage.getItem(KEYS.HAS_SEEN_ONBOARDING);
            return value != null ? JSON.parse(value) : false;
        } catch (e) {
            console.error('Error reading onboarding status', e);
            return false;
        }
    },

    async setUserName(name) {
        try {
            await AsyncStorage.setItem(KEYS.USER_NAME, name);
        } catch (e) {
            console.error('Error saving user name', e);
        }
    },

    async getUserName() {
        try {
            return await AsyncStorage.getItem(KEYS.USER_NAME);
        } catch (e) {
            console.error('Error reading user name', e);
            return null;
        }
    },

    async setLanguage(lang) {
        try {
            await AsyncStorage.setItem(KEYS.LANGUAGE, lang);
        } catch (e) {
            console.error('Error saving language', e);
        }
    },

    async getLanguage() {
        try {
            return await AsyncStorage.getItem(KEYS.LANGUAGE);
        } catch (e) {
            console.error('Error reading language', e);
            return null;
        }
    },

    async clearAll() {
        try {
            await AsyncStorage.clear();
        } catch (e) {
            console.error('Error clearing storage', e);
        }
    }
};
