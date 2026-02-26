import express, { Request, Response } from 'express';
import UDA from '../models/UDA';
import { authenticateToken } from '../middleware/auth';
import multer from 'multer';
import * as XLSX from 'xlsx';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'text/csv',
        ];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only Excel (.xlsx, .xls) and CSV files are allowed.'));
        }
    },
});

// Validate UDA data
function validateUDAData(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.udaNumber || data.udaNumber.trim() === '') {
        errors.push('UDA Number is required');
    }

    if (!data.name || data.name.trim() === '') {
        errors.push('Name is required');
    }

    if (!data.type || data.type.trim() === '') {
        errors.push('Type is required');
    }

    if (!data.billable || !['Billable', 'Non-Billable'].includes(data.billable)) {
        errors.push('Billable must be either "Billable" or "Non-Billable"');
    }

    if (!data.projectRequired || !['Y', 'N'].includes(data.projectRequired)) {
        errors.push('Project Required must be either "Y" or "N"');
    }

    if (!data.active || !['Y', 'N'].includes(data.active)) {
        errors.push('Active must be either "Y" or "N"');
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

// Parse Excel/CSV file
function parseFile(buffer: Buffer, mimetype: string): any[] {
    try {
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);
        return data;
    } catch (error) {
        throw new Error('Failed to parse file. Please ensure it is a valid Excel or CSV file.');
    }
}

// Get all UDA configurations with optional filters
router.get('/', authenticateToken, async (req: Request, res: Response) => {
    try {
        const { active, type, search } = req.query;

        const query: any = {};

        if (active) {
            query.active = active;
        }

        if (type) {
            query.type = type;
        }

        if (search) {
            query.$or = [
                { udaNumber: { $regex: search, $options: 'i' } },
                { name: { $regex: search, $options: 'i' } },
            ];
        }

        const udas = await UDA.find(query).sort({ createdAt: -1 });
        res.json(udas);
    } catch (error) {
        console.error('Error fetching UDA configurations:', error);
        res.status(500).json({ message: 'Failed to fetch UDA configurations' });
    }
});

// Get a single UDA configuration by ID
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
    try {
        const uda = await UDA.findById(req.params.id);

        if (!uda) {
            return res.status(404).json({ message: 'UDA configuration not found' });
        }

        res.json(uda);
    } catch (error) {
        console.error('Error fetching UDA configuration:', error);
        res.status(500).json({ message: 'Failed to fetch UDA configuration' });
    }
});

// Create a new UDA configuration
router.post('/', authenticateToken, async (req: Request, res: Response) => {
    try {
        const {
            udaNumber,
            name,
            description,
            parentUDA,
            type,
            billable,
            projectRequired,
            active,
        } = req.body;

        // Check if UDA number already exists
        const existingUDA = await UDA.findOne({ udaNumber });
        if (existingUDA) {
            return res.status(400).json({ message: 'UDA number already exists' });
        }

        const newUDA = new UDA({
            udaNumber,
            name,
            description,
            parentUDA: parentUDA || '',
            type,
            billable,
            projectRequired,
            active,
        });

        const savedUDA = await newUDA.save();
        res.status(201).json(savedUDA);
    } catch (error) {
        console.error('Error creating UDA configuration:', error);
        res.status(500).json({ message: 'Failed to create UDA configuration' });
    }
});

// Update a UDA configuration
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
    try {
        const {
            udaNumber,
            name,
            description,
            parentUDA,
            type,
            billable,
            projectRequired,
            active,
        } = req.body;

        // If udaNumber is being changed, check if it already exists
        if (udaNumber) {
            const existingUDA = await UDA.findOne({
                udaNumber,
                _id: { $ne: req.params.id },
            });

            if (existingUDA) {
                return res.status(400).json({ message: 'UDA number already exists' });
            }
        }

        const updatedUDA = await UDA.findByIdAndUpdate(
            req.params.id,
            {
                udaNumber,
                name,
                description,
                parentUDA: parentUDA || '',
                type,
                billable,
                projectRequired,
                active,
            },
            { new: true, runValidators: true }
        );

        if (!updatedUDA) {
            return res.status(404).json({ message: 'UDA configuration not found' });
        }

        res.json(updatedUDA);
    } catch (error) {
        console.error('Error updating UDA configuration:', error);
        res.status(500).json({ message: 'Failed to update UDA configuration' });
    }
});

// Delete a UDA configuration
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
    try {
        const deletedUDA = await UDA.findByIdAndDelete(req.params.id);

        if (!deletedUDA) {
            return res.status(404).json({ message: 'UDA configuration not found' });
        }

        res.json({ message: 'UDA configuration deleted successfully' });
    } catch (error) {
        console.error('Error deleting UDA configuration:', error);
        res.status(500).json({ message: 'Failed to delete UDA configuration' });
    }
});

