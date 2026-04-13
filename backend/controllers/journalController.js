import pool from "../db.js";
import { sendEmail } from "../sendEmails.js";


const logEvent = async (eventType, beforeData, afterData, userId, recordId = null) => {
  try {
    await pool.query(
      `INSERT INTO "EventLog"
       ("EventType", "OldValues", "NewValues", "PerformedBy", "RecordID", "TableName")
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        eventType,
        beforeData ? JSON.stringify(beforeData) : null,
        afterData ? JSON.stringify(afterData) : null,
        userId,
        recordId,
        "JournalEntry",
      ]
    );
  } catch (err) {
    console.error("Error logging event:", err);
  }
};
 
// Create a journal entry (draft) 
export const createJournalEntry = async (req, res) => {
  const { entryDate, description, referenceNumber, createdBy, lines } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO "JournalEntry"
       ("EntryDate", "Description", "ReferenceNumber", "CreatedAt", "CreatedBy", status, type)
       VALUES ($1, $2, $3, NOW(), $4, 'PENDING', 'GENERAL')
       RETURNING *`,
      [entryDate, description, referenceNumber, createdBy]
    );

    const journalEntry = result.rows[0];

    for (const line of lines) {
      await pool.query(
        `INSERT INTO "JournalEntryLine" ("JournalEntryID", "AccountID", "Debit", "Credit")
         VALUES ($1, $2, $3, $4)`,
        [journalEntry.id, line.accountId, line.debit || 0, line.credit || 0]
      );
    }

    await logEvent("CREATE", null, { journalEntry, lines }, createdBy);

    await sendEmail({
      to: "boomtownboss11@gmail.com", //need to do an manager or all of them
      subject: "New Journal Entry has been created",
      text: `Hello Manager, a new Journal entry was just created, please approve or deny on the app!`,
      html: `
        <h2>Account Created</h2>
        <p>Journal entry was created.</p>
        <a href="http://localhost:5173/journal-list">CLICK HERE TO APPORVE OR DENY USER</a>
      `,
    });


    res.status(201).json({ journalEntry });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating journal entry" });
  }
};

// Submit journal entry (set to PENDING)
export const submitJournalEntry = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body; // who is submitting

  try {
    // Fetch previous state
    const prevResult = await pool.query(`SELECT * FROM "JournalEntry" WHERE id=$1`, [id]);
    const prevData = prevResult.rows[0];

    await pool.query(
      `UPDATE "JournalEntry" SET status='PENDING' WHERE id=$1`,
      [id]
    );

    const afterResult = await pool.query(`SELECT * FROM "JournalEntry" WHERE id=$1`, [id]);

    await logEvent("SUBMIT", prevData, afterResult.rows[0], userId);

    res.json({ message: "Journal entry submitted for approval" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error submitting journal entry" });
  }
};

// Approve journal entry
export const approveJournalEntry = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  try {
    const prevResult = await pool.query(
      `SELECT * FROM "JournalEntry" WHERE id = $1`,
      [id]
    );
    const prevData = prevResult.rows[0];

    await pool.query(
      `UPDATE "JournalEntry"
       SET status = 'APPROVED', "approvedAt" = NOW()
       WHERE id = $1`,
      [id]
    );

    const afterResult = await pool.query(
      `SELECT * FROM "JournalEntry" WHERE id = $1`,
      [id]
    );

    await logEvent("APPROVE", prevData, afterResult.rows[0], userId);

    res.json({ message: "Journal entry approved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error approving journal entry" });
  }
};

// Reject journal entry
export const rejectJournalEntry = async (req, res) => {
  const { id } = req.params;
  const { userId, reason } = req.body;

  try {
    const prevResult = await pool.query(
      `SELECT * FROM "JournalEntry" WHERE id = $1`,
      [id]
    );
    const prevData = prevResult.rows[0];

    await pool.query(
      `UPDATE "JournalEntry"
       SET status = 'REJECTED',
           "rejectReason" = $1,
           "rejectedAt" = NOW()
       WHERE id = $2`,
      [reason, id]
    );

    const afterResult = await pool.query(
      `SELECT * FROM "JournalEntry" WHERE id = $1`,
      [id]
    );

    await logEvent("REJECT", prevData, afterResult.rows[0], userId);

    res.json({ message: "Journal entry rejected" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error rejecting journal entry" });
  }
};

// Get all journal entries (filter by status/date)
export const getJournalEntries = async (req, res) => {
  const { status, startDate, endDate, type } = req.query;

  let query = `SELECT * FROM "JournalEntry" WHERE 1=1`;
  const params = [];

  if (status) {
    params.push(status);
    query += ` AND status=$${params.length}`;
  }
  if (startDate) {
    params.push(startDate);
    query += ` AND "EntryDate">=$${params.length}`;
  }
  if (endDate) {
    params.push(endDate);
    query += ` AND "EntryDate"<=$${params.length}`;
  }

  //for filtering by 'normal' or 'adjusting'
  if (type) {
    params.push(type);
    query += `AND type=$${params.length}`;
  }

  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching journal entries" });
  }
};

// Get single journal entry with lines
export const getJournalEntryById = async (req, res) => {
  const { id } = req.params;

  try {
    const entryResult = await pool.query(
      `SELECT * FROM "JournalEntry" WHERE id=$1`,
      [id]
    );

      const linesResult = await pool.query(
    `SELECT l.*, a."AccountName" AS account_name
      FROM "JournalEntryLine" l
      JOIN "Account" a ON l."AccountID" = a.id
      WHERE l."JournalEntryID" = $1`,
    [id]
    );

    res.json({ journalEntry: entryResult.rows[0], lines: linesResult.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching journal entry" });
  }
}; 

// Ledger for account
export const getLedgerByAccountId = async (req, res) => {
  const { accountId } = req.params;

  try {
    const result = await pool.query(
      `SELECT 
         l.*,
         j.id AS journal_entry_id,
         j."EntryDate",
         j."ReferenceNumber",
         j."Description"
       FROM "JournalEntryLine" l
       JOIN "JournalEntry" j ON l."JournalEntryID" = j.id
       WHERE l."AccountID" = $1
         AND j.status = 'APPROVED'
       ORDER BY j."EntryDate" ASC, l.id ASC`,
      [accountId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching ledger" });
  }
};

//upload file attachment to JournalEntry
//TODO: update db to add attachment field to journalentry
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


//get event logs
export const getEventLogs = async (req, res) => {
  const { eventType, performedBy, recordId, date } = req.query;

  let query = `
    SELECT *
    FROM "EventLog"
    WHERE 1=1
  `;
  const params = [];

  if (eventType) {
    params.push(`%${eventType}%`);
    query += ` AND "EventType" ILIKE $${params.length}`;
  }

  if (performedBy) {
    params.push(performedBy);
    query += ` AND CAST("PerformedBy" AS TEXT) ILIKE $${params.length}`;
  }

  if (recordId) {
    params.push(recordId);
    query += ` AND CAST("RecordID" AS TEXT) ILIKE $${params.length}`;
  }

  if (date) {
    params.push(date);
    query += ` AND DATE("PerformedAt") = $${params.length}`;
  }

  query += ` ORDER BY "PerformedAt" DESC`;

  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching event logs:", err);
    res.status(500).json({ message: "Error fetching event logs" });
  }
};