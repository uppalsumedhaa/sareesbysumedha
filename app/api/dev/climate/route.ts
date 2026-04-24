import { NextResponse } from 'next/server';
import { getClimate, WeatherLookupError } from '@/lib/weather/climate';

// GET /api/dev/climate?city=Bangalore&month=6
// Dev-only endpoint to inspect what climate signal a city + month resolves to.
// Wired into the rubric only after the full intake submits.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const city = url.searchParams.get('city');
  const monthRaw = url.searchParams.get('month');

  if (!city || !monthRaw) {
    return NextResponse.json(
      { error: 'pass ?city=<name>&month=<1-12>' },
      { status: 400 },
    );
  }
  const month = Number.parseInt(monthRaw, 10);
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    return NextResponse.json({ error: 'month must be 1..12' }, { status: 400 });
  }

  try {
    const profile = await getClimate(city, month);
    return NextResponse.json(profile);
  } catch (err) {
    const message =
      err instanceof WeatherLookupError ? err.message : 'unknown weather error';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
