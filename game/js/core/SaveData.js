// Local persistence: settings, high scores, and local leaderboard entries.
// All data lives in localStorage under a single namespaced key.

const STORAGE_KEY = 'overbrookRun.save.v1';

const DEFAULTS = {
  settings: {
    musicVolume: 55,
    sfxVolume: 75,
    mouseSensitivity: 50,
    touchSensitivity: 50,
    quality: 'medium',
  },
  bestScore: 0,
  scores: [], // { name, score, time, accuracy, combo, date }
};

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredCloneSafe(DEFAULTS);
    const parsed = JSON.parse(raw);
    return { ...structuredCloneSafe(DEFAULTS), ...parsed, settings: { ...DEFAULTS.settings, ...(parsed.settings || {}) } };
  } catch (e) {
    console.warn('[SaveData] failed to load, using defaults', e);
    return structuredCloneSafe(DEFAULTS);
  }
}

function structuredCloneSafe(obj) {
  return JSON.parse(JSON.stringify(obj));
}

class SaveDataStore {
  constructor() {
    this.data = load();
  }

  persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn('[SaveData] failed to persist', e);
    }
  }

  getSettings() {
    return this.data.settings;
  }

  updateSettings(partial) {
    this.data.settings = { ...this.data.settings, ...partial };
    this.persist();
  }

  getBestScore() {
    return this.data.bestScore || 0;
  }

  submitScore(entry) {
    // entry: { name, score, time, accuracy, combo }
    this.data.scores.push({ ...entry, date: Date.now() });
    this.data.scores.sort((a, b) => b.score - a.score);
    this.data.scores = this.data.scores.slice(0, 25);
    if (entry.score > (this.data.bestScore || 0)) {
      this.data.bestScore = entry.score;
    }
    this.persist();
  }

  getScores() {
    return this.data.scores;
  }
}

export const SaveData = new SaveDataStore();
