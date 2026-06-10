import { z } from 'zod';

export const createComplaintSchema = z.object({
  title:       z.string().min(5, 'Title must be at least 5 characters').max(120),
  description: z.string().min(10, 'Description too short').max(2000),
  category:    z.enum(['electrical','plumbing','wifi','hostel','academic','food','safety','event','other']),
  location:    z.string().min(0).max(120).optional(),
  isAnonymous: z.preprocess(
    val => val === 'true' || val === true,
    z.boolean()
  ).optional().default(false),
});

export const updateComplaintSchema = z.object({
  status:      z.enum(['open','assigned','in_progress','resolved','verified','rejected']).optional(),
  priority:    z.enum(['low','medium','high','critical']).optional(),
  assignedTo:  z.string().optional(),
  department:  z.string().optional(),
  remark:      z.string().max(500).optional(),
});

export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: result.error.flatten().fieldErrors,
    });
  }
  req.body = result.data;
  next();
};