import { z } from 'zod';

export const hiringRequestSchema = z.object({
  // Candidate Details
  candidateName: z.string().optional(),
  
  // Position Details
  jobTitle: z.string().min(1, 'Job title is required'),
  employmentType: z.enum(['Full-Time', 'Part-Time', 'Contract', 'Intern'], {
    message: 'Employment type is required'
  }),
  hiringType: z.enum(['New Position', 'Replacement'], {
    message: 'Hiring type is required'
  }),

  // Conditional Replacement Details
  replacementDetails: z.object({
    employeeName: z.string().min(1, 'Employee name is required'),
    reasonForReplacement: z.string().min(1, 'Reason is required'),
    lastWorkingDay: z.date({ message: 'Last working day is required' })
  }).optional(),

  // Experience
  minimumYears: z.number()
    .min(0, 'Minimum years must be at least 0')
    .max(50, 'Minimum years cannot exceed 50'),
  preferredIndustry: z.string().optional(),

  // Work Details
  workLocation: z.enum(['On-site', 'Remote', 'Hybrid'], {
    message: 'Work location is required'
  }),
  preferredJoiningDate: z.date({ message: 'Preferred joining date is required' }),
  shiftOrHours: z.string().optional(),

  // Compensation
  budgetRange: z.object({
    min: z.number().min(0, 'Minimum budget must be at least 0'),
    max: z.number().min(0, 'Maximum budget must be at least 0'),
    currency: z.string().default('INR')
  }).refine(data => data.max >= data.min, {
    message: 'Maximum budget must be greater than or equal to minimum',
    path: ['max']
  }).optional(),

  // Business Justification
  justification: z.string()
    .max(1000, 'Justification cannot exceed 1000 characters')
    .optional(),

  // Contact (auto-filled but can be overridden)
  contactPhone: z.string()
    .min(10, 'Phone number must be at least 10 characters')
    .optional()
}).refine(data => {
  // If hiring type is Replacement, replacement details are required
  if (data.hiringType === 'Replacement' && !data.replacementDetails) {
    return false;
  }
  return true;
}, {
  message: 'Replacement details are required for replacement hiring type',
  path: ['replacementDetails']
});

export type HiringRequestFormData = z.infer<typeof hiringRequestSchema>;
