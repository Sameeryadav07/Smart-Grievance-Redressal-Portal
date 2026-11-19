import prisma from '@/lib/prisma';

interface DuplicateMatch {
  complaintId: number;
  trackingId: string;
  title: string;
  similarityScore: number;
  matchType: string;
}

// ─── Stop words to filter out ───
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'shall', 'can', 'to', 'of', 'in', 'for',
  'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during',
  'before', 'after', 'above', 'below', 'between', 'and', 'but', 'or',
  'not', 'no', 'nor', 'so', 'yet', 'both', 'either', 'neither', 'each',
  'every', 'all', 'any', 'few', 'more', 'most', 'other', 'some', 'such',
  'only', 'own', 'same', 'than', 'too', 'very', 'just', 'because',
  'this', 'that', 'these', 'those', 'it', 'its', 'my', 'our', 'your',
  'his', 'her', 'their', 'i', 'we', 'you', 'he', 'she', 'they', 'me',
  'us', 'him', 'them', 'who', 'whom', 'which', 'what', 'where', 'when',
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/\W+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
}

function buildFrequencyMap(tokens: string[]): Map<string, number> {
  const freq = new Map<string, number>();
  for (const token of tokens) {
    freq.set(token, (freq.get(token) || 0) + 1);
  }
  return freq;
}

function cosineSimilarity(a: Map<string, number>, b: Map<string, number>): number {
  const allKeys = new Set([...Array.from(a.keys()), ...Array.from(b.keys())]);
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (const key of allKeys) {
    const valA = a.get(key) || 0;
    const valB = b.get(key) || 0;
    dotProduct += valA * valB;
    magnitudeA += valA * valA;
    magnitudeB += valB * valB;
  }

  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  return dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function findDuplicates(
  complaintId: number,
  title: string,
  description: string,
  _imagePath: string | null,
  lat: number | null,
  lng: number | null
): Promise<DuplicateMatch[]> {
  try {
    // Fetch existing complaints (exclude current)
    const existing = await prisma.complaint.findMany({
      where: { id: { not: complaintId } },
      select: {
        id: true,
        trackingId: true,
        title: true,
        description: true,
        locationLat: true,
        locationLng: true,
      },
      take: 200, // Limit for performance
      orderBy: { createdAt: 'desc' },
    });

    const newText = `${title} ${title} ${description}`; // Weight title 2x
    const newTokens = tokenize(newText);
    const newFreq = buildFrequencyMap(newTokens);

    const matches: DuplicateMatch[] = [];

    for (const complaint of existing) {
      const existingText = `${complaint.title} ${complaint.title} ${complaint.description}`;
      const existingTokens = tokenize(existingText);
      const existingFreq = buildFrequencyMap(existingTokens);

      // Text similarity
      const textSimilarity = cosineSimilarity(newFreq, existingFreq);

      // Location proximity
      let locationScore = 0;
      let matchType = 'text';

      if (lat && lng && complaint.locationLat && complaint.locationLng) {
        const distance = haversineDistance(lat, lng, complaint.locationLat, complaint.locationLng);
        if (distance < 500) {
          locationScore = 1 - distance / 500;
          matchType = 'text+location';
        }
      }

      // Combined score
      const hasLocation = lat && lng && complaint.locationLat && complaint.locationLng;
      const combinedScore = hasLocation
        ? textSimilarity * 0.7 + locationScore * 0.3
        : textSimilarity;

      if (combinedScore > 0.4) {
        matches.push({
          complaintId: complaint.id,
          trackingId: complaint.trackingId,
          title: complaint.title,
          similarityScore: Math.round(combinedScore * 100) / 100,
          matchType,
        });
      }
    }

    // Sort by similarity and return top 5
    return matches.sort((a, b) => b.similarityScore - a.similarityScore).slice(0, 5);
  } catch (error) {
    console.error('Duplicate detection error:', error);
    return [];
  }
}
