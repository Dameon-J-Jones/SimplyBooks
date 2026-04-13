import pool from "../db.js";

export const createNotification = async (req, res) => {
    const {user_id, message} = req.body;

    await pool.query(
        `INSERT INTO "Notification" (user_id, message)
        VALUES ($1, $2)`,
        [user_id, message]
    );

    res.json({ message: "Notification created" });
};

export const getNotifications = async (req, res) => {
    const { user_id } = req.params;

    const result = await pool.query(
        `SELECT * FROM "Notification
        WHERE user_id = $1`,
        [user_id]
    );

    res.json(result.rows);
};