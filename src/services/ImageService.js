import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Alert } from 'react-native';

export const ImageService = {
    /**
     * Request camera and media library permissions
     */
    async requestPermissions() {
        const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
        const mediaPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();

        return {
            camera: cameraPermission.status === 'granted',
            media: mediaPermission.status === 'granted'
        };
    },

    /**
     * Pick an image from the gallery
     */
    async pickImage() {
        try {
            const permissions = await this.requestPermissions();

            if (!permissions.media) {
                Alert.alert(
                    'Permission Required',
                    'Please grant access to your photo library to attach images.'
                );
                return null;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.7, // Compress to 70% quality
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                return result.assets[0].uri;
            }

            return null;
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image');
            return null;
        }
    },

    /**
     * Take a photo with the camera
     */
    async takePhoto() {
        try {
            const permissions = await this.requestPermissions();

            if (!permissions.camera) {
                Alert.alert(
                    'Permission Required',
                    'Please grant camera access to take photos.'
                );
                return null;
            }

            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.7,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                return result.assets[0].uri;
            }

            return null;
        } catch (error) {
            console.error('Error taking photo:', error);
            Alert.alert('Error', 'Failed to take photo');
            return null;
        }
    },

    /**
     * Get file size in bytes
     */
    async getImageSize(uri) {
        try {
            const fileInfo = await FileSystem.getInfoAsync(uri);
            return fileInfo.size || 0;
        } catch (error) {
            console.error('Error getting image size:', error);
            return 0;
        }
    },

    /**
     * Delete an image file
     */
    async deleteImage(uri) {
        try {
            const fileInfo = await FileSystem.getInfoAsync(uri);
            if (fileInfo.exists) {
                await FileSystem.deleteAsync(uri);
            }
        } catch (error) {
            console.error('Error deleting image:', error);
        }
    },

    /**
     * Validate image size (max 5MB)
     */
    async validateImageSize(uri, maxSizeMB = 5) {
        const size = await this.getImageSize(uri);
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        return size <= maxSizeBytes;
    }
};
