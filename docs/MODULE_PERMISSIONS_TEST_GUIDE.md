# 🧪 Module Permissions Testing Guide

**Date:** March 2, 2026  
**Purpose:** Test newly implemented module permissions for Employee and Leave modules  
**Backend Status:** ✅ Server running on port 5000

---

## 📋 Test Preparation

### Prerequisites
1. ✅ Backend server running (port 5000)
2. ✅ Frontend server running (port 5173/5174)
3. ✅ MongoDB connected
4. 📝 Multiple test users with different permission configurations

### Test Users Required

You'll need to create/configure these test scenarios in Super Admin:

| Test User | Employee ID | Module | Permissions | Purpose |
|-----------|-------------|---------|-------------|---------|
| **User A** | TEST001 | EMPLOYEE | ❌ None | Test blocked access |
| **User B** | TEST002 | EMPLOYEE | ✅ View only | Test view access |
| **User C** | TEST003 | EMPLOYEE | ✅ View + Add | Test create access |
| **User D** | TEST004 | EMPLOYEE | ✅ View + Add + Modify | Test full access |
| **User E** | TEST005 | LEAVE | ❌ None | Test blocked leave access |
| **User F** | TEST006 | LEAVE | ✅ View only | Test view-only leave |
| **User G** | TEST007 | LEAVE | ✅ All permissions | Test full leave access |

---

## 🧪 Test Scenarios

## Part 1: Employee Module Permissions

### Test 1.1: Create Employee (POST /api/employees)

**Endpoint:** `POST http://localhost:5000/api/employees`

#### Test Case 1.1a: User WITHOUT 'add' permission
```bash
# Headers
Authorization: Bearer <TEST001_TOKEN>
Content-Type: application/json

# Request Body
{
  "name": "Test Employee",
  "email": "test@example.com",
  "department": "IT",
  "designation": "Developer"
}

# Expected Response: 403 Forbidden
{
  "success": false,
  "message": "You do not have permission to add in EMPLOYEE module"
}
```

#### Test Case 1.1b: User WITH 'add' permission
```bash
# Headers
Authorization: Bearer <TEST003_TOKEN>
Content-Type: application/json

# Request Body
{
  "name": "Test Employee",
  "email": "test@example.com",
  "department": "IT",
  "designation": "Developer"
}

# Expected Response: 201 Created
{
  "success": true,
  "data": { /* employee object */ }
}
```

---

### Test 1.2: Update Employee (PUT /api/employees/:id)

**Endpoint:** `PUT http://localhost:5000/api/employees/:id`

#### Test Case 1.2a: User WITHOUT 'modify' permission
```bash
# Headers
Authorization: Bearer <TEST002_TOKEN>  # View only
Content-Type: application/json

# Request Body
{
  "name": "Updated Name",
  "department": "HR"
}

# Expected Response: 403 Forbidden
{
  "success": false,
  "message": "You do not have permission to modify in EMPLOYEE module"
}
```

#### Test Case 1.2b: User WITH 'modify' permission
```bash
# Headers
Authorization: Bearer <TEST004_TOKEN>  # Full access
Content-Type: application/json

# Request Body
{
  "name": "Updated Name",
  "department": "HR"
}

# Expected Response: 200 OK
{
  "success": true,
  "data": { /* updated employee */ }
}
```

---

### Test 1.3: Delete Employee (DELETE /api/employees/:id)

**Endpoint:** `DELETE http://localhost:5000/api/employees/:id`

#### Test Case 1.3a: User WITHOUT 'modify' permission
```bash
# Headers
Authorization: Bearer <TEST002_TOKEN>  # View only

# Expected Response: 403 Forbidden
{
  "success": false,
  "message": "You do not have permission to modify in EMPLOYEE module"
}
```

#### Test Case 1.3b: User WITH 'modify' permission
```bash
# Headers
Authorization: Bearer <TEST004_TOKEN>  # Full access

# Expected Response: 200 OK
{
  "success": true,
  "message": "Employee deleted successfully"
}
```

