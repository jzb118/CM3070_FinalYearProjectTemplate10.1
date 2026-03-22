import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { useEffect, useState } from 'react';
import { initDatabase, getDB } from './src/services/DatabaseService';
import { seedDatabase } from './src/utils/seedDataV2';
import { migrateNewTables } from './src/utils/migrateDataV2';
import { GamificationService } from './src/services/GamificationService';
import { LanguageProvider } from './src/context/LanguageContext';

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const setup = async () => {
      try {
        const start = Date.now();
        console.log(`[PERF_INIT] App render start: ${start}`);
        await initDatabase();

        // DEBUG: Check user_progress count
        const db = getDB();
        const before = await db.getFirstAsync("SELECT count(*) as count FROM user_progress");
        console.log("DEBUG: user_progress count on mount:", before?.count);

        await seedDatabase();

        // Restore backup if needed
        await GamificationService.restoreProgress();

        // DEBUG: Check again
        const after = await db.getFirstAsync("SELECT count(*) as count FROM user_progress");
        console.log("DEBUG: user_progress count after restore:", after?.count);

        await migrateNewTables();
        const end = Date.now();
        console.log(`[PERF_INIT] App render complete: ${end} (Duration: ${end - start}ms)`);
      } catch (e) {
        console.error("Setup error:", e);
      } finally {
        setIsReady(true);
      }
    };
    setup();
  }, []);

  if (!isReady) {
    return null; // Or a splash screen
  }

  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <StatusBar style="dark" />
        <AppNavigator />
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
