// Pure pixel analysis behind the selfie face check.
//
// No DOM, no canvas: it takes RGBA pixels of a square frame and decides whether
// they look like a face inside the on-screen oval. Split out from the hook so
// the thresholds can be reasoned about (and tested) on their own.

export const FACE_VERDICT = Object.freeze({
  NO_FACE: 'NO_FACE',
  TOO_FAR: 'TOO_FAR',
  TOO_CLOSE: 'TOO_CLOSE',
  TOO_DARK: 'TOO_DARK',
  OK: 'OK',
});

// A flat wall is skin-coloured often enough that colour alone is useless. A
// real face also has: structure (edges from eyes, brows, nostrils, lips), dark
// features inside the skin area, and skin concentrated in the centre while the
// corners are background.
const THRESHOLDS = Object.freeze({
  minLuma: 40,
  maxLuma: 244,
  minSkin: 0.1,
  maxSkin: 0.97,
  farSkin: 0.32, // skin present but small → sitting too far back
  minEdgeEnergy: 0.03, // mean normalised gradient inside the oval
  minDarkFeatures: 0.05, // fraction of clearly darker pixels (eyes, brows, lips)
  minCentreAdvantage: 0.12, // centre skin ratio − corner skin ratio
  // A face against a skin-toned wall has no centre advantage, so strong facial
  // structure stands in for it.
  strongEdgeEnergy: 0.045,
  strongDarkFeatures: 0.08,
});

const isSkin = (r, g, b) => {
  const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
  const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
  return cb >= 77 && cb <= 127 && cr >= 133 && cr <= 173 && r > 60 && r > b && r - g >= 8;
};

/**
 * @param {Uint8ClampedArray} data — RGBA pixels, size × size
 * @param {number} size — frame side in pixels
 * @returns {{verdict: string, metrics: object}}
 */
export function evaluateFaceFrame(data, size) {
  const centre = size / 2;
  const innerRadius = size * 0.34; // matches the 68% oval guide
  const outerRadius = size * 0.46;

  const luma = new Float32Array(size * size);
  let inside = 0;
  let insideSkin = 0;
  let insideLuma = 0;
  let corner = 0;
  let cornerSkin = 0;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const index = y * size + x;
      const i = index * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      luma[index] = 0.299 * r + 0.587 * g + 0.114 * b;

      const dx = (x - centre) / innerRadius;
      const dy = (y - centre) / innerRadius;
      const inOval = dx * dx + dy * dy <= 1;
      const skin = isSkin(r, g, b);

      if (inOval) {
        inside += 1;
        insideLuma += luma[index];
        if (skin) insideSkin += 1;
        continue;
      }

      const ox = (x - centre) / outerRadius;
      const oy = (y - centre) / outerRadius;
      if (ox * ox + oy * oy > 1) {
        corner += 1;
        if (skin) cornerSkin += 1;
      }
    }
  }

  if (!inside) return { verdict: FACE_VERDICT.NO_FACE, metrics: {} };

  const avgLuma = insideLuma / inside;
  const skinRatio = insideSkin / inside;
  const cornerSkinRatio = corner ? cornerSkin / corner : 0;

  // Second pass over the oval: edge energy and dark facial features.
  let edgeSum = 0;
  let edgeCount = 0;
  let darkPixels = 0;
  const darkCutoff = avgLuma * 0.72;

  for (let y = 1; y < size - 1; y += 1) {
    for (let x = 1; x < size - 1; x += 1) {
      const dx = (x - centre) / innerRadius;
      const dy = (y - centre) / innerRadius;
      if (dx * dx + dy * dy > 1) continue;

      const index = y * size + x;
      const gx = Math.abs(luma[index + 1] - luma[index - 1]);
      const gy = Math.abs(luma[index + size] - luma[index - size]);
      edgeSum += (gx + gy) / 510;
      edgeCount += 1;
      if (luma[index] < darkCutoff) darkPixels += 1;
    }
  }

  const edgeEnergy = edgeCount ? edgeSum / edgeCount : 0;
  const darkFeatures = edgeCount ? darkPixels / edgeCount : 0;
  const centreAdvantage = skinRatio - cornerSkinRatio;

  const metrics = {
    avgLuma,
    skinRatio,
    cornerSkinRatio,
    centreAdvantage,
    edgeEnergy,
    darkFeatures,
  };

  if (avgLuma < THRESHOLDS.minLuma || avgLuma > THRESHOLDS.maxLuma)
    return { verdict: FACE_VERDICT.TOO_DARK, metrics };

  // Structure decides first: a flat surface never becomes a face, however
  // skin-coloured it is.
  if (edgeEnergy < THRESHOLDS.minEdgeEnergy || darkFeatures < THRESHOLDS.minDarkFeatures)
    return { verdict: FACE_VERDICT.NO_FACE, metrics };

  if (skinRatio < THRESHOLDS.minSkin) return { verdict: FACE_VERDICT.NO_FACE, metrics };

  const framedLikeAFace =
    centreAdvantage >= THRESHOLDS.minCentreAdvantage ||
    (edgeEnergy >= THRESHOLDS.strongEdgeEnergy &&
      darkFeatures >= THRESHOLDS.strongDarkFeatures);
  if (!framedLikeAFace) return { verdict: FACE_VERDICT.NO_FACE, metrics };

  if (skinRatio < THRESHOLDS.farSkin) return { verdict: FACE_VERDICT.TOO_FAR, metrics };
  if (skinRatio > THRESHOLDS.maxSkin) return { verdict: FACE_VERDICT.TOO_CLOSE, metrics };

  return { verdict: FACE_VERDICT.OK, metrics };
}

export default evaluateFaceFrame;
