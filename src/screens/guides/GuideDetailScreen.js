import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { AppText } from '../../components/AppText';
import { GlassView } from '../../components/GlassView';
import { GuidesService } from '../../services/GuidesService';
import { theme } from '../../utils/theme';
import { useLanguage } from '../../context/LanguageContext';

export default function GuideDetailScreen({ route, navigation }) {
    const { t, tc } = useLanguage();
    const { guideId } = route.params;
    const [guide, setGuide] = useState(null);
    const [progress, setProgress] = useState({ completed: 0, total: 0, percentage: 0 });
    const [loading, setLoading] = useState(true);

    const loadGuideData = async () => {
        try {
            const guideData = await GuidesService.getGuideDetails(guideId);
            const progressData = await GuidesService.getChecklistProgress(guideId);

            setGuide(guideData);
            setProgress(progressData);
        } catch (error) {
            console.error('Error loading guide:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadGuideData();
    }, [guideId]);

    const handleToggleChecklistItem = async (checklistId, currentStatus) => {
        const newStatus = !currentStatus;
        const success = await GuidesService.toggleChecklistItem(checklistId, newStatus);

        if (success) {
            await loadGuideData(); // refresh
        }
    };

    if (loading) {
        return (
            <ScreenWrapper>
                <View style={styles.center}>
                    <AppText>{t('loading')}</AppText>
                </View>
            </ScreenWrapper>
        );
    }

    if (!guide) {
        return (
            <ScreenWrapper>
                <View style={styles.center}>
                    <AppText variant="h2">{t('guideNotFound')}</AppText>
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper>
            {/* Back Button */}
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
            </TouchableOpacity>

            {/* Home Button */}
            <TouchableOpacity
                style={styles.homeButton}
                onPress={() => navigation.navigate('Home')}
            >
                <Ionicons name="home" size={24} color={theme.colors.text} />
            </TouchableOpacity>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <AppText variant="h1">{tc('guides', guideId, 'title') || String(guide.title)}</AppText>
                    <AppText variant="body" color={theme.colors.textSecondary} style={styles.content}>
                        {tc('guides', guideId, 'content') || String(guide.content)}
                    </AppText>
                </View>

                {/* Checklist Section */}
                {guide.checklists && guide.checklists.length > 0 ? (
                    <View style={styles.checklistSection}>
                        <View style={styles.progressHeader}>
                            <AppText variant="h2">{t('checklist')}</AppText>

                            <View style={styles.progressBadge}>
                                <AppText variant="caption" style={styles.progressText}>
                                    {progress.completed}/{progress.total} • {progress.percentage}%
                                </AppText>
                            </View>
                        </View>

                        <View style={styles.progressBar}>
                            <View style={[styles.progressFill, { width: `${progress.percentage}%` }]} />
                        </View>

                        {guide.checklists.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                onPress={() => handleToggleChecklistItem(item.id, item.is_completed)}
                                style={styles.checklistItem}
                            >
                                <GlassView style={styles.checklistCard}>
                                    <View style={[
                                        styles.checkbox,
                                        item.is_completed ? styles.checkboxChecked : null
                                    ]}>
                                        {item.is_completed ? (
                                            <Ionicons name="checkmark" size={20} color={theme.colors.background} />
                                        ) : null}
                                    </View>

                                    <AppText
                                        variant="body"
                                        style={[
                                            styles.checklistText,
                                            item.is_completed ? styles.checklistTextCompleted : null
                                        ]}
                                    >
                                        {tc('checklists', item.id, 'item_text') || String(item.item_text)}
                                    </AppText>
                                </GlassView>
                            </TouchableOpacity>
                        ))}
                    </View>
                ) : null}
            </ScrollView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    backButton: {
        position: 'absolute',
        top: theme.spacing.l,
        left: theme.spacing.l,
        zIndex: 10,
        padding: theme.spacing.s,
    },
    homeButton: {
        position: 'absolute',
        top: theme.spacing.l,
        right: theme.spacing.l,
        zIndex: 10,
        padding: theme.spacing.s,
    },
    scrollContent: {
        padding: theme.spacing.l,
        paddingTop: theme.spacing.xl + 40,
    },
    header: {
        marginBottom: theme.spacing.xl,
    },
    content: {
        marginTop: theme.spacing.m,
        lineHeight: 24,
    },
    checklistSection: {
        marginTop: theme.spacing.l,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.m,
    },
    progressBadge: {
        backgroundColor: theme.colors.primaryLight,
        paddingHorizontal: theme.spacing.m,
        paddingVertical: theme.spacing.s,
        borderRadius: 20,
    },
    progressText: {
        color: theme.colors.primary,
        fontWeight: 'bold',
    },
    progressBar: {
        height: 8,
        backgroundColor: theme.colors.primaryLight,
        borderRadius: 4,
        marginBottom: theme.spacing.l,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: theme.colors.primary,
        borderRadius: 4,
    },
    checklistItem: {
        marginBottom: theme.spacing.m,
    },
    checklistCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing.m,
    },
    checkbox: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: theme.colors.primary,
        marginRight: theme.spacing.m,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    checklistText: {
        flex: 1,
    },
    checklistTextCompleted: {
        textDecorationLine: 'line-through',
        color: theme.colors.textSecondary,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
