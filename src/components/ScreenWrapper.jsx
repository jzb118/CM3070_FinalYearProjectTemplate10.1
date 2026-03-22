import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../utils/theme';

export const ScreenWrapper = ({ children, style }) => {
    return (
        <LinearGradient
            colors={[theme.colors.background, '#FFF3C7']}
            style={styles.container}
        >
            <SafeAreaView style={[styles.safeArea, style]}>
                {children}
            </SafeAreaView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
});
