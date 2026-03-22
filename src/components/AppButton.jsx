import React from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { AppText } from './AppText';
import { theme } from '../utils/theme';

export const AppButton = ({
    title,
    onPress,
    variant = 'primary',
    loading = false,
    disabled = false,
    style,
}) => {
    const handlePress = () => {
        if (disabled || loading) return;
        Haptics.selectionAsync();
        onPress();
    };

    const getColors = () => {
        if (disabled) return ['#555', '#555'];
        switch (variant) {
            case 'primary':
                return [theme.colors.primary, '#FF8E8E'];
            case 'secondary':
                return [theme.colors.secondary, '#6EE7E0'];
            case 'outline':
                return ['transparent', 'transparent'];
            default:
                return [theme.colors.primary, '#FF8E8E'];
        }
    };

    const content = (
        <>
            {loading ? (
                <ActivityIndicator color="white" />
            ) : (
                <AppText
                    variant="h3"
                    style={{
                        color: variant === 'outline' ? theme.colors.primary : 'white',
                        fontWeight: 'bold',
                    }}
                >
                    {title}
                </AppText>
            )}
        </>
    );

    if (variant === 'outline') {
        return (
            <TouchableOpacity
                onPress={handlePress}
                disabled={disabled || loading}
                style={[
                    styles.button,
                    {
                        borderWidth: 2,
                        borderColor: disabled ? '#555' : theme.colors.primary,
                        backgroundColor: 'transparent',
                    },
                    style,
                ]}
            >
                {content}
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            onPress={handlePress}
            disabled={disabled || loading}
            activeOpacity={0.8}
            style={[styles.shadow, style]}
        >
            <LinearGradient
                colors={getColors()}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.button}
            >
                {content}
            </LinearGradient>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        height: 56,
        borderRadius: theme.borderRadius.l,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.l,
    },
    shadow: {
        shadowColor: theme.colors.primary,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
});
