import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import HomeScreen from '../screens/HomeScreen';
import GuidesScreen from '../screens/GuidesScreen';
import MapScreen from '../screens/MapScreen';
import ProfileScreen from '../screens/ProfileScreen';
import QuizListScreen from '../screens/gamification/QuizListScreen';
import { theme } from '../utils/theme';
import { useLanguage } from '../context/LanguageContext';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
    const { t } = useLanguage();
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    elevation: 2,
                    borderTopWidth: 1,
                    borderTopColor: theme.colors.border,
                    backgroundColor: Platform.OS === 'ios' ? 'transparent' : 'rgba(255, 255, 255, 0.95)',
                    height: 80,
                },
                tabBarBackground: () => (
                    Platform.OS === 'ios' && (
                        <BlurView tint="light" intensity={80} style={{ flex: 1 }} />
                    )
                ),
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.textSecondary,
                tabBarShowLabel: true,
                tabBarLabelStyle: {
                    fontSize: 13,
                    fontWeight: '500',
                    marginBottom: 5,
                },
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    tabBarLabel: t('tabHome'),
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Guides"
                component={GuidesScreen}
                options={{
                    tabBarLabel: t('tabGuides'),
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="book" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Map"
                component={MapScreen}
                options={{
                    tabBarLabel: t('tabReport'),
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="map" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Quizzes"
                component={QuizListScreen}
                options={{
                    tabBarLabel: t('tabQuizzes'),
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="school" size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarLabel: t('tabProfile'),
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person" size={size} color={color} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}
