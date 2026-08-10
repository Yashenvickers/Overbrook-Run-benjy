// Leaderboard.js
//
// Local leaderboard is fully functional out of the box (localStorage via SaveData).
// Online leaderboard is a thin adapter: point ONLINE_ENDPOINT at a real backend
// (REST endpoint that accepts POST { name, score, time, accuracy, combo } and
// GET returning an array of the same shape) and it will be used automatically.
// If the endpoint is unset, unreachable, or errors, we silently fall back to
// the local list so the game never blocks on network access.
//
// Suggested backend contract (any stack — Node/Express, FastAPI, Supabase, etc.):
//   GET  /api/leaderboard          -> [{ name, score, time, accuracy, combo, date }, ...]
//   POST /api/leaderboard          <- { name, score, time, accuracy, combo }

import { SaveData } from './SaveData.js';

const ONLINE_ENDPOINT = null; // e.g. 'https://your-backend.example.com/api/leaderboard'

export const Leaderboard = {
  async submit(entry) {
    SaveData.submitScore(entry);
    if (ONLINE_ENDPOINT) {
      try {
        await fetch(ONLINE_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry),
        });
      } catch (e) {
        console.warn('[Leaderboard] online submit failed, using local only', e);
      }
    }
    return this.getScores();
  },

  async getScores() {
    if (ONLINE_ENDPOINT) {
      try {
        const res = await fetch(ONLINE_ENDPOINT);
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('[Leaderboard] online fetch failed, using local only', e);
      }
    }
    return SaveData.getScores();
  },
};
