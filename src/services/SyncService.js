import { ref, push, set, query, orderByChild, get, update } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { database, storage } from '../config/firebase';
import { getDB } from './DatabaseService';
import NetInfo from '@react-native-community/netinfo';

export const SyncService = {
    /**
     * Check if device has internet connectivity
     */
    async checkConnectivity() {
        try {
            const state = await NetInfo.fetch();
            // In emulator, isInternetReachable might be null, so we check isConnected
            return state.isConnected === true;
        } catch (error) {
            console.error('Error checking connectivity:', error);
            // Assume connected if we can't check (fail open for development)
            return true;
        }
    },

    /**
     * Upload a single report to Firebase
     */
    async uploadReport(report) {
        try {
            console.log('📤 Starting upload for report:', report.id, report.type);

            const reportsRef = ref(database, 'reports');
            console.log('✅ Got database reference');

            const newReportRef = push(reportsRef);
            console.log('✅ Created new report reference:', newReportRef.key);

            let photoUrl = null;

            // Upload photo if exists
            if (report.photo_uri) {
                console.log('📸 Photo found, uploading...');
                try {
                    photoUrl = await this.uploadPhoto(report.photo_uri, newReportRef.key);
                    console.log('✅ Photo uploaded:', photoUrl);
                } catch (photoError) {
                    console.error('❌ Photo upload failed:', photoError);
                    console.error('Photo error details:', photoError.message);
                    // Continue without photo
                }
            } else {
                console.log('ℹ️ No photo to upload');
            }

            // Prepare report data for Firebase
            const firebaseReport = {
                type: report.type,
                latitude: report.latitude,
                longitude: report.longitude,
                description: report.description,
                timestamp: report.timestamp,
                photoUrl: photoUrl,
                localId: report.id, // Keep reference to local ID
            };

            console.log('📝 Prepared Firebase report data:', firebaseReport);

            // Upload to Firebase with timeout
            console.log('🚀 Uploading to Firebase...');

            try {
                // Add a timeout to catch hanging requests, with proper cleanup
                const uploadPromise = set(newReportRef, firebaseReport);
                let timeoutId;
                const timeoutPromise = new Promise((_, reject) => {
                    timeoutId = setTimeout(() => reject(new Error('Firebase upload timeout after 10 seconds')), 10000);
                });

                try {
                    await Promise.race([uploadPromise, timeoutPromise]);
                } finally {
                    clearTimeout(timeoutId);
                }
                console.log('✅ Successfully uploaded to Firebase!');
            } catch (setError) {
                console.error('❌ Firebase set() failed:', setError);
                console.error('Set error name:', setError.name);
                console.error('Set error message:', setError.message);
                console.error('Set error code:', setError.code);
                throw setError; // Re-throw to be caught by outer catch
            }

            return {
                success: true,
                serverId: newReportRef.key,
                photoUrl
            };
        } catch (error) {
            console.error('❌ Error uploading report:', error);
            console.error('Error name:', error.name);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
            return {
                success: false,
                error: error.message
            };
        }
    },

    /**
     * Upload photo to Firebase Storage
     */
    async uploadPhoto(localUri, reportId) {
        try {
            // Fetch the image as blob
            const response = await fetch(localUri);
            const blob = await response.blob();

            // Create storage reference
            const photoRef = storageRef(storage, `report-photos/${reportId}.jpg`);

            // Upload
            await uploadBytes(photoRef, blob);

            // Get download URL
            const downloadURL = await getDownloadURL(photoRef);
            return downloadURL;
        } catch (error) {
            console.error('Error uploading photo:', error);
            throw error;
        }
    },

    /**
     * Sync all pending reports to Firebase
     */
    async syncPendingReports() {
        const db = getDB();

        try {
            console.log('Starting sync process...');

            // Check connectivity first
            const isConnected = await this.checkConnectivity();
            console.log('Connectivity check:', isConnected);

            if (!isConnected) {
                console.log('No internet connection, skipping sync');
                return {
                    success: false,
                    message: 'No internet connection',
                    synced: 0
                };
            }

            // Get all pending reports
            const pendingReports = await db.getAllAsync(
                "SELECT * FROM reports WHERE sync_status = 'pending' OR sync_status = 'failed'"
            );

            console.log(`Found ${pendingReports.length} pending reports to sync`);

            if (pendingReports.length === 0) {
                return {
                    success: true,
                    message: 'No reports to sync',
                    synced: 0
                };
            }

            let syncedCount = 0;
            let failedCount = 0;

            // Upload each report
            for (const report of pendingReports) {
                console.log(`Syncing report ${report.id}:`, report.type);

                // Update status to 'syncing'
                await db.runAsync(
                    "UPDATE reports SET sync_status = 'syncing', last_sync_attempt = ? WHERE id = ?",
                    [new Date().toISOString(), report.id]
                );

                const result = await this.uploadReport(report);
                console.log(`Upload result for report ${report.id}:`, result);

                if (result.success) {
                    // Update local database with sync success
                    await db.runAsync(
                        `UPDATE reports SET 
                            sync_status = 'synced', 
                            server_id = ?,
                            photo_url = ?,
                            last_sync_attempt = ?
                        WHERE id = ?`,
                        [result.serverId, result.photoUrl || null, new Date().toISOString(), report.id]
                    );
                    syncedCount++;
                    console.log(`✅ Report ${report.id} synced successfully`);
                } else {
                    // Update with failed status
                    const attempts = (report.sync_attempts || 0) + 1;
                    await db.runAsync(
                        `UPDATE reports SET 
                            sync_status = 'failed', 
                            sync_attempts = ?,
                            last_sync_attempt = ?
                        WHERE id = ?`,
                        [attempts, new Date().toISOString(), report.id]
                    );
                    failedCount++;
                    console.error(`❌ Report ${report.id} sync failed:`, result.error);
                }
            }

            const finalResult = {
                success: true,
                message: `Synced ${syncedCount} reports, ${failedCount} failed`,
                synced: syncedCount,
                failed: failedCount
            };

            console.log('Sync process complete:', finalResult);
            return finalResult;
        } catch (error) {
            console.error('Error syncing reports:', error);
            return {
                success: false,
                message: error.message,
                synced: 0
            };
        }
    },

    /**
     * Fetch nearby reports from Firebase
     */
    async fetchNearbyReports(userLat, userLon, radiusKm = 50) {
        try {
            const isConnected = await this.checkConnectivity();
            if (!isConnected) {
                return [];
            }

            const reportsRef = ref(database, 'reports');
            const snapshot = await get(reportsRef);

            if (!snapshot.exists()) {
                return [];
            }

            const reports = [];
            snapshot.forEach((childSnapshot) => {
                const report = childSnapshot.val();

                // Calculate distance
                const distance = this.calculateDistance(
                    userLat,
                    userLon,
                    report.latitude,
                    report.longitude
                );

                // Only include reports within radius
                if (distance <= radiusKm) {
                    reports.push({
                        ...report,
                        id: childSnapshot.key,
                        distance: distance,
                        source: 'firebase'
                    });
                }
            });

            return reports;
        } catch (error) {
            console.error('Error fetching nearby reports:', error);
            return [];
        }
    },

    /**
     * Calculate distance between two coordinates (Haversine formula)
     */
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in km
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(lat1)) *
            Math.cos(this.toRad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    },

    toRad(degrees) {
        return degrees * (Math.PI / 180);
    },

    /**
     * Get sync status summary
     */
    async getSyncStatus() {
        const db = getDB();

        try {
            const pending = await db.getFirstAsync(
                "SELECT COUNT(*) as count FROM reports WHERE sync_status = 'pending'"
            );
            const syncing = await db.getFirstAsync(
                "SELECT COUNT(*) as count FROM reports WHERE sync_status = 'syncing'"
            );
            const synced = await db.getFirstAsync(
                "SELECT COUNT(*) as count FROM reports WHERE sync_status = 'synced'"
            );
            const failed = await db.getFirstAsync(
                "SELECT COUNT(*) as count FROM reports WHERE sync_status = 'failed'"
            );

            return {
                pending: pending.count || 0,
                syncing: syncing.count || 0,
                synced: synced.count || 0,
                failed: failed.count || 0,
                total: (pending.count || 0) + (syncing.count || 0) + (synced.count || 0) + (failed.count || 0)
            };
        } catch (error) {
            console.error('Error getting sync status:', error);
            return {
                pending: 0,
                syncing: 0,
                synced: 0,
                failed: 0,
                total: 0
            };
        }
    },

    /**
     * Setup automatic sync when connectivity is restored
     */
    setupAutoSync(callback) {
        let syncTimeout = null;

        return NetInfo.addEventListener(state => {
            if (state.isConnected === true) {
                // Debounce: wait 2 seconds before syncing to avoid multiple rapid calls
                if (syncTimeout) clearTimeout(syncTimeout);

                syncTimeout = setTimeout(() => {
                    console.log('Connection restored, syncing...');
                    this.syncPendingReports().then(result => {
                        if (callback) callback(result);
                    });
                }, 2000);
            }
        });
    }
};
