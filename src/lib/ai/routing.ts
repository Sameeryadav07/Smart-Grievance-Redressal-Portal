import prisma from '@/lib/prisma';
import { categorizeComplaint } from './categorization';

type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

interface RoutingResult {
  departmentId: number;
  priority: Priority;
  confidence: number;
}

const URGENCY_KEYWORDS = ['emergency', 'danger', 'life', 'threatening', 'death', 'collapse', 'fire', 'flood', 'accident', 'dying', 'critical', 'electrocution'];
const SEVERITY_KEYWORDS = ['broken', 'damaged', 'blocked', 'overflow', 'exposed', 'wire', 'fallen', 'burst', 'collapsed', 'cracked', 'major', 'severe'];

function lowerPriority(priority: Priority): Priority {
  const levels: Priority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
  const idx = levels.indexOf(priority);
  return idx > 0 ? levels[idx - 1] : 'LOW';
}

export async function routeComplaint(
  categoryId: number | null,
  title: string,
  description: string,
  tamperingScore: number
): Promise<RoutingResult> {
  try {
    let departmentId: number | null = null;
    let confidence = 0.5;

    // Get department from category
    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
        select: { departmentId: true },
      });
      if (category) {
        departmentId = category.departmentId;
        confidence = 0.9;
      }
    }

    // If no category provided, run categorization
    if (!departmentId) {
      const suggestions = await categorizeComplaint(title, description);
      if (suggestions.length > 0) {
        const topCategory = await prisma.category.findUnique({
          where: { id: suggestions[0].categoryId },
          select: { departmentId: true },
        });
        if (topCategory) {
          departmentId = topCategory.departmentId;
          confidence = suggestions[0].confidence;
        }
      }
    }

    // Fallback: assign to first department
    if (!departmentId) {
      const firstDept = await prisma.department.findFirst();
      departmentId = firstDept?.id || 1;
      confidence = 0.3;
    }

    // ─── Priority Assignment ───
    const text = `${title} ${description}`.toLowerCase();
    let priority: Priority = 'MEDIUM';

    const hasUrgency = URGENCY_KEYWORDS.some((kw) => text.includes(kw));
    const hasSeverity = SEVERITY_KEYWORDS.some((kw) => text.includes(kw));

    if (hasUrgency) {
      priority = 'URGENT';
    } else if (hasSeverity) {
      priority = 'HIGH';
    }

    // Lower priority if image seems tampered
    if (tamperingScore > 70) {
      priority = lowerPriority(priority);
    }

    return { departmentId, priority, confidence };
  } catch (error) {
    console.error('Routing error:', error);
    return { departmentId: 1, priority: 'MEDIUM', confidence: 0.1 };
  }
}
