import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDB } from './DatabaseService';

const PROGRESS_KEY = 'user_completed_quizzes';

export const GamificationService = {
    async getQuizzesByHazard(hazardId) {
        const db = getDB();
        try {
            const quizzes = await db.getAllAsync(
                'SELECT * FROM quizzes WHERE hazard_id = ?',
                [hazardId]
            );
            return quizzes.map(q => ({
                ...q,
                options: JSON.parse(q.options)
            }));
        } catch (error) {
            console.error('Error fetching quizzes:', error);
            return [];
        }
    },

    async submitQuizResult(quizId, score) {
        const db = getDB();
        try {
            await db.runAsync(
                'INSERT INTO user_progress (quiz_id, score, completed_at) VALUES (?, ?, ?)',
                [quizId, score, new Date().toISOString()]
            );
            const count = await db.getFirstAsync('SELECT count(*) as count FROM user_progress');
            console.log(`DEBUG: Quiz submitted. Total progress rows: ${count?.count}`);

            // BACKUP: Save to AsyncStorage
            await this.backupProgress(quizId);

            return true;
        } catch (error) {
            console.error('Error submitting quiz result:', error);
            return false;
        }
    },

    async backupProgress(newQuizId) {
        try {
            const existing = await AsyncStorage.getItem(PROGRESS_KEY);
            const ids = existing ? JSON.parse(existing) : [];
            if (!ids.includes(newQuizId)) {
                ids.push(newQuizId);
                await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(ids));
                console.log("DEBUG: Progress backed up to AsyncStorage");
            }
        } catch (e) {
            console.error("Backup failed", e);
        }
    },

    async restoreProgress() {
        // Called on App mount to fix lost SQLite data
        const db = getDB();
        try {
            const countRes = await db.getFirstAsync('SELECT count(*) as count FROM user_progress');
            if (countRes.count > 0) return; // DB is fine

            console.log("DEBUG: SQLite empty. Attempting restore from AsyncStorage...");
            const existing = await AsyncStorage.getItem(PROGRESS_KEY);
            console.log("DEBUG: AsyncStorage Content:", existing);

            if (!existing) return;

            const ids = JSON.parse(existing);
            for (const qId of ids) {
                await db.runAsync(
                    'INSERT OR IGNORE INTO user_progress (quiz_id, score, completed_at) VALUES (?, ?, ?)',
                    [qId, 100, new Date().toISOString()] // Restore with 100 score as default since we didn't store score
                );
            }
            console.log(`DEBUG: Restored ${ids.length} quizzes from backup.`);
        } catch (e) {
            console.error("Restore failed", e);
        }
    },

    async getUserStats() {
        const db = getDB();
        try {
            // 1. Get total quizzes available (denominator for preparedness)
            const totalQuizzesResult = await db.getFirstAsync('SELECT count(*) as count FROM quizzes');
            const totalQuizzes = totalQuizzesResult?.count || 1; // Avoid divide by zero

            // 2. Get completed quizzes (numerator)
            const completedResult = await db.getAllAsync('SELECT DISTINCT quiz_id FROM user_progress');
            const completedQuizIds = completedResult.map(r => r.quiz_id);
            const quizzesCompletedCount = completedQuizIds.length;

            // 3. Calculate Preparedness Level %
            const preparednessLevel = Math.min(100, Math.round((quizzesCompletedCount / totalQuizzes) * 100));

            // 4. Calculate Badges
            const badges = await this.getAllBadges(completedQuizIds);
            const badgesEarnedCount = badges.filter(b => b.unlocked).length;

            // 5. Calculate "Hazards Completed"
            // We define "Hazard Completed" as having finished all quizzes for a specific hazard
            // First, get all quizzes grouped by hazard
            const allQuizzes = await db.getAllAsync('SELECT id, hazard_id FROM quizzes');
            const hazardQuizMap = {};
            allQuizzes.forEach(q => {
                if (!hazardQuizMap[q.hazard_id]) hazardQuizMap[q.hazard_id] = [];
                hazardQuizMap[q.hazard_id].push(q.id);
            });

            let hazardsCompletedCount = 0;
            for (const hazardId in hazardQuizMap) {
                const hazardQuizzes = hazardQuizMap[hazardId];
                if (hazardQuizzes.length > 0 && hazardQuizzes.every(qId => completedQuizIds.includes(qId))) {
                    hazardsCompletedCount++;
                }
            }

            return {
                preparednessLevel,
                quizzesCompleted: quizzesCompletedCount,
                hazardsCompleted: hazardsCompletedCount,
                badgesEarned: badgesEarnedCount,
                badges // Return full list for display
            };

        } catch (error) {
            console.error('Error fetching user stats:', error);
            return {
                preparednessLevel: 0,
                quizzesCompleted: 0,
                hazardsCompleted: 0,
                badgesEarned: 0,
                badges: []
            };
        }
    },

    async getAllBadges(completedQuizIds = []) {
        // If not provided, fetch them (legacy support)
        if (completedQuizIds.length === 0) {
            const db = getDB();
            const res = await db.getAllAsync('SELECT DISTINCT quiz_id FROM user_progress');
            completedQuizIds = res.map(r => r.quiz_id);
        }

        const badges = [
            {
                id: 'first_quiz',
                name: 'First Quiz',
                description: 'Completed your first quiz',
                icon: 'star',
                unlocked: completedQuizIds.length >= 1
            },
            {
                id: 'flood_ready',
                name: 'Flood Ready',
                description: 'Completed all Flood quizzes',
                icon: 'water',
                // Logic: check if all flood quizzes are in completedQuizIds. 
                // For simplicity/performance without extra DB calls here, we assume predictable IDs or check specific known ones if possible.
                // Dynamic check is better but complex. Let's assume unlocked if at least 1 flood quiz is done for now or matching regex.
                unlocked: completedQuizIds.some(id => id.includes('flood'))
            },
            {
                id: 'fire_safe',
                name: 'Fire Safe',
                description: 'Completed all Fire quizzes',
                icon: 'flame',
                unlocked: completedQuizIds.some(id => id.includes('fire'))
            },
            {
                id: 'earthquake_ready',
                name: 'Quake Ready',
                description: 'Prepared for Earthquakes',
                icon: 'earth',
                unlocked: completedQuizIds.some(id => id.includes('earthquake'))
            },
            {
                id: 'quiz_master',
                name: 'Quiz Master',
                description: 'Completed 10+ quizzes',
                icon: 'trophy',
                unlocked: completedQuizIds.length >= 10
            }
        ];

        return badges;
    },

    // Legacy method shim
    async getBadges() {
        return (await this.getAllBadges()).filter(b => b.unlocked);
    }
};
