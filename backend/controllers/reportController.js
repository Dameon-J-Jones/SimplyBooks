import pool from "../db.js";

export const getTrialBalance = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                a.id,
                a."AccountName",
                SUM(l."Debit") as total_debit,
                SUM(l."Credit") as total_credit
            FROM "JournalEntryLine" l
            JOIN "JournalEntry" j ON l."JournalEntryID = j.id
            JOIN "Account" a on l."AccountID" = a.id
            WHERE j.status = 'APPROVED'
            GROUP BY a.id, a."AccountName"
            ORDER BY a."AccountName"
        `);
        
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error generating trial balance" });
    }
};

export const getIncomeStatement = async (req, res) => {
        try {
        const result = await pool.query(`
            SELECT
                a."AccountName",
                a."Category",
                SUM(l."Debit" - l."Credit") as amount
            FROM "JournalEntryLine" l
            JOIN "JournalEntry" j ON l."JournalEntryID" = j.id
            JOIN "Account" a ON l."AccountID" = a.id
                WHERE j.status = 'APPROVED'
                AND a."Category" IN ('Revenue', 'Expense')
            GROUP BY a."AccountName", a."Category"
        `);
        
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error generating income statement" });
    }
};

export const getBalanceSheet = async (req, res) => {
        try {
        const result = await pool.query(`
            SELECT
                a."AccountName",
                a."Category",
                SUM(l."Debit" - l."Credit") as balance
            FROM "JournalEntryLine" l
            JOIN "JournalEntry" j on l."JournalEntryID" = j.id
            JOIN "Account" a ON l."AccountID" = a.id
            WHERE j.status = 'APPROVED'
            AND a."Category" IN ('Asset', 'Liability', 'Equity')
            GROUP BY a."AccountName", a."Category"
        `);
        
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error generating balance sheet" });
    }
};

export const getRetainedEarnings = async (req, res) => {
        try {
        const result = await pool.query(`
            SELECT
                SUM(l."Credit" - l."Debit) as retained_earnings
            FROM "JournalEntryLine" l
            JOIN "JournalEntry" j ON l."JournalEntryID" = j.id
            JOIN "Account" a ON l."AccountID" = a.id
            WHERE j.status = 'APPROVED'
            AND a."Category" = 'Revenue'
        `);
        
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error generating balance sheet" });
    }
};
