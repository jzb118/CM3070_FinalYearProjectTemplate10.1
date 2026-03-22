import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { AppText } from '../components/AppText';
import { GlassView } from '../components/GlassView';
import { AppButton } from '../components/AppButton';
import { getDB } from '../services/DatabaseService';
import { theme } from '../utils/theme';

export default function CaseDetailScreen({ route, navigation }) {
    const { caseData } = route.params;
    const [guides, setGuides] = useState([]);
    const [checklists, setChecklists] = useState([]);
    const [selectedGuide, setSelectedGuide] = useState(null);

    useEffect(() => {
        fetchGuides();
    }, []);

    const fetchGuides = async () => {
        const start = Date.now();
        try {
            const db = getDB();
            const guidesResult = await db.getAllAsync(
                'SELECT * FROM guides WHERE hazard_id = ? ORDER BY step_order',
                [caseData.type]
            );

            setGuides(guidesResult);
            console.log(`[PERF_DB] fetchGuides for ${caseData.type}: ${Date.now() - start}ms (Rows: ${guidesResult.length})`);

            if (guidesResult.length > 0) {
                setSelectedGuide(guidesResult[0]);
                fetchChecklists(guidesResult[0].id);
            }
        } catch (e) {
            console.error('Error fetching guides:', e);
        }
    };

    const fetchChecklists = async (guideId) => {
        try {
            const db = getDB();
            const checklistsResult = await db.getAllAsync(
                'SELECT * FROM checklists WHERE guide_id = ?',
                [guideId]
            );

            setChecklists(checklistsResult);
        } catch (e) {
            console.error('Error fetching checklists:', e);
        }
    };

    const toggleChecklistItem = async (itemId, currentStatus) => {
        try {
            const db = getDB();
            await db.runAsync(
                'UPDATE checklists SET is_completed = ? WHERE id = ?',
                [currentStatus ? 0 : 1, itemId]
            );

            if (selectedGuide) {
                fetchChecklists(selectedGuide.id);
            }
        } catch (e) {
            console.error('Error toggling checklist item:', e);
        }
    };

    const getHazardIcon = (type) => {
        const iconMap = {
            flood: 'water',
            fire: 'flame',
            earthquake: 'earth',
            covid: 'medkit',
            dengue: 'bug',
        };
        return iconMap[type] || 'alert-circle';
    };

    const getHazardColor = (type) => {
        const colorMap = {
            flood: '#4A90E2',
            fire: '#E74C3C',
            earthquake: '#8B4513',
            covid: '#E74C3C',
            dengue: '#F39C12',
        };
        return colorMap[type] || theme.colors.primary;
    };

    return (
        <ScreenWrapper>
            <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
                {/* Back Button */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                </View>

                {/* Case Info */}
                <GlassView style={styles.caseInfo}>
                    <View style={[styles.caseIcon, { backgroundColor: getHazardColor(caseData.type) + '33' }]}>
                        <Ionicons name={getHazardIcon(caseData.type)} size={40} color={getHazardColor(caseData.type)} />
                    </View>

                    <AppText variant="h1" style={styles.caseTitle}>
                        {String(caseData.type.charAt(0).toUpperCase() + caseData.type.slice(1))} Emergency
                    </AppText>

                    <AppText variant="body" color={theme.colors.textSecondary} style={styles.caseDescription}>
                        {String(caseData.description ?? "")}
                    </AppText>

                    <View style={[styles.alertBadge, { backgroundColor: theme.colors.error + '33' }]}>
                        <Ionicons name="alert-circle" size={16} color={theme.colors.error} />
                        <AppText variant="caption" color={theme.colors.error} style={styles.alertText}>
                            Active Emergency - Follow safety guidelines
                        </AppText>
                    </View>
                </GlassView>

                {/* Safety Guidelines */}
                <View style={styles.section}>
                    <AppText variant="h2" style={styles.sectionTitle}>
                        Safety Guidelines
                    </AppText>
                    <AppText variant="body" color={theme.colors.textSecondary} style={styles.sectionSubtitle}>
                        Follow these steps to stay safe and help others
                    </AppText>
                </View>

                {/* Guide Tabs */}
                {guides.length > 0 ? (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.guideTabs}
                        contentContainerStyle={styles.guideTabsContent}
                    >
                        {guides.map((guide) => (
                            <TouchableOpacity
                                key={guide.id}
                                onPress={() => {
                                    setSelectedGuide(guide);
                                    fetchChecklists(guide.id);
                                }}
                                activeOpacity={0.7}
                            >
                                <GlassView
                                    style={[
                                        styles.guideTab,
                                        selectedGuide?.id === guide.id ? styles.guideTabActive : null
                                    ]}
                                >
                                    <AppText
                                        variant="body"
                                        color={selectedGuide?.id === guide.id ? theme.colors.primary : theme.colors.text}
                                        style={styles.guideTabText}
                                    >
                                        {String(guide.title ?? "")}
                                    </AppText>
                                </GlassView>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                ) : null}

                {/* Guide Content */}
                {selectedGuide ? (
                    <GlassView style={styles.guideContent}>
                        <AppText variant="body" style={styles.guideText}>
                            {String(selectedGuide.content ?? "")}
                        </AppText>
                    </GlassView>
                ) : null}

                {/* Checklist */}
                {checklists.length > 0 ? (
                    <View style={styles.section}>
                        <AppText variant="h3" style={styles.sectionTitle}>
                            Action Checklist
                        </AppText>

                        {checklists.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                onPress={() => toggleChecklistItem(item.id, item.is_completed)}
                                activeOpacity={0.7}
                            >
                                <GlassView style={styles.checklistItem}>
                                    <View style={[
                                        styles.checkbox,
                                        item.is_completed ? styles.checkboxChecked : null
                                    ]}>
                                        {item.is_completed ? (
                                            <Ionicons name="checkmark" size={16} color={theme.colors.success} />
                                        ) : null}
                                    </View>

                                    <AppText
                                        variant="body"
                                        style={[
                                            styles.checklistText,
                                            item.is_completed ? styles.checklistTextCompleted : null
                                        ]}
                                    >
                                        {String(item.item_text ?? "")}
                                    </AppText>
                                </GlassView>
                            </TouchableOpacity>
                        ))}
                    </View>
                ) : null}

                {/* Emergency Contact Button */}
                <View style={styles.emergencySection}>
                    <AppButton
                        title="Call Emergency Services"
                        onPress={() => console.log('Emergency call')}
                        style={styles.emergencyButton}
                    />
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        paddingBottom: 100,
    },
    header: {
        padding: theme.spacing.l,
        paddingBottom: theme.spacing.m,
    },
    backButton: {
        padding: theme.spacing.xs,
        alignSelf: 'flex-start',
    },
    caseInfo: {
        marginHorizontal: theme.spacing.l,
        padding: theme.spacing.l,
        alignItems: 'center',
    },
    caseIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing.m,
    },
    caseTitle: {
        marginBottom: theme.spacing.s,
        textAlign: 'center',
    },
    caseDescription: {
        textAlign: 'center',
        marginBottom: theme.spacing.m,
    },
    alertBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.m,
        paddingVertical: theme.spacing.s,
        borderRadius: theme.borderRadius.m,
    },
    alertText: {
        marginLeft: theme.spacing.xs,
        fontWeight: '600',
    },
    section: {
        marginTop: theme.spacing.l,
        paddingHorizontal: theme.spacing.l,
    },
    sectionTitle: {
        marginBottom: theme.spacing.xs,
    },
    sectionSubtitle: {
        marginBottom: theme.spacing.m,
    },
    guideTabs: {
        marginTop: theme.spacing.m,
    },
    guideTabsContent: {
        paddingHorizontal: theme.spacing.l,
    },
    guideTab: {
        paddingHorizontal: theme.spacing.m,
        paddingVertical: theme.spacing.s,
        marginRight: theme.spacing.s,
        minWidth: 100,
        alignItems: 'center',
    },
    guideTabActive: {
        backgroundColor: 'rgba(255, 107, 107, 0.2)',
    },
    guideTabText: {
        fontSize: 14,
    },
    guideContent: {
        marginHorizontal: theme.spacing.l,
        marginTop: theme.spacing.m,
        padding: theme.spacing.m,
    },
    guideText: {
        lineHeight: 24,
    },
    checklistItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing.m,
        marginBottom: theme.spacing.s,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: theme.colors.textSecondary,
        marginRight: theme.spacing.m,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxChecked: {
        borderColor: theme.colors.success,
        backgroundColor: theme.colors.success + '33',
    },
    checklistText: {
        flex: 1,
        lineHeight: 20,
    },
    checklistTextCompleted: {
        textDecorationLine: 'line-through',
        color: theme.colors.textSecondary,
    },
    emergencySection: {
        padding: theme.spacing.l,
        marginTop: theme.spacing.l,
    },
    emergencyButton: {
        backgroundColor: theme.colors.error,
    },
});
