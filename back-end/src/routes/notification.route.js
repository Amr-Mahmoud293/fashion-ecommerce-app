const express = require("express");
const router = express.Router();
const Notification = require("../models/notification.model");
const { authenticate } = require("../middlewares/auth.middleware");
const { authorizeRole } = require("../middlewares/role.middleware");
const { paginate } = require("../middlewares/paginate.middleware");

const {
    getAllNotifications,
    getNotificationById,
    changeNotificationStatus,
    deleteNotification,
    readAllNotifications,
    deleteAllNotifications
} = require("../controllers/notification.controller");

router.use(authenticate, authorizeRole("admin"));
router.put("/read-all", readAllNotifications);
router.delete("/delete-all", deleteAllNotifications);
router.get("/", paginate(Notification, { isDeleted: false }), getAllNotifications);
router.get("/:id", getNotificationById);
router.put("/:id/status", changeNotificationStatus);
router.delete("/:id", deleteNotification);

module.exports = router;