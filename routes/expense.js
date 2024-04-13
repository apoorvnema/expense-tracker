const express = require("express");

const expenseController = require("../controllers/expense");
const authenticate = require("../middlewares/auth");

const router = express.Router();

router.post('/add-expense', authenticate, expenseController.addExpense);

router.get('/get-expense', authenticate, expenseController.getExpense);

router.delete('/delete-expense/:id', authenticate, expenseController.deleteExpense);

module.exports = router;