---

## Part 2: Leave Module Permissions

### Test 2.1: View All Leaves (GET /api/leaves)

**Endpoint:** `GET http://localhost:5000/api/leaves`

#### Test Case 2.1a: User WITHOUT 'view' permission
```bash
# Headers
Authorization: Bearer <TEST005_TOKEN>

# Expected Response: 403 Forbidden
{
  "success": false,
  "message": "You do not have permission to view in LEAVE module"
}
```

#### Test Case 2.1b: User WITH 'view' permission
```bash
# Headers
Authorization: Bearer <TEST006_TOKEN>

# Expected Response: 200 OK
{
  "success": true,
  "data": [ /* array of leaves */ ]
}
```

---

### Test 2.2: View User Leaves (GET /api/leaves/user/:userId)

**Endpoint:** `GET http://localhost:5000/api/leaves/user/:userId`

#### Test Case 2.2a: Blocked access
```bash
# Headers
Authorization: Bearer <TEST005_TOKEN>  # No permissions

# Expected Response: 403 Forbidden
{
  "success": false,
  "message": "You do not have permission to view in LEAVE module"
}
```

#### Test Case 2.2b: Allowed access
```bash
# Headers
Authorization: Bearer <TEST006_TOKEN>  # View permission

# Expected Response: 200 OK
{
  "success": true,
  "data": [ /* user's leaves */ ]
}
```

---

### Test 2.3: View Pending Leaves (GET /api/leaves/pending)

**Endpoint:** `GET http://localhost:5000/api/leaves/pending`

#### Test Case 2.3a: Blocked access
```bash
# Headers
Authorization: Bearer <TEST005_TOKEN>

# Expected Response: 403 Forbidden
{
  "success": false,
  "message": "You do not have permission to view in LEAVE module"
}
```

#### Test Case 2.3b: Allowed access (Manager/HR use case)
```bash
# Headers
Authorization: Bearer <TEST007_TOKEN>  # Full permissions

# Expected Response: 200 OK
{
  "success": true,
  "data": [ /* pending leaves */ ]
}
```

---

### Test 2.4: Create Leave (POST /api/leaves)

**Endpoint:** `POST http://localhost:5000/api/leaves`

#### Test Case 2.4a: User WITHOUT 'add' permission
```bash
# Headers
Authorization: Bearer <TEST006_TOKEN>  # View only
Content-Type: application/json

# Request Body
{
  "employeeId": "TEST006",
  "leaveType": "Annual Leave",
  "startDate": "2026-03-10",
  "endDate": "2026-03-12",
  "days": 3,
  "reason": "Personal"
}

# Expected Response: 403 Forbidden
{
  "success": false,
  "message": "You do not have permission to add in LEAVE module"
}
```

#### Test Case 2.4b: User WITH 'add' permission
```bash
# Headers
Authorization: Bearer <TEST007_TOKEN>
Content-Type: application/json

# Request Body
{
  "employeeId": "TEST007",
  "leaveType": "Annual Leave",
  "startDate": "2026-03-10",
  "endDate": "2026-03-12",
  "days": 3,
  "reason": "Personal"
}

# Expected Response: 201 Created
{
  "success": true,
  "data": { /* leave record */ }
}
```

---

## 🛠️ Testing Tools

### Option 1: Postman / Thunder Client (VS Code)

1. Import the collection or create requests manually
2. Set up environment variables for tokens
3. Run tests sequentially

### Option 2: cURL Commands

```bash
# Example: Test Employee Create (Blocked)
curl -X POST http://localhost:5000/api/employees \
  -H "Authorization: Bearer YOUR_TEST_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Employee",
    "email": "test@example.com",
    "department": "IT"
  }'

# Example: Test Leave View (Allowed)
curl -X GET http://localhost:5000/api/leaves \
  -H "Authorization: Bearer YOUR_TEST_TOKEN"
```

### Option 3: Frontend Testing

