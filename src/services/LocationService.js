import * as Location from 'expo-location';
import { Alert } from 'react-native';

export const LocationService = {
    // Request permissions and get current location
    getCurrentLocation: async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Allow location access to report disasters and see nearby alerts.');
                return null;
            }

            // Try to get last known position first (faster)
            let location = await Location.getLastKnownPositionAsync({});

            // If no last known, or if we want fresh, try current position
            if (!location) {
                location = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                });
            }

            return location.coords; // { latitude, longitude }
        } catch (error) {
            console.log('Error getting location:', error);
            Alert.alert(
                'Location Error',
                'Could not fetch location. Please ensure GPS is on and permissions are granted.'
            );
            // Fallback for simulation/testing if real location fails
            return { latitude: 1.3521, longitude: 103.8198 }; // Default to Singapore/Center
        }
    },

    // Calculate distance in km between two points (Haversine formula)
    calculateDistance: (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Radius of the earth in km
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return d;
    }
};

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}
