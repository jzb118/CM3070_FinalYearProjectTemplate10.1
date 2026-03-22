import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { AppText } from '../../components/AppText';
import { GlassView } from '../../components/GlassView';
import { getDB } from '../../services/DatabaseService';
import { theme } from '../../utils/theme';
import { useLanguage } from '../../context/LanguageContext';

export default function QuizListScreen({ navigation }) {
    const { t, tc } = useLanguage();
    const [hazards, setHazards] = useState([]);

    useEffect(() => {
        const fetchHazards = async () => {
            const db = getDB();
            const result = await db.getAllAsync('SELECT * FROM hazards');
            setHazards(result);
        };
        fetchHazards();
    }, []);

    const renderItem = ({ item }) => (
        <TouchableOpacity onPress={() => navigation.navigate('Quiz', { hazardId: item.id, hazardName: item.name })}>
            <GlassView style={styles.card}>
                <View style={styles.iconContainer}>
                    <Ionicons name={item.icon} size={32} color={theme.colors.primary} />
                </View>
                <View style={styles.textContainer}>
                    <AppText variant="h3">{tc('hazards', item.id, 'name') || item.name}</AppText>
                    <AppText variant="caption" color={theme.colors.textSecondary}>{tc('hazards', item.id, 'description') || item.description}</AppText>
                </View>
                <Ionicons name="chevron-forward" size={24} color={theme.colors.textSecondary} />
            </GlassView>
        </TouchableOpacity>
    );

    return (
        <ScreenWrapper>
            <View style={styles.header}>
                <AppText variant="h1">{t('quizzes')}</AppText>
                <AppText variant="body" color={theme.colors.textSecondary}>{t('quizzesSubtitle')}</AppText>
            </View>
            <FlatList
                data={hazards}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
            />
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    header: {
        padding: theme.spacing.l,
    },
    list: {
        padding: theme.spacing.l,
        paddingTop: 0,
        paddingBottom: 100, // Extra padding for tab bar
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing.m,
        marginBottom: theme.spacing.m,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: theme.colors.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.m,
    },
    textContainer: {
        flex: 1,
    },
});
