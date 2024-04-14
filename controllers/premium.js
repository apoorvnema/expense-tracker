const sequelize = require('../utils/database');
const User = require('../models/user');
const Expense = require('../models/expense');

/* exports.getLeaderboard = async (req, res) => {
    try {
        const leaderboard = await sequelize.query(
            `SELECT USERS.name, SUM(EXPENSES.amount) AS Total_Expenses FROM USERS
             LEFT JOIN EXPENSES ON USERS.id = EXPENSES.userId
             GROUP BY USERS.id ORDER BY Total_Expenses DESC;`
        );
        res.status(200).json(leaderboard);
    } catch (err) {
        console.error('Error fetching leaderboard:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}; */

/* exports.getLeaderboard = async (req, res) => {
    try {
        const leaderboard = await User.findAll({
            attributes: ['name', [sequelize.fn('sum', sequelize.col('expenses.amount')), 'Total_Expenses']],
            include: [{ model: Expense, attributes: [] }],
            group: ['user.id'],
            order: [['Total_Expenses', 'DESC']]
        });
        res.status(200).json(leaderboard);
    } catch (err) {
        console.error('Error fetching leaderboard:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}; */

exports.getLeaderboard = async (req, res) => {
    try {
        const leaderboard = await User.findAll({
            attributes: ['name', 'totalexpense'],
            order: [['totalexpense', 'DESC']]
        });
        res.status(200).json(leaderboard);
    } catch (err) {
        console.error('Error fetching leaderboard:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
