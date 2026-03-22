import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Dimensions, TouchableOpacity, Alert, Platform } from 'react-native';
import { theme } from '../utils/theme';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { AppText } from '../components/AppText';
import { ReportModal } from '../components/ReportModal';
import { ReportList } from '../components/ReportList';
import { LocationService } from '../services/LocationService';
import { ReportService } from '../services/ReportService';
import { SyncService } from '../services/SyncService';
import { StorageService } from '../services/StorageService';
import * as Notifications from 'expo-notifications';
import { testFirebaseConnection, testReportWrite } from '../config/firebaseTest';
import { useLanguage } from '../context/LanguageContext';

const { width, height } = Dimensions.get('window');

// Configure notifications locally
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

export default function MapScreen() {
    const { t, tc } = useLanguage();
    const webViewRef = useRef(null);
    const [userLocation, setUserLocation] = useState(null);
    const [reports, setReports] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [syncStatus, setSyncStatus] = useState({ pending: 0, synced: 0, failed: 0 });
    const [isSyncing, setIsSyncing] = useState(false);
    const [mapInitialized, setMapInitialized] = useState(false);

    useEffect(() => {
        // Test Firebase connection
        testFirebaseConnection().then(success => {
            if (success) {
                console.log('Firebase is ready!');
                testReportWrite();
            }
        });

        // Request permissions immediately
        (async () => {
            const { status } = await Notifications.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(t('permissionNeeded'), t('notifPermissionMsg'));
            }
        })();

        setupLocation();
        loadReports();
        loadSyncStatus();

        // Setup auto-sync
        const unsubscribe = SyncService.setupAutoSync(handleSyncComplete);
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, []);

    // Helper to load reports
    const loadReports = async () => {
        const data = await ReportService.getAllReports();
        console.log('Loaded reports:', data.length);
        setReports(data);
        // If map is already initialized, update markers
        if (mapInitialized && webViewRef.current) {
            updateMapMarkers(data);
        }
    };

    const updateMapMarkers = (reportData) => {
        const script = `
            clearMarkers();
            ${reportData.map(r => {
            const translatedType = tc('hazards', r.type, 'name') || r.type;
            return `
                addMarker(
                    ${r.latitude}, 
                    ${r.longitude}, 
                    "${translatedType.replace(/"/g, '\\"')}", 
                    "${(r.description || '').replace(/"/g, '\\"')}", 
                    "${r.type === 'Fire' ? 'red' : r.type === 'Flood' ? 'blue' : 'orange'}"
                );
            `;
        }).join('')}
        `;
        webViewRef.current?.injectJavaScript(script);
    };

    // Load sync status
    const loadSyncStatus = async () => {
        const status = await SyncService.getSyncStatus();
        setSyncStatus(status);
    };

    // Handle sync completion
    const handleSyncComplete = async (result) => {
        await loadReports();
        await loadSyncStatus();
        setIsSyncing(false);
        if (result.synced > 0) {
            Alert.alert(t('syncComplete'), t('syncedReports').replace('{count}', result.synced));
        }
    };

    // Manual sync trigger
    const handleManualSync = async () => {
        try {
            setIsSyncing(true);
            const result = await SyncService.syncPendingReports();
            await handleSyncComplete(result);
            if (!result.success) {
                Alert.alert(t('syncFailed'), result.message || 'Unable to sync reports.');
            }
        } catch (error) {
            console.error('Manual sync error:', error);
            setIsSyncing(false);
            await loadSyncStatus();
            Alert.alert(t('syncError'), t('checkConnection'));
        }
    };

    const setupLocation = async () => {
        console.log('Setting up location...');
        const loc = await LocationService.getCurrentLocation();
        console.log('Location received:', loc);
        if (loc) {
            setUserLocation(loc);
            // If map is initialized, center it
            if (mapInitialized && webViewRef.current) {
                centerMap(loc.latitude, loc.longitude);
            }
        }
    };

    const centerMap = (lat, lng) => {
        webViewRef.current?.injectJavaScript(`
            map.setView([${lat}, ${lng}], 15);
            updateUserLocation(${lat}, ${lng});
        `);
    };

    // Periodically check for new reports from Firebase
    useEffect(() => {
        let interval;
        if (userLocation) {
            interval = setInterval(async () => {
                console.log('Checking for new reports from Firebase...');
                const firebaseReports = await SyncService.fetchNearbyReports(
                    userLocation.latitude,
                    userLocation.longitude,
                    50
                );

                if (firebaseReports.length > 0) {
                    console.log(`Found ${firebaseReports.length} remote reports`);
                    let hasNew = false;

                    for (const report of firebaseReports) {

                        // ReportService/Sqlite handles the logic of "does this server_id exist?"
                        const result = await ReportService.saveSyncedReport(report);
                        if (result.new) hasNew = true;
                    }

                    if (hasNew) {
                        console.log('New reports synced! Reloading map...');
                        await loadReports();
                    }

                    // Always check for hazards periodically
                    await checkNearbyHazards();
                } else {
                    // Even if no remote reports, check local/existing reports
                    await checkNearbyHazards();
                }
            }, 15000); // Check every 15 seconds (interval)
        }
        return () => clearInterval(interval);
    }, [userLocation]);

    // Check for hazards within 5km
    const checkNearbyHazards = async () => {
        if (!userLocation) return;
        console.log('Checking nearby hazards...');
        const currentReports = await ReportService.getAllReports();
        const nearby = currentReports.find(r => {
            const timeDiff = new Date() - new Date(r.timestamp);
            const isRecent = timeDiff < 300000; // 5 minutes
            if (!isRecent) return false;

            const dist = LocationService.calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                r.latitude,
                r.longitude
            );
            console.log(`Checking report ${r.id}: ${r.type}, Age: ${Math.round(timeDiff / 1000)}s, Dist: ${dist.toFixed(2)}km`);
            return dist <= 5;
        });

        if (nearby) {
            console.log('Nearby hazard found! Scheduling notification:', nearby.type);
            scheduleNotification(nearby);
        } else {
            console.log('No nearby hazards found in this check.');
        }
    };

    const scheduleNotification = async (report) => {
        // Check user settings first
        console.log('Checking notification settings...');
        const notificationsEnabled = await StorageService.getNotificationSettings();
        console.log('Notifications enabled:', notificationsEnabled);

        if (!notificationsEnabled) {
            console.log('Notifications disabled by user settings. Skipping alert.');
            return;
        }

        console.log('Scheduling actual notification now.');
        await Notifications.scheduleNotificationAsync({
            content: {
                title: t('dangerAlert'),
                body: t('dangerAlertBody').replace('{type}', tc('hazards', report.type, 'name') || report.type),
                data: { reportId: report.id },
            },
            trigger: null,
        });
    };

    const handleReportSubmit = async (data) => {
        if (!userLocation) {
            Alert.alert(t('error'), t('locationNotFound'));
            return;
        }

        const result = await ReportService.addReport(
            data.type,
            userLocation.latitude,
            userLocation.longitude,
            data.description,
            data.photoUri
        );

        if (result.success) {
            setModalVisible(false);
            Alert.alert(t('success'), t('reportSaved'));
            await loadReports();
            await loadSyncStatus();
            handleManualSync().catch(err => console.error('Auto-sync error:', err));

            // Delay notification so it fires AFTER the Alert dialog is visible
            setTimeout(async () => {
                // Directly notify for the user's own report
                const notificationsEnabled = await StorageService.getNotificationSettings();
                if (notificationsEnabled) {
                    await Notifications.scheduleNotificationAsync({
                        content: {
                            title: t('dangerAlert'),
                            body: t('dangerAlertBody').replace('{type}', data.type),
                            data: { reportId: result.id },
                        },
                        trigger: null,
                    });
                }
            }, 2000);
        } else {
            Alert.alert(t('error'), t('failedSaveReport'));
        }
    };

    const focusOnReport = (report) => {
        centerMap(report.latitude, report.longitude);
    };

    // Inject initial data when map loads
    const handleMapLoad = () => {
        console.log("Map Loaded in WebView");
        setMapInitialized(true);
        if (userLocation) {
            centerMap(userLocation.latitude, userLocation.longitude);
        }
        if (reports.length > 0) {
            updateMapMarkers(reports);
        }
    };

    // HTML Content for the WebView
    const mapHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
          <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
          <style>
            body { margin: 0; padding: 0; }
            #map { width: 100%; height: 100vh; }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <script>
            var map = L.map('map').setView([${userLocation ? userLocation.latitude : 1.3521}, ${userLocation ? userLocation.longitude : 103.8198}], 13);
            
            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map);

            var userMarker;
            var reportMarkers = [];

            // Custom Icons
            function getIcon(color) {
                return L.divIcon({
                    className: 'custom-div-icon',
                    html: "<div style='background-color:" + color + ";width:12px;height:12px;border-radius:50%;border:2px solid white;'></div>",
                    iconSize: [20, 20],
                    iconAnchor: [10, 10]
                });
            }

            function updateUserLocation(lat, lng) {
                if (userMarker) {
                    userMarker.setLatLng([lat, lng]);
                } else {
                    userMarker = L.marker([lat, lng]).addTo(map).bindPopup("You are here");
                }
            }

            function clearMarkers() {
                reportMarkers.forEach(m => map.removeLayer(m));
                reportMarkers = [];
            }

            function addMarker(lat, lng, type, desc, color) {
                var marker = L.circleMarker([lat, lng], {
                    color: color,
                    fillColor: color,
                    fillOpacity: 0.8,
                    radius: 8
                }).addTo(map);
                
                // Add a permanent label (tooltip)
                marker.bindTooltip("<b>" + type + "</b><br>" + desc, {
                    permanent: true, 
                    direction: 'top',
                    className: 'custom-tooltip'
                });
                
                reportMarkers.push(marker);
            }
          </script>
        </body>
      </html>
    `;

    return (
        <ScreenWrapper contentContainerStyle={{ padding: 0 }}>
            <View style={styles.container}>
                <WebView
                    ref={webViewRef}
                    originWhitelist={['*']}
                    source={{ html: mapHtml, baseUrl: 'https://localhost' }}
                    style={styles.map}
                    onLoadEnd={handleMapLoad}
                />

                {!mapInitialized && (
                    <View style={styles.loadingContainer}>
                        <AppText variant="h3" style={{ color: theme.colors.text }}>{t('loadingMap')}</AppText>
                    </View>
                )}

                {/* Header Overlay */}
                <View style={styles.headerOverlay}>
                    <AppText variant="h2" style={styles.headerText}>{t('liveMap')}</AppText>
                    <TouchableOpacity
                        style={[styles.syncButton, isSyncing && styles.syncButtonActive]}
                        onPress={handleManualSync}
                        disabled={isSyncing}
                    >
                        <Ionicons
                            name={isSyncing ? "sync" : "cloud-upload"}
                            size={16}
                            color="#FFF"
                        />
                        <AppText style={styles.syncText}>
                            {isSyncing ? t('syncing') : `${syncStatus.pending} ${t('pending')}`}
                        </AppText>
                    </TouchableOpacity>
                </View>

                {/* Report List Overlay */}
                <ReportList
                    reports={reports}
                    onReportPress={focusOnReport}
                />

                {/* Add Report FAB */}
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => setModalVisible(true)}
                    activeOpacity={0.8}
                >
                    <Ionicons name="add" size={32} color="#FFF" />
                </TouchableOpacity>

                {/* Recenter FAB */}
                <TouchableOpacity
                    style={styles.locationFab}
                    onPress={setupLocation}
                    activeOpacity={0.8}
                >
                    <Ionicons name="locate" size={24} color="#FFF" />
                </TouchableOpacity>

                <ReportModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    onSubmit={handleReportSubmit}
                    location={userLocation}
                />
            </View>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    map: {
        width: width,
        height: height,
        ...StyleSheet.absoluteFillObject,
    },
    loadingContainer: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
        zIndex: 5,
    },
    headerOverlay: {
        position: 'absolute',
        top: 50,
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10,
    },
    headerText: {
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10
    },
    syncButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#F39C12',
    },
    syncButtonActive: {
        backgroundColor: '#3498DB',
        borderColor: '#3498DB',
    },
    syncText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#FFF',
        marginLeft: 6,
    },
    fab: {
        position: 'absolute',
        bottom: 180,
        right: 20,
        backgroundColor: '#E74C3C',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        zIndex: 10,
    },
    locationFab: {
        position: 'absolute',
        bottom: 180,
        right: 20,
        marginBottom: 70,
        backgroundColor: '#333',
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 6,
        zIndex: 10,
    },
});
