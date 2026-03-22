import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { AppText } from '../components/AppText';
import { AppButton } from '../components/AppButton';
import { GlassView } from '../components/GlassView';
import { theme } from '../utils/theme';

export default function TestScreen() {
    return (
        <ScreenWrapper>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <AppText variant="h1" centered style={styles.title}>
                    Design System
                </AppText>

                <AppText variant="body" centered style={styles.subtitle}>
                    Verifying Glassmorphism & UI Components
                </AppText>

                <View style={styles.section}>
                    <AppText variant="h2" style={styles.sectionTitle}>Typography</AppText>
                    <AppText variant="h1">Heading 1</AppText>
                    <AppText variant="h2">Heading 2</AppText>
                    <AppText variant="h3">Heading 3</AppText>
                    <AppText variant="body">Body Text</AppText>
                    <AppText variant="caption">Caption Text</AppText>
                </View>

                <View style={styles.section}>
                    <AppText variant="h2" style={styles.sectionTitle}>Buttons</AppText>
                    <AppButton title="Primary Button" onPress={() => { }} style={styles.button} />
                    <AppButton title="Secondary Button" variant="secondary" onPress={() => { }} style={styles.button} />
                    <AppButton title="Outline Button" variant="outline" onPress={() => { }} style={styles.button} />
                    <AppButton title="Loading..." loading onPress={() => { }} style={styles.button} />
                </View>

                <View style={styles.section}>
                    <AppText variant="h2" style={styles.sectionTitle}>Glassmorphism</AppText>
                    <GlassView style={styles.glassCard}>
                        <AppText variant="h3">Glass Card</AppText>
                        <AppText variant="body" style={{ marginTop: 8 }}>
                            This is a glassmorphic container with a blur effect. It should look premium and modern.
                        </AppText>
                    </GlassView>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        padding: theme.spacing.l,
    },
    title: {
        marginBottom: theme.spacing.s,
        color: theme.colors.primary,
    },
    subtitle: {
        marginBottom: theme.spacing.xl,
        color: theme.colors.textSecondary,
    },
    section: {
        marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
        marginBottom: theme.spacing.m,
        color: theme.colors.secondary,
    },
    button: {
        marginBottom: theme.spacing.m,
    },
    glassCard: {
        padding: theme.spacing.l,
    },
});
