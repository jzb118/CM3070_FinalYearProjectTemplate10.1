import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { theme } from '../utils/theme';

export const GlassView = ({
    children,
    style,
    intensity = 20,
}) => {
    // Android doesn't support BlurView as seamlessly as iOS, so we fallback
    if (Platform.OS === 'android') {
        return (
            <View style={[styles.androidContainer, style]}>
                {children}
            </View>
        );
    }

    return (
        <BlurView intensity={intensity} tint="light" style={[styles.container, style]}>
            {children}
        </BlurView>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.l,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    androidContainer: {
        backgroundColor: theme.colors.card,
        borderRadius: theme.borderRadius.l,
        borderWidth: 1,
        borderColor: theme.colors.border,
        elevation: 2,
    },
});
