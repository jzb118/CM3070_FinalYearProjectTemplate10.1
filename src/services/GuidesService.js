import { getDB } from './DatabaseService';

export class GuidesService {
    /**
     * Get all guides for a specific hazard
     * @param {string} hazardId - The hazard ID
     * @returns {Promise<Array>} Array of guides ordered by step_order
     */
    static async getGuidesByHazard(hazardId) {
        try {
            const db = getDB();
            const guides = await db.getAllAsync(
                'SELECT * FROM guides WHERE hazard_id = ? ORDER BY step_order ASC',
                [hazardId]
            );
            return guides;
        } catch (error) {
            console.error('Error fetching guides:', error);
            return [];
        }
    }

    /**
     * Get guide details with associated checklist items
     * @param {string} guideId - The guide ID
     * @returns {Promise<Object>} Guide object with checklists array
     */
    static async getGuideDetails(guideId) {
        try {
            const db = getDB();

            // Get guide
            const guide = await db.getFirstAsync(
                'SELECT * FROM guides WHERE id = ?',
                [guideId]
            );

            if (!guide) {
                return null;
            }

            // Get checklist items for this guide
            const checklists = await db.getAllAsync(
                'SELECT * FROM checklists WHERE guide_id = ? ORDER BY id ASC',
                [guideId]
            );

            return {
                ...guide,
                checklists: checklists || []
            };
        } catch (error) {
            console.error('Error fetching guide details:', error);
            return null;
        }
    }

    /**
     * Toggle checklist item completion status
     * @param {string} checklistId - The checklist item ID
     * @param {boolean} isCompleted - New completion status
     * @returns {Promise<boolean>} Success status
     */
    static async toggleChecklistItem(checklistId, isCompleted) {
        try {
            const db = getDB();
            await db.runAsync(
                'UPDATE checklists SET is_completed = ? WHERE id = ?',
                [isCompleted ? 1 : 0, checklistId]
            );
            return true;
        } catch (error) {
            console.error('Error toggling checklist item:', error);
            return false;
        }
    }

    /**
     * Get checklist completion progress for a guide
     * @param {string} guideId - The guide ID
     * @returns {Promise<Object>} Object with completed, total, and percentage
     */
    static async getChecklistProgress(guideId) {
        try {
            const db = getDB();

            const result = await db.getFirstAsync(
                `SELECT 
                    COUNT(*) as total,
                    SUM(is_completed) as completed
                FROM checklists 
                WHERE guide_id = ?`,
                [guideId]
            );

            const total = result?.total || 0;
            const completed = result?.completed || 0;
            const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

            return {
                completed,
                total,
                percentage
            };
        } catch (error) {
            console.error('Error getting checklist progress:', error);
            return { completed: 0, total: 0, percentage: 0 };
        }
    }
}
