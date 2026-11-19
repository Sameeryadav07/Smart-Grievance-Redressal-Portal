import { z } from 'zod';

export const complaintSubmitSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(200, 'Title must be under 200 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters').max(2000, 'Description must be under 2000 characters'),
  categoryId: z.coerce.number().optional(),
  locationLat: z.coerce.number().min(-90).max(90).optional(),
  locationLng: z.coerce.number().min(-180).max(180).optional(),
  locationAddress: z.string().optional(),
});

export const complaintUpdateSchema = z.object({
  status: z.enum(['SUBMITTED', 'UNDER_REVIEW', 'IN_PROGRESS', 'RESOLVED', 'REJECTED']),
  comment: z.string().min(5, 'Comment must be at least 5 characters').max(500, 'Comment must be under 500 characters'),
});

export type ComplaintSubmitInput = z.infer<typeof complaintSubmitSchema>;
export type ComplaintUpdateInput = z.infer<typeof complaintUpdateSchema>;
