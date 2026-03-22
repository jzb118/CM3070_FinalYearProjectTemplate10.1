import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';
import QuizScreen from '../screens/gamification/QuizScreen';
import QuizResultScreen from '../screens/gamification/QuizResultScreen';
import GuideListScreen from '../screens/guides/GuideListScreen';
import GuideDetailScreen from '../screens/guides/GuideDetailScreen';
import CasesScreen from '../screens/CasesScreen';
import CaseDetailScreen from '../screens/CaseDetailScreen';
import { theme } from '../utils/theme';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    const navigationTheme = {
        ...DarkTheme,
        colors: {
            ...DarkTheme.colors,
            primary: theme.colors.primary,
            background: theme.colors.background,
            card: theme.colors.surface,
            text: theme.colors.text,
            border: 'transparent',
            notification: theme.colors.primary,
        },
    };

    return (
        <NavigationContainer theme={navigationTheme}>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Main" component={TabNavigator} />
                <Stack.Screen name="Cases" component={CasesScreen} />
                <Stack.Screen name="CaseDetail" component={CaseDetailScreen} />
                <Stack.Screen name="Quiz" component={QuizScreen} />
                <Stack.Screen name="QuizResult" component={QuizResultScreen} />
                <Stack.Screen name="GuideList" component={GuideListScreen} />
                <Stack.Screen name="GuideDetail" component={GuideDetailScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
