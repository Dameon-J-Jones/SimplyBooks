import pool from "../db.js";

const getErrorMessage = async (code) => {
  const result = await pool.query(
    `SELECT message FROM "ErrorMessage" WHERE code = $1`,
    [code]
  );

  return result.rows[0]?.message || "Unknown error";
};