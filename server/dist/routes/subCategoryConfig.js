"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const SubCategoryConfig_1 = __importDefault(require("../models/SubCategoryConfig"));
const router = express_1.default.Router();
// Get all subcategory configurations (grouped by high-level category)
router.get('/', async (req, res) => {
    try {
        const configs = await SubCategoryConfig_1.default.find({ isActive: true }).sort({ highLevelCategory: 1, order: 1, subCategory: 1 });
        // Transform into nested object structure for frontend compatibility
        const mappingObject = {};
        configs.forEach(config => {
            if (!mappingObject[config.highLevelCategory]) {
                mappingObject[config.highLevelCategory] = {};
            }
            mappingObject[config.highLevelCategory][config.subCategory] = {
                requiresApproval: config.requiresApproval,
                processingQueue: config.processingQueue,
                specialistQueue: config.specialistQueue
            };
        });
        res.json({ success: true, data: mappingObject });
    }
    catch (error) {
        console.error('Failed to fetch subcategory configs:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch subcategory configurations' });
    }
});
// Get configurations for a specific high-level category
router.get('/category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const configs = await SubCategoryConfig_1.default.find({
            highLevelCategory: category,
            isActive: true
        }).sort({ order: 1, subCategory: 1 });
        res.json({ success: true, data: configs });
    }
    catch (error) {
        console.error('Failed to fetch category configs:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch category configurations' });
    }
});
// Get specific subcategory configuration
router.get('/:category/:subCategory', async (req, res) => {
    try {
        const { category, subCategory } = req.params;
        const config = await SubCategoryConfig_1.default.findOne({
            highLevelCategory: category,
            subCategory: decodeURIComponent(subCategory),
            isActive: true
        });
        if (!config) {
            return res.status(404).json({ success: false, message: 'Configuration not found' });
        }
        res.json({ success: true, data: config });
    }
    catch (error) {
        console.error('Failed to fetch config:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch configuration' });
    }
});
// Create new subcategory configuration
router.post('/', async (req, res) => {
    try {
        const config = new SubCategoryConfig_1.default(req.body);
        await config.save();
        res.status(201).json({ success: true, data: config });
    }
    catch (error) {
        console.error('Failed to create subcategory config:', error);
        res.status(500).json({ success: false, message: 'Failed to create configuration' });
    }
});
// Update subcategory configuration
router.put('/:id', async (req, res) => {
    try {
        const config = await SubCategoryConfig_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!config) {
            return res.status(404).json({ success: false, message: 'Configuration not found' });
        }
        res.json({ success: true, data: config });
    }
    catch (error) {
        console.error('Failed to update config:', error);
        res.status(500).json({ success: false, message: 'Failed to update configuration' });
    }
});
// Delete (soft delete) subcategory configuration
router.delete('/:id', async (req, res) => {
    try {
        const config = await SubCategoryConfig_1.default.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true, runValidators: true });
        if (!config) {
            return res.status(404).json({ success: false, message: 'Configuration not found' });
        }
        res.json({ success: true, message: 'Configuration deactivated successfully' });
    }
    catch (error) {
        console.error('Failed to delete config:', error);
        res.status(500).json({ success: false, message: 'Failed to delete configuration' });
    }
});
exports.default = router;
//# sourceMappingURL=subCategoryConfig.js.map