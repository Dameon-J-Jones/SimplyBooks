import pool from "../db.js";

//create account
export const createAccount = async (req, res) => {
  const {
    account_name,
    account_number,
    description,
    normal_side,
    category,
    subcategory,
    initial_balance,
    debit,
    credit,
    account_order,
    statement,
    comment,
    user_id
  } = req.body;
  console.log(req.body)
  try {
    //Validate required fields
    if (!account_name || !account_number || !category || !user_id) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    //Ensure account number is integer
    if (!Number.isInteger(account_number)) {
      return res.status(400).json({ message: "Account number must be a whole number" });
    }

    //Check if user exists
    const userCheck = await pool.query(`SELECT id FROM "User" WHERE id = $1`, [user_id]);
    if (userCheck.rows.length === 0) {
      return res.status(400).json({ message: "Invalid user_id" });
    }

    //Check for duplicates
    const duplicate = await pool.query(
      `SELECT * FROM "Account" WHERE "AccountName" = $1 OR "AccountNumber" = $2`,
      [account_name, account_number]
    );
    if (duplicate.rows.length > 0) {
      return res.status(400).json({ message: "Duplicate account name or number" });
    }

    //Auto-calculate balance
    const finalBalance = (initial_balance || 0) + (debit || 0) - (credit || 0);
 
    //Insert into Account table
    const result = await pool.query(
  `INSERT INTO "Account"
  ("AccountName", "AccountNumber", "Description", "NormalSide", "Category", "SubCategory",
   "InitialBalance", debit, credit, balance, "AccountOrder", "StatementType", "Comment", "IsActive", "CreatedBy")
  VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
  RETURNING *`,
  [
    account_name,
    account_number,
    description || "",
    normal_side || "",
    category,
    subcategory || "",
    initial_balance || 0,
    debit || 0,
    credit || 0,
    finalBalance,
    account_order || null,
    statement || "",   
    comment || "",
    true, // is active
    user_id
  ]
);

    const newAccount = result.rows[0];

    // Insert event log
  await pool.query(
  `INSERT INTO "EventLog"
   ("OldValues", "NewValues", "PerformedBy", "PerformedAt", "RecordID", "EventType", "TableName", "UserAgent", "IPAddress")
   VALUES ($1, $2, $3, NOW(), $4, $5, $6, $7, $8)`,
  [
    null,
    JSON.stringify(newAccount),
    user_id,
    newAccount.id,
    "CREATE",
    "Account",
    req.get("user-agent") || "",
    req.ip || ""
  ]
);

    res.status(201).json(newAccount);

  } catch (err) {
    console.error("CREATE ACCOUNT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
 
//search, filter and view ALL accounts
export const getAccounts = async (req, res) => {
  const { search, category, number, subcategory, amount } = req.query;

  try {
    let query = `
      SELECT
        id,
        "AccountName" AS account_name,
        "AccountNumber" AS account_number,
        "Category" AS category,
        "SubCategory" AS subcategory,
        balance
      FROM "Account"
      WHERE "IsActive" = true
    `;

    let values = [];

    if (search) {
      values.push(`%${search}%`);
      query += ` AND "AccountName" ILIKE $${values.length}`;
    }

    if (category) {
      values.push(category);
      query += ` AND "Category" = $${values.length}`;
    }

    if (number) {
      values.push(number);
      query += ` AND "AccountNumber" = $${values.length}`;
    }

    if (subcategory) {
      values.push(subcategory);
      query += ` AND "SubCategory" ILIKE $${values.length}`;
    }

    if (amount) {
      values.push(`%${amount}%`);
      query += ` AND CAST(balance AS TEXT) ILIKE $${values.length}`;
    }

    const result = await pool.query(query, values);

    res.json(result.rows);
  } catch (err) {
    console.error("getAccounts error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

//getAccountById
//return a SINGLE account by id
export const getAccountById = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        id,
        "AccountName" AS account_name,
        "AccountNumber" AS account_number,
        "Description" AS description,
        "NormalSide" AS normal_side,
        "Category" AS category,
        "SubCategory" AS subcategory,
        "InitialBalance" AS initial_balance,
        debit,
        credit,
        balance,
        "AccountOrder" AS account_order,
        "StatementType" AS statement,
        "Comment" AS comment,
        "IsActive" AS is_active
      FROM "Account"
      WHERE id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Account not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("getAccountById error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE an account by id
export const updateAccount = async (req, res) => {
  const { id } = req.params;
  const {
    account_name,
    account_number,
    description,
    normal_side,
    category,
    subcategory,
    initial_balance,
    debit,
    credit,
    account_order,
    statement,
    comment,
    user_id,
  } = req.body;

  try {
    const oldResult = await pool.query(
      `SELECT * FROM "Account" WHERE id = $1`,
      [id]
    );

    if (oldResult.rows.length === 0) {
      return res.status(404).json({ message: "Account not found" });
    }
 
    const oldAccount = oldResult.rows[0];

    const finalBalance =
      Number(initial_balance || 0) +
      Number(debit || 0) -
      Number(credit || 0);

    const result = await pool.query(
      `UPDATE "Account"
       SET "AccountName" = $1,
           "AccountNumber" = $2,
           "Description" = $3,
           "NormalSide" = $4,
           "Category" = $5,
           "SubCategory" = $6,
           "InitialBalance" = $7,
           debit = $8,
           credit = $9,
           balance = $10,
           "AccountOrder" = $11,
           "StatementType" = $12,
           "Comment" = $13
       WHERE id = $14
       RETURNING *`,
      [
        account_name,
        Number(account_number),
        description || "",
        normal_side || "Debit",
        category,
        subcategory || "",
        Number(initial_balance || 0),
        Number(debit || 0),
        Number(credit || 0),
        finalBalance,
        account_order === "" ? null : Number(account_order),
        statement || "",
        comment || "",
        id,
      ]
    );

    const updatedAccount = result.rows[0];

    await pool.query(
      `INSERT INTO "EventLog"
       ("OldValues", "NewValues", "PerformedBy", "PerformedAt", "RecordID", "EventType", "TableName", "UserAgent", "IPAddress")
       VALUES ($1, $2, $3, NOW(), $4, $5, $6, $7, $8)`,
      [
        JSON.stringify(oldAccount),
        JSON.stringify(updatedAccount),
        user_id,
        id,
        "UPDATE",
        "Account",
        req.get("user-agent") || "",
        req.ip || "",
      ]
    );

    res.json(updatedAccount);
  } catch (err) {
    console.error("UPDATE ACCOUNT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// deactivate an account
export const deactivateAccount = async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.body;

  try {
    const result = await pool.query(
      `SELECT * FROM "Account" WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Account not found" });
    }

    const account = result.rows[0];

    if (Number(account.balance) > 0) {
      return res.status(400).json({
        message: "Cannot deactivate account with balance > 0",
      });
    }

    const updateResult = await pool.query(
      `UPDATE "Account"
       SET "IsActive" = false
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    const deactivatedAccount = updateResult.rows[0];

    await pool.query(
  `INSERT INTO "EventLog"
   ("OldValues", "NewValues", "PerformedBy", "PerformedAt", "RecordID", "EventType", "TableName", "UserAgent", "IPAddress")
   VALUES ($1, $2, $3, NOW(), $4, $5, $6, $7, $8)`,
  [
    JSON.stringify(account),
    JSON.stringify(deactivatedAccount),
    user_id,
    id,
    "UPDATE",
    "Account",
    req.get("user-agent") || "",
    req.ip || "",
  ]
);

    res.json({ message: "Account deactivated" });
  } catch (err) {
    console.error("DEACTIVATE ACCOUNT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};