import type { ColorAnalysis, Contrast, Undertone } from '@/lib/session/types';

// First-cut stub. Real client-side analysis (face-api.js or MediaPipe pixel sampling)
// comes in a later slice. The photo never leaves the browser in either implementation.
// See PRD §5.3 option A.

const PALETTES: Record<Undertone, string[]> = {
  warm: [
    '#B4412A', // rust
    '#D9A441', // mustard
    '#C8764F', // terracotta
    '#9BA273', // sage
    '#D97559', // coral
    '#7A7A3D', // olive
    '#D4B67A', // cream gold
    '#2D5F5A', // deep teal
  ],
  cool: [
    '#3B5C99', // cool blue
    '#7A1A2E', // burgundy
    '#2A6B47', // emerald
    '#6B2D4A', // plum
    '#C8838E', // dusty pink
    '#8EB1B8', // icy blue-green
    '#A08FB8', // lavender
    '#B8B8B5', // silver grey
  ],
  neutral: [
    '#5C4A3E', // taupe
    '#8E1929', // bindi
    '#2A3C2F', // forest
    '#D9A441', // mustard
    '#6B4F6B', // dusty purple
    '#B48A6B', // camel
    '#3A5A6B', // slate
    '#C8838E', // dusty pink
  ],
};

function pickOne<T>(values: readonly T[]): T {
  return values[Math.floor(Math.random() * values.length)] as T;
}

export async function analyzePhotoStub(_file: File): Promise<ColorAnalysis> {
  await new Promise((resolve) => setTimeout(resolve, 1400));
  const undertone = pickOne<Undertone>(['warm', 'cool', 'neutral']);
  const contrast = pickOne<Contrast>(['high', 'medium', 'low']);
  return {
    undertone,
    contrast,
    palette: PALETTES[undertone],
  };
}
