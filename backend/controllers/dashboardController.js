import pool from "../db.js";

export const getDashboardRatios = async (req, res) => {
    try {
        //Get totals by category
        const result = await pool.query(`
            SELECT "Category", SUM(balance) as total
            FROM "Account"
            WHERE "isActive" = true
            GROUP BY "Category"
        `);

        const data = result.rows;

        //Helper to get totals without throwing errors
        const getTotal = (category) => parseFloat(data.find(d => d.category === category)?.total || 0);

        const assets = getTotal("Asset");
        const liabilities = getTotal("Liability");
        const equity = getTotal("Equity");
        const revenue = getTotal("Revenue");
        const expenses = getTotal("Expense");

        const netIncome = revenue - expenses;

        //safeguards against division by zero
        const currentRatio = liabilities !== 0 ? assets / liabilities : 0;
        const debtRatio = assets !== 0 ? liabilities / assets : 0;
        const debtToEquity = assets !== 0 ? liabilities / equity : 0;
        const profitMargin = revenue !== 0 ? netIncome / revenue: 0;

        //FOR FRONT-END: helper for color-coding
        const getStatus = (value, good, warn) => {
            if (value >= good) return "green";
            if (value >= warn) return "yellow";
            return "red";
        };

        res.json({
            currentRatio: {
                value: currentRatio.toFixed(2),
                status: getStatus(currentRatio, 2, 1)
            },

            debtRatio: {
                value: debtRatio.toFixed(2),
                status: getStatus(1 - debtRatio, 0.5, 0.25)
            },

            debtToEquity: {
                value: debtToEquity.toFixed(2),
                status: getStatus(1 - debtToEquity, 1, 0.5)
            },

            profitMargin: {
                value: profitMargin.toFixed(2),
                status: getStatus(profitMargin, 0.2, 0.1)
            },

            netIncome: netIncome.toFixed(2)
        });
    } catch (err) {
        res.status(500).json({ message: "Error calculating ratios"});
    }
};