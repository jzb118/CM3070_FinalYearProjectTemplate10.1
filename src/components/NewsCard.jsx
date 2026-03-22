import React from 'react';
import { StyleSheet, View, TouchableOpacity, Image } from 'react-native';
import { AppText } from './AppText';
import { GlassView } from './GlassView';
import { theme } from '../utils/theme';

export const NewsCard = ({ title, description, imageUrl, timestamp, source, onPress }) => {
    const getTimeAgo = (dateString) => {
        const now = new Date();
        const past = new Date(dateString);
        const diffInHours = Math.floor((now - past) / (1000 * 60 * 60));

        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${diffInHours}h ago`;
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays}d ago`;
        return `${Math.floor(diffInDays / 7)}w ago`;
    };

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
            <GlassView style={styles.card}>
                {imageUrl && (
                    <Image
                        source={{ uri: imageUrl }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                )}
                <View style={styles.content}>
                    <AppText variant="h3" style={styles.title} numberOfLines={2}>
                        {title}
                    </AppText>
                    <AppText variant="caption" color={theme.colors.textSecondary} numberOfLines={2} style={styles.description}>
                        {description}
                    </AppText>
                    <View style={styles.footer}>
                        <AppText variant="caption" color={theme.colors.textSecondary} style={styles.source}>
                            {source}
                        </AppText>
                        <AppText variant="caption" color={theme.colors.textSecondary}>
                            {getTimeAgo(timestamp)}
                        </AppText>
                    </View>
                </View>
            </GlassView>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        marginBottom: theme.spacing.m,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: 150,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    content: {
        padding: theme.spacing.m,
    },
    title: {
        marginBottom: theme.spacing.xs,
        fontSize: 16,
    },
    description: {
        marginBottom: theme.spacing.s,
        lineHeight: 18,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    source: {
        flex: 1,
        marginRight: theme.spacing.s,
    },
});