1. **Configure Module Permissions:**
   - Go to `/superadmin/permissions`
   - Search for test employee
   - Set EMPLOYEE module: View only
   - Try to create/edit employee from Employee Management page
   - Should see error or blocked UI

2. **Test Leave Permissions:**
   - Set LEAVE module permissions for test user
   - Navigate to Leave Management
   - Try to view/create/approve leaves based on permissions

---

## ✅ Expected Results Summary

| Test | User Permission | Expected Outcome |
|------|----------------|------------------|
| POST /employees | ❌ No 'add' | 403 Forbidden |
| POST /employees | ✅ Has 'add' | 201 Created |
| PUT /employees/:id | ❌ No 'modify' | 403 Forbidden |
| PUT /employees/:id | ✅ Has 'modify' | 200 OK |
| DELETE /employees/:id | ❌ No 'modify' | 403 Forbidden |
| DELETE /employees/:id | ✅ Has 'modify' | 200 OK |
| GET /leaves | ❌ No 'view' | 403 Forbidden |
| GET /leaves | ✅ Has 'view' | 200 OK |
| GET /leaves/user/:id | ❌ No 'view' | 403 Forbidden |
| GET /leaves/user/:id | ✅ Has 'view' | 200 OK |
| GET /leaves/pending | ❌ No 'view' | 403 Forbidden |
| GET /leaves/pending | ✅ Has 'view' | 200 OK |
| POST /leaves | ❌ No 'add' | 403 Forbidden |
| POST /leaves | ✅ Has 'add' | 201 Created |

---

## 🐛 Troubleshooting

### Issue: Getting 401 Unauthorized
**Solution:** Check if authentication token is valid and not expired

### Issue: Getting 500 Internal Server Error
**Solution:** Check server logs for errors, ensure MongoDB is connected

### Issue: Permission check not working
**Solution:** 
1. Verify module permission exists in database for test employee
2. Check `employeeId` matches between token and permission record
3. Ensure `enabled: true` in module permission

### Issue: No permission record = Access allowed
**Behavior:** By design - backward compatibility
**Note:** If no permission record exists, access is allowed by default

---

## 📊 Test Results Template

Use this template to record your test results:

```
Date: ___________
Tester: ___________

EMPLOYEE MODULE TESTS:
[ ] Test 1.1a: Create blocked - PASS/FAIL
[ ] Test 1.1b: Create allowed - PASS/FAIL
[ ] Test 1.2a: Update blocked - PASS/FAIL
[ ] Test 1.2b: Update allowed - PASS/FAIL
[ ] Test 1.3a: Delete blocked - PASS/FAIL
[ ] Test 1.3b: Delete allowed - PASS/FAIL

LEAVE MODULE TESTS:
[ ] Test 2.1a: View all blocked - PASS/FAIL
[ ] Test 2.1b: View all allowed - PASS/FAIL
[ ] Test 2.2a: View user blocked - PASS/FAIL
[ ] Test 2.2b: View user allowed - PASS/FAIL
[ ] Test 2.3a: View pending blocked - PASS/FAIL
[ ] Test 2.3b: View pending allowed - PASS/FAIL
[ ] Test 2.4a: Create blocked - PASS/FAIL
[ ] Test 2.4b: Create allowed - PASS/FAIL

Overall: _____ / 14 tests passed
```

---

## 🎯 Quick Start Testing Steps

1. **Configure Test User in Super Admin:**
   - Go to `/superadmin/permissions`
   - Search for your employee ID
   - Set EMPLOYEE module: View only (disable Add and Modify)
   - Save

2. **Test with Postman:**
   - Try to POST to `/api/employees`
   - Use your user's auth token
   - Should get 403 Forbidden

3. **Enable Permission:**
   - Go back to Super Admin
   - Enable Add permission for EMPLOYEE module
   - Try POST again
   - Should succeed with 201 Created

4. **Repeat for Leave Module**

---

**Testing Guide End** | Module Permissions v1.0
