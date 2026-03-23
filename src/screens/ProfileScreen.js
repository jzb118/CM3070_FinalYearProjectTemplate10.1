import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Switch, Alert, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { AppText } from '../components/AppText';
import { GlassView } from '../components/GlassView';
import { theme } from '../utils/theme';
import { GamificationService } from '../services/GamificationService';
import { useFocusEffect } from '@react-navigation/native';
import { getDB } from '../services/DatabaseService';
import { StorageService } from '../services/StorageService';
import { useLanguage } from '../context/LanguageContext';

export default function ProfileScreen({ navigation }) {
    const { t, tc, language, setLanguage } = useLanguage();
    const [stats, setStats] = useState({
        preparednessLevel: 0,
        quizzesCompleted: 0,
        hazardsCompleted: 0,
        badgesEarned: 0,
        badges: []
    });

    // Settings state
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [languageModalVisible, setLanguageModalVisible] = useState(false);
    const [aboutModalVisible, setAboutModalVisible] = useState(false);
    const [privacyModalVisible, setPrivacyModalVisible] = useState(false);

    useFocusEffect(
        React.useCallback(() => {
            loadStats();
            loadSettings();
        }, [])
    );

    const loadSettings = async () => {
        const enabled = await StorageService.getNotificationSettings();
        setNotificationsEnabled(enabled);
    }

    const toggleNotifications = async (value) => {
        setNotificationsEnabled(value);
        await StorageService.setNotificationSettings(value);
    };

    const loadStats = async () => {
        const userStats = await GamificationService.getUserStats();
        setStats(userStats);
    };

    const handleResetProgress = () => {
        Alert.alert(
            t('resetProgress'),
            t('resetConfirm'),
            [
                { text: t('cancel'), style: "cancel" },
                {
                    text: t('reset'),
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const db = getDB();
                            await db.runAsync('DELETE FROM user_progress');
                            loadStats();
                            Alert.alert(t('resetComplete'), t('progressReset'));
                        } catch (e) {
                            console.error(e);
                        }
                    }
                }
            ]
        );
    };

    const languages = [
        { code: 'en', label: 'English', flag: '🇬🇧' },
        { code: 'ms', label: 'Bahasa Melayu', flag: '🇲🇾' },
        { code: 'my', label: 'မြန်မာ', flag: '🇲🇲' },
    ];

    const currentLangLabel = languages.find(l => l.code === language)?.label || 'English';

    const handleSelectLanguage = async (code) => {
        await setLanguage(code);
        setLanguageModalVisible(false);
    };

    const renderBadge = (badge) => (
        <View key={badge.id} style={styles.badgeItem}>
            <View style={[styles.badgeIcon, !badge.unlocked && styles.badgeLocked]}>
                <Ionicons
                    name={badge.unlocked ? badge.icon : "lock-closed"}
                    size={32}
                    color={badge.unlocked ? theme.colors.primary : "#95A5A6"}
                />
            </View>
            <AppText variant="caption" style={styles.badgeName} numberOfLines={1}>
                {badge.unlocked ? (tc('badges', badge.id, 'name') || badge.name) : t('locked')}
            </AppText>
        </View>
    );

    return (
        <ScreenWrapper>
            <View style={styles.header}>
                <AppText variant="h1" centered>{t('profile')}</AppText>
                <AppText variant="body" color={theme.colors.textSecondary} centered>
                    {t('settingsAndBadges')}
                </AppText>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Preparedness Level Card */}
                <GlassView style={styles.card}>
                    <View style={styles.cardHeader}>
                        <AppText variant="h3">{t('preparednessLevel')}</AppText>
                    </View>

                    <View style={styles.progressContainer}>
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: `${stats.preparednessLevel}%` }]} />
                        </View>
                        <AppText variant="h3" style={styles.progressText}>{stats.preparednessLevel}%</AppText>
                    </View>

                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <AppText variant="body" style={styles.bullet}>•</AppText>
                            <AppText variant="body" color={theme.colors.textSecondary}>{t('hazardsCompleted')}: {stats.hazardsCompleted}</AppText>
                        </View>
                        <View style={styles.statItem}>
                            <AppText variant="body" style={styles.bullet}>•</AppText>
                            <AppText variant="body" color={theme.colors.textSecondary}>{t('quizzesCompleted')}: {stats.quizzesCompleted}</AppText>
                        </View>
                        <View style={styles.statItem}>
                            <AppText variant="body" style={styles.bullet}>•</AppText>
                            <AppText variant="body" color={theme.colors.textSecondary}>{t('badgesEarned')}: {stats.badgesEarned}</AppText>
                        </View>
                    </View>
                </GlassView>

                {/* Badges Card */}
                <GlassView style={styles.card}>
                    <View style={styles.cardHeader}>
                        <AppText variant="h3">{t('badges')}</AppText>
                    </View>
                    <View style={styles.badgesGrid}>
                        {stats.badges.map(renderBadge)}
                    </View>
                </GlassView>

                {/* Settings Card */}
                <GlassView style={styles.card}>
                    <View style={styles.cardHeader}>
                        <AppText variant="h3">{t('settings')}</AppText>
                    </View>

                    <View style={styles.settingRow}>
                        <AppText variant="body">{t('notifications')}</AppText>
                        <Switch
                            value={notificationsEnabled}
                            onValueChange={toggleNotifications}
                            trackColor={{ false: "#767577", true: theme.colors.primary }}
                        />
                    </View>
                    <View style={styles.divider} />

                    <TouchableOpacity style={styles.settingRow} onPress={() => setLanguageModalVisible(true)}>
                        <AppText variant="body">{t('language')}</AppText>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <AppText variant="caption" color={theme.colors.textSecondary} style={{ marginRight: 8 }}>
                                {currentLangLabel}
                            </AppText>
                            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                        </View>
                    </TouchableOpacity>
                    <View style={styles.divider} />

                    <TouchableOpacity style={styles.settingRow} onPress={handleResetProgress}>
                        <AppText variant="body" color={theme.colors.error}>{t('resetLocalProgress')}</AppText>
                        <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                </GlassView>

                {/* About Card */}
                <GlassView style={styles.card}>
                    <View style={styles.cardHeader}>
                        <AppText variant="h3">{t('about')}</AppText>
                    </View>

                    <TouchableOpacity style={styles.settingRow} onPress={() => setAboutModalVisible(true)}>
                        <AppText variant="body">{t('howThisAppWorks')}</AppText>
                        <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                    <View style={styles.divider} />

                    <TouchableOpacity style={styles.settingRow} onPress={() => setPrivacyModalVisible(true)}>
                        <AppText variant="body">{t('privacyDisclaimer')}</AppText>
                        <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                </GlassView>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Language Picker Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={languageModalVisible}
                onRequestClose={() => setLanguageModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setLanguageModalVisible(false)}
                >
                    <View style={styles.modalContent}>
                        <AppText variant="h3" style={styles.modalTitle}>{t('selectLanguage')}</AppText>

                        {languages.map((lang) => (
                            <TouchableOpacity
                                key={lang.code}
                                style={[
                                    styles.langOption,
                                    language === lang.code && styles.langOptionSelected
                                ]}
                                onPress={() => handleSelectLanguage(lang.code)}
                            >
                                <AppText style={styles.langFlag}>{lang.flag}</AppText>
                                <AppText variant="body" style={styles.langLabel}>{lang.label}</AppText>
                                {language === lang.code && (
                                    <Ionicons name="checkmark-circle" size={22} color={theme.colors.primary} />
                                )}
                            </TouchableOpacity>
                        ))}

                        <TouchableOpacity
                            style={styles.modalCloseBtn}
                            onPress={() => setLanguageModalVisible(false)}
                        >
                            <AppText variant="body" color={theme.colors.textSecondary}>{t('cancel')}</AppText>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* About / How this app works Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={aboutModalVisible}
                onRequestClose={() => setAboutModalVisible(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setAboutModalVisible(false)}
                >
                    <Pressable
                        style={[styles.modalContent, { width: '90%', maxHeight: '80%' }]}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <AppText variant="h2" style={styles.modalTitle}>{t('howThisAppWorks')}</AppText>
                        <ScrollView showsVerticalScrollIndicator={true} nestedScrollEnabled={true}>
                            <AppText variant="body" color={theme.colors.textSecondary} style={styles.infoText}>
                                {t('aboutDescription')}
                            </AppText>

                            <AppText variant="h3" style={styles.infoSectionTitle}>{t('aboutFeatures')}</AppText>
                            <AppText variant="body" color={theme.colors.textSecondary} style={styles.infoText}>
                                {t('aboutFeature1')}
                            </AppText>
                            <AppText variant="body" color={theme.colors.textSecondary} style={styles.infoText}>
                                {t('aboutFeature2')}
                            </AppText>
                            <AppText variant="body" color={theme.colors.textSecondary} style={styles.infoText}>
                                {t('aboutFeature3')}
                            </AppText>
                            <AppText variant="body" color={theme.colors.textSecondary} style={styles.infoText}>
                                {t('aboutFeature4')}
                            </AppText>

                            <View style={styles.contactSection}>
                                <AppText variant="h3" style={styles.infoSectionTitle}>{t('contactUs')}</AppText>
                                <AppText variant="body" color={theme.colors.primary}>
                                    disasterprep@mymail.com
                                </AppText>
                            </View>
                        </ScrollView>

                        <TouchableOpacity
                            style={styles.modalCloseBtn}
                            onPress={() => setAboutModalVisible(false)}
                        >
                            <AppText variant="body" color={theme.colors.primary}>{t('goBack')}</AppText>
                        </TouchableOpacity>
                    </Pressable>
                </Pressable>
            </Modal>

            {/* Privacy & Disclaimer Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={privacyModalVisible}
                onRequestClose={() => setPrivacyModalVisible(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setPrivacyModalVisible(false)}
                >
                    <Pressable
                        style={[styles.modalContent, { width: '90%', maxHeight: '80%' }]}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <AppText variant="h2" style={styles.modalTitle}>{t('privacyDisclaimer')}</AppText>
                        <ScrollView showsVerticalScrollIndicator={true} nestedScrollEnabled={true}>
                            <AppText variant="h3" style={styles.infoSectionTitle}>{t('privacyDataTitle')}</AppText>
                            <AppText variant="body" color={theme.colors.textSecondary} style={styles.infoText}>
                                {t('privacyDataBody')}
                            </AppText>

                            <AppText variant="h3" style={styles.infoSectionTitle}>{t('privacyLocationTitle')}</AppText>
                            <AppText variant="body" color={theme.colors.textSecondary} style={styles.infoText}>
                                {t('privacyLocationBody')}
                            </AppText>

                            <AppText variant="h3" style={styles.infoSectionTitle}>{t('privacyDisclaimerTitle')}</AppText>
                            <AppText variant="body" color={theme.colors.textSecondary} style={styles.infoText}>
                                {t('privacyDisclaimerBody')}
                            </AppText>

                            <View style={styles.contactSection}>
                                <AppText variant="h3" style={styles.infoSectionTitle}>{t('contactUs')}</AppText>
                                <AppText variant="body" color={theme.colors.primary}>
                                    disasterprep@mymail.com
                                </AppText>
                            </View>
                        </ScrollView>

                        <TouchableOpacity
                            style={styles.modalCloseBtn}
                            onPress={() => setPrivacyModalVisible(false)}
                        >
                            <AppText variant="body" color={theme.colors.primary}>{t('goBack')}</AppText>
                        </TouchableOpacity>
                    </Pressable>
                </Pressable>
            </Modal>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingVertical: theme.spacing.l,
        alignItems: 'center',
    },
    scrollContent: {
        paddingHorizontal: theme.spacing.l,
        paddingBottom: 20,
    },
    card: {
        padding: theme.spacing.l,
        marginBottom: theme.spacing.l,
        borderRadius: theme.borderRadius.l,
    },
    cardHeader: {
        marginBottom: theme.spacing.m,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        paddingBottom: theme.spacing.s,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.m,
    },
    progressBarBg: {
        flex: 1,
        height: 12,
        backgroundColor: theme.colors.border,
        borderRadius: 6,
        marginRight: theme.spacing.m,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#7F8C8D',
        borderRadius: 6,
    },
    progressText: {
        width: 50,
        textAlign: 'right',
    },
    statsRow: {
        marginTop: theme.spacing.s,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    bullet: {
        marginRight: 8,
        color: theme.colors.textSecondary,
    },
    badgesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    badgeItem: {
        width: '23%',
        alignItems: 'center',
        marginBottom: theme.spacing.m,
    },
    badgeIcon: {
        width: 60,
        height: 60,
        backgroundColor: theme.colors.background,
        borderRadius: theme.borderRadius.m,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.xs,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    badgeLocked: {
        opacity: 0.5,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    badgeName: {
        textAlign: 'center',
        fontSize: 10,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.border,
    },
    // language Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: theme.colors.card,
        borderRadius: 16,
        padding: 24,
        width: '80%',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    modalTitle: {
        textAlign: 'center',
        marginBottom: 20,
    },
    langOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 8,
        backgroundColor: theme.colors.background,
    },
    langOptionSelected: {
        backgroundColor: 'rgba(46, 134, 171, 0.1)',
        borderWidth: 1,
        borderColor: theme.colors.primary,
    },
    langFlag: {
        fontSize: 24,
        marginRight: 14,
    },
    langLabel: {
        flex: 1,
        color: theme.colors.text,
    },
    modalCloseBtn: {
        alignItems: 'center',
        paddingVertical: 12,
        marginTop: 8,
    },
    infoText: {
        lineHeight: 22,
        marginBottom: 12,
    },
    infoSectionTitle: {
        marginTop: 8,
        marginBottom: 8,
    },
    contactSection: {
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        paddingTop: 12,
        marginTop: 4,
        alignItems: 'center',
    },
});
