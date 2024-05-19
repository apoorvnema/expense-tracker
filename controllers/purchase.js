const Razorpay = require("razorpay");

const Order = require("../models/order");
const User = require("../models/user");

exports.premiumMembership = async (req, res, next) => {
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
            Order.create({ orderId: order.id, status: "PENDING" })
                .then(async (order) => {
                    await User.updateOne({ _id: req.user._id }, { $push: { orders: order._id } })
                    return res.status(201).json({ order, key_id: rzp.key_id });
                })
                .catch(err => {
                    throw new Error(err);
                })
        })
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
}

exports.updateTransactionStatus = async (req, res, next) => {
    try {
        const { payment_id, _id } = req.body;
        const order = await Order.findOne({ _id: _id });
        const paymentUpdate = order.updateOne({ paymentId: payment_id, status: "SUCCESSFUL" });
        const userUpdate = req.user.updateOne({ isPremiumUser: true });
        await Promise.all([paymentUpdate, userUpdate])
        return res.status(202).json({ message: "Transaction Successful" });
    }
    catch (error) {
        console.error(error);
        res.status(403).json({ error: "Something went wrong" });
    }
}

exports.failedTransactionStatus = async (req, res, next) => {
    const { payment_id, _id } = req.body;
    try {
        const order = await Order.findOne({ _id: _id });
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        const paymentUpdate = order.updateOne({ paymentId: payment_id, status: "FAILED" });
        const userUpdate = req.user.updateOne({ isPremiumUser: false });
        await Promise.all([paymentUpdate, userUpdate])
        return res.status(202).json({ message: "Transaction Failed" });
    }
    catch (error) {
        console.error(error);
        res.status(403).json({ error: "Something went wrong" });
    }
}