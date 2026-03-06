"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Attendance_1 = __importDefault(require("../models/Attendance"));
const validation_1 = require("../middleware/validation");
const router = express_1.default.Router();
router.get('/', async (req, res) => {
    try {
        const { employeeId, startDate, endDate } = req.query;
        const query = {};
        if (employeeId)
            query.employeeId = employeeId;
        if (startDate && endDate) {
            query.date = { $gte: startDate, $lte: endDate };
        }
        const attendance = await Attendance_1.default.find(query).sort({ date: -1 });
        res.json({ success: true, data: attendance });
    }
    catch (error) {
        console.error('Failed to read attendance:', error);
        res.status(500).json({ success: false, message: 'Failed to read attendance' });
    }
});
router.post('/', validation_1.attendanceValidation.create, async (req, res) => {
    try {
        const attendance = new Attendance_1.default(req.body);
        await attendance.save();
        res.status(201).json({ success: true, data: attendance });
    }
    catch (error) {
        console.error('Failed to create attendance:', error);
        res.status(500).json({ success: false, message: 'Failed to create attendance' });
    }
});
router.put('/:id', async (req, res) => {
    try {
        const attendance = await Attendance_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!attendance) {
            return res.status(404).json({ success: false, message: 'Attendance not found' });
        }
        res.json({ success: true, data: attendance });
    }
    catch (error) {
        console.error('Failed to update attendance:', error);
        res.status(500).json({ success: false, message: 'Failed to update attendance' });
    }
});
exports.default = router;
//# sourceMappingURL=attendance.js.map