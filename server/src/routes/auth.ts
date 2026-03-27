import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import axios from 'axios';
import Employee from '../models/Employee';
import { authValidation } from '../middleware/validation';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';
// Azure env vars are read lazily inside the handler because dotenv.config()
// runs after route modules are imported.
const getAzureConfig = () => ({
  tenantId: process.env.AZURE_TENANT_ID || '',
  clientId: process.env.AZURE_CLIENT_ID || '',
});

// Login endpoint with validation
router.post('/login', authValidation.login, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find employee by email and include password field
    const employee = await Employee.findOne({ 
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
      isPasswordValid = await bcrypt.compare(password, employee.password);
    } else {
      // Legacy plain text password - compare directly and hash it
      isPasswordValid = employee.password === password;
      if (isPasswordValid) {
        // Hash the password for future logins
        const hashedPassword = await bcrypt.hash(password, 10);
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
    const token = jwt.sign(
      {
        id: employee._id.toString(),
        email: employee.email,
        role: employee.role,
        employeeId: employee.employeeId
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRE } as jwt.SignOptions
    );

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
  } catch (error: any) {
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
router.get('/verify', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string; employeeId?: string };

    // Find employee
    const employee = await Employee.findById(decoded.id);

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
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

// Logout endpoint
router.post('/logout', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Microsoft / Azure AD login endpoint
// Receives a Microsoft ID token from the frontend (obtained via MSAL),
// validates it, then issues an app-level JWT.
router.post('/microsoft', async (req: Request, res: Response) => {
  try {
    const { tenantId: AZURE_TENANT_ID, clientId: AZURE_CLIENT_ID } = getAzureConfig();

    if (!AZURE_TENANT_ID || !AZURE_CLIENT_ID) {
      return res.status(503).json({
        success: false,
        message: 'Microsoft authentication is not configured on this server. Add AZURE_TENANT_ID and AZURE_CLIENT_ID to server .env.'
      });
    }

    const { idToken } = req.body;
    if (!idToken || typeof idToken !== 'string') {
      console.error('[/auth/microsoft] No idToken in request body. Keys:', Object.keys(req.body || {}));
      return res.status(400).json({ success: false, message: 'idToken is required' });
    }

    console.log(`[/auth/microsoft] Received token (length: ${idToken.length}, starts: ${idToken.substring(0, 20)}...)`);

    // Decode the token header to extract the key ID (kid)
    const decoded = jwt.decode(idToken, { complete: true });
    if (!decoded || typeof decoded === 'string' || !decoded.header?.kid) {
      console.error('[/auth/microsoft] Cannot decode token. decoded:', decoded ? 'truthy but no kid' : 'null');
      return res.status(401).json({ success: false, message: 'Invalid Microsoft token format. The ID token could not be decoded.' });
    }

    console.log(`[/auth/microsoft] Token decoded. alg: ${decoded.header.alg}, kid: ${decoded.header.kid}`);

    // Fetch Microsoft's current signing keys
    const client = jwksClient({
      jwksUri: `https://login.microsoftonline.com/${AZURE_TENANT_ID}/discovery/v2.0/keys`,
      cache: true,
      cacheMaxAge: 86400000, // 24 hours
      rateLimit: true,
    });

    const key = await client.getSigningKey(decoded.header.kid as string);
    const signingKey = key.getPublicKey();

    // Verify signature, audience, and issuer
    const payload = jwt.verify(idToken, signingKey, {
      audience: AZURE_CLIENT_ID,
      issuer: `https://login.microsoftonline.com/${AZURE_TENANT_ID}/v2.0`,
    }) as { email?: string; preferred_username?: string; name?: string; oid: string };

    const microsoftEmail = (payload.email || payload.preferred_username || '').toLowerCase();
    if (!microsoftEmail) {
      return res.status(401).json({ success: false, message: 'Could not extract email from Microsoft token' });
    }

    console.log(`[/auth/microsoft] Token email: "${microsoftEmail}" (oid: ${payload.oid})`);

    // Look up the employee by their Microsoft / Office 365 email
    const employee = await Employee.findOne({
      email: microsoftEmail,
      hasLoginAccess: true,
      isActive: true,
    });

    if (!employee) {
      console.warn(`[/auth/microsoft] No employee found for email: "${microsoftEmail}"`);
      return res.status(401).json({
        success: false,
        message: `No active account found for "${microsoftEmail}". Ensure this Microsoft email matches your employee record, or contact your administrator.`
      });
    }

    // Fetch profile photo from Microsoft Graph if an access token was provided
    const { graphAccessToken } = req.body;
    console.log(`[/auth/microsoft] graphAccessToken present: ${!!graphAccessToken}, length: ${graphAccessToken?.length || 0}`);
    if (graphAccessToken && typeof graphAccessToken === 'string') {
      try {
        const graphRes = await axios.get<ArrayBuffer>(
          'https://graph.microsoft.com/v1.0/me/photo/$value',
          {
            headers: { Authorization: `Bearer ${graphAccessToken}` },
            responseType: 'arraybuffer',
          }
        );
        const contentType = (graphRes.headers['content-type'] as string) || 'image/jpeg';
        const base64Photo = `data:${contentType};base64,${Buffer.from(graphRes.data).toString('base64')}`;
        employee.profilePhoto = base64Photo;
        await employee.save();
        console.log(`[/auth/microsoft] Saved Graph profile photo for ${microsoftEmail} (${contentType})`);
      } catch (photoErr: any) {
        const status = photoErr?.response?.status;
        if (status === 404) {
          console.log(`[/auth/microsoft] No profile photo set in Microsoft 365 for ${microsoftEmail}`);
        } else {
          console.warn(`[/auth/microsoft] Failed to fetch Graph photo: ${status || ''} ${photoErr?.message}`);
        }
      }
    }

    // Issue an app-level JWT
    const token = jwt.sign(
      {
        id: employee._id.toString(),
        email: employee.email,
        role: employee.role,
        employeeId: employee.employeeId,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRE } as jwt.SignOptions
    );

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
      location: employee.location,
    };

    return res.json({ user: userResponse, token, refreshToken: token });
  } catch (error: any) {
    console.error('Microsoft auth error:', error?.name, error?.message);
    console.error('Microsoft auth stack:', error?.stack);

    // Surface specific JWT validation failures as 401
    if (
      error?.name === 'JsonWebTokenError' ||
      error?.name === 'TokenExpiredError' ||
      error?.name === 'NotBeforeError'
    ) {
      return res.status(401).json({ success: false, message: 'Microsoft token validation failed' });
    }

    return res.status(500).json({ success: false, message: 'Microsoft authentication failed. Please try again.' });
  }
});

// Get current user endpoint
router.get('/me', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string; employeeId?: string };

    // Find employee
    const employee = await Employee.findById(decoded.id);

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
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user data'
    });
  }
});

export default router;

