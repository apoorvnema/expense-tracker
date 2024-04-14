const { createTransport } = require('nodemailer');

exports.forgotPassword = async (req, res) => {
    try {
        const transporter = createTransport({
            host: 'smtp-relay.brevo.com',
            port: 587,
            auth: {
                user: 'apoorvnema38@gmail.com',
                pass: process.env.BREVO_API_KEY
            }
        });
        const mailOptions = {
            from: '"Apoorv Nema" <apoorvnema38@gmail.com>',
            to: req.body.email,
            subject: 'Forgot Password',
            text: 'Hello, world!'
        };
        await transporter.sendMail(mailOptions);
        res.status(200).json("Email sent sucessfully");
    }
    catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
}