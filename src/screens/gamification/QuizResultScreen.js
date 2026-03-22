import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { AppText } from '../../components/AppText';
import { AppButton } from '../../components/AppButton';
import { theme } from '../../utils/theme';
import { useLanguage } from '../../context/LanguageContext';

export default function QuizResultScreen({ route, navigation }) {
    const { t } = useLanguage();
    const { score, total } = route.params;

    return (
        <ScreenWrapper>
            <TouchableOpacity
                style={styles.homeButton}
                onPress={() => navigation.navigate('Home')}
            >
                <Ionicons name="home" size={24} color={theme.colors.text} />
            </TouchableOpacity>

            <View style={styles.container}>
                <AppText variant="h1" centered style={{ marginBottom: 20 }}>
                    {t('quizComplete')}
                </AppText>

                <AppText variant="h2" centered color={theme.colors.secondary}>
                    {t('score')}: {score} / {total}
                </AppText>

                <View style={styles.footer}>
                    <AppButton
                        title={t('backToQuizzes')}
                        onPress={() => navigation.navigate('Quizzes')}
                    />
                    <AppButton
                        title={t('goToHome')}
                        variant="outline"
                        onPress={() => navigation.navigate('Home')}
                        style={{ marginTop: theme.spacing.m }}
                    />
                </View>
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    homeButton: {
        position: 'absolute',
        top: theme.spacing.l,
        right: theme.spacing.l,
        zIndex: 10,
        padding: theme.spacing.s,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.l,
    },
    footer: {
        marginTop: 50,
        width: '100%',
    },
});
