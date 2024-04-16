const express = require('express');

const authenticate = require('../middlewares/auth');
const premiumController = require('../controllers/premium');

const router = express.Router();

router.get("/leaderboard", authenticate, premiumController.getLeaderboard);

router.get("/report", authenticate, premiumController.generateReport);

router.get('/download-report', authenticate, premiumController.downloadReport);

module.exports = router;