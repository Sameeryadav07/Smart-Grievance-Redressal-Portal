import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

export interface ImageAnalysisResult {
  tamperingScore: number;
  elaImagePath: string;
  metadataFlags: string[];
}

export async function analyzeImage(imagePath: string): Promise<ImageAnalysisResult> {
  const metadataFlags: string[] = [];
  let tamperingScore = 0;

  try {
    const fullPath = path.join(process.cwd(), 'public', imagePath);

    if (!fs.existsSync(fullPath)) {
      return { tamperingScore: 0, elaImagePath: '', metadataFlags: ['image_not_found'] };
    }

    // Read original image
    const originalBuffer = fs.readFileSync(fullPath);
    const originalSharp = sharp(originalBuffer);
    const metadata = await originalSharp.metadata();

    // ─── Metadata Analysis ───
    if (!metadata.exif) {
      metadataFlags.push('no_exif_data');
      tamperingScore += 15;
    }

    if (metadata.width && metadata.height) {
      const ratio = metadata.width / metadata.height;
      if (ratio > 4 || ratio < 0.25) {
        metadataFlags.push('unusual_aspect_ratio');
        tamperingScore += 10;
      }
    }

    if (metadata.format && metadata.format !== 'jpeg' && metadata.format !== 'png') {
      metadataFlags.push(`uncommon_format: ${metadata.format}`);
      tamperingScore += 5;
    }

    // ─── Error Level Analysis (ELA) ───
    // Re-save at known quality
    const resavedBuffer = await sharp(originalBuffer)
      .jpeg({ quality: 95 })
      .toBuffer();

    // Get raw pixel data from both
    const originalPixels = await sharp(originalBuffer)
      .resize(800, 600, { fit: 'inside' })
      .raw()
      .toBuffer();

    const resavedPixels = await sharp(resavedBuffer)
      .resize(800, 600, { fit: 'inside' })
      .raw()
      .toBuffer();

    // Compute pixel differences
    const minLen = Math.min(originalPixels.length, resavedPixels.length);
    const diffBuffer = Buffer.alloc(minLen);
    let totalDiff = 0;
    let diffSquaredSum = 0;

    for (let i = 0; i < minLen; i++) {
      const diff = Math.abs(originalPixels[i] - resavedPixels[i]);
      const scaled = Math.min(255, diff * 10); // Scale up for visibility
      diffBuffer[i] = scaled;
      totalDiff += diff;
      diffSquaredSum += diff * diff;
    }

    const meanDiff = totalDiff / minLen;
    const variance = diffSquaredSum / minLen - meanDiff * meanDiff;
    const stdDev = Math.sqrt(variance);

    // Calculate ELA-based tampering score
    const elaScore = Math.min(100, meanDiff * 5 + stdDev * 2);
    tamperingScore += elaScore * 0.7;

    if (meanDiff > 15) {
      metadataFlags.push('high_ela_variance');
    }
    if (stdDev > 25) {
      metadataFlags.push('inconsistent_compression');
    }

    // Save ELA heatmap image
    const elaFileName = path.basename(imagePath, path.extname(imagePath)) + '-ela.jpg';
    const elaDir = path.dirname(fullPath);
    const elaFullPath = path.join(elaDir, elaFileName);
    const elaRelPath = path.join(path.dirname(imagePath), elaFileName);

    const imgInfo = await sharp(originalBuffer).resize(800, 600, { fit: 'inside' }).metadata();
    const width = imgInfo.width || 800;
    const height = imgInfo.height || 600;

    await sharp(diffBuffer, {
      raw: { width, height, channels: 3 },
    })
      .jpeg({ quality: 90 })
      .toFile(elaFullPath);

    tamperingScore = Math.min(100, Math.round(tamperingScore));

    return {
      tamperingScore,
      elaImagePath: elaRelPath.replace(/\\/g, '/'),
      metadataFlags,
    };
  } catch (error) {
    console.error('Image analysis error:', error);
    return {
      tamperingScore: 0,
      elaImagePath: '',
      metadataFlags: ['analysis_error'],
    };
  }
}
