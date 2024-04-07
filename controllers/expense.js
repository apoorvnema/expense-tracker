const Expense = require("../models/expense");

exports.addExpense = (req, res) => {
    const amount = req.body.amount;
    const description = req.body.description;
    const category = req.body.category;
    Expense.create({
        amount: amount,
        description: description,
        category: category
    })
        .then(result => res.json(result))
        .catch(err => console.log(err));
}

exports.getExpense = (req, res) => {
    Expense.findAll()
        .then((expenses) => {
            res.json(expenses);
        })
        .catch(err => console.log(err));
}

exports.deleteExpense = (req, res) => {
    const id = req.params.id;
    Expense.destroy({ where: { id: id } })
        .then(result => res.json(result))
        .catch(err => console.log(err));
}
