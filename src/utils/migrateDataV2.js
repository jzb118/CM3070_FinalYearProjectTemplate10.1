import { getDB } from "../services/DatabaseService";

/**
 * Migration to add news, cases, and users data
 * Run this once to populate the new tables
 */
export const migrateNewTables = async () => {
    const db = getDB();

    try {
        // Check if news data already exists
        const newsCheck = await db.getFirstAsync("SELECT count(*) as count FROM news");
        if (newsCheck.count > 0) {
            console.log("News data already exists, skipping migration");
            return;
        }

        console.log("Migrating new tables data...");

        // Sample Cases
        const cases = [
            { type: "flood", latitude: 1.3521, longitude: 103.8198, description: "Severe flooding in downtown area", timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
            { type: "fire", latitude: 1.3000, longitude: 103.8000, description: "Building fire reported", timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
            { type: "earthquake", latitude: 1.3700, longitude: 103.8500, description: "Minor tremors felt", timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() },
            { type: "covid", latitude: 1.3400, longitude: 103.8300, description: "COVID-19 cluster identified", timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
            { type: "dengue", latitude: 1.3600, longitude: 103.8400, description: "Dengue outbreak in residential area", timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
            { type: "fire", latitude: 1.3200, longitude: 103.8100, description: "Forest fire contained", timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString() },
            { type: "flood", latitude: 1.3300, longitude: 103.8200, description: "Flash flood warning", timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
        ];

        for (const c of cases) {
            await db.runAsync("INSERT INTO disaster_cases (type, latitude, longitude, description, timestamp) VALUES (?, ?, ?, ?, ?)",
                [c.type, c.latitude, c.longitude, c.description, c.timestamp]);
        }

        // Sample Users
        const users = [
            { name: "John Doe", email: "john@example.com", registered_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
            { name: "Jane Smith", email: "jane@example.com", registered_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString() },
            { name: "Bob Johnson", email: "bob@example.com", registered_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString() },
            { name: "Alice Williams", email: "alice@example.com", registered_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() },
            { name: "Charlie Brown", email: "charlie@example.com", registered_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
            { name: "Diana Prince", email: "diana@example.com", registered_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
            { name: "Eve Davis", email: "eve@example.com", registered_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
            { name: "Frank Miller", email: "frank@example.com", registered_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
        ];

        for (const u of users) {
            await db.runAsync("INSERT INTO users (name, email, registered_at) VALUES (?, ?, ?)", [u.name, u.email, u.registered_at]);
        }

        // Sample News
        const news = [
            {
                title: "Flood Warning Issued for Central Region",
                description: "Authorities have issued a flood warning for the central region due to heavy rainfall expected over the next 48 hours.",
                image_url: "https://images.unsplash.com/photo-1547683905-f686c993aae5?w=400",
                published_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                source: "National Weather Service"
            },
            {
                title: "Fire Safety Workshop This Weekend",
                description: "Join us for a free fire safety workshop covering prevention, evacuation procedures, and first aid.",
                image_url: "https://images.unsplash.com/photo-1583340806775-eb30a7c0e3b1?w=400",
                published_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
                source: "Community Safety Board"
            },
            {
                title: "Earthquake Preparedness Month",
                description: "This month we focus on earthquake preparedness. Learn how to secure your home and create an emergency plan.",
                image_url: "https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=400",
                published_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
                source: "Disaster Management Agency"
            },
            {
                title: "COVID-19 Vaccination Drive Continues",
                description: "Free COVID-19 vaccinations available at community centers. Walk-ins welcome.",
                image_url: "https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=400",
                published_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                source: "Health Ministry"
            },
            {
                title: "Dengue Cases on the Rise",
                description: "Health officials report increase in dengue cases. Residents urged to eliminate stagnant water.",
                image_url: "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400",
                published_at: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
                source: "Public Health Department"
            },
        ];

        for (const n of news) {
            await db.runAsync("INSERT INTO news (title, description, image_url, published_at, source) VALUES (?, ?, ?, ?, ?)",
                [n.title, n.description, n.image_url, n.published_at, n.source]);
        }

        console.log("Migration completed successfully");
    } catch (error) {
        console.error("Error during migration:", error);
    }
};
