const AWS = require('aws-sdk');

const User = require('../models/user');
const Expense = require('../models/expense');
const Report = require('../models/report');

exports.getLeaderboard = async (req, res) => {
    const premium = req.user.isPremiumUser;
    try {
        if (!premium) {
            return res.status(401).json({ error: 'You are not a premium user. Access to the leaderboard is restricted.' });
        }
        const leaderboard = await User.find({ totalExpense: { $gt: 0 } }, 'name totalExpense')
            .sort({ totalExpense: -1 })
            .limit(10);
        res.status(200).json(leaderboard);
    } catch (err) {
        console.error('Error fetching leaderboard:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.generateReport = async (req, res) => {
    const premium = req.user.isPremiumUser;
    try {
        if (!premium) {
            return res.status(401).json({ error: 'You are not a premium user. Access to the report generation is restricted.' });
        }
        const _id = req.user._id;
        const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const currentYear = new Date().getFullYear();
        const currentMonth = month[new Date().getMonth()];
        await req.user.populate({ path: 'expenseReport' });
        await req.user.populate({ path: 'expenses' });
        const p1 = req.user.expenses.reduce((acc, expense) => {
            const expenseMonth = month[expense.updatedAt.getMonth()];
            const expenseDate = expense.updatedAt.getDate();
            if (expenseMonth === currentMonth) {
                const key = `${expenseMonth}-${expenseDate}`;
                if (!acc[key]) {
                    acc[key] = {
                        date: expenseDate,
                        income: 0,
                        expense: 0
                    };
                }
                acc[key].income += expense.income;
                acc[key].expense += expense.expense;
            }
            
            return acc;
        },{});
        const p2 = req.user.expenses.reduce((acc, expense) => {
            const expenseYear = expense.updatedAt.getFullYear();
            const expenseMonth = expense.updatedAt.getMonth();
            if (expenseYear === currentYear) {
                const key = `${expenseYear}-${expenseMonth}`;
                if (!acc[key]) {
                    acc[key] = {
                        month: expenseMonth,
                        income: 0,
                        expense: 0
                    };
                }
                acc[key].income += expense.income;
                acc[key].expense += expense.expense;
            }
            return acc;
        },{});
        const p3 = req.user.expenseReport
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            .slice(0,20);
        const [expensesMonthly, expensesYearly, allReports] = await Promise.all([p1, p2, p3]);
        let yearly = [];
        let monthly = [];
        let reports = {};
        for (const [key, value] of Object.entries(expensesMonthly)) {
            monthly.push({
                date: value.date,
                expense: value.expense,
                income: value.income
            });
        }
        for (const [key, value] of Object.entries(expensesYearly)) {
            yearly.push({
                month: month[value.month-1],
                expense: value.expense,
                income: value.income,
                savings: value.income - value.expense
            });
        }
        allReports.forEach((result, index) => {
            const updatedAt = new Date(result.updatedAt);
            const date = updatedAt.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
            reports[index] = {
                url: result.url,
                date: date
            };
        })

        res.status(200).json({
            monthly, yearly, reports, currentYear, currentMonth
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
    const premium = req.user.isPremiumUser;
    try {
        if (!premium) {
            return res.status(401).json({ error: 'You are not a premium user. Access to the report generation is restricted.' });
        }
        const expenses = await req.user.populate({
            path: 'expenses',
            select: 'expense income description category updatedAt -_id'
        });
        const stringifiedExpenses = JSON.stringify(expenses.expenses);
        const fileName = `ExpenseReports/${req.user._id}/${new Date()}.txt`;
        const fileUrl = await uploadToS3(stringifiedExpenses, fileName);
        const report = await Report.create({ url: fileUrl, userId: req.user._id });
        await req.user.updateOne({$push: {expenseReport:report._id}});
        res.status(200).json({ fileUrl });
    }
    catch (err) {
        console.error('Error downloading report:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
