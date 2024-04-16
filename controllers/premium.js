const Sequelize = require('sequelize');
const AWS = require('aws-sdk');

const sequelize = require('../utils/database');
const User = require('../models/user');
const Expense = require('../models/expense');
const Report = require('../models/report');

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
    const premium = req.user.ispremiumuser;
    try {
        if (!premium) {
            return res.status(401).json({ error: 'You are not a premium user. Access to the leaderboard is restricted.' });
        }

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

exports.generateReport = async (req, res) => {
    const premium = req.user.ispremiumuser;
    try {
        if (!premium) {
            return res.status(401).json({ error: 'You are not a premium user. Access to the report generation is restricted.' });
        }
        const id = req.user.id;
        const p1 = Expense.findAll({ where: { userId: id } });
        const p2 = Expense.findAll({
            attributes: [
                'userId',
                [Sequelize.literal('SUM(expense)'), 'totalExpense'],
                [Sequelize.literal('SUM(income)'), 'totalIncome'],
                [Sequelize.literal('MONTH(updatedAt)'), 'month']
            ],
            where: { userId: id },
            group: [Sequelize.literal('MONTH(updatedAt)')]
        });
        const p3 = req.user.getReports();
        const [expensesMonthly, expensesYearly, allReports] = await Promise.all([p1, p2, p3]);
        const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        let yearly = {};
        let monthly = {};
        let reports = {};
        expensesMonthly.forEach((result, index) => {
            const updatedAt = new Date(result.updatedAt);
            const date = updatedAt.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
            monthly[index] = {
                date: date,
                description: result.description,
                category: result.category,
                income: result.income,
                expense: result.expense,
            }
        })
        expensesYearly.forEach((result, index) => {
            yearly[index] = {
                month: month[result.dataValues.month - 1],
                expense: result.dataValues.totalExpense,
                income: result.dataValues.totalIncome,
                savings: result.dataValues.totalIncome - result.dataValues.totalExpense
            }
        })
        allReports.forEach((result, index) => {
            const updatedAt = new Date(result.updatedAt);
            const date = updatedAt.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
            reports[index] = {
                url: result.url,
                date: date
            };
        })

        res.status(200).json({
            monthly, yearly, reports
        });

    }
    catch (err) {
        console.error('Error generating report:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

function uploadToS3(data, fileName) {
    const s3 = new AWS.S3({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    });
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileName,
        Body: data,
        ACL: 'public-read'
    };
    return new Promise((resolve, reject) => {
        s3.upload(params, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data.Location);
            }
        });
    });
}

exports.downloadReport = async (req, res, next) => {
    const premium = req.user.ispremiumuser;
    const t = await sequelize.transaction();
    try {
        if (!premium) {
            return res.status(401).json({ error: 'You are not a premium user. Access to the report generation is restricted.' });
        }
        const expenses = await req.user.getExpenses();
        const stringifiedExpenses = JSON.stringify(expenses);
        const fileName = `Expense${req.user.id}/${new Date()}.txt`;
        const fileUrl = await uploadToS3(stringifiedExpenses, fileName);
        await Report.create({ url: fileUrl, userId: req.user.id }, { transaction: t });
        await t.commit();
        res.status(200).json({ fileUrl });
    }
    catch (err) {
        console.error('Error downloading report:', err);
        await t.rollback();
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
