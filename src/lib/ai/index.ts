import prisma from '@/lib/prisma';
import { analyzeImage } from './image-analysis';
import { findDuplicates } from './duplicate-detection';
import { categorizeComplaint } from './categorization';
import { routeComplaint } from './routing';

export interface FullAnalysisResult {
  tamperingScore: number;
  elaImagePath: string | null;
  metadataFlags: string[];
  duplicates: { complaintId: number; trackingId: string; title: string; similarityScore: number; matchType: string }[];
  autoCategory: string | null;
  categoryConfidence: number | null;
  suggestedCategoryId: number | null;
  departmentId: number;
  priority: string;
  routingConfidence: number;
  isFlagged: boolean;
}

export async function analyzeComplaint(
  complaintId: number,
  title: string,
  description: string,
  imagePath: string | null,
  lat: number | null,
  lng: number | null
): Promise<FullAnalysisResult> {
  try {
    // ─── 1. Image Analysis ───
    let tamperingScore = 0;
    let elaImagePath: string | null = null;
    let metadataFlags: string[] = [];

    if (imagePath) {
      const imageResult = await analyzeImage(imagePath);
      tamperingScore = imageResult.tamperingScore;
      elaImagePath = imageResult.elaImagePath;
      metadataFlags = imageResult.metadataFlags;
    }

    // ─── 2. Duplicate Detection ───
    const duplicates = await findDuplicates(complaintId, title, description, imagePath, lat, lng);

    // ─── 3. Categorization ───
    const categories = await categorizeComplaint(title, description);
    const topCategory = categories[0] || null;

    // ─── 4. Routing ───
    const routing = await routeComplaint(
      topCategory?.categoryId || null,
      title,
      description,
      tamperingScore
    );

    // ─── 5. Determine if flagged ───
    const isFlagged =
      tamperingScore > 60 ||
      duplicates.some((d) => d.similarityScore > 0.8) ||
      metadataFlags.includes('software_detected');

    // ─── 6. Save to database ───
    const duplicateOfId = duplicates.length > 0 && duplicates[0].similarityScore > 0.8
      ? duplicates[0].complaintId
      : null;

    await prisma.aIAnalysis.upsert({
      where: { complaintId },
      create: {
        complaintId,
        tamperingScore,
        elaImagePath,
        metadataFlags: JSON.stringify(metadataFlags),
        duplicateOfId,
        similarityScore: duplicates.length > 0 ? duplicates[0].similarityScore : null,
        autoCategory: topCategory?.categoryName || null,
        categoryConfidence: topCategory?.confidence || null,
        isFlagged,
        analysisData: JSON.stringify({
          duplicates,
          allCategories: categories,
          routing,
        }),
      },
      update: {
        tamperingScore,
        elaImagePath,
        metadataFlags: JSON.stringify(metadataFlags),
        duplicateOfId,
        similarityScore: duplicates.length > 0 ? duplicates[0].similarityScore : null,
        autoCategory: topCategory?.categoryName || null,
        categoryConfidence: topCategory?.confidence || null,
        isFlagged,
        analysisData: JSON.stringify({
          duplicates,
          allCategories: categories,
          routing,
        }),
      },
    });

    // ─── 7. Update complaint with routing results ───
    await prisma.complaint.update({
      where: { id: complaintId },
      data: {
        categoryId: topCategory?.categoryId,
        departmentId: routing.departmentId,
        priority: routing.priority,
      },
    });

    return {
      tamperingScore,
      elaImagePath,
      metadataFlags,
      duplicates,
      autoCategory: topCategory?.categoryName || null,
      categoryConfidence: topCategory?.confidence || null,
      suggestedCategoryId: topCategory?.categoryId || null,
      departmentId: routing.departmentId,
      priority: routing.priority,
      routingConfidence: routing.confidence,
      isFlagged,
    };
  } catch (error) {
    console.error('Full analysis error:', error);
    // Return safe defaults on error
    return {
      tamperingScore: 0,
      elaImagePath: null,
      metadataFlags: ['analysis_error'],
      duplicates: [],
      autoCategory: null,
      categoryConfidence: null,
      suggestedCategoryId: null,
      departmentId: 1,
      priority: 'MEDIUM',
      routingConfidence: 0,
      isFlagged: false,
    };
  }
}
