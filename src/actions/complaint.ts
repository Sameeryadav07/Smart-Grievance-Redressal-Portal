'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { complaintSubmitSchema, complaintUpdateSchema } from '@/schemas/complaint';
import { generateTrackingId } from '@/lib/utils';
import { analyzeComplaint } from '@/lib/ai';
import { revalidatePath } from 'next/cache';
import fs from 'fs';
import path from 'path';

export async function submitComplaintAction(formData: FormData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return { success: false, error: 'You must be logged in to submit a complaint' };
    }

    const rawData = {
      title: formData.get('title'),
      description: formData.get('description'),
      categoryId: formData.get('categoryId') || undefined,
      locationLat: formData.get('locationLat') || undefined,
      locationLng: formData.get('locationLng') || undefined,
      locationAddress: formData.get('locationAddress') || undefined,
    };

    const validated = complaintSubmitSchema.safeParse(rawData);
    if (!validated.success) {
      return {
        success: false,
        error: 'Validation failed',
        fieldErrors: validated.error.flatten().fieldErrors,
      };
    }

    let savedImagePath: string | null = null;
    const imageFile = formData.get('image') as File | null;

    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `complaint_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.jpg`;
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      fs.writeFileSync(path.join(uploadsDir, filename), buffer);
      savedImagePath = `/uploads/${filename}`;
    }

    const trackingId = generateTrackingId();
    const userId = parseInt(session.user.id, 10);

    const complaint = await prisma.complaint.create({
      data: {
        trackingId,
        title: validated.data.title,
        description: validated.data.description,
        categoryId: validated.data.categoryId,
        locationLat: validated.data.locationLat,
        locationLng: validated.data.locationLng,
        locationAddress: validated.data.locationAddress,
        imagePath: savedImagePath,
        userId,
        status: 'SUBMITTED',
        priority: 'MEDIUM',
      },
    });

    // Run AI pipeline in background
    analyzeComplaint(
      complaint.id,
      complaint.title,
      complaint.description,
      savedImagePath,
      complaint.locationLat,
      complaint.locationLng
    ).catch((err) => console.error('AI pipeline error:', err));

    revalidatePath('/my-complaints');
    revalidatePath('/dashboard');
    revalidatePath('/complaints');

    return {
      success: true,
      trackingId: complaint.trackingId,
      complaintId: complaint.id,
    };
  } catch (error) {
    console.error('Server action submission error:', error);
    return { success: false, error: 'Failed to process submission' };
  }
}

export async function updateComplaintStatusAction(
  complaintId: number,
  status: string,
  comment: string,
  priority?: string,
  departmentId?: number
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'DEPT_OFFICER')) {
      return { success: false, error: 'Unauthorized' };
    }

    const validated = complaintUpdateSchema.safeParse({ status, comment });
    if (!validated.success) {
      return { success: false, error: 'Validation failed' };
    }

    const officerId = parseInt(session.user.id, 10);

    await prisma.complaint.update({
      where: { id: complaintId },
      data: {
        status: validated.data.status,
        ...(priority ? { priority } : {}),
        ...(departmentId ? { departmentId } : {}),
        updates: {
          create: {
            officerId,
            status: validated.data.status,
            comment: validated.data.comment,
          },
        },
      },
    });

    revalidatePath(`/complaints/${complaintId}`);
    revalidatePath('/dashboard');
    revalidatePath('/complaints');

    return { success: true };
  } catch (error) {
    console.error('Status update action error:', error);
    return { success: false, error: 'Failed to update complaint' };
  }
}
