const Sequelize = require("sequelize");

const sequelize = require("../utils/database");

const Expense = sequelize.define('expense', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    expense: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    income: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    description: {
        type: Sequelize.STRING
    },
    category: {
        type: Sequelize.STRING
    }
});

module.exports = Expense;
