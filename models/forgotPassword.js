const Sequelize = require("sequelize");

const sequelize = require("../utils/database");

const ForgotPasswordRequests = sequelize.define('forgotpasswordrequest', {
    id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true
    },
    userId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
})

module.exports = ForgotPasswordRequests;