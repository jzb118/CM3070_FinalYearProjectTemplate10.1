import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { AppText } from '../components/AppText';
import { GlassView } from '../components/GlassView';
import { getDB } from '../services/DatabaseService';
import { theme } from '../utils/theme';
import { useLanguage } from '../context/LanguageContext';

export default function CasesScreen({ route, navigation }) {
    const { t } = useLanguage();
    const { filter } = route.params || {};
    const [cases, setCases] = useState([]);

    useEffect(() => {
        fetchCases();
    }, [filter]);

    const fetchCases = async () => {
        const start = Date.now();
        try {
            const db = getDB();
            let query = 'SELECT * FROM reports WHERE 1=1';
            const params = [];

            if (filter === 'nearby') {
                // Cases within last 24 hours
                const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
                query += ' AND timestamp > ?';
                params.push(yesterday.toISOString());
            } else if (filter === 'today') {
                // Cases from today
                const todayStart = new Date();
                todayStart.setHours(0, 0, 0, 0);
                query += ' AND timestamp >= ?';
                params.push(todayStart.toISOString());
            }

            query += ' ORDER BY timestamp DESC';

            const result = await db.getAllAsync(query, params);
            setCases(result);
            console.log(`[PERF_DB] fetchCases: ${Date.now() - start}ms (Rows: ${result.length})`);
        } catch (e) {
            console.error('Error fetching cases:', e);
        }
    };

    const calculateDistance = (lat, lon) => {
        // Mock distance calculation - in real app, use user's location
        // For now, return random distance between 0.5 and 5 km
        return (Math.random() * 4.5 + 0.5).toFixed(1);
    };

    const getTimeAgo = (dateString) => {
        const now = new Date();
        const past = new Date(dateString);
        const diffInMinutes = Math.floor((now - past) / (1000 * 60));

        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays}d ago`;
    };

    const getHazardIcon = (type) => {
        const iconMap = {
            flood: 'water',
            fire: 'flame',
            earthquake: 'earth',
            covid: 'medkit',
            dengue: 'bug',
            tsunami: 'water',
            warming: 'sunny',
            terror: 'alert-circle',
            robbery: 'walk',
            shooting: 'warning',
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

    const renderCase = ({ item }) => (
        <TouchableOpacity
            onPress={() => navigation.navigate('CaseDetail', { caseId: item.id, caseData: item })}
            activeOpacity={0.7}
        >
            <GlassView style={styles.caseCard}>
                <View style={styles.caseHeader}>
                    <View style={[styles.caseIcon, { backgroundColor: `${getHazardColor(item.type)}20` }]}>
                        <Ionicons name={getHazardIcon(item.type)} size={24} color={getHazardColor(item.type)} />
                    </View>
                    <View style={styles.caseHeaderText}>
                        <AppText variant="h3" style={styles.caseTitle}>
                            {item.type.charAt(0).toUpperCase() + item.type.slice(1)} {t('emergency')}
                        </AppText>
                        <View style={styles.caseMetaRow}>
                            <Ionicons name="location" size={14} color={theme.colors.textSecondary} />
                            <AppText variant="caption" color={theme.colors.textSecondary} style={styles.distance}>
                                {calculateDistance(item.latitude, item.longitude)} {t('kmAway')}
                            </AppText>
                            <AppText variant="caption" color={theme.colors.textSecondary}>
                                • {getTimeAgo(item.timestamp)}
                            </AppText>
                        </View>
                    </View>
                </View>
                <AppText variant="body" color={theme.colors.textSecondary} numberOfLines={2} style={styles.description}>
                    {item.description}
                </AppText>
                <View style={styles.caseFooter}>
                    {/* Status badge removed as column was deleted */}
                    <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                </View>
            </GlassView>
        </TouchableOpacity>
    );

    const title = filter === 'nearby' ? t('nearbyCases') : filter === 'today' ? t('casesToday') : t('allCases');

    return (
        <ScreenWrapper>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <View style={styles.headerText}>
                    <AppText variant="h1">{title}</AppText>
                    <AppText variant="caption" color={theme.colors.textSecondary}>
                        {cases.length} {cases.length === 1 ? t('case') : t('cases')}
                    </AppText>
                </View>
            </View>
            <FlatList
                data={cases}
                renderItem={renderCase}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="checkmark-circle" size={64} color={theme.colors.success} />
                        <AppText variant="h3" style={styles.emptyText}>{t('noActiveCases')}</AppText>
                        <AppText variant="body" color={theme.colors.textSecondary}>
                            {t('allClear')}
                        </AppText>
                    </View>
                }
            />
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing.l,
        paddingBottom: theme.spacing.m,
    },
    backButton: {
        marginRight: theme.spacing.m,
        padding: theme.spacing.xs,
    },
    headerText: {
        flex: 1,
    },
    list: {
        padding: theme.spacing.l,
        paddingTop: 0,
        paddingBottom: 100,
    },
    caseCard: {
        padding: theme.spacing.m,
        marginBottom: theme.spacing.m,
    },
    caseHeader: {
        flexDirection: 'row',
        marginBottom: theme.spacing.s,
    },
    caseIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.m,
    },
    caseHeaderText: {
        flex: 1,
    },
    caseTitle: {
        marginBottom: theme.spacing.xs,
        fontSize: 16,
    },
    caseMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    distance: {
        marginLeft: theme.spacing.xs,
        marginRight: theme.spacing.xs,
    },
    description: {
        marginBottom: theme.spacing.m,
        lineHeight: 20,
    },
    caseFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statusBadge: {
        paddingHorizontal: theme.spacing.s,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.borderRadius.s,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.spacing.xxl,
    },
    emptyText: {
        marginTop: theme.spacing.m,
        marginBottom: theme.spacing.xs,
    },
});
