import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { theme } from '../utils/theme';
import { AppText } from './AppText';
import { useLanguage } from '../context/LanguageContext';

const { width } = Dimensions.get('window');

export function ReportList({ reports, onReportPress }) {
    const { tc } = useLanguage();

    if (!reports || reports.length === 0) {
        return null;
    }

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => onReportPress(item)}
            activeOpacity={0.8}
        >
            <View style={styles.header}>
                <AppText style={styles.type}>{tc('hazards', item.type, 'name') || item.type}</AppText>
                <AppText style={styles.time}>{new Date(item.timestamp).toLocaleTimeString()}</AppText>
            </View>
            <AppText style={styles.description} numberOfLines={2}>
                {item.description}
            </AppText>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={reports}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                snapToInterval={width * 0.7 + 20} // width + margin
                decelerationRate="fast"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 90,
        left: 0,
        right: 0,
        height: 140, // Height of the list area
    },
    listContent: {
        paddingHorizontal: 20,
    },
    card: {
        width: width * 0.7,
        backgroundColor: theme.colors.card,
        borderRadius: 15,
        padding: 15,
        marginRight: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
        borderLeftWidth: 5,
        borderLeftColor: '#E74C3C',
        justifyContent: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    type: {
        color: '#E74C3C',
        fontWeight: 'bold',
        fontSize: 16,
    },
    time: {
        color: '#888',
        fontSize: 12,
    },
    description: {
        color: theme.colors.text,
        fontSize: 14,
    },
});
