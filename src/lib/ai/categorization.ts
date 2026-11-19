import prisma from '@/lib/prisma';

interface CategorySuggestion {
  categoryId: number;
  categoryName: string;
  confidence: number;
}

// ─── Keyword sets per category type ───
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Road & Infrastructure': ['road', 'pothole', 'highway', 'bridge', 'footpath', 'pavement', 'crack', 'construction', 'asphalt', 'divider', 'speed', 'breaker', 'flyover', 'lane'],
  'Water Supply': ['water', 'pipeline', 'tap', 'supply', 'tank', 'contaminated', 'dirty', 'leakage', 'bore', 'well', 'purification', 'shortage', 'pressure'],
  'Electricity': ['power', 'electricity', 'transformer', 'wire', 'voltage', 'outage', 'blackout', 'street', 'light', 'meter', 'billing', 'electric', 'current', 'phase'],
  'Sanitation & Waste': ['garbage', 'waste', 'dustbin', 'sweeping', 'drain', 'sewage', 'smell', 'dump', 'clean', 'sanitation', 'rubbish', 'trash', 'disposal', 'stink'],
  'Public Safety': ['crime', 'theft', 'robbery', 'assault', 'harassment', 'accident', 'traffic', 'signal', 'police', 'security', 'unsafe', 'danger', 'violence', 'eve'],
  'Health': ['hospital', 'clinic', 'disease', 'epidemic', 'mosquito', 'stagnant', 'medical', 'ambulance', 'doctor', 'health', 'dengue', 'malaria', 'fever'],
  'Education': ['school', 'college', 'teacher', 'classroom', 'education', 'playground', 'library', 'student', 'fee', 'exam', 'syllabus'],
  'Revenue & Property': ['tax', 'property', 'land', 'encroachment', 'illegal', 'mutation', 'registry', 'survey', 'title', 'deed', 'rent'],
  'Noise Pollution': ['noise', 'loudspeaker', 'honking', 'factory', 'disturbance', 'loud', 'music', 'construction', 'sound'],
  'Environment': ['tree', 'deforestation', 'pollution', 'air', 'quality', 'smoke', 'burning', 'park', 'garden', 'green', 'environment'],
  'Public Transport': ['bus', 'metro', 'auto', 'rickshaw', 'fare', 'route', 'stop', 'station', 'schedule', 'overcrowding', 'transport'],
  'Corruption': ['bribe', 'corruption', 'official', 'delay', 'negligence', 'misconduct', 'ignored', 'pending', 'bribery'],
};

export async function categorizeComplaint(
  title: string,
  description: string
): Promise<CategorySuggestion[]> {
  try {
    // Tokenize input (weight title 2x)
    const text = `${title} ${title} ${description}`.toLowerCase();
    const words = text.split(/\W+/).filter((w) => w.length > 2);

    // Score each category by keyword matches
    const scores: { type: string; score: number }[] = [];

    for (const [categoryType, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      let matchCount = 0;
      for (const keyword of keywords) {
        for (const word of words) {
          if (word.includes(keyword) || keyword.includes(word)) {
            matchCount++;
          }
        }
      }
      if (matchCount > 0) {
        // Normalize: confidence = matches / total keywords, capped at 1
        const confidence = Math.min(1, matchCount / (keywords.length * 0.5));
        scores.push({ type: categoryType, score: confidence });
      }
    }

    // Sort by score descending
    scores.sort((a, b) => b.score - a.score);
    const topScores = scores.slice(0, 3);

    // Map to actual database categories
    const categories = await prisma.category.findMany({
      select: { id: true, name: true, keywords: true },
    });

    const suggestions: CategorySuggestion[] = [];

    for (const scored of topScores) {
      // Find best matching category from DB
      const matchedCategory = categories.find((cat) => {
        const catKeywords = cat.keywords.toLowerCase().split(',');
        const typeKeywords = CATEGORY_KEYWORDS[scored.type] || [];
        return typeKeywords.some((kw) => catKeywords.some((ck) => ck.trim().includes(kw)));
      });

      if (matchedCategory) {
        suggestions.push({
          categoryId: matchedCategory.id,
          categoryName: matchedCategory.name,
          confidence: Math.round(scored.score * 100) / 100,
        });
      }
    }

    // If no matches, return first category as fallback
    if (suggestions.length === 0 && categories.length > 0) {
      suggestions.push({
        categoryId: categories[0].id,
        categoryName: categories[0].name,
        confidence: 0.1,
      });
    }

    return suggestions;
  } catch (error) {
    console.error('Categorization error:', error);
    return [];
  }
}
