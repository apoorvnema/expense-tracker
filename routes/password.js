const express = require('express');

const passwordController = require('../controllers/password');

const router = express.Router();

router.post('/forgotpassword', passwordController.sendForgotPassword);

router.get('/forgotpassword/:uuid', passwordController.getForgotPassword);

router.post('/forgotpassword/:uuid', passwordController.newPassword);

module.exports = router;