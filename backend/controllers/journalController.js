import pool from "../db.js";

const logEvent = async (action, beforeData, afterData, userId) => {
  try {
    await pool.query(
      `INSERT INTO "EventLog" (action, before_data, after_data, user_id)
       VALUES ($1, $2, $3, $4)`,
      [
        action,
        beforeData ? JSON.stringify(beforeData) : null,
        afterData ? JSON.stringify(afterData) : null,
        userId,
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
    // 1. Insert journal entry
    const result = await pool.query(
      `INSERT INTO "JournalEntry" (EntryDate, Description, ReferenceNumber, CreatedAt, CreatedBy)
       VALUES ($1, $2, $3, NOW(), $4)
       RETURNING *`,
      [entryDate, description, referenceNumber, createdBy]
    );

    const journalEntry = result.rows[0];

    // 2. Insert lines
    for (const line of lines) {
      await pool.query(
        `INSERT INTO "JournalEntryLine" (JournalEntryID, AccountID, Debit, Credit)
         VALUES ($1, $2, $3, $4)`,
        [journalEntry.id, line.accountId, line.debit || 0, line.credit || 0]
      );
    }

    // 3. Log event
    await logEvent("CREATE", null, { journalEntry, lines }, createdBy);

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
  const { userId } = req.body; // manager id

  try {
    const prevResult = await pool.query(`SELECT * FROM "JournalEntry" WHERE id=$1`, [id]);
    const prevData = prevResult.rows[0];

    await pool.query(
      `UPDATE "JournalEntry" SET status='APPROVED', approvedAt=NOW() WHERE id=$1`,
      [id]
    );

    const afterResult = await pool.query(`SELECT * FROM "JournalEntry" WHERE id=$1`, [id]);

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
    const prevResult = await pool.query(`SELECT * FROM "JournalEntry" WHERE id=$1`, [id]);
    const prevData = prevResult.rows[0];

    await pool.query(
      `UPDATE "JournalEntry" SET status='REJECTED', rejectReason=$1, rejectedAt=NOW() WHERE id=$2`,
      [reason, id]
    );

    const afterResult = await pool.query(`SELECT * FROM "JournalEntry" WHERE id=$1`, [id]);

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
      `SELECT l.*, a.account_name 
       FROM "JournalEntryLine" l
       JOIN "Account" a ON l."AccountID"=a.id
       WHERE l."JournalEntryID"=$1`,
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
      `SELECT l.*, j."EntryDate", j."ReferenceNumber", j.Description
       FROM "JournalEntryLine" l
       JOIN "JournalEntry" j ON l."JournalEntryID"=j.id
       WHERE l."AccountID"=$1
       ORDER BY j."EntryDate" ASC`,
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