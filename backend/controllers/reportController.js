import pool from "../db.js";
import {sendEmail} from "../sendEmails.js"

export const getTrialBalance = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        a.id,
        a."AccountName" AS account_name,
        COALESCE(SUM(l."Debit"), 0) AS total_debit,
        COALESCE(SUM(l."Credit"), 0) AS total_credit
      FROM "JournalEntryLine" l
      JOIN "JournalEntry" j ON l."JournalEntryID" = j.id
      JOIN "Account" a ON l."AccountID" = a.id
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
        a."AccountName" AS account_name,
        a."Category" AS category,
        CASE
          WHEN a."Category" = 'Revenue' THEN COALESCE(SUM(l."Credit"), 0) - COALESCE(SUM(l."Debit"), 0)
          WHEN a."Category" = 'Expense' THEN COALESCE(SUM(l."Debit"), 0) - COALESCE(SUM(l."Credit"), 0)
          ELSE 0
        END AS amount
      FROM "JournalEntryLine" l
      JOIN "JournalEntry" j ON l."JournalEntryID" = j.id
      JOIN "Account" a ON l."AccountID" = a.id
      WHERE j.status = 'APPROVED'
        AND a."Category" IN ('Revenue', 'Expense')
      GROUP BY a."AccountName", a."Category"
      ORDER BY a."Category", a."AccountName"
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
        a."AccountName" AS account_name,
        a."Category" AS category,
        CASE
          WHEN a."Category" = 'Asset' THEN COALESCE(SUM(l."Debit"), 0) - COALESCE(SUM(l."Credit"), 0)
          WHEN a."Category" IN ('Liability', 'Equity') THEN COALESCE(SUM(l."Credit"), 0) - COALESCE(SUM(l."Debit"), 0)
          ELSE 0
        END AS balance
      FROM "JournalEntryLine" l
      JOIN "JournalEntry" j ON l."JournalEntryID" = j.id
      JOIN "Account" a ON l."AccountID" = a.id
      WHERE j.status = 'APPROVED'
        AND a."Category" IN ('Asset', 'Liability', 'Equity')
      GROUP BY a."AccountName", a."Category"
      ORDER BY a."Category", a."AccountName"
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
        COALESCE(SUM(
          CASE
            WHEN a."Category" = 'Revenue' THEN l."Credit" - l."Debit"
            WHEN a."Category" = 'Expense' THEN l."Debit" - l."Credit"
            ELSE 0
          END
        ), 0) AS retained_earnings
      FROM "JournalEntryLine" l
      JOIN "JournalEntry" j ON l."JournalEntryID" = j.id
      JOIN "Account" a ON l."AccountID" = a.id
      WHERE j.status = 'APPROVED'
        AND a."Category" IN ('Revenue', 'Expense')
    `);

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error generating retained earnings" });
  }
};

export const emailReport = async (req, res) => {
  try {
    const { to, reportType, filters, reportData } = req.body;

    if (!to) {
      return res.status(400).json({ message: "Email address is required" });
    }

  
    const html = buildEmailReportHtml(reportType, filters, reportData);

    await sendEmail({
    to,
    subject: `Financial Report - ${reportType}`,
    text: `Financial report (${reportType}) generated.`,
    html,
    });
    

    res.json({ message: "Email sent successfully" });
  } catch (err) {
    console.error("Email error:", err);
    res.status(500).json({ message: "Failed to send email" });
  }
};


//helpers for email 
const formatMoney = (value) => {
  const num = Number(value || 0);
  if (isNaN(num)) return "0.00";
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const buildEmailReportHtml = (reportType, filters, reportData) => {
  const generatedAt = new Date().toLocaleString();

  const filterText = `
    <p><strong>Exact Date:</strong> ${filters?.exactDate || "N/A"}</p>
    <p><strong>Start Date:</strong> ${filters?.startDate || "N/A"}</p>
    <p><strong>End Date:</strong> ${filters?.endDate || "N/A"}</p>
  `;

  let content = "";

  if (reportType === "trial-balance" && Array.isArray(reportData)) {
    const totalDebit = reportData.reduce(
      (sum, row) => sum + Number(row.total_debit || 0),
      0
    );
    const totalCredit = reportData.reduce(
      (sum, row) => sum + Number(row.total_credit || 0),
      0
    );

    content = `
      <h2>Trial Balance</h2>
      <table>
        <thead>
          <tr>
            <th>Account</th>
            <th>Debit</th>
            <th>Credit</th>
          </tr>
        </thead>
        <tbody>
          ${reportData
            .map(
              (row) => `
                <tr>
                  <td>${row.account_name || "N/A"}</td>
                  <td>$${formatMoney(row.total_debit)}</td>
                  <td>$${formatMoney(row.total_credit)}</td>
                </tr>
              `
            )
            .join("")}
          <tr>
            <td><strong>Total</strong></td>
            <td><strong>$${formatMoney(totalDebit)}</strong></td>
            <td><strong>$${formatMoney(totalCredit)}</strong></td>
          </tr>
        </tbody>
      </table>
    `;
  }

  if (reportType === "income-statement" && Array.isArray(reportData)) {
    const revenueRows = reportData.filter((row) => row.category === "Revenue");
    const expenseRows = reportData.filter((row) => row.category === "Expense");

    const totalRevenue = revenueRows.reduce(
      (sum, row) => sum + Number(row.amount || 0),
      0
    );
    const totalExpense = expenseRows.reduce(
      (sum, row) => sum + Number(row.amount || 0),
      0
    );

    content = `
      <h2>Income Statement</h2>

      <h3>Revenue</h3>
      <table>
        <thead>
          <tr>
            <th>Account</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          ${revenueRows
            .map(
              (row) => `
                <tr>
                  <td>${row.account_name || "N/A"}</td>
                  <td>$${formatMoney(row.amount)}</td>
                </tr>
              `
            )
            .join("")}
          <tr>
            <td><strong>Total Revenue</strong></td>
            <td><strong>$${formatMoney(totalRevenue)}</strong></td>
          </tr>
        </tbody>
      </table>

      <h3>Expenses</h3>
      <table>
        <thead>
          <tr>
            <th>Account</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          ${expenseRows
            .map(
              (row) => `
                <tr>
                  <td>${row.account_name || "N/A"}</td>
                  <td>$${formatMoney(row.amount)}</td>
                </tr>
              `
            )
            .join("")}
          <tr>
            <td><strong>Total Expense</strong></td>
            <td><strong>$${formatMoney(totalExpense)}</strong></td>
          </tr>
          <tr>
            <td><strong>Net Income</strong></td>
            <td><strong>$${formatMoney(totalRevenue - totalExpense)}</strong></td>
          </tr>
        </tbody>
      </table>
    `;
  }

  if (reportType === "balance-sheet" && Array.isArray(reportData)) {
    const buildSection = (title, rows, totalLabel) => {
      const total = rows.reduce((sum, row) => sum + Number(row.balance || 0), 0);

      return `
        <h3>${title}</h3>
        <table>
          <thead>
            <tr>
              <th>Account</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            ${rows
              .map(
                (row) => `
                  <tr>
                    <td>${row.account_name || "N/A"}</td>
                    <td>$${formatMoney(row.balance)}</td>
                  </tr>
                `
              )
              .join("")}
            <tr>
              <td><strong>${totalLabel}</strong></td>
              <td><strong>$${formatMoney(total)}</strong></td>
            </tr>
          </tbody>
        </table>
      `;
    };

    const assetRows = reportData.filter((row) => row.category === "Asset");
    const liabilityRows = reportData.filter((row) => row.category === "Liability");
    const equityRows = reportData.filter((row) => row.category === "Equity");

    content = `
      <h2>Balance Sheet</h2>
      ${buildSection("Assets", assetRows, "Total Assets")}
      ${buildSection("Liabilities", liabilityRows, "Total Liabilities")}
      ${buildSection("Equity", equityRows, "Total Equity")}
    `;
  }

  if (reportType === "retained-earnings" && reportData) {
    content = `
      <h2>Retained Earnings Statement</h2>
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Retained Earnings</td>
            <td>$${formatMoney(reportData.retained_earnings)}</td>
          </tr>
        </tbody>
      </table>
    `;
  }

  return `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            color: #222;
            line-height: 1.4;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            border: 1px solid #ccc;
            padding: 8px;
            text-align: left;
          }
          th {
            background: #f3f3f3;
          }
        </style>
      </head>
      <body>
        <h1>Financial Report</h1>
        <p><strong>Report Type:</strong> ${reportType}</p>
        <p><strong>Generated:</strong> ${generatedAt}</p>
        <h3>Filters</h3>
        ${filterText}
        ${content}
      </body>
    </html>
  `;
};