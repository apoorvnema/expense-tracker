const express = require("express");

const authenticate = require("../middlewares/auth");
const purchaseController = require("../controllers/purchase");

const router = express.Router();

router.get("/premiummembership", authenticate, purchaseController.premiumMembership);

router.post("/updatetransactionstatus", authenticate, purchaseController.updateTransactionStatus);

router.post("/failedtransactionstatus", authenticate, purchaseController.failedTransactionStatus);

module.exports = router;