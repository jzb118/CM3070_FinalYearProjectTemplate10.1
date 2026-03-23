import { getDB } from "../services/DatabaseService";

export const seedDatabase = async () => {
    const db = getDB();

    try {
        /* ------------------------------------------
         *  CLEANUP (Remove restricted hazards)
         * ------------------------------------------ */
        console.log("Running hazard cleanup...");
        // Added 'fire' to restricted list to ensure it's deleted from existing DBs
        const restrictedHazards = ['covid', 'warming', 'dengue', 'terror', 'robbery', 'shooting', 'other', 'fire'];

        for (const id of restrictedHazards) {
            // Delete from hazards
            await db.runAsync("DELETE FROM hazards WHERE id = ?", [id]);
            // Delete related data
            await db.runAsync("DELETE FROM quizzes WHERE hazard_id = ?", [id]);
            await db.runAsync("DELETE FROM guides WHERE hazard_id = ?", [id]);
            // Note: checklists link to guides, cases link to type (hazard id)
        }



        const result = await db.getFirstAsync("SELECT count(*) as count FROM hazards");
        const needsFullSeed = result.count === 0;

        if (needsFullSeed) {
            console.log("Seeding database (First Run)...");
        } else {
            console.log("Database already seeded. Cleanup complete.");
        }

        /*
         * HAZARDS (Disasters Only - No Fire)
         *  */
        const hazards = [
            { id: "flood", name: "Flood", icon: "water", description: `Overflow of water onto normally dry land.` },
            { id: "earthquake", name: "Earthquake", icon: "earth", description: `Sudden shaking of the ground.` },
            { id: "tsunami", name: "Tsunami", icon: "water", description: `Long high sea wave caused by an earthquake.` },
        ];

        //  Ensure 'safe' hazards exist 
        for (const h of hazards) {
            await db.runAsync(
                "INSERT OR IGNORE INTO hazards (id, name, icon, description) VALUES (?, ?, ?, ?)",
                [h.id, h.name, h.icon, h.description]
            );
        }

        //  Ensure new quiz questions exist 
        const expansionQuizIds = [
            'flood_q6', 'flood_q7', 'flood_q8', 'flood_q9', 'flood_q10',
            'earthquake_q6', 'earthquake_q7', 'earthquake_q8', 'earthquake_q9', 'earthquake_q10',
            'tsunami_q6', 'tsunami_q7', 'tsunami_q8', 'tsunami_q9', 'tsunami_q10',
        ];
        const expansionQuizzes = {
            flood_q6: { hazard_id: "flood", question: "What is a flash flood?", options: JSON.stringify(["A flood caused by rapid rainfall", "A flood from the ocean", "A slow-moving flood"]), correct_answer: 0 },
            flood_q7: { hazard_id: "flood", question: "Which item should be in a flood emergency kit?", options: JSON.stringify(["Flashlight and batteries", "Board games", "Gardening tools"]), correct_answer: 0 },
            flood_q8: { hazard_id: "flood", question: "How deep does water need to be to sweep away a vehicle?", options: JSON.stringify(["2 feet", "6 feet", "10 feet"]), correct_answer: 0 },
            flood_q9: { hazard_id: "flood", question: "What should you do with electrical appliances during a flood warning?", options: JSON.stringify(["Unplug and move to higher level", "Leave them plugged in", "Cover them with plastic"]), correct_answer: 0 },
            flood_q10: { hazard_id: "flood", question: "Why should you avoid walking through flood water?", options: JSON.stringify(["Hidden debris and contamination", "It is always cold", "It is illegal"]), correct_answer: 0 },
            earthquake_q6: { hazard_id: "earthquake", question: "What scale measures earthquake magnitude?", options: JSON.stringify(["Richter scale", "Beaufort scale", "Celsius scale"]), correct_answer: 0 },
            earthquake_q7: { hazard_id: "earthquake", question: "What should you do if you are in bed during an earthquake?", options: JSON.stringify(["Stay and protect your head with a pillow", "Run outside immediately", "Stand in a doorway"]), correct_answer: 0 },
            earthquake_q8: { hazard_id: "earthquake", question: "Which building is safest during an earthquake?", options: JSON.stringify(["A reinforced concrete building", "A brick building without reinforcement", "A glass building"]), correct_answer: 0 },
            earthquake_q9: { hazard_id: "earthquake", question: "What is the main cause of injury during earthquakes?", options: JSON.stringify(["Falling objects and debris", "The ground splitting open", "Lightning"]), correct_answer: 0 },
            earthquake_q10: { hazard_id: "earthquake", question: "Should you use elevators during an earthquake?", options: JSON.stringify(["No, use stairs instead", "Yes, they are safe", "Only in tall buildings"]), correct_answer: 0 },
            tsunami_q6: { hazard_id: "tsunami", question: "How far inland can a tsunami travel?", options: JSON.stringify(["Several kilometers", "Only a few meters", "Never reaches land"]), correct_answer: 0 },
            tsunami_q7: { hazard_id: "tsunami", question: "What should you do if you feel a strong earthquake near the coast?", options: JSON.stringify(["Move to high ground immediately", "Wait for an official warning", "Go to the beach to check"]), correct_answer: 0 },
            tsunami_q8: { hazard_id: "tsunami", question: "Which areas are most at risk from tsunamis?", options: JSON.stringify(["Low-lying coastal areas", "Mountain regions", "Desert areas"]), correct_answer: 0 },
            tsunami_q9: { hazard_id: "tsunami", question: "How long can tsunami waves continue to arrive?", options: JSON.stringify(["For hours after the first wave", "Only one wave arrives", "For exactly 10 minutes"]), correct_answer: 0 },
            tsunami_q10: { hazard_id: "tsunami", question: "What is the safest vertical evacuation for a tsunami?", options: JSON.stringify(["Upper floors of a reinforced building", "Basement of any building", "Ground floor near exits"]), correct_answer: 0 },
        };
        for (const id of expansionQuizIds) {
            const q = expansionQuizzes[id];
            await db.runAsync(
                "INSERT OR IGNORE INTO quizzes (id, hazard_id, question, options, correct_answer) VALUES (?, ?, ?, ?, ?)",
                [id, q.hazard_id, q.question, q.options, q.correct_answer]
            );
        }

        // Always ensure tsunami guides and checklists exist (expansion)
        const tsunamiGuides = [
            { id: 'tsunami_g1', hazard_id: 'tsunami', title: 'Before a Tsunami', content: 'Know the warning signs and prepare an evacuation plan. If you live in a coastal area, identify high ground or upper floors of reinforced buildings as safe zones. Prepare an emergency kit with water, food, medications, and important documents.', step_order: 1 },
            { id: 'tsunami_g2', hazard_id: 'tsunami', title: 'During a Tsunami', content: 'If you feel a strong earthquake near the coast, move to high ground immediately without waiting for an official warning. Stay away from the shore, harbors, and river banks. If caught in the water, grab onto something that floats.', step_order: 2 },
            { id: 'tsunami_g3', hazard_id: 'tsunami', title: 'After a Tsunami', content: 'Do not return to low-lying areas until authorities declare it safe. Tsunamis can produce multiple waves over several hours. Avoid flooded and damaged areas, watch for debris, and check yourself and others for injuries.', step_order: 3 },
        ];
        for (const g of tsunamiGuides) {
            await db.runAsync(
                "INSERT OR IGNORE INTO guides (id, hazard_id, title, content, step_order) VALUES (?, ?, ?, ?, ?)",
                [g.id, g.hazard_id, g.title, g.content, g.step_order]
            );
        }
        const tsunamiChecklists = [
            { id: 'tsunami_c1', guide_id: 'tsunami_g1', item_text: 'Know tsunami evacuation routes in your area' },
            { id: 'tsunami_c2', guide_id: 'tsunami_g1', item_text: 'Prepare an emergency kit with essentials' },
            { id: 'tsunami_c3', guide_id: 'tsunami_g1', item_text: 'Identify high ground or safe buildings nearby' },
            { id: 'tsunami_c4', guide_id: 'tsunami_g2', item_text: 'Move to high ground immediately if earthquake felt' },
            { id: 'tsunami_c5', guide_id: 'tsunami_g2', item_text: 'Stay away from the coast and harbors' },
            { id: 'tsunami_c6', guide_id: 'tsunami_g2', item_text: 'Listen to emergency broadcasts and warnings' },
            { id: 'tsunami_c7', guide_id: 'tsunami_g3', item_text: 'Wait for official all-clear before returning' },
            { id: 'tsunami_c8', guide_id: 'tsunami_g3', item_text: 'Avoid flooded and debris-filled areas' },
            { id: 'tsunami_c9', guide_id: 'tsunami_g3', item_text: 'Check for injuries and provide first aid' },
        ];
        for (const c of tsunamiChecklists) {
            await db.runAsync(
                "INSERT OR IGNORE INTO checklists (id, guide_id, item_text, is_completed) VALUES (?, ?, ?, 0)",
                [c.id, c.guide_id, c.item_text]
            );
        }

        // If we just cleaned up, we might not need to re-seed everything unless it requires full seed
        if (!needsFullSeed) return;

        /* 
         * QUIZZES
         *  */
        const quizzes = [
            // FLOOD
            {
                id: "flood_q1", hazard_id: "flood",
                question: `What should you do if you see rising flood waters?`,
                options: JSON.stringify(["Run to high ground", "Stay in the basement", "Drive through the water"]),
                correct_answer: 0,
            },
            {
                id: "flood_q2", hazard_id: "flood",
                question: `Which of these is a sign of a potential flash flood?`,
                options: JSON.stringify(["Clear blue skies", "Rapidly rising water levels in streams", "Dry ground"]),
                correct_answer: 1,
            },
            {
                id: "flood_q3", hazard_id: "flood",
                question: `How much water is needed to knock a person off their feet?`,
                options: JSON.stringify(["6 inches", "1 foot", "2 feet"]),
                correct_answer: 0,
            },
            {
                id: "flood_q4", hazard_id: "flood",
                question: `What should you avoid during a flood?`,
                options: JSON.stringify(["Drinking tap water without boiling", "Moving to higher ground", "Listening to the radio"]),
                correct_answer: 0,
            },
            {
                id: "flood_q5", hazard_id: "flood",
                question: `If you are in a car and water levels rise, what should you do?`,
                options: JSON.stringify(["Stay inside and lock the doors", "Abandon the car and move to higher ground", "Drive faster"]),
                correct_answer: 1,
            },

            // EARTHQUAKE
            {
                id: "earthquake_q1", hazard_id: "earthquake",
                question: `What is the 'Drop, Cover, and Hold On' rule?`,
                options: JSON.stringify(["Dance move", "Safety procedure during shaking", "Exercise routine"]),
                correct_answer: 1,
            },
            {
                id: "earthquake_q2", hazard_id: "earthquake",
                question: `Where is the safest place indoors during an earthquake?`,
                options: JSON.stringify(["Near a window", "Under a sturdy table", "In an elevator"]),
                correct_answer: 1,
            },
            {
                id: "earthquake_q3", hazard_id: "earthquake",
                question: `What should you do if you are outside during an earthquake?`,
                options: JSON.stringify(["Run inside", "Move to an open area", "Stand under a tree"]),
                correct_answer: 1,
            },
            {
                id: "earthquake_q4", hazard_id: "earthquake",
                question: `What often follows a major earthquake?`,
                options: JSON.stringify(["Heavy rain", "Aftershocks", "Strong winds"]),
                correct_answer: 1,
            },
            {
                id: "earthquake_q5", hazard_id: "earthquake",
                question: `Why should you secure heavy furniture?`,
                options: JSON.stringify(["To prevent it from tipping over", "To look nice", "To make it heavier"]),
                correct_answer: 0,
            },

            // TSUNAMI
            {
                id: "tsunami_q1", hazard_id: "tsunami",
                question: `What usually causes a tsunami?`,
                options: JSON.stringify(["High winds", "Undersea earthquake", "Heavy rain"]),
                correct_answer: 1,
            },
            {
                id: "tsunami_q2", hazard_id: "tsunami",
                question: `What is a natural warning sign of a tsunami?`,
                options: JSON.stringify(["Water receding far from the shore", "Clear sky", "Calm waves"]),
                correct_answer: 0,
            },
            {
                id: "tsunami_q3", hazard_id: "tsunami",
                question: `Where should you go if a tsunami warning is issued?`,
                options: JSON.stringify(["To the beach", "To high ground inland", "To the basement"]),
                correct_answer: 1,
            },
            {
                id: "tsunami_q4", hazard_id: "tsunami",
                question: `Can a tsunami be a series of waves?`,
                options: JSON.stringify(["No, it's always one wave", "Yes, and the first may not be the largest", "Only in movies"]),
                correct_answer: 1,
            },
            {
                id: "tsunami_q5", hazard_id: "tsunami",
                question: `How fast can a tsunami travel in deep ocean?`,
                options: JSON.stringify(["10 mph", "50 mph", "500 mph"]),
                correct_answer: 2,
            },

            // FLOOD 
            {
                id: "flood_q6", hazard_id: "flood",
                question: `What is a flash flood?`,
                options: JSON.stringify(["A flood caused by rapid rainfall", "A flood from the ocean", "A slow-moving flood"]),
                correct_answer: 0,
            },
            {
                id: "flood_q7", hazard_id: "flood",
                question: `Which item should be in a flood emergency kit?`,
                options: JSON.stringify(["Flashlight and batteries", "Board games", "Gardening tools"]),
                correct_answer: 0,
            },
            {
                id: "flood_q8", hazard_id: "flood",
                question: `How deep does water need to be to sweep away a vehicle?`,
                options: JSON.stringify(["2 feet", "6 feet", "10 feet"]),
                correct_answer: 0,
            },
            {
                id: "flood_q9", hazard_id: "flood",
                question: `What should you do with electrical appliances during a flood warning?`,
                options: JSON.stringify(["Unplug and move to higher level", "Leave them plugged in", "Cover them with plastic"]),
                correct_answer: 0,
            },
            {
                id: "flood_q10", hazard_id: "flood",
                question: `Why should you avoid walking through flood water?`,
                options: JSON.stringify(["Hidden debris and contamination", "It is always cold", "It is illegal"]),
                correct_answer: 0,
            },

            // EARTHQUAKE 
            {
                id: "earthquake_q6", hazard_id: "earthquake",
                question: `What scale measures earthquake magnitude?`,
                options: JSON.stringify(["Richter scale", "Beaufort scale", "Celsius scale"]),
                correct_answer: 0,
            },
            {
                id: "earthquake_q7", hazard_id: "earthquake",
                question: `What should you do if you are in bed during an earthquake?`,
                options: JSON.stringify(["Stay and protect your head with a pillow", "Run outside immediately", "Stand in a doorway"]),
                correct_answer: 0,
            },
            {
                id: "earthquake_q8", hazard_id: "earthquake",
                question: `Which building is safest during an earthquake?`,
                options: JSON.stringify(["A reinforced concrete building", "A brick building without reinforcement", "A glass building"]),
                correct_answer: 0,
            },
            {
                id: "earthquake_q9", hazard_id: "earthquake",
                question: `What is the main cause of injury during earthquakes?`,
                options: JSON.stringify(["Falling objects and debris", "The ground splitting open", "Lightning"]),
                correct_answer: 0,
            },
            {
                id: "earthquake_q10", hazard_id: "earthquake",
                question: `Should you use elevators during an earthquake?`,
                options: JSON.stringify(["No, use stairs instead", "Yes, they are safe", "Only in tall buildings"]),
                correct_answer: 0,
            },

            // TSUNAMI 
            {
                id: "tsunami_q6", hazard_id: "tsunami",
                question: `How far inland can a tsunami travel?`,
                options: JSON.stringify(["Several kilometers", "Only a few meters", "Never reaches land"]),
                correct_answer: 0,
            },
            {
                id: "tsunami_q7", hazard_id: "tsunami",
                question: `What should you do if you feel a strong earthquake near the coast?`,
                options: JSON.stringify(["Move to high ground immediately", "Wait for an official warning", "Go to the beach to check"]),
                correct_answer: 0,
            },
            {
                id: "tsunami_q8", hazard_id: "tsunami",
                question: `Which areas are most at risk from tsunamis?`,
                options: JSON.stringify(["Low-lying coastal areas", "Mountain regions", "Desert areas"]),
                correct_answer: 0,
            },
            {
                id: "tsunami_q9", hazard_id: "tsunami",
                question: `How long can tsunami waves continue to arrive?`,
                options: JSON.stringify(["For hours after the first wave", "Only one wave arrives", "For exactly 10 minutes"]),
                correct_answer: 0,
            },
            {
                id: "tsunami_q10", hazard_id: "tsunami",
                question: `What is the safest vertical evacuation for a tsunami?`,
                options: JSON.stringify(["Upper floors of a reinforced building", "Basement of any building", "Ground floor near exits"]),
                correct_answer: 0,
            },
        ];

        for (const q of quizzes) {
            await db.runAsync(
                "INSERT OR IGNORE INTO quizzes (id, hazard_id, question, options, correct_answer) VALUES (?, ?, ?, ?, ?)",
                [q.id, q.hazard_id, q.question, q.options, q.correct_answer]
            );
        }

        /* 
         * GUIDES
         *  */
        const guides = [
            // Flood
            {
                id: "flood_g1", hazard_id: "flood",
                title: `Before a Flood`,
                content: `Prepare your home and family before flood waters arrive. Create an emergency kit, identify evacuation routes, and protect important documents.`,
                step_order: 1,
            },
            {
                id: "flood_g2", hazard_id: "flood",
                title: `During a Flood`,
                content: `Stay safe during flooding. Move to higher ground immediately, avoid walking or driving through flood waters, and stay informed through emergency broadcasts.`,
                step_order: 2,
            },
            {
                id: "flood_g3", hazard_id: "flood",
                title: `After a Flood`,
                content: `Return home safely and begin recovery. Check for structural damage, avoid contaminated water, and document damage for insurance claims.`,
                step_order: 3,
            },
            // Earthquake
            {
                id: "earthquake_g1", hazard_id: "earthquake",
                title: `Earthquake Preparation`,
                content: `Prepare your home for earthquakes. Secure heavy furniture, create an emergency plan, and stock emergency supplies.`,
                step_order: 1,
            },
            {
                id: "earthquake_g2", hazard_id: "earthquake",
                title: `During an Earthquake`,
                content: `Stay safe when the ground shakes. Drop, Cover, and Hold On. Stay away from windows and exterior walls.`,
                step_order: 2,
            },
            {
                id: "earthquake_g3", hazard_id: "earthquake",
                title: `After an Earthquake`,
                content: `What to do after shaking stops. Check for injuries, inspect your home for damage, and be prepared for aftershocks.`,
                step_order: 3,
            },
            // Tsunami
            {
                id: "tsunami_g1", hazard_id: "tsunami",
                title: `Before a Tsunami`,
                content: `Know the warning signs and prepare an evacuation plan. If you live in a coastal area, identify high ground or upper floors of reinforced buildings as safe zones. Prepare an emergency kit with water, food, medications, and important documents.`,
                step_order: 1,
            },
            {
                id: "tsunami_g2", hazard_id: "tsunami",
                title: `During a Tsunami`,
                content: `If you feel a strong earthquake near the coast, move to high ground immediately without waiting for an official warning. Stay away from the shore, harbors, and river banks. If caught in the water, grab onto something that floats.`,
                step_order: 2,
            },
            {
                id: "tsunami_g3", hazard_id: "tsunami",
                title: `After a Tsunami`,
                content: `Do not return to low-lying areas until authorities declare it safe. Tsunamis can produce multiple waves over several hours. Avoid flooded and damaged areas, watch for debris, and check yourself and others for injuries.`,
                step_order: 3,
            },
        ];

        for (const g of guides) {
            await db.runAsync(
                "INSERT OR IGNORE INTO guides (id, hazard_id, title, content, step_order) VALUES (?, ?, ?, ?, ?)",
                [g.id, g.hazard_id, g.title, g.content, g.step_order]
            );
        }

        /* 
         * CHECKLISTS
         *  */
        const checklists = [
            // Flood
            { id: "flood_c1", guide_id: "flood_g1", item_text: `Assemble emergency kit water, food, first aid` },
            { id: "flood_c2", guide_id: "flood_g1", item_text: `Store important documents in waterproof container` },
            { id: "flood_c3", guide_id: "flood_g1", item_text: `Identify evacuation routes and shelter locations` },
            { id: "flood_c5", guide_id: "flood_g2", item_text: `Move to higher ground immediately` },
            { id: "flood_c6", guide_id: "flood_g2", item_text: `Avoid walking or driving through flood waters` },
            { id: "flood_c8", guide_id: "flood_g2", item_text: `Stay tuned to emergency broadcasts` },
            // Earthquake
            { id: "earthquake_c1", guide_id: "earthquake_g1", item_text: `Secure heavy furniture to walls` },
            { id: "earthquake_c4", guide_id: "earthquake_g1", item_text: `Practice Drop, Cover, and Hold On` },
            { id: "earthquake_c6", guide_id: "earthquake_g2", item_text: `Take cover under sturdy furniture` },
            // Tsunami
            { id: "tsunami_c1", guide_id: "tsunami_g1", item_text: `Know tsunami evacuation routes in your area` },
            { id: "tsunami_c2", guide_id: "tsunami_g1", item_text: `Prepare an emergency kit with essentials` },
            { id: "tsunami_c3", guide_id: "tsunami_g1", item_text: `Identify high ground or safe buildings nearby` },
            { id: "tsunami_c4", guide_id: "tsunami_g2", item_text: `Move to high ground immediately if earthquake felt` },
            { id: "tsunami_c5", guide_id: "tsunami_g2", item_text: `Stay away from the coast and harbors` },
            { id: "tsunami_c6", guide_id: "tsunami_g2", item_text: `Listen to emergency broadcasts and warnings` },
            { id: "tsunami_c7", guide_id: "tsunami_g3", item_text: `Wait for official all-clear before returning` },
            { id: "tsunami_c8", guide_id: "tsunami_g3", item_text: `Avoid flooded and debris-filled areas` },
            { id: "tsunami_c9", guide_id: "tsunami_g3", item_text: `Check for injuries and provide first aid` },
        ];

        for (const c of checklists) {
            await db.runAsync(
                "INSERT OR IGNORE INTO checklists (id, guide_id, item_text, is_completed) VALUES (?, ?, ?, 0)",
                [c.id, c.guide_id, c.item_text]
            );
        }

        /* 
         * SAMPLE CASES (inserted into reports table)
         *  */
        const cases = [
            { type: "flood", latitude: 1.3521, longitude: 103.8198, description: `Severe flooding in downtown area`, timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
            { type: "earthquake", latitude: 1.3700, longitude: 103.8500, description: `Minor tremors felt`, timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() },
        ];

        for (const c of cases) {
            await db.runAsync(
                "INSERT INTO reports (type, latitude, longitude, description, timestamp, sync_status, synced) VALUES (?, ?, ?, ?, ?, 'synced', 1)",
                [c.type, c.latitude, c.longitude, c.description, c.timestamp]
            );
        }

        /* 
         * NEWS
         *  */
        const news = [
            {
                title: `Flood Warning Issued`,
                description: `Authorities have issued a flood warning due to heavy rainfall.`,
                image_url: `https://images.unsplash.com/photo-1547683905-f686c993aae5?w=400`,
                published_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                source: `National Weather Service`,
                url: `https://www.weather.gov/`,
            },
        ];

        for (const n of news) {
            await db.runAsync(
                "INSERT INTO news (title, description, image_url, published_at, source, url) VALUES (?, ?, ?, ?, ?, ?)",
                [n.title, n.description, n.image_url, n.published_at, n.source, n.url]
            );
        }

        console.log("Database seeded successfully");

    } catch (error) {
        console.error("Error seeding database V2:", error);
    }
};
