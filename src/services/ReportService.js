import { getDB } from './DatabaseService';

const db = getDB();

export const ReportService = {
    // Add a new report
    addReport: async (type, lat, lon, description, photo_uri = null) => {
        try {
            const timestamp = new Date().toISOString();
            const result = await db.runAsync(
                `INSERT INTO reports (type, latitude, longitude, description, timestamp, photo_uri, sync_status, synced) 
         VALUES (?, ?, ?, ?, ?, ?, 'pending', 0)`,
                [type, lat, lon, description, timestamp, photo_uri]
            );
            return { success: true, id: result.lastInsertRowId };
        } catch (error) {
            console.error("Error adding report:", error);
            return { success: false, error };
        }
    },

    // Save a report downloaded from Firebase
    saveSyncedReport: async (report) => {
        try {
            // Check if already exists by server_id
            const existing = await db.getFirstAsync(
                'SELECT id FROM reports WHERE server_id = ?',
                [report.id] // report.id from firebase IS the server_id
            );

            if (existing) {
                return { success: true, exists: true };
            }

            const result = await db.runAsync(
                `INSERT INTO reports (type, latitude, longitude, description, timestamp, photo_uri, sync_status, synced, server_id, photo_url) 
         VALUES (?, ?, ?, ?, ?, ?, 'synced', 1, ?, ?)`,
                [
                    report.type,
                    report.latitude,
                    report.longitude,
                    report.description,
                    report.timestamp,
                    null, // No local photo URI for downloaded reports
                    report.id, // server_id
                    report.photoUrl || null
                ]
            );
            return { success: true, id: result.lastInsertRowId, new: true };
        } catch (error) {
            console.error("Error saving synced report:", error);
            return { success: false, error };
        }
    },

    // Get all reports 
    getAllReports: async () => {
        try {
            const reports = await db.getAllAsync('SELECT * FROM reports ORDER BY timestamp DESC');
            return reports;
        } catch (error) {
            console.error("Error fetching reports:", error);
            return [];
        }
    },

    // Mock function to simulate receiving reports from "Internet"
    // In a real app, this would fetch from an API
    simulateIncomingReports: async (currentLat, currentLon) => {
        // Generate a random report near the user
        // Random offset ~0.01 deg is approx 1km
        const randomLat = currentLat + (Math.random() - 0.5) * 0.02;
        const randomLon = currentLon + (Math.random() - 0.5) * 0.02;

        const types = ['Fire', 'Flood', 'Accident', 'Help Needed'];
        const type = types[Math.floor(Math.random() * types.length)];

        try {
            await ReportService.addReport(
                type,
                randomLat,
                randomLon,
                `Simulated incoming report: ${type} reported near you.`
            );
            return true; // New report added
        } catch (e) {
            return false;
        }
    }
};
