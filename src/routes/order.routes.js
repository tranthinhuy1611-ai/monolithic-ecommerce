const express = require("express");
const router = express.Router();
const { createOrder, getMyOrders } = require("../controllers/order.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

router.post("/", verifyToken, createOrder);
router.get("/", verifyToken, getMyOrders);

module.exports = router;
