export type Occasion =
  | 'wedding'
  | 'festival'
  | 'work'
  | 'casual'
  | 'party'
  | 'browsing';

export type WeddingRole = 'bride' | 'bridesmaid' | 'family' | 'guest';

export type ReuseIntent = 'once' | 'few-times' | 'often';

export type BudgetBand = 'everyday' | 'mid' | 'premium' | 'heirloom';

export type VenueType = 'indoor' | 'outdoor' | 'mixed';

export type Duration = 'couple-hours' | 'half-day' | 'all-day';

export type Mood =
  | 'minimal'
  | 'soft-romantic'
  | 'maximalist'
  | 'old-money'
  | 'festive-loud'
  | 'power-dresser'
  | 'boho'
  | 'preppy'
  | 'old-world'
  | 'contemporary-edgy'
  | 'sporty-modern'
  | 'earthy-artisan';

export type TradContempLevel =
  | 'classic'
  | 'classic-twist'
  | 'balanced'
  | 'modern-heritage'
  | 'fully-contemporary';

export type VetoColor =
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'blue'
  | 'purple'
  | 'pink'
  | 'brown'
  | 'black'
  | 'white';

export type Undertone = 'warm' | 'cool' | 'neutral';

export type Contrast = 'high' | 'medium' | 'low';

export type BlousePreference = 'traditional' | 'crop-top' | 'both';

export type DrapeStyle = 'nivi' | 'regional' | 'pant-saree' | 'unsure';

export type AccessoriesVibe =
  | 'temple'
  | 'oxidized'
  | 'minimal-gold'
  | 'statement'
  | 'none';

export interface ColorAnalysis {
  undertone: Undertone;
  contrast: Contrast;
  palette: string[]; // array of hex colors, 8 to 12 entries
}

export interface SessionState {
  // Stage 1
  occasion?: Occasion;
  weddingRole?: WeddingRole;
  reuseIntent?: ReuseIntent;
  budget?: number;
  // Stage 2
  location?: string;
  eventMonth?: string; // YYYY-MM
  venueType?: VenueType;
  duration?: Duration;
  // Stage 3
  moods?: Mood[];
  tradContempLevel?: TradContempLevel;
  colorVetoes?: VetoColor[];
  // Stage 4
  undertone?: Undertone;
  contrast?: Contrast;
  suggestedPalette?: string[];
  // Stage 5
  blousePreference?: BlousePreference;
  drapeStyle?: DrapeStyle;
  accessoriesVibe?: AccessoriesVibe;
}
