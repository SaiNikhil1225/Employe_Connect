"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const customerController_1 = require("../controllers/customerController");
const router = express_1.default.Router();
// Get all customers (with optional filters: status, region, search)
router.get('/', customerController_1.getCustomers);
// Get customer statistics
router.get('/stats', customerController_1.getCustomerStats);
// Get customer by ID
router.get('/:id', customerController_1.getCustomerById);
// Create new customer
router.post('/', customerController_1.createCustomer);
// Update customer
router.put('/:id', customerController_1.updateCustomer);
// Delete customer
router.delete('/:id', customerController_1.deleteCustomer);
exports.default = router;
//# sourceMappingURL=customers.js.map