import { getCoords, distanceMiles } from "./cities.js";

const ROUTE_TOLERANCE_MILES = 40; // how close origin/destination need to be to "match"
const DATE_TOLERANCE_DAYS = 3;    // how much slack in date windows

function daysBetween(dateStr1, dateStr2) {
  const d1 = new Date(dateStr1);
  const d2 = new Date(dateStr2);
  return Math.abs((d1 - d2) / (1000 * 60 * 60 * 24));
}

function datesOverlapOrClose(legEarliest, legLatest, neededBy) {
  const needed = new Date(neededBy);
  const earliest = new Date(legEarliest);
  const latest = new Date(legLatest);
  if (needed >= earliest && needed <= latest) return { fits: true, slackDays: 0 };
  const distToWindow = Math.min(
    Math.abs(needed - earliest),
    Math.abs(needed - latest)
  ) / (1000 * 60 * 60 * 24);
  return { fits: distToWindow <= DATE_TOLERANCE_DAYS, slackDays: distToWindow };
}

/**
 * Score a single (empty leg, load request) pair.
 * Returns null if it's not a viable match, otherwise a score 0-100
 * plus the underlying distances for the pricing step.
 */
export function scorePair(leg, load) {
  const legOrigin = getCoords(leg.origin);
  const legDest = getCoords(leg.destination);
  const loadOrigin = getCoords(load.origin);
  const loadDest = getCoords(load.destination);

  if (!legOrigin || !legDest || !loadOrigin || !loadDest) return null;

  const originGap = distanceMiles(legOrigin, loadOrigin);
  const destGap = distanceMiles(legDest, loadDest);

  if (originGap > ROUTE_TOLERANCE_MILES || destGap > ROUTE_TOLERANCE_MILES) {
    return null; // not on a comparable route
  }

  const dateCheck = datesOverlapOrClose(leg.earliest_date, leg.latest_date, load.needed_by);
  if (!dateCheck.fits) return null;

  if (load.weight_lbs && leg.capacity_lbs && load.weight_lbs > leg.capacity_lbs) {
    return null; // truck can't physically take it
  }

  // Score: closer route + closer date = higher score. Weighted, simple, explainable.
  const routeScore = 100 - ((originGap + destGap) / 2) * (100 / ROUTE_TOLERANCE_MILES);
  const dateScore = 100 - dateCheck.slackDays * (100 / (DATE_TOLERANCE_DAYS || 1));
  const score = Math.round(routeScore * 0.6 + dateScore * 0.4);

  const legDistance = distanceMiles(legOrigin, legDest);

  return {
    score: Math.max(0, Math.min(100, score)),
    originGap,
    destGap,
    legDistanceMiles: Math.round(legDistance),
    dateSlackDays: Math.round(dateCheck.slackDays),
  };
}

/**
 * Find all viable matches for a given empty leg against a list of load requests.
 */
export function findMatchesForLeg(leg, loadRequests) {
  const results = [];
  for (const load of loadRequests) {
    const scored = scorePair(leg, load);
    if (scored) results.push({ leg, load, ...scored });
  }
  return results.sort((a, b) => b.score - a.score);
}

/**
 * Find all viable matches across every leg/load combination.
 */
export function findAllMatches(emptyLegs, loadRequests) {
  const all = [];
  for (const leg of emptyLegs) {
    all.push(...findMatchesForLeg(leg, loadRequests));
  }
  return all.sort((a, b) => b.score - a.score);
}
