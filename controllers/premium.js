const sequelize = require('../utils/database');

exports.getLeaderboard = async (req, res) => {
    try {
        const leaderboard = await sequelize.query(
            `SELECT users.name, SUM(expenses.amount) AS Total_Expenses
             FROM users
             INNER JOIN expenses ON users.id = expenses.userId
             GROUP BY expenses.userId`
        );
        res.status(200).json(leaderboard);
    } catch (err) {
        console.error('Error fetching leaderboard:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
