import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { GlassView } from './GlassView';
import { theme } from '../utils/theme';

export const LearningModuleCard = ({ icon, title, description, progress = 0, onPress }) => {
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
            <GlassView style={styles.card}>
                <View style={styles.iconContainer}>
                    <Ionicons name={icon} size={32} color={theme.colors.primary} />
                </View>
                <View style={styles.content}>
                    <AppText variant="h3" style={styles.title}>{title}</AppText>
                    <AppText variant="caption" color={theme.colors.textSecondary} numberOfLines={2}>
                        {description}
                    </AppText>
                    <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                            <View style={[styles.progressFill, { width: `${progress}%` }]} />
                        </View>
                        <AppText variant="caption" color={theme.colors.primary} style={styles.progressText}>
                            {progress}%
                        </AppText>
                    </View>
                </View>
            </GlassView>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        padding: theme.spacing.m,
        marginRight: theme.spacing.m,
        width: 280,
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: theme.colors.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.m,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        marginBottom: theme.spacing.xs,
        fontSize: 16,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: theme.spacing.s,
    },
    progressBar: {
        flex: 1,
        height: 6,
        backgroundColor: theme.colors.primaryLight,
        borderRadius: 3,
        overflow: 'hidden',
        marginRight: theme.spacing.s,
    },
    progressFill: {
        height: '100%',
        backgroundColor: theme.colors.primary,
        borderRadius: 3,
    },
    progressText: {
        fontSize: 12,
        fontWeight: '600',
        minWidth: 35,
    },
});
