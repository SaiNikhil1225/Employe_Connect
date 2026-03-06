"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const NewJoiner_1 = __importDefault(require("../models/NewJoiner"));
const router = express_1.default.Router();
router.get('/', async (_req, res) => {
    try {
        const newJoiners = await NewJoiner_1.default.find().sort({ joiningDate: -1 });
        res.json({ success: true, data: newJoiners });
    }
    catch (error) {
        console.error('Failed to read new joiners:', error);
        res.status(500).json({ success: false, message: 'Failed to read new joiners' });
    }
});
exports.default = router;
//# sourceMappingURL=newJoiners.js.map