const Expense = require("../models/expense");
const User = require("../models/user");
const sequelize = require("../utils/database");

exports.addExpense = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const amount = req.body.amount;
        const description = req.body.description;
        const category = req.body.category;
        const id = req.user.id;
        await User.update(
            { totalexpense: sequelize.literal(`totalexpense + ${amount}`) },
            { where: { id: id } },
            { transaction: t }
        );
        const result = await Expense.create({
            amount: amount,
            description: description,
            category: category,
            userId: id,
            transaction: t
        });
        await t.commit();
        res.json(result);
    } catch (err) {
        console.error(err);
        await t.rollback();
        res.status(500).json({ message: "Internal server error" });
    }
}

exports.getExpense = async (req, res) => {
    try {
        const id = req.user.id;
        const premium = req.user.ispremiumuser;
        const expenses = await Expense.findAll({ where: { userId: id } });
        res.json({ expenses: expenses, premium: premium });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
}

exports.deleteExpense = async (req, res) => {
    const t = await sequelize.transaction();
    const id = req.params.id;
    const userId = req.user.id;
    const expense = await Expense.findOne({ where: { id: id, userId: userId } }, { transaction: t });
    if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
    }
    const amount = expense.amount;
    try {
        await User.update(
            { totalexpense: sequelize.literal(`totalexpense - ${amount}`) },
            { where: { id: userId } },
            { transaction: t }
        );
        await t.commit();
        await expense.destroy();
        res.json({ message: "Expense deleted successfully" });
    } catch (err) {
        console.error(err);
        await t.rollback();
        res.status(500).json({ message: "Internal server error" });
    }
}