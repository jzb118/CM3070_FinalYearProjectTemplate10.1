// Simple Firebase Test
// This file tests if Firebase connection is working

import { ref, set } from 'firebase/database';
import { database } from './firebase';

export const testFirebaseConnection = async () => {
    try {
        console.log('🧪 Testing Firebase connection...');

        // Try to write a simple test object
        const testRef = ref(database, 'test');
        await set(testRef, {
            message: 'Firebase connection test',
            timestamp: new Date().toISOString()
        });

        console.log('✅ Firebase write test successful!');
        return true;
    } catch (error) {
        console.error('❌ Firebase write test failed:', error);
        console.error('Error details:', error.message);
        return false;
    }
};

export const testReportWrite = async () => {
    try {
        console.log('🧪 Testing report write to Firebase...');

        const reportRef = ref(database, 'reports/test-report-1');
        await set(reportRef, {
            type: 'Test',
            latitude: 1.3521,
            longitude: 103.8198,
            description: 'This is a test report',
            timestamp: new Date().toISOString()
        });

        console.log('✅ Test report written successfully!');
        return true;
    } catch (error) {
        console.error('❌ Test report write failed:', error);
        console.error('Error details:', error.message);
        return false;
    }
};
