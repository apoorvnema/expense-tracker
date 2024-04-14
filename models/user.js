const Sequelize = require("sequelize");

const sequelize = require("../utils/database");

const User = sequelize.define('user', {
    name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    ispremiumuser: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    totalexpense: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    }
});

module.exports = User;
