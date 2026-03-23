import React, { useState, useCallback } from 'react';
import { StyleSheet, View, ScrollView, FlatList, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { AppText } from '../components/AppText';
import { StatCard } from '../components/StatCard';
import { LearningModuleCard } from '../components/LearningModuleCard';
import { NewsCard } from '../components/NewsCard';
import { getDB } from '../services/DatabaseService';
import { theme } from '../utils/theme';
import { useLanguage } from '../context/LanguageContext';

export default function HomeScreen({ navigation }) {
    const { t, tc } = useLanguage();
    const [stats, setStats] = useState({
        nearbyCases: 0,
        totalCasesToday: 0,
        registeredUsers: 0,
        preparedness: 0,
    });
    const [learningModules, setLearningModules] = useState([]);
    const [news, setNews] = useState([]);

    useFocusEffect(
        useCallback(() => {
            fetchDashboardData();
        }, [])
    );

    const fetchDashboardData = async () => {
        try {
            const db = getDB();

            // Fetch nearby cases (within last 24 hours)
            const now = new Date();
            const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            const nearbyCasesResult = await db.getFirstAsync(
                'SELECT count(*) as count FROM reports WHERE timestamp > ?',
                [yesterday.toISOString()]
            );

            // Fetch total cases today
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const totalCasesResult = await db.getFirstAsync(
                'SELECT count(*) as count FROM reports WHERE timestamp >= ?',
                [todayStart.toISOString()]
            );

            // Fetch registered users count
            const usersResult = await db.getFirstAsync('SELECT count(*) as count FROM users');

            // Calculate preparedness percentage
            const totalQuizzesResult = await db.getFirstAsync('SELECT count(*) as count FROM quizzes');
            const completedQuizzesResult = await db.getFirstAsync(
                `SELECT count(*) as count FROM user_progress up WHERE score > 0 AND completed_at = (SELECT MAX(completed_at) FROM user_progress WHERE quiz_id = up.quiz_id)`
            );
            const preparedness = totalQuizzesResult.count > 0
                ? Math.round((completedQuizzesResult.count / totalQuizzesResult.count) * 100)
                : 0;

            setStats({
                nearbyCases: nearbyCasesResult.count,
                totalCasesToday: totalCasesResult.count,
                registeredUsers: usersResult.count,
                preparedness,
            });

            // Fetch learning modules (hazards with progress)
            const hazards = await db.getAllAsync('SELECT * FROM hazards');
            const modulesWithProgress = await Promise.all(
                hazards.map(async (hazard) => {
                    const quizzesForHazard = await db.getFirstAsync(
                        'SELECT count(*) as count FROM quizzes WHERE hazard_id = ?',
                        [hazard.id]
                    );
                    const completedForHazard = await db.getFirstAsync(
                        `SELECT count(*) as count FROM user_progress up WHERE score > 0 AND quiz_id IN (SELECT id FROM quizzes WHERE hazard_id = ?) AND completed_at = (SELECT MAX(completed_at) FROM user_progress WHERE quiz_id = up.quiz_id)`,
                        [hazard.id]
                    );
                    const progress = quizzesForHazard.count > 0
                        ? Math.round((completedForHazard.count / quizzesForHazard.count) * 100)
                        : 0;

                    return {
                        ...hazard,
                        progress,
                    };
                })
            );
            setLearningModules(modulesWithProgress);

            // Fetch latest news from Guardian API with fallback
            try {
                const response = await fetch('https://content.guardianapis.com/search?q=disaster%20OR%20climate&api-key=test&show-fields=thumbnail,trailText');
                const data = await response.json();

                if (data.response && data.response.results && data.response.results.length > 0) {
                    const mappedNews = data.response.results.slice(0, 5).map((item) => ({
                        id: item.id,
                        title: item.webTitle,
                        description: item.fields?.trailText?.replace(/<[^>]*>?/gm, '') || 'Read more about this incident.',
                        image_url: item.fields?.thumbnail || null,
                        published_at: item.webPublicationDate,
                        source: 'The Guardian',
                        url: item.webUrl
                    }));
                    setNews(mappedNews);
                } else {
                    throw new Error('No live news found, using local data');
                }
            } catch (newsError) {
                console.log('Falling back to local SQLite news:', newsError.message);
                const newsResult = await db.getAllAsync(
                    'SELECT * FROM news ORDER BY published_at DESC LIMIT 5'
                );
                setNews(newsResult);
            }
        } catch (e) {
            console.error('Error fetching dashboard data:', e);
        }
    };

    const renderLearningModule = ({ item }) => {
        const translatedName = tc('hazards', item.id, 'name') || item.name;
        const translatedDesc = tc('hazards', item.id, 'description') || item.description;
        return (
            <LearningModuleCard
                icon={item.icon}
                title={translatedName}
                description={translatedDesc}
                progress={item.progress}
                onPress={() => navigation.navigate('Quiz', { hazardId: item.id, hazardName: translatedName })}
            />
        );
    };

    return (
        <ScreenWrapper>
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <AppText variant="h1">{t('dashboard')}</AppText>
                    <AppText variant="body" color={theme.colors.textSecondary}>
                        {t('stayPrepared')}
                    </AppText>
                </View>

                {/* Statistics Grid */}
                <View style={styles.statsGrid}>
                    <View style={styles.statsRow}>
                        <StatCard
                            icon="location"
                            value={stats.nearbyCases}
                            label={t('nearbyCases')}
                            color={theme.colors.error}
                            onPress={() => navigation.navigate('Cases', { filter: 'nearby' })}
                        />
                        <View style={styles.statsSpacer} />
                        <StatCard
                            icon="flame"
                            value={stats.totalCasesToday}
                            label={t('casesToday')}
                            color={theme.colors.warning}
                            onPress={() => navigation.navigate('Cases', { filter: 'today' })}
                        />
                    </View>
                    <View style={styles.statsRow}>
                        <StatCard
                            icon="shield-checkmark"
                            value={`${stats.preparedness}%`}
                            label={t('yourPreparedness')}
                            color={theme.colors.success}
                            style={{ flex: 1 }}
                            onPress={() => navigation.navigate('Profile')}
                        />
                    </View>
                </View>

                {/* Continue Learning Section */}
                <View style={styles.section}>
                    <AppText variant="h2" style={styles.sectionTitle}>
                        {t('continueLearning')}
                    </AppText>
                    <FlatList
                        data={learningModules}
                        renderItem={renderLearningModule}
                        keyExtractor={(item) => item.id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.learningList}
                    />
                </View>

                {/* Latest News Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <AppText variant="h2" style={styles.sectionTitle}>
                            {t('latestNews')}
                        </AppText>
                    </View>
                    <View style={styles.newsContainer}>
                        {news.slice(0, 3).map((item) => (
                            <NewsCard
                                key={item.id}
                                title={item.title}
                                description={item.description}
                                imageUrl={item.image_url}
                                timestamp={item.published_at}
                                source={item.source}
                                onPress={() => {
                                    if (item.url) {
                                        Linking.openURL(item.url).catch(err => console.error("Couldn't open URL:", err));
                                    } else {
                                        console.log('No URL for this news item:', item.title);
                                        // Fallback URL for older dummy data
                                        Linking.openURL('https://www.bbc.com/news/science-environment-56837908').catch(err => console.error("Couldn't open URL:", err));
                                    }
                                }}
                            />
                        ))}
                        {news.length > 3 && (
                            <TouchableOpacity
                                style={styles.viewMoreButton}
                                onPress={() => {
                                    //Navigate to all news
                                    console.log('View all news');
                                }}
                                activeOpacity={0.7}
                            >
                                <AppText variant="body" color={theme.colors.primary} style={styles.viewMoreText}>
                                    {t('viewMoreNews')}
                                </AppText>
                                <Ionicons name="chevron-forward" size={20} color={theme.colors.primary} />
                            </TouchableOpacity>
                        )}
                    </View>
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
        paddingBottom: 100, // Extra padding for tab bar
    },
    header: {
        padding: theme.spacing.l,
        paddingBottom: theme.spacing.m,
    },
    statsGrid: {
        paddingHorizontal: theme.spacing.l,
    },
    statsRow: {
        flexDirection: 'row',
        marginBottom: theme.spacing.m,
    },
    statsSpacer: {
        width: theme.spacing.m,
    },
    section: {
        marginTop: theme.spacing.l,
    },
    sectionTitle: {
        paddingHorizontal: theme.spacing.l,
        marginBottom: theme.spacing.m,
    },
    learningList: {
        paddingLeft: theme.spacing.l,
    },
    sectionHeader: {
        paddingHorizontal: theme.spacing.l,
    },
    newsContainer: {
        paddingHorizontal: theme.spacing.l,
    },
    viewMoreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.spacing.m,
        marginTop: theme.spacing.s,
    },
    viewMoreText: {
        marginRight: theme.spacing.xs,
        fontWeight: '600',
    },
});
