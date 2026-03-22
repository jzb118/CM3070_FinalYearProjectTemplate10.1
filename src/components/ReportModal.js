import React, { useState, useEffect } from 'react';
import { Modal, View, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { theme } from '../utils/theme';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { ImageService } from '../services/ImageService';
import { getDB } from '../services/DatabaseService';
import { useLanguage } from '../context/LanguageContext';

export function ReportModal({ visible, onClose, onSubmit, location }) {
    const { t, tc } = useLanguage();
    const [type, setType] = useState('');
    const [description, setDescription] = useState('');
    const [photoUri, setPhotoUri] = useState(null);
    const [hazards, setHazards] = useState([]);
    const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

    // Load hazards from database
    useEffect(() => {
        loadHazards();
        checkDisclaimerStatus();
    }, []);

    const loadHazards = async () => {
        const db = getDB();
        const result = await db.getAllAsync('SELECT * FROM hazards ORDER BY name');
        setHazards([...result, { id: 'other', name: 'Other', icon: 'help-circle' }]);
        if (result.length > 0 && !type) {
            setType(result[0].id);
        }
    };

    const checkDisclaimerStatus = async () => {
        // In a real app, you'd store this in AsyncStorage
        // For now, we'll just set it to true after first view
        setDisclaimerAccepted(true);
    };

    const handlePhotoSelect = async () => {
        Alert.alert(
            t('addPhoto'),
            t('chooseOption'),
            [
                {
                    text: t('takePhoto'),
                    onPress: async () => {
                        const uri = await ImageService.takePhoto();
                        if (uri) setPhotoUri(uri);
                    }
                },
                {
                    text: t('chooseFromGallery'),
                    onPress: async () => {
                        const uri = await ImageService.pickImage();
                        if (uri) setPhotoUri(uri);
                    }
                },
                {
                    text: t('cancel'),
                    style: 'cancel'
                }
            ]
        );
    };

    const handleRemovePhoto = () => {
        setPhotoUri(null);
    };

    const handleSubmit = () => {
        if (!type) {
            Alert.alert(t('required'), t('selectHazardType'));
            return;
        }
        if (!description.trim() || description.trim().length < 10) {
            Alert.alert(t('required'), t('addDescription'));
            return;
        }

        onSubmit({ type, description: description.trim(), photoUri });

        // Reset form
        setDescription('');
        setPhotoUri(null);
        setType(hazards[0]?.id || '');
    };

    const getHazardIcon = (iconName) => {
        // Map database icon names to Ionicons
        const iconMap = {
            'water': 'water',
            'flame': 'flame',
            'medkit': 'medkit',
            'earth': 'earth',
            'sunny': 'sunny',
            'bug': 'bug',
            'alert-circle': 'alert-circle',
            'walk': 'walk',
            'warning': 'warning',
            'help-circle': 'help-circle'
        };
        return iconMap[iconName] || 'alert-circle';
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <View style={styles.header}>
                        <AppText variant="h2" style={styles.title}>{t('reportDisaster')}</AppText>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color="#FFF" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Disclaimer */}
                        {!disclaimerAccepted && (
                            <View style={styles.disclaimer}>
                                <Ionicons name="information-circle" size={20} color="#3498DB" />
                                <AppText variant="caption" style={styles.disclaimerText}>
                                    {t('disclaimerText')}
                                </AppText>
                            </View>
                        )}

                        <AppText variant="body" style={styles.label}>{t('selectDisasterType')}</AppText>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.hazardScroll}
                        >
                            {hazards.map((h) => (
                                <TouchableOpacity
                                    key={h.id}
                                    style={[styles.hazardCard, type === h.id && styles.hazardCardSelected]}
                                    onPress={() => setType(h.id)}
                                >
                                    <Ionicons
                                        name={getHazardIcon(h.icon)}
                                        size={28}
                                        color={type === h.id ? '#FFF' : theme.colors.text}
                                    />
                                    <AppText
                                        variant="caption"
                                        style={[styles.hazardText, type === h.id && styles.hazardTextSelected]}
                                    >
                                        {tc('hazards', h.id, 'name') || h.name}
                                    </AppText>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <AppText variant="body" style={styles.label}>{t('description')}</AppText>
                        <TextInput
                            style={styles.input}
                            placeholder={t('descriptionPlaceholder')}
                            placeholderTextColor={theme.colors.text}
                            multiline
                            numberOfLines={4}
                            value={description}
                            onChangeText={setDescription}
                        />

                        <AppText variant="body" style={styles.label}>{t('photoOptional')}</AppText>
                        {photoUri ? (
                            <View style={styles.photoContainer}>
                                <Image source={{ uri: photoUri }} style={styles.photoPreview} />
                                <TouchableOpacity
                                    style={styles.removePhotoButton}
                                    onPress={handleRemovePhoto}
                                >
                                    <Ionicons name="close-circle" size={24} color="#E74C3C" />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity style={styles.photoButton} onPress={handlePhotoSelect}>
                                <Ionicons name="camera" size={24} color="#3498DB" />
                                <AppText style={styles.photoButtonText}>{t('addPhoto')}</AppText>
                            </TouchableOpacity>
                        )}

                        {location && (
                            <View style={styles.locationContainer}>
                                <Ionicons name="location" size={16} color="#27AE60" />
                                <AppText variant="caption" style={styles.locationText}>
                                    {t('location')}: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                                </AppText>
                            </View>
                        )}

                        <View style={styles.buttonRow}>
                            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
                                <AppText style={styles.buttonText}>{t('cancel')}</AppText>
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.button, styles.submitButton]} onPress={handleSubmit}>
                                <AppText style={styles.buttonText}>{t('submitReport')}</AppText>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        height: '85%',
        backgroundColor: theme.colors.card,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        color: theme.colors.text,
    },
    closeButton: {
        padding: 5,
    },
    disclaimer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(52, 152, 219, 0.1)',
        padding: 12,
        borderRadius: 8,
        marginBottom: 20,
        borderLeftWidth: 3,
        borderLeftColor: '#3498DB',
    },
    disclaimerText: {
        color: '#3498DB',
        flex: 1,
        marginLeft: 8,
        lineHeight: 18,
    },
    label: {
        marginBottom: 10,
        marginTop: 10,
        color: theme.colors.textSecondary,
        fontWeight: '600',
    },
    hazardScroll: {
        marginBottom: 10,
    },
    hazardCard: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: theme.colors.background,
        marginRight: 10,
        borderWidth: 2,
        borderColor: theme.colors.border,
        minWidth: 80,
    },
    hazardCardSelected: {
        backgroundColor: '#E74C3C',
        borderColor: '#E74C3C',
    },
    hazardText: {
        color: theme.colors.textSecondary,
        marginTop: 6,
        fontSize: 12,
        textAlign: 'center',
    },
    hazardTextSelected: {
        color: '#FFF',
        fontWeight: 'bold',
    },
    input: {
        backgroundColor: theme.colors.background,
        borderRadius: 10,
        padding: 15,
        color: theme.colors.text,
        marginBottom: 10,
        textAlignVertical: 'top',
        minHeight: 100,
    },
    photoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.background,
        borderRadius: 10,
        padding: 15,
        borderWidth: 1,
        borderColor: '#3498DB',
        borderStyle: 'dashed',
    },
    photoButtonText: {
        color: '#3498DB',
        marginLeft: 8,
        fontWeight: '600',
    },
    photoContainer: {
        position: 'relative',
        marginBottom: 10,
    },
    photoPreview: {
        width: '100%',
        height: 200,
        borderRadius: 10,
        backgroundColor: theme.colors.background,
    },
    removePhotoButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 12,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
        padding: 10,
        backgroundColor: 'rgba(39, 174, 96, 0.1)',
        borderRadius: 8,
    },
    locationText: {
        color: '#27AE60',
        marginLeft: 6,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    button: {
        borderRadius: 10,
        padding: 15,
        width: '48%',
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: theme.colors.textSecondary,
    },
    submitButton: {
        backgroundColor: '#E74C3C',
    },
    buttonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
