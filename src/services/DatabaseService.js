import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("disaster_app_v3.db");

/* -----------------------------------------------------
   🔧 REQUIRED HELPERS (Missing in your original code)
----------------------------------------------------- */

// Runs INSERT / UPDATE / DELETE
export const runAsync = (sql, params = []) => {
  return db.runAsync(sql, params);
};

// Returns all rows from a SELECT
export const getAllAsync = (sql, params = []) => {
  return db.getAllAsync(sql, params);
};

// Returns FIRST row from a SELECT
export const getFirstAsync = async (sql, params = []) => {
  const rows = await db.getAllAsync(sql, params);
  return rows?.length ? rows[0] : null;
};


//INIT DB 
export const initDatabase = async () => {
  try {
    await db.execAsync(`
      PRAGMA journal_mode = DELETE;
      
      CREATE TABLE IF NOT EXISTS hazards (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        icon TEXT,
        description TEXT
      );

      CREATE TABLE IF NOT EXISTS guides (
        id TEXT PRIMARY KEY NOT NULL,
        hazard_id TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        step_order INTEGER,
        FOREIGN KEY (hazard_id) REFERENCES hazards (id)
      );

      CREATE TABLE IF NOT EXISTS checklists (
        id TEXT PRIMARY KEY NOT NULL,
        guide_id TEXT NOT NULL,
        item_text TEXT NOT NULL,
        is_completed INTEGER DEFAULT 0,
        FOREIGN KEY (guide_id) REFERENCES guides (id)
      );

      CREATE TABLE IF NOT EXISTS quizzes (
        id TEXT PRIMARY KEY NOT NULL,
        hazard_id TEXT NOT NULL,
        question TEXT NOT NULL,
        options TEXT NOT NULL,
        correct_answer INTEGER NOT NULL,
        FOREIGN KEY (hazard_id) REFERENCES hazards (id)
      );

      CREATE TABLE IF NOT EXISTS user_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        quiz_id TEXT NOT NULL,
        score INTEGER NOT NULL,
        completed_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        latitude REAL,
        longitude REAL,
        description TEXT,
        timestamp TEXT NOT NULL,
        photo_uri TEXT,
        sync_status TEXT DEFAULT 'pending',
        sync_attempts INTEGER DEFAULT 0,
        last_sync_attempt TEXT,
        server_id TEXT,
        photo_url TEXT,
        synced INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS disaster_cases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        latitude REAL,
        longitude REAL,
        description TEXT,
        timestamp TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE,
        registered_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS news (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        published_at TEXT NOT NULL,
        source TEXT,
        url TEXT
      );
    `);

    // Safely add url column to existing tables (fails gracefully if it already exists)
    await db.execAsync("ALTER TABLE news ADD COLUMN url TEXT;").catch(() => {});


    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
};

/* -----------------------------------------------------
   EXPORT DB INSTANCE (same as before)
----------------------------------------------------- */
export const getDB = () => {
  return {
    ...db,
    runAsync,
    getAllAsync,
    getFirstAsync,
  };
};
