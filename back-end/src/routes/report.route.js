const express = require("express");
const router = express.Router();

const { getSalesReports } = require("../controllers/report.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorizeRole } = require("../middlewares/role.middleware");

router.get("/sales", authenticate, authorizeRole("admin"), getSalesReports);
module.exports = router;