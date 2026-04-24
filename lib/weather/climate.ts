// Climate signal for the rubric, derived from city + month via Open-Meteo.
// No API key, no signup; geocoding + historical archive endpoints are free
// for non-commercial use and don't rate-limit at the volume this app sees.
//
// V1: pulls last fully archived calendar year for the requested month and
// reports daily means averaged across that month. A multi-year average
// would be more stable; left as a follow-up.

const GEOCODE_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const ARCHIVE_URL = 'https://archive-api.open-meteo.com/v1/archive';

export type ClimateBucket = 'hot_humid' | 'hot_dry' | 'temperate' | 'cool';

export interface ClimateProfile {
  city: string; // resolved name returned by geocoder, e.g. "Bengaluru, India"
  month: number;
  year: number;
  avgTempC: number;
  avgHumidity: number;
  precipMm: number;
  rainy: boolean;
  bucket: ClimateBucket;
  source: 'open-meteo';
}

export class WeatherLookupError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message);
    this.name = 'WeatherLookupError';
  }
}

interface GeocodeHit {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
}

async function geocode(city: string): Promise<GeocodeHit> {
  const url = `${GEOCODE_URL}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
  const res = await fetch(url, { next: { revalidate: 60 * 60 * 24 * 30 } });
  if (!res.ok) {
    throw new WeatherLookupError(`geocoding failed (${res.status}) for "${city}"`);
  }
  const data = (await res.json()) as { results?: GeocodeHit[] };
  const hit = data.results?.[0];
  if (!hit) {
    throw new WeatherLookupError(`no city match for "${city}"`);
  }
  return hit;
}

function bucketize(tempC: number, humidity: number): ClimateBucket {
  if (tempC >= 27 && humidity >= 60) return 'hot_humid';
  if (tempC >= 27) return 'hot_dry';
  if (tempC < 18) return 'cool';
  return 'temperate';
}

function lastFullYear(now: Date = new Date()): number {
  // Open-Meteo's archive lags the present by a few days. The most recent
  // calendar year that's always complete is "previous year" once we pass
  // mid-January, which is the only window the app would ever query in.
  return now.getUTCFullYear() - 1;
}

function monthRange(year: number, month: number): { start: string; end: string } {
  if (month < 1 || month > 12) {
    throw new WeatherLookupError(`month out of range: ${month}`);
  }
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const mm = String(month).padStart(2, '0');
  return {
    start: `${year}-${mm}-01`,
    end: `${year}-${mm}-${String(lastDay).padStart(2, '0')}`,
  };
}

function mean(xs: number[]): number {
  const valid = xs.filter((x) => typeof x === 'number' && Number.isFinite(x));
  if (valid.length === 0) return 0;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}

function total(xs: number[]): number {
  return xs
    .filter((x) => typeof x === 'number' && Number.isFinite(x))
    .reduce((a, b) => a + b, 0);
}

const round = (n: number, dp: number) => Math.round(n * 10 ** dp) / 10 ** dp;

export async function getClimate(city: string, month: number): Promise<ClimateProfile> {
  const hit = await geocode(city);
  const year = lastFullYear();
  const { start, end } = monthRange(year, month);

  const url =
    `${ARCHIVE_URL}?latitude=${hit.latitude}&longitude=${hit.longitude}` +
    `&start_date=${start}&end_date=${end}` +
    `&daily=temperature_2m_mean,relative_humidity_2m_mean,precipitation_sum` +
    `&timezone=auto`;

  const res = await fetch(url, { next: { revalidate: 60 * 60 * 24 * 30 } });
  if (!res.ok) {
    throw new WeatherLookupError(`archive fetch failed (${res.status}) for ${hit.name}`);
  }

  const data = (await res.json()) as {
    daily?: {
      temperature_2m_mean: number[];
      relative_humidity_2m_mean: number[];
      precipitation_sum: number[];
    };
  };

  const daily = data.daily;
  if (!daily?.temperature_2m_mean?.length) {
    throw new WeatherLookupError(`no daily data returned for ${hit.name} ${start}..${end}`);
  }

  const avgTempC = round(mean(daily.temperature_2m_mean), 1);
  const avgHumidity = round(mean(daily.relative_humidity_2m_mean), 0);
  const precipMm = round(total(daily.precipitation_sum), 0);

  return {
    city: `${hit.name}, ${hit.country}`,
    month,
    year,
    avgTempC,
    avgHumidity,
    precipMm,
    rainy: precipMm >= 80,
    bucket: bucketize(avgTempC, avgHumidity),
    source: 'open-meteo',
  };
}
