import type {
  ColorFamily,
  Saturation,
  Season,
  UseCase,
} from '@/lib/recommendation/generateRubric';

export type FabricFamily = 'silk' | 'cotton' | 'cotton_silk' | 'synthetic';

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