// Bulk preview endpoint
router.post('/bulk-preview', authenticateToken, upload.single('file'), async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Parse the file
        const data = parseFile(req.file.buffer, req.file.mimetype);

        if (!data || data.length === 0) {
            return res.status(400).json({ message: 'File is empty or invalid' });
        }

        // Validate each row and prepare preview
        const preview = await Promise.all(
            data.map(async (row: any) => {
                const validation = validateUDAData(row);
                
                // Check if UDA number already exists
                let errors = [...validation.errors];
                if (row.udaNumber) {
                    const existing = await UDA.findOne({ udaNumber: row.udaNumber });
                    if (existing) {
                        errors.push(`UDA Number "${row.udaNumber}" already exists`);
                    }
                }

                return {
                    udaNumber: row.udaNumber || '',
                    name: row.name || '',
                    description: row.description || '',
                    parentUDA: row.parentUDA || '',
                    type: row.type || '',
                    billable: row.billable || '',
                    projectRequired: row.projectRequired || '',
                    active: row.active || '',
                    status: validation.valid && errors.length === 0 ? 'valid' : 'error',
                    errors: errors.length > 0 ? errors : undefined,
                };
            })
        );

        res.json({
            success: true,
            preview,
            totalRows: preview.length,
            validRows: preview.filter((p: any) => p.status === 'valid').length,
            errorRows: preview.filter((p: any) => p.status === 'error').length,
        });
    } catch (error: any) {
        console.error('Error previewing bulk upload:', error);
        res.status(500).json({ 
            message: error.message || 'Failed to preview file',
            error: error.toString() 
        });
    }
});

// Bulk upload endpoint
router.post('/bulk-upload', authenticateToken, upload.single('file'), async (req: Request, res: Response) => {
    try {
        console.log('=== Bulk Upload Request Started ===');
        
        if (!req.file) {
            console.log('ERROR: No file uploaded');
            return res.status(400).json({ message: 'No file uploaded' });
        }

        console.log(`File received: ${req.file.originalname}, Size: ${req.file.size} bytes`);

        // Parse the file
        const data = parseFile(req.file.buffer, req.file.mimetype);

        console.log(`Parsed ${data.length} rows from file`);
        
        if (!data || data.length === 0) {
            console.log('ERROR: File is empty or invalid');
            return res.status(400).json({ message: 'File is empty or invalid' });
        }

        console.log('Sample row:', data[0]);

        // Validate all rows first
        console.log('Starting validation...');
        const validationResults = await Promise.all(
            data.map(async (row: any, index: number) => {
                const validation = validateUDAData(row);
                const existing = row.udaNumber ? await UDA.findOne({ udaNumber: row.udaNumber }) : null;
                
                if (index === 0) {
                    console.log('First row validation:', {
                        udaNumber: row.udaNumber,
                        validationValid: validation.valid,
                        exists: !!existing,
                        errors: validation.errors
                    });
                }
                
                return {
                    row,
                    valid: validation.valid && !existing,
                    errors: existing ? [`UDA Number "${row.udaNumber}" already exists`] : validation.errors,
                };
            })
        );

        console.log(`Validation complete. Valid: ${validationResults.filter(r => r.valid).length}, Invalid: ${validationResults.filter(r => !r.valid).length}`);

        // Check if any rows have errors
        const invalidRows = validationResults.filter((r) => !r.valid);
        if (invalidRows.length > 0) {
            console.log(`Validation failed: ${invalidRows.length} invalid rows`);
            console.log('First invalid row:', invalidRows[0]);
            return res.status(400).json({
                message: `${invalidRows.length} row(s) have validation errors`,
                errors: invalidRows.slice(0, 5).map((r, index) => ({
                    row: index + 2,
                    udaNumber: r.row.udaNumber,
                    errors: r.errors,
                })),
            });
        }

        // Create all UDAs
        console.log(`Starting creation of ${validationResults.length} UDAs...`);
        const created = [];
        const errors = [];
        
        for (let i = 0; i < validationResults.length; i++) {
            try {
                const result = validationResults[i];
                const row = result.row;
                
                if (i === 0) {
                    console.log('Creating first UDA:', {
                        udaNumber: row.udaNumber,
                        name: row.name,
                        type: row.type,
                        billable: row.billable,
                        projectRequired: row.projectRequired,
                        active: row.active
                    });
                }
                
                const newUDA = new UDA({
                    udaNumber: row.udaNumber,
                    name: row.name,
                    description: row.description || '',
                    parentUDA: row.parentUDA || '',
                    type: row.type,
                    billable: row.billable,
                    projectRequired: row.projectRequired,
                    active: row.active,
                });
                
                const savedUDA = await newUDA.save();
                created.push(savedUDA);
                
                if ((i + 1) % 10 === 0) {
                    console.log(`Created ${i + 1} UDAs...`);
                }
            } catch (error: any) {
                console.error(`Error saving UDA at row ${i + 2}:`, error.message);
                errors.push({
                    row: i + 2,
                    udaNumber: validationResults[i].row.udaNumber,
                    error: error.message,
                });
            }
        }

        console.log(`Creation complete. Created: ${created.length}, Failed: ${errors.length}`);

        if (errors.length > 0) {
            console.log(`Partial success: ${created.length} created, ${errors.length} failed`);
            return res.status(207).json({
                success: true,
                message: `Created ${created.length} UDA configuration(s). ${errors.length} failed.`,
                created: created.length,
                failed: errors.length,
                errors: errors,
            });
        }

        console.log(`=== Bulk Upload Complete: ${created.length} UDAs created ===`);
        res.status(201).json({
            success: true,
            message: `Successfully created ${created.length} UDA configuration(s)`,
            created: created.length,
        });
    } catch (error: any) {
        console.error('=== Bulk Upload Error ===');
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        res.status(500).json({ 
            message: error.message || 'Failed to process bulk upload',
            error: error.toString(),
            details: error.stack,
        });
    }
});

export default router;
