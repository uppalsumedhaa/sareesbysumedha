import type {
  ColorFamily,
  Saturation,
  Season,
  UseCase,
} from '@/lib/recommendation/generateRubric';

export type FabricFamily = 'silk' | 'cotton' | 'cotton_silk' | 'synthetic';

// How decorated the saree is. Drives the everyday vs occasion split.
//   plain   — no embellishment beyond the woven structure (most mul cotton, plain handloom)
//   subtle  — light woven motifs, small prints, light thread work, woven borders
//   heavy   — stone work, mirror work, sequins, heavy zari, dense embroidery
// `heavy` is hard-filtered out of everyday_office / everyday_home; reserved for special_occasion.
export type Embellishment = 'plain' | 'subtle' | 'heavy';

export interface CatalogSaree {
  id: string;
  productName: string;
  productUrl: string;
  imageUrl: string;
  retailer: string;
  priceInr: number;

  // Rubric-matching attributes
  fabric: string;
  fabricFamily: FabricFamily;
  dominantColor: ColorFamily;
  secondaryColors?: ColorFamily[];
  saturation: Saturation | 'flexible';
  embellishment: Embellishment;
  useCases: UseCase[];
  seasonsOk: Season[];

  // Sumi's voice reasoning line. Optional; page falls back to a short
  // generic line if missing. Keep it short, warm, no jargon.
  reasoningLine?: string;
  // Short headline ("direction") rendered above the reasoning.
  direction?: string;
}

export interface ScoredSaree {
  saree: CatalogSaree;
  score: number;
  matchedOn: string[];
}
