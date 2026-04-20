import pool from "../db.js";

export const getDashboardRatios = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT "Category", SUM(balance) AS total
      FROM "Account"
      WHERE "IsActive" = true
      GROUP BY "Category"
    `);

    const data = result.rows;

    const getTotal = (category) => {
      const item = data.find(
        (d) => d.Category === category || d.category === category
      );
      return item ? parseFloat(item.total) : 0;
    };

    const assets = getTotal("Asset");
    const liabilities = getTotal("Liability") * -1;
    const equity = getTotal("Equity");
    const revenue = getTotal("Revenue");
    const expenses = getTotal("Expense") * -1;

    const netIncome = revenue - expenses;

    const currentRatio = liabilities !== 0 ? assets / liabilities : 0;
    const debtRatio = assets !== 0 ? liabilities / assets : 0;
    const debtToEquity = equity !== 0 ? liabilities / equity : 0;
    const profitMargin = revenue !== 0 ? netIncome / revenue : 0;

    const getStatus = (value, good, warn) => {
      if (value >= good) return "green";
      if (value >= warn) return "yellow";
      return "red";
    };

    res.json({
      currentRatio: {
        value: currentRatio.toFixed(2),
        status: getStatus(currentRatio, 2, 1),
      },
      debtRatio: {
        value: debtRatio.toFixed(2),
        status: getStatus(1 - debtRatio, 0.5, 0.25),
      },
      debtToEquity: {
        value: debtToEquity.toFixed(2),
        status: getStatus(1 - debtToEquity, 1, 0.5),
      },
      profitMargin: {
        value: profitMargin.toFixed(2),
        status: getStatus(profitMargin, 0.2, 0.1),
      },
      netIncome: netIncome.toFixed(2),
    });
  } catch (err) {
    console.error("Dashboard ratio error:", err);
    res.status(500).json({ message: "Error calculating ratios" });
  }
};