import { NextResponse } from 'next/server';
import { generateRubric, type Profile } from '@/lib/recommendation/generateRubric';

const JPMC_FRIEND: Profile = {
  use_case: 'everyday_office',
  location: 'bangalore',
  season: 'summer',
  time_of_day: 'day',
  complexion_depth: 'light',
  undertone: 'neutral',
  drape_volume: 'close',
  draping_skill: 'medium_pro',
  solids_vs_prints: 'either',
  budget_inr_max: 3000,
  fabric_aversions: [],
};

export function GET() {
  const rubric = generateRubric(JPMC_FRIEND);
  return NextResponse.json({ profile: JPMC_FRIEND, rubric }, { status: 200 });
}
