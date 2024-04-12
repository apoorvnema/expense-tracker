const express = require("express");

const userController = require("../controllers/user");

const router = express.Router();

router.post('/signup', userController.signUp);

router.post('/login', userController.logIn);

module.exports = router;