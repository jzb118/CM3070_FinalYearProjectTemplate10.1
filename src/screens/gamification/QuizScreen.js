import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { AppText } from '../../components/AppText';
import { AppButton } from '../../components/AppButton';
import { GamificationService } from '../../services/GamificationService';
import { theme } from '../../utils/theme';
import { useLanguage } from '../../context/LanguageContext';

export default function QuizScreen({ route, navigation }) {
    const { t, tc } = useLanguage();
    const { hazardId, hazardName } = route.params;
    const [quizzes, setQuizzes] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadQuizzes = async () => {
            const data = await GamificationService.getQuizzesByHazard(hazardId);
            setQuizzes(data);
            setLoading(false);
        };
        loadQuizzes();
    }, [hazardId]);

    const handleAnswer = async (optionIndex) => {
        const currentQuiz = quizzes[currentIndex];
        const isCorrect = optionIndex === currentQuiz.correct_answer;

        if (isCorrect) {
            setScore(score + 1);
            Alert.alert(t('correct'), t('greatJob'));
        } else {
            Alert.alert(t('incorrect'), t('betterLuck'));
        }

        // Submit result for this question
        await GamificationService.submitQuizResult(currentQuiz.id, isCorrect ? 100 : 0);

        const nextIndex = currentIndex + 1;
        if (nextIndex < quizzes.length) {
            setCurrentIndex(nextIndex);
        } else {
            // Quiz Finished
            navigation.replace('QuizResult', { score: isCorrect ? score + 1 : score, total: quizzes.length });
        }
    };

    if (loading) {
        return (
            <ScreenWrapper>
                <View style={styles.center}>
                    <AppText>{t('loading')}</AppText>
                </View>
            </ScreenWrapper>
        );
    }

    if (quizzes.length === 0) {
        return (
            <ScreenWrapper>
                <View style={styles.center}>
                    <AppText variant="h2">{t('noQuizzesFound')}</AppText>
                    <AppButton title={t('goBack')} onPress={() => navigation.goBack()} style={{ marginTop: 20 }} />
                </View>
            </ScreenWrapper>
        );
    }

    const currentQuiz = quizzes[currentIndex];

    return (
        <ScreenWrapper>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
            </TouchableOpacity>

            <View style={styles.container}>
                <AppText variant="caption" centered style={{ marginBottom: 10 }}>
                    {tc('hazards', hazardId, 'name') || hazardName} {t('quiz')} • {currentIndex + 1}/{quizzes.length}
                </AppText>

                <AppText variant="h2" centered style={styles.question}>
                    {tc('quizzes', currentQuiz.id, 'question') || currentQuiz.question}
                </AppText>

                <View style={styles.options}>
                    {currentQuiz.options.map((option, index) => {
                        const translatedOptions = tc('quizzes', currentQuiz.id, 'options');
                        const displayOption = (translatedOptions && translatedOptions[index]) || option;
                        return (
                            <AppButton
                                key={index}
                                title={displayOption}
                                variant="outline"
                                onPress={() => handleAnswer(index)}
                                style={styles.optionButton}
                            />
                        );
                    })}
                </View>
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    backButton: {
        position: 'absolute',
        top: theme.spacing.l,
        left: theme.spacing.l,
        zIndex: 10,
        padding: theme.spacing.s,
    },
    container: {
        flex: 1,
        padding: theme.spacing.l,
        justifyContent: 'center',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    question: {
        marginBottom: theme.spacing.xl,
    },
    options: {
        gap: theme.spacing.m,
    },
    optionButton: {
        marginBottom: theme.spacing.m,
    },
});
