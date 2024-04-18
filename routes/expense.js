const express = require("express");

const expenseController = require("../controllers/expense");
const authenticate = require("../middlewares/auth");

const router = express.Router();

router.post('/add-expense', authenticate, expenseController.addExpense);

router.get('/getExpensePerPage/', authenticate, expenseController.getExpensePerPage);

router.delete('/delete-expense/:id', authenticate, expenseController.deleteExpense);

module.exports = router;