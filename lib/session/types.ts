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

export interface SessionState {
  occasion?: Occasion;
  weddingRole?: WeddingRole;
  reuseIntent?: ReuseIntent;
  budget?: number;
}
