"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomerStats = exports.deleteCustomer = exports.updateCustomer = exports.createCustomer = exports.getCustomerById = exports.getCustomers = void 0;
const Customer_1 = __importDefault(require("../models/Customer"));
const logger_1 = __importDefault(require("../config/logger"));
// Get all customers with optional filters
const getCustomers = async (req, res) => {
    try {
        const { status, region, search } = req.query;
        const query = {};
        if (status)
            query.status = status;
        if (region)
            query.region = region;
        if (search) {
            query.$or = [
                { customerName: { $regex: search, $options: 'i' } },
                { customerNo: { $regex: search, $options: 'i' } }
            ];
        }
        const customers = await Customer_1.default.find(query).sort({ createdAt: -1 });
        res.json({
            success: true,
            data: customers,
            count: customers.length
        });
    }
    catch (error) {
        logger_1.default.error('Failed to fetch customers:', error);
        const message = error instanceof Error ? error.message : 'Failed to fetch customers';
        res.status(500).json({
            success: false,
            message: 'Failed to fetch customers',
            error: message
        });
    }
};
exports.getCustomers = getCustomers;
// Get customer by ID
const getCustomerById = async (req, res) => {
    try {
        const customer = await Customer_1.default.findById(req.params.id);
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }
        res.json({
            success: true,
            data: customer
        });
    }
    catch (error) {
        logger_1.default.error('Failed to fetch customer:', error);
        const message = error instanceof Error ? error.message : 'Failed to fetch customer';
        res.status(500).json({
            success: false,
            message: 'Failed to fetch customer',
            error: message
        });
    }
};
exports.getCustomerById = getCustomerById;
// Create new customer
const createCustomer = async (req, res) => {
    try {
        const { customerName, hubspotRecordId, industry, region, regionHead, status } = req.body;
        // Validate required fields
        if (!customerName || !industry || !region) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: customerName, industry, region'
            });
        }
        // Auto-generate customer number
        const lastCustomer = await Customer_1.default.findOne().sort({ createdAt: -1 });
        let nextNumber = 1;
        if (lastCustomer && lastCustomer.customerNo) {
            const match = lastCustomer.customerNo.match(/CUST-(\d+)/);
            if (match) {
                nextNumber = parseInt(match[1], 10) + 1;
            }
        }
        const customerNo = `CUST-${String(nextNumber).padStart(4, '0')}`;
        // Check if customer number already exists (safety check)
        const existingCustomer = await Customer_1.default.findOne({ customerNo });
        if (existingCustomer) {
            return res.status(400).json({
                success: false,
                message: 'Customer number already exists'
            });
        }
        const customer = new Customer_1.default({
            customerNo,
            customerName,
            hubspotRecordId,
            industry,
            region,
            regionHead,
            status: status || 'Active'
        });
        await customer.save();
        logger_1.default.info(`Customer created: ${customerName} (${customerNo})`);
        res.status(201).json({
            success: true,
            message: 'Customer created successfully',
            data: customer
        });
    }
    catch (error) {
        logger_1.default.error('Failed to create customer:', error);
        if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Customer number already exists'
            });
        }
        const message = error instanceof Error ? error.message : 'Failed to create customer';
        res.status(500).json({
            success: false,
            message: 'Failed to create customer',
            error: message
        });
    }
};
exports.createCustomer = createCustomer;
// Update customer
const updateCustomer = async (req, res) => {
    try {
        const { customerName, hubspotRecordId, industry, region, regionHead, status } = req.body;
        const customer = await Customer_1.default.findById(req.params.id);
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }
        // Update fields
        if (customerName)
            customer.customerName = customerName;
        if (hubspotRecordId !== undefined)
            customer.hubspotRecordId = hubspotRecordId;
        if (industry)
            customer.industry = industry;
        if (region)
            customer.region = region;
        if (regionHead !== undefined)
            customer.regionHead = regionHead;
        if (status)
            customer.status = status;
        await customer.save();
        logger_1.default.info(`Customer updated: ${customer.customerName} (${customer.customerNo})`);
        res.json({
            success: true,
            message: 'Customer updated successfully',
            data: customer
        });
    }
    catch (error) {
        logger_1.default.error('Failed to update customer:', error);
        const message = error instanceof Error ? error.message : 'Failed to update customer';
        res.status(500).json({
            success: false,
            message: 'Failed to update customer',
            error: message
        });
    }
};
exports.updateCustomer = updateCustomer;
// Delete customer
const deleteCustomer = async (req, res) => {
    try {
        const customer = await Customer_1.default.findById(req.params.id);
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }
        // TODO: Check if customer has associated projects before deleting
        // const projectCount = await Project.countDocuments({ customerId: req.params.id });
        // if (projectCount > 0) {
        //   return res.status(400).json({
        //     success: false,
        //     message: 'Cannot delete customer with associated projects'
        //   });
        // }
        await Customer_1.default.findByIdAndDelete(req.params.id);
        logger_1.default.info(`Customer deleted: ${customer.customerName} (${customer.customerNo})`);
        res.json({
            success: true,
            message: 'Customer deleted successfully'
        });
    }
    catch (error) {
        logger_1.default.error('Failed to delete customer:', error);
        const message = error instanceof Error ? error.message : 'Failed to delete customer';
        res.status(500).json({
            success: false,
            message: 'Failed to delete customer',
            error: message
        });
    }
};
exports.deleteCustomer = deleteCustomer;
// Get customer statistics
const getCustomerStats = async (req, res) => {
    try {
        const totalCustomers = await Customer_1.default.countDocuments();
        const activeCustomers = await Customer_1.default.countDocuments({ status: 'Active' });
        const inactiveCustomers = await Customer_1.default.countDocuments({ status: 'Inactive' });
        const customersByRegion = await Customer_1.default.aggregate([
            {
                $group: {
                    _id: '$region',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);
        res.json({
            success: true,
            data: {
                total: totalCustomers,
                active: activeCustomers,
                inactive: inactiveCustomers,
                byRegion: customersByRegion
            }
        });
    }
    catch (error) {
        logger_1.default.error('Failed to fetch customer statistics:', error);
        const message = error instanceof Error ? error.message : 'Failed to fetch customer statistics';
        res.status(500).json({
            success: false,
            message: 'Failed to fetch customer statistics',
            error: message
        });
    }
};
exports.getCustomerStats = getCustomerStats;
//# sourceMappingURL=customerController.js.map