#!/usr/bin/env node
/**
 * Aggregates upcoming neighborhood events into static/river/events.json.
 * Runs in CI (see .github/workflows/events.yml).
 *
 * Sources are small adapters, each returning [{ venue, title, date, time, url }].
 * Add more adapters to the `sources` array as venues expose feeds/APIs.
 *
 * Ticketmaster needs a free Discovery API key in env TICKETMASTER_API_KEY
 * (stored as the repo secret of the same name). With no key, that source is
 * skipped and the file is left with whatever the other sources produced.
 */
import { writeFileSync } from 'node:fs';

const OUT = new URL('../static/river/events.json', import.meta.url);

// --- Adapter: Ticketmaster Discovery API → Climate Pledge Arena ---------
async function ticketmasterCPA() {
  const key = process.env.TICKETMASTER_API_KEY;
  if (!key) { console.warn('No TICKETMASTER_API_KEY set — skipping Ticketmaster.'); return []; }
  const params = new URLSearchParams({
    apikey: key,
    keyword: 'Climate Pledge Arena',
    city: 'Seattle',
    sort: 'date,asc',
    size: '40',
  });
  const res = await fetch(`https://app.ticketmaster.com/discovery/v2/events.json?${params}`);
  if (!res.ok) { console.error('Ticketmaster HTTP', res.status); return []; }
  const data = await res.json();
  const events = data?._embedded?.events || [];
  return events
    .filter((e) => (e._embedded?.venues?.[0]?.name || '').toLowerCase().includes('climate pledge'))
    .map((e) => ({
      venue: 'Climate Pledge Arena',
      title: e.name,
      date: e.dates?.start?.localDate || '',
      time: e.dates?.start?.localTime || '',
      url: e.url || 'https://climatepledgearena.com/events/',
    }));
}

const sources = [ticketmasterCPA];

let all = [];
for (const src of sources) {
  try { all = all.concat(await src()); }
  catch (err) { console.error(`Source ${src.name} failed:`, err.message); }
}

// upcoming only, de-duped, sorted, capped
const today = new Date().toISOString().slice(0, 10);
const seen = new Set();
const merged = all
  .filter((e) => e.date && e.date >= today)
  .filter((e) => { const k = `${e.venue}|${e.title}|${e.date}`; if (seen.has(k)) return false; seen.add(k); return true; })
  .sort((a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || '')))
  .slice(0, 10);

writeFileSync(OUT, JSON.stringify(merged, null, 2) + '\n');
console.log(`Wrote ${merged.length} events to ${OUT.pathname}`);
