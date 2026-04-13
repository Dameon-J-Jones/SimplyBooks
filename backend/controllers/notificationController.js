import pool from "../db.js";

export const createNotification = async (req, res) => {
    const { user_id, message, journalEntryID } = req.body;

    try {
        await pool.query(
            `INSERT INTO "Notification" 
             ("userID", message, "journalEntryID")
             VALUES ($1, $2, $3)`,
            [user_id, message, journalEntryID]
        );

        res.json({ message: "Notification created" });
    } catch (err) {
        console.error("Notification error:", err);
        res.status(500).json({ message: "Failed to create notification" });
    }
};

export const getNotifications = async (req, res) => {
    
    const result = await pool.query(
        `SELECT * FROM "Notification"` 
    );

    res.json(result.rows);
};

//TODO: getter method and make db table