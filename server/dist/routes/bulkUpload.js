"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const excelService_1 = require("../services/excelService");
const bulkUploadService_1 = require("../services/bulkUploadService");
const router = express_1.default.Router();
// Configure multer for file upload
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            file.mimetype === 'application/vnd.ms-excel') {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type. Only .xlsx files are allowed'));
        }
    }
});
// Download template
router.get('/template', async (req, res) => {
    try {
        await excelService_1.excelService.generateTemplate(res);
    }
    catch (error) {
        console.error('Template generation error:', error);
        res.status(500).json({ error: 'Failed to generate template' });
    }
});
// Validate uploaded file
router.post('/validate', (req, res, next) => {
    console.log('Validation request received');
    console.log('Content-Type:', req.headers['content-type']);
    next();
}, upload.single('file'), async (req, res) => {
    try {
        console.log('After multer middleware');
        if (!req.file) {
            console.log('No file in request');
            return res.status(400).json({ error: 'No file uploaded' });
        }
        console.log('File received:', req.file.originalname, 'Size:', req.file.size);
        // Parse Excel file
        const employees = await excelService_1.excelService.parseExcelFile(req.file.buffer);
        console.log('Parsed employees:', employees.length);
        if (employees.length === 0) {
            return res.status(400).json({ error: 'No employee data found in file' });
        }
        if (employees.length > 1000) {
            return res.status(400).json({ error: 'Maximum 1000 employees can be uploaded at once' });
        }
        // Validate employees
        const validationReport = await bulkUploadService_1.bulkUploadService.validateEmployees(employees);
        console.log('Validation complete:', validationReport);
        res.json(validationReport);
    }
    catch (error) {
        console.error('Validation error:', error);
        res.status(500).json({ error: error.message || 'Failed to validate file' });
    }
});
// Process and create employees
router.post('/process', upload.single('file'), async (req, res) => {
    try {
        console.log('Processing request received');
        if (!req.file) {
            console.log('No file in processing request');
            return res.status(400).json({ error: 'No file uploaded' });
        }
        console.log('Processing file:', req.file.originalname);
        // Parse Excel file
        const employees = await excelService_1.excelService.parseExcelFile(req.file.buffer);
        console.log('Parsed employees for processing:', employees.length);
        if (employees.length === 0) {
            return res.status(400).json({ error: 'No employee data found in file' });
        }
        // Set headers for SSE (Server-Sent Events)
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        console.log('Starting employee processing...');
        // Process employees with progress updates
        await bulkUploadService_1.bulkUploadService.processEmployees(employees, (created, total, current) => {
            console.log(`Progress: ${created}/${total} - Current: ${current?.firstName} ${current?.lastName}`);
            res.write(`data: ${JSON.stringify({ created, total, current })}\n\n`);
        });
        console.log('Processing complete');
        res.end();
    }
    catch (error) {
        console.error('Processing error:', error);
        console.error('Error stack:', error?.stack);
        if (!res.headersSent) {
            res.status(500).json({ error: error?.message || 'Failed to process employees' });
        }
        else {
            res.write(`data: ${JSON.stringify({ error: error?.message || 'Processing failed' })}\n\n`);
            res.end();
        }
    }
});
// Error handler for multer
router.use((error, req, res, next) => {
    if (error instanceof multer_1.default.MulterError) {
        console.error('Multer error:', error);
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File size exceeds 5MB limit' });
        }
        return res.status(400).json({ error: error.message });
    }
    else if (error) {
        console.error('Upload error:', error);
        return res.status(500).json({ error: error.message || 'File upload failed' });
    }
    next();
});
exports.default = router;
//# sourceMappingURL=bulkUpload.js.map