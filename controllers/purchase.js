const Razorpay = require("razorpay");
const Order = require("../models/order");
const sequelize = require("../utils/database");

exports.premiumMembership = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        var rzp = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        })
        const amount = 2500;
        rzp.orders.create({ amount, currency: "INR" }, (err, order) => {
            if (err) {
                throw new Error(JSON.stringify(err));
            }
            req.user.createOrder({ orderId: order.id, status: "PENDING" }, { transaction: t })
                .then(() => {
                    t.commit();
                    return res.status(201).json({ order, key_id: rzp.key_id });
                })
                .catch(err => {
                    t.rollback();
                    throw new Error(err);
                })
        })
    }
    catch (error) {
        t.rollback();
        console.log(error);
    }
}

exports.updateTransactionStatus = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const { payment_id, order_id } = req.body;
        const order = await Order.findOne({ where: { orderId: order_id } });
        const paymentUpdate = order.update({ paymentId: payment_id, status: "SUCCESSFUL" }, { transaction: t });
        const userUpdate = req.user.update({ ispremiumuser: true }, { transaction: t });
        await Promise.all([paymentUpdate, userUpdate])
        await t.commit();
        return res.status(202).json({ message: "Transaction Successful" });
    }
    catch (error) {
        console.log(error);
        t.rollback();
        res.status(403).json({ message: "Something went wrong" });
    }
}

exports.failedTransactionStatus = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const { payment_id, order_id } = req.body;
        const order = await Order.findOne({ where: { orderId: order_id } });
        const paymentUpdate = order.update({ paymentId: payment_id, status: "FAILED" }, { transaction: t });
        const userUpdate = req.user.update({ ispremiumuser: false }, { transaction: t });
        await Promise.all([paymentUpdate, userUpdate])
        await t.commit();
        return res.status(202).json({ message: "Transaction Failed" });
    }
    catch (error) {
        console.log(error);
        t.rollback();
        res.status(403).json({ message: "Something went wrong" });
    }
}