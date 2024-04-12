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
