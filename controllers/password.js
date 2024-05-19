const { createTransport } = require('nodemailer');
const uuidv4 = require('uuid').v4;
const path = require('path');
const bcrypt = require('bcrypt');

const ForgotPasswordRequests = require('../models/forgotPassword');
const User = require('../models/user');

exports.sendForgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({email: req.body.email});
        if (!user) {
            const error = new Error("User not found");
            error.status = 404;
            throw error;
        }
        const forgetPasswordId = uuidv4();
        const htmlContent = `<a href="https://expense-tracker.apoorvnema.pro/password/forgotpassword/${forgetPasswordId}">Link to Reset Password</a>`;
        const transporter = createTransport({
            host: process.env.BREVO_HOST,
            port: 587,
            auth: {
                user: process.env.BREVO_USER,
                pass: process.env.BREVO_API_KEY
            }
        });
        const mailOptions = {
            from: '"Apoorv Nema" <contact@apoorvnema.pro>',
            to: req.body.email,
            subject: 'Forgot Password',
            text: htmlContent
        };
        const forgetPassword = await ForgotPasswordRequests.create({ forgetPasswordId: forgetPasswordId, userId: user._id });
        await user.updateOne({$push: {forgetPasswordRequest: forgetPassword._id}});
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "Email sent sucessfully" });
    }
    catch (err) {
        if (err.status === 404) {
            res.status(404).json({ error: err.message });
        }
        else {
            console.error(err);
            res.status(500).json({ error: "Internal server error" });
        }
    }
}

exports.getForgotPassword = async (req, res) => {
    try {
        const userRequest = await ForgotPasswordRequests.findOne({ forgetPasswordId: req.params.uuid });
        if (!userRequest) {
            res.send("<h1>Password reset request not found</h1>");
        }
        if (!userRequest.isActive) {
            res.send("<h1>Password reset request expired</h1>");
        }
        else {
            res.sendFile(path.join(__dirname, '../public/forgetPassword.html'));
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

exports.newPassword = async (req, res) => {
    try {
        const userRequest = await ForgotPasswordRequests.findOne({ forgetPasswordId: req.params.uuid });
        if (!userRequest) {
            throw new Error("Password reset request not found");
        }
        const user = await User.findOne({ _id: userRequest.userId });
        if (!user) {
            throw new Error("User not found");
        }
        const saltRounds = 10;
        const hash = await bcrypt.hash(req.body.password, saltRounds);
        if (userRequest.isActive == true) {
            user.password = hash;
            await user.save();
            userRequest.isActive = false;
            await userRequest.save();
        }
        res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}