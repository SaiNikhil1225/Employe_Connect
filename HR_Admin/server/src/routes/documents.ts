import express, { Request, Response } from 'express';
import EmployeeDocument from '../models/EmployeeDocument';
import Employee from '../models/Employee';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/documents');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, PDF, DOC, and DOCX files are allowed.'));
    }
  }
});

// Get all documents for an employee
router.get('/employee/:employeeId', async (req: Request, res: Response) => {
  try {
    const documents = await EmployeeDocument.find({ 
      employeeId: req.params.employeeId,
      isActive: true 
    }).sort({ uploadedDate: -1 });
    
    res.json({ success: true, data: documents });
  } catch (error) {
    console.error('Failed to fetch documents:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch documents' });
  }
});

// Get documents by type
router.get('/employee/:employeeId/type/:documentType', async (req: Request, res: Response) => {
  try {
    const documents = await EmployeeDocument.find({ 
      employeeId: req.params.employeeId,
      documentType: req.params.documentType,
      isActive: true 
    }).sort({ uploadedDate: -1 });
    
    res.json({ success: true, data: documents });
  } catch (error) {
    console.error('Failed to fetch documents:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch documents' });
  }
});

// Upload a document
router.post('/upload', upload.single('document'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { employeeId, documentType, documentName, notes, expiryDate, metadata } = req.body;

    // Verify employee exists
    const employee = await Employee.findOne({ employeeId });
    if (!employee) {
      // Delete uploaded file if employee not found
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const documentUrl = `/uploads/documents/${req.file.filename}`;

    const document = new EmployeeDocument({
      employeeId,
      documentType,
      documentName: documentName || req.file.originalname,
      documentUrl,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadedBy: req.body.uploadedBy || 'system',
      notes,
      expiryDate,
      metadata: metadata ? JSON.parse(metadata) : undefined
    });

    await document.save();

    res.status(201).json({ 
      success: true, 
      data: document,
      message: 'Document uploaded successfully'
    });
  } catch (error) {
    console.error('Failed to upload document:', error);
    // Clean up uploaded file if database operation failed
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Failed to delete file after error:', unlinkError);
      }
    }
    res.status(500).json({ success: false, message: 'Failed to upload document' });
  }
});

// Verify a document
router.patch('/:documentId/verify', async (req: Request, res: Response) => {
  try {
    const { verifiedBy } = req.body;

    const document = await EmployeeDocument.findByIdAndUpdate(
      req.params.documentId,
      {
        verificationStatus: 'verified',
        verifiedBy,
        verifiedDate: new Date()
      },
      { new: true }
    );

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    res.json({ 
      success: true, 
      data: document,
      message: 'Document verified successfully'
    });
  } catch (error) {
    console.error('Failed to verify document:', error);
    res.status(500).json({ success: false, message: 'Failed to verify document' });
  }
});

// Reject a document
router.patch('/:documentId/reject', async (req: Request, res: Response) => {
  try {
    const { verifiedBy, rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({ 
        success: false, 
        message: 'Rejection reason is required' 
      });
    }

    const document = await EmployeeDocument.findByIdAndUpdate(
      req.params.documentId,
      {
        verificationStatus: 'rejected',
        verifiedBy,
        verifiedDate: new Date(),
        rejectionReason
      },
      { new: true }
    );

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    res.json({ 
      success: true, 
      data: document,
      message: 'Document rejected'
    });
  } catch (error) {
    console.error('Failed to reject document:', error);
    res.status(500).json({ success: false, message: 'Failed to reject document' });
  }
});

// Delete (soft delete) a document
router.delete('/:documentId', async (req: Request, res: Response) => {
  try {
    const document = await EmployeeDocument.findByIdAndUpdate(
      req.params.documentId,
      { isActive: false },
      { new: true }
    );

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    res.json({ 
      success: true, 
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Failed to delete document:', error);
    res.status(500).json({ success: false, message: 'Failed to delete document' });
  }
});

// Get pending documents for verification
router.get('/pending-verification', async (_req: Request, res: Response) => {
  try {
    const documents = await EmployeeDocument.find({ 
      verificationStatus: 'pending',
      isActive: true 
    })
    .sort({ uploadedDate: -1 })
    .limit(100);
    
    res.json({ success: true, data: documents });
  } catch (error) {
    console.error('Failed to fetch pending documents:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch pending documents' });
  }
});

// Get expiring documents
router.get('/expiring-soon', async (_req: Request, res: Response) => {
  try {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const documents = await EmployeeDocument.find({ 
      expiryDate: { 
        $lte: thirtyDaysFromNow,
        $gte: new Date()
      },
      isActive: true 
    }).sort({ expiryDate: 1 });
    
    res.json({ success: true, data: documents });
  } catch (error) {
    console.error('Failed to fetch expiring documents:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch expiring documents' });
  }
});

// Update document metadata
router.patch('/:documentId/metadata', async (req: Request, res: Response) => {
  try {
    const { metadata, expiryDate, notes } = req.body;

    const updateData: any = {};
    if (metadata) updateData.metadata = metadata;
    if (expiryDate) updateData.expiryDate = expiryDate;
    if (notes !== undefined) updateData.notes = notes;

    const document = await EmployeeDocument.findByIdAndUpdate(
      req.params.documentId,
      updateData,
      { new: true }
    );

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    res.json({ 
      success: true, 
      data: document,
      message: 'Document metadata updated'
    });
  } catch (error) {
    console.error('Failed to update document metadata:', error);
    res.status(500).json({ success: false, message: 'Failed to update document metadata' });
  }
});

export default router;
