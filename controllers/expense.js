const Expense = require("../models/expense");

exports.addExpense = (req, res) => {
    const amount = req.body.amount;
    const description = req.body.description;
    const category = req.body.category;
    const id = req.user.id;
    Expense.create({
        amount: amount,
        description: description,
        category: category,
        userId: id
    })
        .then(result => res.json(result))
        .catch(err => console.log(err));
}

exports.getExpense = (req, res) => {
    const id = req.user.id;
    const premium = req.user.ispremiumuser;
    Expense.findAll({ where: { userId: id } })
        .then((expenses) => {
            res.json({ expenses: expenses, premium: premium });
        })
        .catch(err => console.log(err));
}

exports.deleteExpense = (req, res) => {
    const id = req.params.id;
    const userId = req.user.id;
    Expense.destroy({ where: { id: id, userId: userId } })
        .then(result => res.json(result))
        .catch(err => console.log(err));
}
