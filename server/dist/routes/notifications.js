"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Notification_1 = __importDefault(require("../models/Notification"));
const router = express_1.default.Router();
console.log('[Notifications] Route file loaded');
// Get unread notification count
router.get('/unread/count', async (req, res) => {
    try {
        const { userId, role } = req.query;
        const query = { isRead: false };
        // Build $or conditions for matching notifications
        const orConditions = [];
        // Match notifications sent to this specific user
        if (userId) {
            orConditions.push({ userId: userId });
        }
        // Match notifications sent to this role (for approvers, IT admins, etc.)
        if (role && role !== 'all') {
            orConditions.push({ role: role });
        }
        // Always include broadcast notifications
        orConditions.push({ role: 'all' });
        if (orConditions.length > 0) {
            query.$or = orConditions;
        }
        const count = await Notification_1.default.countDocuments(query);
        res.json({ success: true, count });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to get notification count' });
    }
});
// Get all notifications for a user
router.get('/', async (req, res) => {
    try {
        const { userId, role } = req.query;
        const query = {};
        // Build $or conditions for matching notifications
        const orConditions = [];
        // Match notifications sent to this specific user
        if (userId) {
            orConditions.push({ userId: userId });
        }
        // Match notifications sent to this role (for approvers, IT admins, etc.)
        if (role && role !== 'all') {
            orConditions.push({ role: role });
        }
        // Always include broadcast notifications
        orConditions.push({ role: 'all' });
        if (orConditions.length > 0) {
            query.$or = orConditions;
        }
        const notifications = await Notification_1.default.find(query)
            .sort({ createdAt: -1 })
            .limit(100);
        // Map _id to id for frontend compatibility
        const notificationsWithId = notifications.map(n => ({
            ...n.toObject(),
            id: n._id.toString()
        }));
        res.json({ success: true, data: notificationsWithId });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to read notifications' });
    }
});
// Create a new notification
router.post('/', async (req, res) => {
    try {
        const { title, description, type, userId, role, meta } = req.body;
        if (!title || !description || !type || !role) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: title, description, type, role'
            });
        }
        const notification = new Notification_1.default({
            title,
            description,
            type,
            userId,
            role,
            meta: meta || {}
        });
        await notification.save();
        res.status(201).json({ success: true, data: notification });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create notification' });
    }
});
// Mark notification as read
router.patch('/:id/read', async (req, res) => {
    try {
        const notification = await Notification_1.default.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true, runValidators: true });
        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }
        // Map _id to id for frontend compatibility
        const notificationWithId = {
            ...notification.toObject(),
            id: notification._id.toString()
        };
        res.json({ success: true, data: notificationWithId });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to mark notification as read' });
    }
});
// Mark all notifications as read
router.patch('/read-all', async (req, res) => {
    try {
        const { userId, role } = req.query;
        const query = { isRead: false };
        // Build $or conditions for matching notifications
        const orConditions = [];
        // Match notifications sent to this specific user
        if (userId) {
            orConditions.push({ userId: userId });
        }
        // Match notifications sent to this role (for approvers, IT admins, etc.)
        if (role && role !== 'all') {
            orConditions.push({ role: role });
        }
        // Always include broadcast notifications
        orConditions.push({ role: 'all' });
        if (orConditions.length > 0) {
            query.$or = orConditions;
        }
        await Notification_1.default.updateMany(query, { isRead: true });
        res.json({ success: true, message: 'All notifications marked as read' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to mark notifications as read' });
    }
});
// Delete a notification
router.delete('/:id', async (req, res) => {
    try {
        const notification = await Notification_1.default.findByIdAndDelete(req.params.id);
        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }
        res.json({ success: true, message: 'Notification deleted' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete notification' });
    }
});
// Clear all notifications for a user
router.delete('/clear-all', async (req, res) => {
    try {
        const { userId, role } = req.query;
        console.log('[Clear All] Request received:', { userId, role });
        if (!userId && !role) {
            console.log('[Clear All] No userId or role provided');
            return res.status(400).json({
                success: false,
                message: 'userId or role is required'
            });
        }
        const query = {};
        // Build $or conditions for matching notifications
        const orConditions = [];
        // Match notifications sent to this specific user
        if (userId) {
            orConditions.push({ userId: userId });
        }
        // Match notifications sent to this role (for approvers, IT admins, etc.)
        if (role && role !== 'all') {
            orConditions.push({ role: role });
        }
        // Always include broadcast notifications
        orConditions.push({ role: 'all' });
        if (orConditions.length > 0) {
            query.$or = orConditions;
        }
        console.log('[Clear All] Delete query:', JSON.stringify(query, null, 2));
        const result = await Notification_1.default.deleteMany(query);
        console.log('[Clear All] Deleted count:', result.deletedCount);
        res.json({
            success: true,
            message: 'All notifications cleared',
            deletedCount: result.deletedCount
        });
    }
    catch (error) {
        console.error('[Clear All] Error:', error);
        console.error('[Clear All] Error stack:', error.stack);
        console.error('[Clear All] Error message:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to clear notifications',
            error: error.message || String(error)
        });
    }
});
exports.default = router;
//# sourceMappingURL=notifications.js.map