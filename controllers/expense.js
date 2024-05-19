const Expense = require("../models/expense");
const User = require("../models/user");

exports.addExpense = async (req, res) => {
    try {
        const expense = req.body.expense || 0;
        const income = req.body.income || 0;
        const description = req.body.description;
        const category = req.body.category;
        const _id = req.user._id;
        const result = await Expense.create({
            expense: expense,
            income: income,
            description: description,
            category: category
        });
        await User.updateOne(
            { _id: _id },
            {
                $inc: {
                    totalExpense: -expense + income
                },
                $push: {
                    expenses: result._id
                }
            }
        );
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
}

exports.getExpensePerPage = async (req, res) => {
    try {
        const ITEMS_PER_PAGE = parseInt(req.query.items_per_page);
        const page = req.query.page || 1;
        const offset = (page - 1) * ITEMS_PER_PAGE;
        const limit = ITEMS_PER_PAGE;
        const premium = req.user.isPremiumUser;
        const p1 = await req.user.populate('expenses');
        const totalExpenses = p1.expenses;
        const expenses = await Expense.find({ _id: { $in: totalExpenses } })
            .skip(offset)
            .limit(limit);
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
    const _id = req.params._id;
    const userId = req.user._id;
    const expense = await Expense.findOne({ _id: _id });
    if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
    }
    const expenseAmount = expense.expense;
    const incomeAmount = expense.income;
    try {
        await User.updateOne(
            { _id: userId },
            {
                $inc: {
                    totalExpense: - incomeAmount + expenseAmount
                },
                $pull: {
                    expenses: _id
                }
            }
        );
        await expense.deleteOne();
        res.json({ message: "Expense deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
}