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
}
