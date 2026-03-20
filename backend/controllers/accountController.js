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
      `SELECT * FROM "Account" WHERE account_name = $1 OR account_number = $2`,
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
      (account_name, account_number, description, normal_side, category, subcategory,
       initial_balance, debit, credit, balance, user_id, account_order, statement, comment, is_active)
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
        user_id,
        account_order || null,
        statement || "",
        comment || "",
        true // is_active
      ]
    );

    const newAccount = result.rows[0];

    // Insert event log
    await pool.query(
      `INSERT INTO "EventLog" (action, after_data, user_id)
       VALUES ($1, $2, $3)`,
      ["CREATE", newAccount, user_id]
    );

    res.status(201).json(newAccount);

  } catch (err) {
    console.error("CREATE ACCOUNT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

//search, filter and view ALL accounts
export const getAccounts = async (req, res) => {
  const { search, category, number } = req.query;

  try {
    let query = `SELECT * FROM "Account" WHERE is_active = true`;
    let values = [];

    if (search) {
      values.push(`%${search}%`);
      query += ` AND account_name ILIKE $${values.length}`;
    }

    if (category) {
      values.push(category);
      query += ` AND category = $${values.length}`;
    }

    if (number) {
      values.push(number);
      query += ` AND account_number = $${values.length}`;
    }

    const result = await pool.query(query, values);
    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

//return a SINGLE account by id
export const getAccountById = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM "Account" WHERE id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Account not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

//UPDATE an account by id
export const updateAccount = async (req, res) => {
  const { id } = req.params;

  try {
    // Get old data
    const oldResult = await pool.query(
      `SELECT * FROM "Account" WHERE id = $1`,
      [id]
    );

    const oldAccount = oldResult.rows[0];

    //Update
    const result = await pool.query(
      `UPDATE "Account"
       SET account_name = $1,
           category = $2
       WHERE id = $3
       RETURNING *`,
      [req.body.account_name, req.body.category, id]
    );

    const updatedAccount = result.rows[0];

    //Log event
    await pool.query(
      `INSERT INTO "EventLog" (action, before_data, after_data, user_id)
       VALUES ($1,$2,$3,$4)`,
      ["UPDATE", oldAccount, updatedAccount, req.body.user_id]
    );

    res.json(updatedAccount);

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

//deactivate an account
export const deactivateAccount = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM "Account" WHERE id = $1`,
      [id]
    );

    const account = result.rows[0];

    if (account.balance > 0) {
      return res.status(400).json({
        message: "Cannot deactivate account with balance > 0"
      });
    }

    await pool.query(
      `UPDATE "Account" SET is_active = false WHERE id = $1`,
      [id]
    );

    res.json({ message: "Account deactivated" });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};