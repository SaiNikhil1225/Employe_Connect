"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const customerPOController_1 = require("../controllers/customerPOController");
const router = express_1.default.Router();
// Get all customer POs with filters
router.get('/', customerPOController_1.getCustomerPOs);
// Get active customer POs only
router.get('/active', customerPOController_1.getActiveCustomerPOs);
// Get stats
router.get('/stats', customerPOController_1.getCustomerPOStats);
// Get customer PO by ID
router.get('/:id', customerPOController_1.getCustomerPOById);
// Create new customer PO
router.post('/', customerPOController_1.createCustomerPO);
// Update customer PO
router.put('/:id', customerPOController_1.updateCustomerPO);
// Delete customer PO
router.delete('/:id', customerPOController_1.deleteCustomerPO);
exports.default = router;
//# sourceMappingURL=customerPOs.js.map