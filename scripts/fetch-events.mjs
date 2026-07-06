#!/usr/bin/env node
/**
 * Aggregates upcoming neighborhood events into static/river/events.json.
 * Runs in CI (see .github/workflows/events.yml).
 *
 * Each source returns [{ venue, title, date, time, url }]. Add more as venues
 * expose feeds/APIs. Ticketmaster needs a free Discovery API key in env
 * TICKETMASTER_API_KEY (repo secret of the same name); with no key it's skipped.
 */
import { writeFileSync } from 'node:fs';

const OUT = new URL('../static/river/events.json', import.meta.url);

function decodeEntities(s) {
  return String(s)
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&(?:#0?39|apos|rsquo|lsquo);/g, "'")
    .replace(/&(?:#8211|ndash|#45);/g, '-').replace(/&(?:#8212|mdash);/g, '—')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => { try { return String.fromCodePoint(Number(n)); } catch { return ''; } })
    .replace(/\s+/g, ' ').trim();
}

// --- Ticketmaster Discovery API (keyword search, filtered by venue name) ---
async function ticketmasterVenue({ keyword, venueMatch, label, fallbackUrl }) {
  const key = process.env.TICKETMASTER_API_KEY;
  if (!key) { console.warn('No TICKETMASTER_API_KEY set — skipping Ticketmaster.'); return []; }
  const params = new URLSearchParams({ apikey: key, keyword, city: 'Seattle', sort: 'date,asc', size: '40' });
  const res = await fetch(`https://app.ticketmaster.com/discovery/v2/events.json?${params}`);
  if (!res.ok) { console.error(`Ticketmaster ${label} HTTP ${res.status}`); return []; }
  const data = await res.json();
  return (data?._embedded?.events || [])
    .filter((e) => (e._embedded?.venues?.[0]?.name || '').toLowerCase().includes(venueMatch))
    .map((e) => ({
      venue: label,
      title: e.name,
      date: e.dates?.start?.localDate || '',
      time: e.dates?.start?.localTime || '',
      url: e.url || fallbackUrl,
    }));
}

// --- McCaw Hall: the venue's own RSS feed (full calendar, incl. opera/ballet) ---
async function mccawHallRss() {
  const res = await fetch('https://www.mccawhall.com/events/rss');
  if (!res.ok) { console.error('McCaw Hall RSS HTTP', res.status); return []; }
  const xml = await res.text();
  const items = xml.match(/<item>[\s\S]*?<\/item>/g) || [];
  return items.map((it) => {
    const grab = (re) => { const m = it.match(re); return m ? m[1].trim() : ''; };
    return {
      venue: 'McCaw Hall',
      title: decodeEntities(grab(/<title>([\s\S]*?)<\/title>/)),
      date: grab(/<ev:startdate>([\s\S]*?)<\/ev:startdate>/).slice(0, 10),
      time: '',
      url: grab(/<link>([\s\S]*?)<\/link>/) || 'https://www.mccawhall.com/events',
    };
  }).filter((e) => e.title && /^\d{4}-\d{2}-\d{2}$/.test(e.date));
}

const sources = [
  () => ticketmasterVenue({ keyword: 'Climate Pledge Arena', venueMatch: 'climate pledge', label: 'Climate Pledge Arena', fallbackUrl: 'https://climatepledgearena.com/events/' }),
  mccawHallRss,
  () => ticketmasterVenue({ keyword: 'Seattle Center', venueMatch: 'seattle center', label: 'Seattle Center', fallbackUrl: 'https://www.seattlecenter.com/events/event-calendar' }),
];

let all = [];
for (const src of sources) {
  try { all = all.concat(await src()); }
  catch (err) { console.error('Source failed:', err.message); }
}

// upcoming only, de-duped, sorted, capped
const today = new Date().toISOString().slice(0, 10);
const seen = new Set();
const merged = all
  .filter((e) => e.date && e.date >= today)
  .filter((e) => { const k = `${e.venue}|${e.title}|${e.date}`; if (seen.has(k)) return false; seen.add(k); return true; })
  .sort((a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || '')))
  .slice(0, 12);

writeFileSync(OUT, JSON.stringify(merged, null, 2) + '\n');
console.log(`Wrote ${merged.length} events to ${OUT.pathname}`);
