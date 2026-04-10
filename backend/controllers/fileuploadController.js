import pool from "../db.js";

export const uploadFile = async (req, res) => {
    try {
        const { id } = req.params;

        await pool.query(
            `UPDATE "JournalEntry"
            SET attachment = $1
            WHERE id = $2`,
            [req.file.filename, id]
        );

        res.json({ message : "File uploaded" });
    } catch (err) {
        res.status(500).json({ message : "Upload failed" });
    }
};

//TODO: update db to add attachment field to journalentry