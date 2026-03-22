import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { AppText } from '../../components/AppText';
import { GlassView } from '../../components/GlassView';
import { GuidesService } from '../../services/GuidesService';
import { theme } from '../../utils/theme';
import { useLanguage } from '../../context/LanguageContext';

export default function GuideListScreen({ route, navigation }) {
    const { t, tc } = useLanguage();
    const { hazardId, hazardName } = route.params;
    const [guides, setGuides] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGuides = async () => {
            const start = Date.now();
            try {
                const data = await GuidesService.getGuidesByHazard(hazardId);
                setGuides(data);
                console.log(`[PERF_DB] fetchGuides (GuideList): ${Date.now() - start}ms (Rows: ${data.length})`);
            } catch (error) {
                console.error('Error fetching guides:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchGuides();
    }, [hazardId]);

    const renderItem = ({ item }) => (
        <TouchableOpacity onPress={() => navigation.navigate('GuideDetail', { guideId: item.id, guideTitle: item.title })}>
            <GlassView style={styles.card}>
                <View style={styles.stepBadge}>
                    <AppText variant="caption" style={styles.stepText}>{item.step_order}</AppText>
                </View>
                <View style={styles.textContainer}>
                    <AppText variant="h3">{tc('guides', item.id, 'title') || item.title}</AppText>
                    <AppText variant="caption" color={theme.colors.textSecondary} numberOfLines={2}>
                        {tc('guides', item.id, 'content') || item.content}
                    </AppText>
                </View>
                <Ionicons name="chevron-forward" size={24} color={theme.colors.textSecondary} />
            </GlassView>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <ScreenWrapper>
                <View style={styles.center}>
                    <AppText>{t('loading')}</AppText>
                </View>
            </ScreenWrapper>
        );
    }

    if (guides.length === 0) {
        return (
            <ScreenWrapper>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>

                <View style={styles.center}>
                    <AppText variant="h2">{t('noGuidesFound')}</AppText>
                    <AppText variant="body" color={theme.colors.textSecondary} style={{ marginTop: 10 }}>
                        {t('guidesComing')}
                    </AppText>
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.homeButton}
                onPress={() => navigation.navigate('Home')}
            >
                <Ionicons name="home" size={24} color={theme.colors.text} />
            </TouchableOpacity>

            <View style={styles.header}>
                <AppText variant="h1">{t('guidesFor').replace('{name}', tc('hazards', hazardId, 'name') || hazardName)}</AppText>
                <AppText variant="body" color={theme.colors.textSecondary}>
                    {t('stepByStep')}
                </AppText>
            </View>

            <FlatList
                data={guides}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
            />
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
    header: {
        padding: theme.spacing.l,
    },
    list: {
        padding: theme.spacing.l,
        paddingTop: 0,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing.m,
        marginBottom: theme.spacing.m,
    },
    stepBadge: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.m,
    },
    stepText: {
        color: theme.colors.background,
        fontWeight: 'bold',
    },
    textContainer: {
        flex: 1,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.l,
    },
});
