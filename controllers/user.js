const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

function generateAccessToken(_id, name) {
    return jwt.sign({ _id: _id, name: name }, process.env.JWT_ACCESS_TOKEN);
}

exports.signUp = async (req, res) => {
    try {
        const name = req.body.name;
        const email = req.body.email;
        const password = req.body.password;
        const saltRounds = 10;
        const hash = await bcrypt.hash(password, saltRounds);
        await User.create({
            name: name,
            email: email,
            password: hash
        })
        res.status(201).json({ message: 'User is created successfully' });
    }
    catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}

exports.logIn = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const user = await User.findOne({email: email});
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const comparePass = await bcrypt.compare(password, user.password);
        if (!comparePass) {
            return res.status(401).json({ message: 'User not authorized' });
        }
        res.status(200).json({ message: 'User login is successful', token: generateAccessToken(user._id, user.name, user.isPremiumUser) });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
