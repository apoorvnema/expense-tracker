const sequelize = require('../utils/database');
const User = require('../models/user');
const Expense = require('../models/expense');

// exports.getLeaderboard = async (req, res) => {
//     try {
//         const leaderboard = await sequelize.query(
//             `SELECT users.name, SUM(expenses.amount) AS Total_Expenses
//              FROM users
//              INNER JOIN expenses ON users.id = expenses.userId
//              GROUP BY expenses.userId order by Total_Expenses desc`
//         );
//         res.status(200).json(leaderboard);
//     } catch (err) {
//         console.error('Error fetching leaderboard:', err);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// };

exports.getLeaderboard = async (req, res) => {
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
};
