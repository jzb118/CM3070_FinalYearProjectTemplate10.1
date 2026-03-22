import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { GlassView } from './GlassView';
import { theme } from '../utils/theme';

export const StatCard = ({ icon, value, label, color = theme.colors.primary, onPress }) => {
    const CardComponent = onPress ? TouchableOpacity : View;

    return (
        <CardComponent onPress={onPress} activeOpacity={0.7} style={{ flex: 1 }}>
            <GlassView style={styles.card}>
                <View style={styles.topRow}>
                    <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
                        <Ionicons name={icon} size={20} color={color} />
                    </View>
                    <AppText variant="h2" style={styles.value}>{value}</AppText>
                </View>
                <AppText variant="caption" color={theme.colors.textSecondary} style={styles.label}>
                    {label}
                </AppText>
            </GlassView>
        </CardComponent>
    );
};

const styles = StyleSheet.create({
    card: {
        padding: theme.spacing.m,
        minHeight: 80,
        justifyContent: 'space-between',
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.xs,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.s,
    },
    value: {
        flex: 1,
    },
    label: {
        fontSize: 11,
    },
});
