"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const financialLineController_1 = require("../controllers/financialLineController");
const router = express_1.default.Router();
// Get all financial lines with filters
router.get('/', financialLineController_1.getFinancialLines);
// Get active financial lines only
router.get('/active', financialLineController_1.getActiveFinancialLines);
// Get stats
router.get('/stats', financialLineController_1.getFinancialLineStats);
// Get financial line by ID
router.get('/:id', financialLineController_1.getFinancialLineById);
// Create new financial line
router.post('/', financialLineController_1.createFinancialLine);
// Update financial line
router.put('/:id', financialLineController_1.updateFinancialLine);
// Delete financial line
router.delete('/:id', financialLineController_1.deleteFinancialLine);
exports.default = router;
//# sourceMappingURL=financialLines.js.map