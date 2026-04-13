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
    await client.query("BEGIN");

    const journalResult = await client.query(
      `INSERT INTO "JournalEntry"
       ("EntryDate", "Description", "ReferenceNumber", "CreatedAt", "CreatedBy", status, type)
       VALUES ($1, $2, $3, NOW(), $4, 'PENDING', 'GENERAL')
       RETURNING *`,
      [entryDate, description, referenceNumber, createdBy]
    );

    const journalEntryID = journalResult.rows[0].id;

    for (const line of lines) {
            await client.query(
        `INSERT INTO "JournalEntryLine"
        ("JournalEntryID", "AccountID", "Debit", "Credit")
        VALUES ($1, $2, $3, $4)`,
        [journalEntryID, line.accountId, line.debit, line.credit]
      );
    }

    await client.query("COMMIT");

    res.status(201).json({
      message: "Journal entry created successfully",
      journalEntryID,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Create journal error:", err);
    res.status(500).json({ message: "Failed to create journal entry" });
  } finally {
    client.release();
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

    if (!prevData) {
      return res.status(404).json({ message: "Journal entry not found" });
    }

    await pool.query(
      `UPDATE "JournalEntry"
       SET status = 'APPROVED', "approvedAt" = NOW()
       WHERE id = $1`,
      [id]
    );

    await pool.query(
      `DELETE FROM "Notification"
       WHERE "journalEntryID" = $1`,
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

    if (!prevData) {
      return res.status(404).json({ message: "Journal entry not found" });
    }

    await pool.query(
      `UPDATE "JournalEntry"
       SET status = 'REJECTED',
           "rejectReason" = $1,
           "rejectedAt" = NOW()
       WHERE id = $2`,
      [reason, id]
    );

    await pool.query(
      `DELETE FROM "Notification"
       WHERE "journalEntryID" = $1`,
      [id]
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
    query += ` AND type=$${params.length}`;
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

export const editJournalEntry = async (req, res) => {
  const { id } = req.params;
  const { entryDate, description, referenceNumber, lines, userId } = req.body;

  try {
    //Get existing entry
    const prevResult = await pool.query(
      `SELECT * FROM "JournalEntry" WHERE id = $1`,
      [id]
    );

    const prevEntry = prevResult.rows[0];

    if (!prevEntry) {
      return res.status(404).json({ message: "Journal entry not found" });
    }

    //Prevent editing approved/rejected
    if (prevEntry.status === "APPROVED" || prevEntry.status === "REJECTED") {
      return res.status(400).json({ message: "Cannot edit finalized journal entry" });
    }

    //Validate debits = credits
    const totalDebits = lines.reduce((sum, l) => sum + (l.debit || 0), 0);
    const totalCredits = lines.reduce((sum, l) => sum + (l.credit || 0), 0);

    if (totalDebits !== totalCredits) {
      return res.status(400).json({ message: "Debits must equal credits" });
    }

    //Update main journal entry
    await pool.query(
      `UPDATE "JournalEntry"
       SET "EntryDate" = $1,
           "Description" = $2,
           "ReferenceNumber" = $3
       WHERE id = $4`,
      [entryDate, description, referenceNumber, id]
    );

    //Delete old lines
    await pool.query(
      `DELETE FROM "JournalEntryLine" WHERE "JournalEntryID" = $1`,
      [id]
    );

    //Insert new lines
    for (const line of lines) {
      await pool.query(
        `INSERT INTO "JournalEntryLine"
         ("JournalEntryID", "AccountID", "Debit", "Credit")
         VALUES ($1, $2, $3, $4)`,
        [id, line.accountId, line.debit || 0, line.credit || 0]
      );
    }

    //Get updated entry + lines
    const updatedEntry = await pool.query(
      `SELECT * FROM "JournalEntry" WHERE id = $1`,
      [id]
    );

    const updatedLines = await pool.query(
      `SELECT * FROM "JournalEntryLine" WHERE "JournalEntryID" = $1`,
      [id]
    );

    //Log event
    await logEvent(
      "UPDATE",
      prevEntry,
      { journalEntry: updatedEntry.rows[0], lines: updatedLines.rows },
      userId,
      id
    );

    res.json({
      message: "Journal entry updated",
      journalEntry: updatedEntry.rows[0],
      lines: updatedLines.rows,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating journal entry" });
  }
};