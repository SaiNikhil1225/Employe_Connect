# Employee Management Module - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

This guide will help you quickly integrate the Employee Management Module into your application.

---

## ✅ Prerequisites

Before starting, ensure:
- [x] MongoDB is installed and running
- [x] Backend server is running on `http://localhost:5000`
- [x] Frontend dev server can be started
- [x] You have HR admin and employee user accounts

---

## 📦 Step 1: Verify Installation (30 seconds)

All files are already created. Verify they exist:

```bash
# Check backend files
ls server/src/models/EmployeeDocument.ts
ls server/src/routes/documents.ts

# Check frontend files  
ls src/services/employeeManagementService.ts
ls src/components/employee/MedicalInfoTab.tsx
ls src/pages/employee/EnhancedProfile.tsx
```

**Expected:** All files should exist ✅

---

## 🔌 Step 2: Add Routes (2 minutes)

### Option A: Quick Integration (Copy-Paste)

Add to your existing router file (e.g., `src/App.tsx`):

```typescript
// Add imports at top
import EnhancedProfile from '@/pages/employee/EnhancedProfile';
import OnboardingDashboard from '@/pages/employee/OnboardingDashboard';
import OffboardingDashboard from '@/pages/employee/OffboardingDashboard';
import EmployeeLifecycleDashboard from '@/pages/hr/EmployeeLifecycleDashboard';

// Add routes in your Routes component
<Route path="/employee/profile" element={<EnhancedProfile />} />
<Route path="/employee/onboarding" element={<OnboardingDashboard />} />
<Route path="/employee/offboarding" element={<OffboardingDashboard />} />
<Route path="/hr/employee-lifecycle" element={<EmployeeLifecycleDashboard />} />
```

### Option B: Using Existing Structure

If you already have employee routes, add these alongside them.

---

## 🧭 Step 3: Add Navigation Links (1 minute)

Add to your sidebar/navigation menu:

```typescript
// For Employee users
<NavLink to="/employee/profile">
  <User className="h-4 w-4" />
  My Profile
</NavLink>

// For HR Admin users
<NavLink to="/hr/employee-lifecycle">
  <Users className="h-4 w-4" />
  Employee Lifecycle
</NavLink>
```

---

## 🎯 Step 4: Test It! (1 minute)

### Test Employee Profile
1. Login as employee
2. Navigate to `/employee/profile`
3. Click on different tabs
4. Try adding an emergency contact
5. Upload a document

### Test HR Dashboard
1. Login as HR admin
2. Navigate to `/hr/employee-lifecycle`
3. Check statistics
4. View different tabs

---

## 🎉 You're Done!

The module is now integrated and ready to use!

---

## 📋 Common Tasks

### Add an Emergency Contact
1. Go to My Profile
2. Click "Emergency Contacts" tab
3. Click "Add Contact" button
4. Fill form and save

### Upload a Document
1. Go to My Profile
2. Click "Documents" tab
3. Click "Upload Document"
4. Drag & drop file or click to browse
5. Select document type
6. Submit

### Track Onboarding
1. Go to Onboarding page
2. Check off completed tasks
3. View progress percentage

### HR: Verify Documents
1. Go to Employee Lifecycle dashboard
2. Click "Document Verification" tab
3. Review pending documents
4. Click Verify or Reject

---

## 🔧 Troubleshooting

### Issue: "Cannot find module"
**Solution:** Check that all imports use `@/` alias correctly

### Issue: Components not showing
**Solution:** Verify routes are added to router

### Issue: API errors
**Solution:** Ensure backend server is running on port 5000

### Issue: File upload fails
**Solution:** Check multer configuration in backend

---

## 📚 Documentation Reference

- **Full Implementation:** `docs/EMPLOYEE_MANAGEMENT_PHASE2_SUMMARY.md`
- **Routing Guide:** `docs/ROUTING_CONFIGURATION_GUIDE.md`
- **API Docs:** `docs/EMPLOYEE_MANAGEMENT_API_TESTING.md`
- **Checklist:** `docs/COMPLETE_IMPLEMENTATION_CHECKLIST.md`

---

## 🎨 Customization Tips

### Change Colors
Edit color classes in components:
```typescript
// Example: Change medical info icon color
<Heart className="h-5 w-5 text-red-500" />
// Change to:
<Heart className="h-5 w-5 text-blue-500" />
```

### Add New Tab
1. Create new tab component in `src/components/employee/`
2. Import in `EnhancedProfile.tsx`
3. Add to Tabs component

### Modify Form Fields
Edit the respective tab component and add/remove input fields.

---

## 🚀 Advanced Features

### Enable File Preview
```typescript
// In DocumentsTab.tsx, add preview button
<Button onClick={() => window.open(fileUrl, '_blank')}>
  <Eye className="h-4 w-4" />
</Button>
```

### Add Notifications
```typescript
// Use existing toast system
import { toast } from 'sonner';

toast.success('Profile updated!');
toast.error('Upload failed');
toast.info('Document pending verification');
```

### Custom Validation
```typescript
// Add to form submission
if (!formData.email.includes('@')) {
  toast.error('Invalid email');
  return;
}
```

---

## 💡 Pro Tips

1. **Use the HR dashboard** to monitor all employee activities
2. **Set up document expiry reminders** using the expiring documents tab
3. **Customize onboarding tasks** via the backend API
4. **Export data** by adding export buttons to tables
5. **Add filters** to HR dashboard for better navigation

---

## 📞 Need Help?

### Common Questions

**Q: Can I add more document types?**
A: Yes! Edit the `documentTypes` array in `DocumentsTab.tsx`

**Q: How do I customize onboarding tasks?**
A: Modify the backend onboarding checklist creation logic

**Q: Can employees see other profiles?**
A: No, by default they only see their own (checked by user ID)

**Q: How to add role-based access?**
A: Use `ProtectedRoute` wrapper with `allowedRoles` prop

---

## 🎯 Success Checklist

After completing integration, verify:

- [ ] Can access employee profile page
- [ ] Can view all 8 tabs
- [ ] Can edit medical information
- [ ] Can add emergency contact
- [ ] Can upload document
- [ ] HR dashboard loads
- [ ] Can see onboarding list
- [ ] Document verification works
- [ ] No console errors
- [ ] Responsive on mobile

---

## 🎉 Congratulations!

Your Employee Management Module is now live! 🚀

### What You've Gained:
✅ Complete employee profile management
✅ Document management system
✅ Onboarding/offboarding workflows
✅ HR admin monitoring dashboard
✅ Mobile-responsive UI
✅ Type-safe TypeScript code
✅ Production-ready components

---

**Time to Complete:** ~5 minutes
**Difficulty:** Easy
**Next Steps:** Explore advanced features and customizations!

---

**Quick Links:**
- 📖 Full Documentation: `/docs/`
- 🔌 API Endpoints: `/docs/EMPLOYEE_MANAGEMENT_API_TESTING.md`
- 🎨 Components: `/src/components/employee/`
- 📄 Pages: `/src/pages/employee/` and `/src/pages/hr/`
