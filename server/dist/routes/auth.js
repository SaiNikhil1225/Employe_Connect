"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Employee_1 = __importDefault(require("../models/Employee"));
const validation_1 = require("../middleware/validation");
const router = express_1.default.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';
// Login endpoint with validation
router.post('/login', validation_1.authValidation.login, async (req, res) => {
    try {
        const { email, password } = req.body;
        // Find employee by email and include password field
        const employee = await Employee_1.default.findOne({
            email: email.toLowerCase(),
            hasLoginAccess: true,
            isActive: true
        }).select('+password');
        if (!employee) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password, or account does not have login access'
            });
        }
        if (!employee.password) {
            return res.status(401).json({
                success: false,
                message: 'Account does not have login credentials configured'
            });
        }
        // Check if password is hashed (starts with $2a$ or $2b$ for bcrypt)
        let isPasswordValid = false;
        if (employee.password?.startsWith('$2')) {
            // Password is hashed, use bcrypt compare
            isPasswordValid = await bcryptjs_1.default.compare(password, employee.password);
        }
        else {
            // Legacy plain text password - compare directly and hash it
            isPasswordValid = employee.password === password;
            if (isPasswordValid) {
                // Hash the password for future logins
                const hashedPassword = await bcryptjs_1.default.hash(password, 10);
                employee.password = hashedPassword;
                await employee.save();
            }
        }
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({
            id: employee._id.toString(),
            email: employee.email,
            role: employee.role,
            employeeId: employee.employeeId
        }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
        // Return employee data without password
        // Use profilePhoto as the primary avatar source, fallback to avatar field
        const avatarPhoto = employee.profilePhoto || employee.avatar;
        const userResponse = {
            id: employee._id.toString(),
            _id: employee._id.toString(),
            email: employee.email,
            name: employee.name,
            role: employee.role,
            department: employee.department,
            designation: employee.designation,
            employeeId: employee.employeeId,
            avatar: avatarPhoto,
            phone: employee.phone,
            location: employee.location
        };
        res.json({
            user: userResponse,
            token,
            refreshToken: token
        });
    }
    catch (error) {
        console.error('Login error:', error?.message, error?.stack);
        res.status(500).json({
            success: false,
            message: process.env.NODE_ENV === 'production'
                ? `Login failed: ${error?.message || 'Unknown error'}`
                : 'Login failed. Please try again.'
        });
    }
});
// Verify token endpoint
router.get('/verify', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }
        // Verify JWT token
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        // Find employee
        const employee = await Employee_1.default.findById(decoded.id);
        if (!employee || !employee.hasLoginAccess || !employee.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token or account disabled'
            });
        }
        // Return employee data
        // Use profilePhoto as the primary avatar source, fallback to avatar field
        const avatarPhotoVerify = employee.profilePhoto || employee.avatar;
        const userResponse = {
            id: employee._id.toString(),
            _id: employee._id.toString(),
            email: employee.email,
            name: employee.name,
            role: employee.role,
            department: employee.department,
            designation: employee.designation,
            employeeId: employee.employeeId,
            avatar: avatarPhotoVerify,
            phone: employee.phone,
            location: employee.location
        };
        res.json(userResponse);
    }
    catch (error) {
        console.error('Token verification error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
});
// Logout endpoint
router.post('/logout', (_req, res) => {
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});
// Get current user endpoint
router.get('/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }
        // Verify JWT token
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        // Find employee
        const employee = await Employee_1.default.findById(decoded.id);
        if (!employee) {
            return res.status(401).json({
                success: false,
                message: 'Employee not found'
            });
        }
        // Return employee data
        // Use profilePhoto as the primary avatar source, fallback to avatar field
        const avatarPhotoMe = employee.profilePhoto || employee.avatar;
        const userResponse = {
            id: employee._id.toString(),
            _id: employee._id.toString(),
            email: employee.email,
            name: employee.name,
            role: employee.role,
            department: employee.department,
            designation: employee.designation,
            employeeId: employee.employeeId,
            avatar: avatarPhotoMe,
            phone: employee.phone,
            location: employee.location
        };
        res.json(userResponse);
    }
    catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user data'
        });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map