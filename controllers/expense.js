const Expense = require("../models/expense");
const User = require("../models/user");
const sequelize = require("../utils/database");

exports.addExpense = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const expense = req.body.expense || 0;
        const income = req.body.income || 0;
        const description = req.body.description;
        const category = req.body.category;
        const id = req.user.id;
        await User.update(
            { totalexpense: sequelize.literal(`totalexpense - ${expense} + ${income}`) },
            { where: { id: id } },
            { transaction: t }
        );
        const result = await Expense.create({
            expense: expense,
            income: income,
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
        res.status(500).json({ error: "Internal server error" });
    }
}

exports.getExpensePerPage = async (req, res) => {
    try {
        const ITEMS_PER_PAGE = parseInt(req.query.items_per_page);
        const page = req.query.page || 1;
        const offset = (page - 1) * ITEMS_PER_PAGE;
        const limit = ITEMS_PER_PAGE;
        const id = req.user.id;
        const premium = req.user.ispremiumuser;
        const p1 = Expense.findAll({ where: { userId: id } });
        const p2 = Expense.findAll({ where: { userId: id }, offset: offset, limit: limit });
        const [totalExpenses, expenses] = await Promise.all([p1, p2]);
        const hasNextPage = ITEMS_PER_PAGE * page < expenses.length;
        const hasPreviousPage = page > 1;
        const nextPage = hasNextPage ? page + 1 : null;
        const previousPage = hasPreviousPage ? page - 1 : null;
        const totalPages = Math.ceil(totalExpenses.length / ITEMS_PER_PAGE);
        const pagesDetail = { hasNextPage, hasPreviousPage, nextPage, previousPage, totalPages };
        res.json({ expenses: expenses, premium: premium, pagesDetail: pagesDetail });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
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
    const expenseAmount = expense.expense;
    const incomeAmount = expense.income;
    try {
        await User.update(
            { totalexpense: sequelize.literal(`totalexpense - ${incomeAmount} + ${expenseAmount}`) },
            { where: { id: userId } },
            { transaction: t }
        );
        await t.commit();
        await expense.destroy();
        res.json({ message: "Expense deleted successfully" });
    } catch (err) {
        console.error(err);
        await t.rollback();
        res.status(500).json({ error: "Internal server error" });
    }
}