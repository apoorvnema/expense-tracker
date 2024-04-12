const User = require("../models/user");

exports.signUp = async (req, res) => {
    try {
        const name = req.body.name;
        const email = req.body.email;
        const password = req.body.password;
        const result = await User.create({
            name: name,
            email: email,
            password: password
        })
        res.status(201).json(result);
    }
    catch (error) {
        res.status(500).json(error);
    }
}

exports.logIn = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const findEmail = await User.findOne({ where: { email: email } });
        if (!findEmail) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (findEmail.password != password) {
            return res.status(401).json({ message: 'User not authorized' });
        }
        res.status(200).json({ message: 'User login successful' });
    }
    catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
}
