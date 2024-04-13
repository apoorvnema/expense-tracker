const Sequelize = require("sequelize");

const sequelize = require("../utils/database");

const Order = sequelize.define('order', {
    paymentId: Sequelize.STRING,
    orderId: Sequelize.STRING,
    status: Sequelize.STRING
})

module.exports = Order;